const { getSelectedText, shellQuote, showError } = require('./toolkit_utils');

try {
    popclip.copyText(shellQuote(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid path');
}
