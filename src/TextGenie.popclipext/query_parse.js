const { getSelectedText, parseQueryText, showAndCopy, showError } = require('./toolkit_utils');

try {
    showAndCopy(parseQueryText(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid query string');
}
