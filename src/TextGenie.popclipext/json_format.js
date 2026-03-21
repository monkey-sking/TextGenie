const { getSelectedText, prettyJson, showError } = require('./toolkit_utils');

try {
    popclip.pasteText(prettyJson(getSelectedText()));
} catch (e) {
    showError('Invalid JSON');
}
