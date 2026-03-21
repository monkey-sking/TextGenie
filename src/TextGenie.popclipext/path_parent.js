const { getSelectedText, parentPath, showError } = require('./toolkit_utils');

try {
    popclip.copyText(parentPath(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid path');
}
