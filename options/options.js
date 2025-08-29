const elements = {
  windowSize: document.getElementById('windowSize'),
  sizeDisplay: document.getElementById('sizeDisplay'),
  aspectWidth: document.getElementById('aspectWidth'),
  aspectHeight: document.getElementById('aspectHeight'),
  modeWindow: document.getElementById('modeWindow'),
  modeTab: document.getElementById('modeTab'),
  windowSettings: document.getElementById('windowSettings')
};

const defaults = {
  windowSize: 50,
  aspectRatioWidth: 1,
  aspectRatioHeight: 1,
  openMode: 'window'
};

async function loadSettings() {
  try {
    const settings = await browser.storage.sync.get(defaults);
    
    elements.windowSize.value = settings.windowSize;
    elements.sizeDisplay.textContent = settings.windowSize + '%';
    elements.aspectWidth.value = settings.aspectRatioWidth;
    elements.aspectHeight.value = settings.aspectRatioHeight;
    
    elements.modeWindow.checked = settings.openMode === 'window';
    elements.modeTab.checked = settings.openMode === 'tab';
    
    updateWindowSettingsVisibility(settings.openMode);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  try {
    await browser.storage.sync.set({
      windowSize: parseInt(elements.windowSize.value),
      aspectRatioWidth: parseFloat(elements.aspectWidth.value),
      aspectRatioHeight: parseFloat(elements.aspectHeight.value),
      openMode: elements.modeWindow.checked ? 'window' : 'tab'
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

function updateWindowSettingsVisibility(mode) {
  elements.windowSettings.classList.toggle('hidden', mode !== 'window');
}

function handleSizeChange() {
  elements.sizeDisplay.textContent = elements.windowSize.value + '%';
  saveSettings();
}

function handleRatioChange() {
  elements.aspectWidth.value = Math.max(0.1, parseFloat(elements.aspectWidth.value) || 1);
  elements.aspectHeight.value = Math.max(0.1, parseFloat(elements.aspectHeight.value) || 1);
  saveSettings();
}

function handleModeChange() {
  const mode = elements.modeWindow.checked ? 'window' : 'tab';
  updateWindowSettingsVisibility(mode);
  saveSettings();
}

document.addEventListener('DOMContentLoaded', loadSettings);
elements.windowSize.addEventListener('input', handleSizeChange);
elements.aspectWidth.addEventListener('input', handleRatioChange);
elements.aspectHeight.addEventListener('input', handleRatioChange);
elements.modeWindow.addEventListener('change', handleModeChange);
elements.modeTab.addEventListener('change', handleModeChange);
