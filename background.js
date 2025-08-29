let cachedSettings = null;

async function initializeSettings() {
  if (!cachedSettings) {
    try {
      cachedSettings = await browser.storage.sync.get({
        windowSize: 50,
        aspectRatioWidth: 1,
        aspectRatioHeight: 1,
        openMode: 'window'
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      cachedSettings = {
        windowSize: 50,
        aspectRatioWidth: 1,
        aspectRatioHeight: 1,
        openMode: 'window'
      };
    }
  }
  return cachedSettings;
}

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && cachedSettings) {
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in cachedSettings) {
        cachedSettings[key] = newValue;
      }
    }
  }
});

function calculateWindowDimensions(settings) {
  const sizeRatio = settings.windowSize / 100;
  const screenWidth = screen.availWidth;
  const screenHeight = screen.availHeight;

  let width = Math.round(screenWidth * sizeRatio);
  let height = Math.round(width * (settings.aspectRatioHeight / settings.aspectRatioWidth));

  width = Math.min(Math.max(width, 320), screenWidth);
  height = Math.min(Math.max(height, 240), screenHeight);

  if (width === screenWidth) {
    height = Math.round(width * (settings.aspectRatioHeight / settings.aspectRatioWidth));
  }
  if (height === screenHeight) {
    width = Math.round(height * (settings.aspectRatioWidth / settings.aspectRatioHeight));
  }

  return { width, height };
}

async function createPopupWindow(url) {
  try {
    const settings = cachedSettings || await initializeSettings();
    const dimensions = calculateWindowDimensions(settings);
    
    await browser.windows.create({
      url,
      type: "popup",
      width: dimensions.width,
      height: dimensions.height
    });
  } catch (error) {
    console.error('Failed to create popup window:', error);
  }
}

async function lookupSelection(text, url) {
  const settings = cachedSettings || await initializeSettings();

  if (settings.openMode === 'tab') {
    browser.tabs.create({ url, active: true })
      .catch(error => console.error('Failed to create tab:', error));
  } else {
    createPopupWindow(url);
  }
}

browser.contextMenus.create({
  title: "Etymonline: %s",
  contexts: ["selection"],
  onclick: (info) => {
    if (info?.selectionText) {
      const url = `https://etymonline.com/word/${info.selectionText}`;
      lookupSelection(info.selectionText, url);
    }
  }
});

initializeSettings();
