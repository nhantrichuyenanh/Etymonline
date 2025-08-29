let cachedSettings = null;
let settingsLoaded = false;

async function initializeSettings() {
  if (!settingsLoaded) {
    try {
      cachedSettings = await browser.storage.sync.get({
        windowSize: 50,
        aspectRatioWidth: 1,
        aspectRatioHeight: 1,
        openMode: 'window'
      });
      settingsLoaded = true;
    } catch (error) {
      cachedSettings = {
        windowSize: 50,
        aspectRatioWidth: 1,
        aspectRatioHeight: 1,
        openMode: 'window'
      };
      settingsLoaded = true;
    }
  }
  return cachedSettings;
}

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (cachedSettings && key in cachedSettings) {
        cachedSettings[key] = newValue;
      }
    }
  }
});

function getCachedSettings() {
  return cachedSettings || {
    windowSize: 50,
    aspectRatioWidth: 1,
    aspectRatioHeight: 1,
    openMode: 'window'
  };
}

let dimensionsCache = null;
let lastScreenSize = { width: 0, height: 0 };

function calculateWindowDimensions() {
  const settings = getCachedSettings();
  const currentScreen = { 
    width: screen.availWidth, 
    height: screen.availHeight 
  };
  
  if (!dimensionsCache || 
      lastScreenSize.width !== currentScreen.width || 
      lastScreenSize.height !== currentScreen.height) {
    
    const sizeRatio = settings.windowSize / 100;
    let windowWidth = Math.round(currentScreen.width * sizeRatio);
    let windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));

    windowWidth = Math.max(windowWidth, 320);
    windowHeight = Math.max(windowHeight, 240);

    if (windowWidth > currentScreen.width) {
      windowWidth = currentScreen.width;
      windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));
    }
    if (windowHeight > currentScreen.height) {
      windowHeight = currentScreen.height;
      windowWidth = Math.round(windowHeight * (settings.aspectRatioWidth / settings.aspectRatioHeight));
    }

    dimensionsCache = { width: windowWidth, height: windowHeight };
    lastScreenSize = currentScreen;
  }

  return dimensionsCache;
}

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.windowSize || changes.aspectRatioWidth || changes.aspectRatioHeight)) {
    dimensionsCache = null;
  }
});

async function onCreated(windowInfo) {
  try {
    const dimensions = calculateWindowDimensions();
    await browser.windows.update(windowInfo.id, {
      width: dimensions.width,
      height: dimensions.height
    });
  } catch (error) {
  }
}

async function lookupSelection(text, url, currentTab) {
  if (!text) return;
  
  if (!settingsLoaded) {
    await initializeSettings();
  }
  
  const settings = getCachedSettings();

  if (settings.openMode === 'tab') {
    browser.tabs.create({
      url: url,
      active: true
    }).catch(error => {
    });
  } else {
    browser.windows.create({
      url: url,
      type: "popup"
    }).then(onCreated).catch(error => {
    });
  }
}

browser.contextMenus.create({
  title: "Etymonline: %s",
  contexts: ["selection"],
  onclick: (info, tab) => {
    if (info?.selectionText) {
      const selectedText = info.selectionText;
      const etymonlineURL = `https://etymonline.com/word/${selectedText}`;
      lookupSelection(selectedText, etymonlineURL, tab);
    }
  }
});

initializeSettings();
