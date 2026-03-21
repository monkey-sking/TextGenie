const { getSelectedText, showError } = require('./toolkit_utils');

try {
    popclip.copyText(getSelectedText());
} catch (e) {
    showError(e.message || 'Invalid path');
}
