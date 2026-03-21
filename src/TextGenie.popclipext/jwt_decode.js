const { decodeJwtPayload, getSelectedText, showAndCopy, showError } = require('./toolkit_utils');

try {
    showAndCopy(decodeJwtPayload(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid JWT');
}
