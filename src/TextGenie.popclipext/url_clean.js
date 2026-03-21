const { cleanUrl, getSelectedText, showError } = require('./toolkit_utils');

try {
    popclip.pasteText(cleanUrl(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid URL');
}
