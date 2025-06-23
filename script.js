// context menu entry
browser.contextMenus.create({
  title: "Etymonline: %s",
  contexts: ["selection"],
  onclick: (info, tab) => {
    if (info) {
      const selectedText = info.selectionText;
      const etymonlineURL = `https://etymonline.com/word/${selectedText}`;
      lookupSelection(selectedText, etymonlineURL);
    }
  }
});

// get user preferences from storage with defaults
async function getWindowSettings() {
  try {
    const result = await browser.storage.sync.get({
      windowSize: 50,
      aspectRatioWidth: 4,
      aspectRatioHeight: 3
    });
    return result;
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return {
      windowSize: 50,
      aspectRatioWidth: 4,
      aspectRatioHeight: 3
    };
  }
}

// calculate window dimensions based on user settings
async function calculateWindowDimensions() {
  const settings = await getWindowSettings();
  const sizeRatio = settings.windowSize / 100;

  // use available screen size for sizing
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;

  let windowWidth = Math.round(screenWidth * sizeRatio);
  let windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));

  windowWidth = Math.max(windowWidth, 320);
  windowHeight = Math.max(windowHeight, 240);

  if (windowWidth > screenWidth) {
    windowWidth = screenWidth;
    windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));
  }
  if (windowHeight > screenHeight) {
    windowHeight = screenHeight;
    windowWidth = Math.round(windowHeight * (settings.aspectRatioWidth / settings.aspectRatioHeight));
  }

  return { width: windowWidth, height: windowHeight };
}

// resize window based on calculated dimensions
async function onCreated(windowInfo) {
  try {
    const dimensions = await calculateWindowDimensions();
    await browser.windows.update(windowInfo.id, {
      width: dimensions.width,
      height: dimensions.height
    });
  } catch (error) {
    console.error('Error updating window size:', error);
  }
}

// popup window to look up the selected word
function lookupSelection(text, url) {
  if (text) {
    browser.windows.create({
      url: url,
      type: "popup"
    }).then(onCreated).catch(error => {
      console.error(`Error creating window: ${error}`);
    });
  }
}