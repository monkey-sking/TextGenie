const { getSelectedText, parentPath, shellQuote, showError } = require('./toolkit_utils');

try {
    popclip.copyText('cd ' + shellQuote(parentPath(getSelectedText())));
} catch (e) {
    showError(e.message || 'Invalid path');
}
