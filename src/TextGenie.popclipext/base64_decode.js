const { decodeBase64Text, getSelectedText, showError } = require('./toolkit_utils');

try {
    popclip.pasteText(decodeBase64Text(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid Base64');
}
