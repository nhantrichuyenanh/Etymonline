// el
const windowSizeSlider = document.getElementById('windowSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const aspectWidthInput = document.getElementById('aspectWidth');
const aspectHeightInput = document.getElementById('aspectHeight');
const saveIndicator = document.getElementById('saveIndicator');

// load saved settings when page loads
document.addEventListener('DOMContentLoaded', loadSettings);

// add event listeners for all form inputs
windowSizeSlider.addEventListener('input', handleSizeChange);
aspectWidthInput.addEventListener('input', handleRatioChange);
aspectHeightInput.addEventListener('input', handleRatioChange);

// load settings from storage and populate form
async function loadSettings() {
    try {
        const settings = await browser.storage.sync.get({
            windowSize: 50,
            aspectRatioWidth: 4,
            aspectRatioHeight: 3
        });
        
        windowSizeSlider.value = settings.windowSize;
        sizeDisplay.textContent = settings.windowSize + '%';
        aspectWidthInput.value = settings.aspectRatioWidth;
        aspectHeightInput.value = settings.aspectRatioHeight;
    } catch (error) {
        console.error('Error loading settings:', error);
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
        const settings = {
            windowSize: parseInt(windowSizeSlider.value),
            aspectRatioWidth: parseFloat(aspectWidthInput.value),
            aspectRatioHeight: parseFloat(aspectHeightInput.value)
        };
        
        await browser.storage.sync.set(settings);
        showSaveIndicator();
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// show save confirmation message
function showSaveIndicator() {
    saveIndicator.classList.add('show');
    setTimeout(() => {
        saveIndicator.classList.remove('show');
    }, 2000);
}