// el
const windowSizeSlider = document.getElementById('windowSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const aspectWidthInput = document.getElementById('aspectWidth');
const aspectHeightInput = document.getElementById('aspectHeight');
const modeWindowRadio = document.getElementById('modeWindow');
const modeTabRadio = document.getElementById('modeTab');
const windowSettings = document.getElementById('windowSettings');

// load saved settings when page loads
document.addEventListener('DOMContentLoaded', loadSettings);

// add event listeners for all form inputs
windowSizeSlider.addEventListener('input', handleSizeChange);
aspectWidthInput.addEventListener('input', handleRatioChange);
aspectHeightInput.addEventListener('input', handleRatioChange);
modeWindowRadio.addEventListener('change', handleModeChange);
modeTabRadio.addEventListener('change', handleModeChange);

// load settings from storage and populate form
async function loadSettings() {
    try {
        const settings = await browser.storage.sync.get({
            windowSize: 50,
            aspectRatioWidth: 4,
            aspectRatioHeight: 3,
            openMode: 'window'
        });

        windowSizeSlider.value = settings.windowSize;
        sizeDisplay.textContent = settings.windowSize + '%';
        aspectWidthInput.value = settings.aspectRatioWidth;
        aspectHeightInput.value = settings.aspectRatioHeight;

        // set radio button selection
        if (settings.openMode === 'tab') {
            modeTabRadio.checked = true;
            modeWindowRadio.checked = false;
        } else {
            modeWindowRadio.checked = true;
            modeTabRadio.checked = false;
        }

        // update UI visibility based on mode
        updateWindowSettingsVisibility(settings.openMode);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// handle open mode changes
function handleModeChange() {
    const selectedMode = modeWindowRadio.checked ? 'window' : 'tab';
    updateWindowSettingsVisibility(selectedMode);
    saveSettings();
}

// update visibility of window settings based on selected mode
function updateWindowSettingsVisibility(mode) {
    if (mode === 'window') {
        windowSettings.classList.remove('hidden');
    } else {
        windowSettings.classList.add('hidden');
    }
}

// handle window size slider changes
function handleSizeChange() {
    const size = windowSizeSlider.value;
    sizeDisplay.textContent = size + '%';
    saveSettings();
}

// handle aspect ratio input changes
function handleRatioChange() {
    // validate inputs to ensure they are positive numbers
    const width = Math.max(0.1, parseFloat(aspectWidthInput.value) || 1);
    const height = Math.max(0.1, parseFloat(aspectHeightInput.value) || 1);

    // update the inputs with validated values
    aspectWidthInput.value = width;
    aspectHeightInput.value = height;

    saveSettings();
}

// save all current settings to storage
async function saveSettings() {
    try {
        const selectedMode = modeWindowRadio.checked ? 'window' : 'tab';

        const settings = {
            windowSize: parseInt(windowSizeSlider.value),
            aspectRatioWidth: parseFloat(aspectWidthInput.value),
            aspectRatioHeight: parseFloat(aspectHeightInput.value),
            openMode: selectedMode
        };

        await browser.storage.sync.set(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}