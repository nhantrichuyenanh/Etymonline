// context menu entry with an anonymous function
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

// size of the newly created window based on screen dimensions
function onCreated(windowInfo) {
  const screenWidth = windowInfo.width;
  const screenHeight = windowInfo.height;
  
  // half of the available screen width
  let windowWidth = Math.round(screenWidth * 0.5);
  let windowHeight = Math.round(windowWidth * (4 / 3));  // 4:3 aspect ratio

  // enforce minimum dimensions
  windowWidth = Math.max(windowWidth, 768);
  windowHeight = Math.max(windowHeight, 1024);

  // ensure the popup does not exceed available screen dimensions
  if (windowWidth > screenWidth) {
    windowWidth = screenWidth;
    windowHeight = Math.round(windowWidth * (4 / 3));
  }
  if (windowHeight > screenHeight) {
    windowHeight = screenHeight;
    windowWidth = Math.round(windowHeight * (3 / 4));
  }

  const currentWindowId = browser.windows.WINDOW_ID_CURRENT;
  browser.windows.update(currentWindowId, {
    width: windowWidth,
    height: windowHeight
  });
}

// popup window to look up the selected word
function lookupSelection(text, url) {
  if (text) {
    browser.windows.create({
      url: url,
      type: "popup"
    }).then(onCreated, console.error(`Error: ${error}`));
  }
}