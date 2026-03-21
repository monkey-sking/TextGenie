const { getSelectedText, normalizeUrlText, readableHost, showError } = require('./toolkit_utils');

try {
    popclip.copyText(readableHost(normalizeUrlText(getSelectedText())));
} catch (e) {
    showError(e.message || 'Invalid URL');
}
