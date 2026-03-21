const { getSelectedText, minifyJson, showError } = require('./toolkit_utils');

try {
    popclip.pasteText(minifyJson(getSelectedText()));
} catch (e) {
    showError('Invalid JSON');
}
