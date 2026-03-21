const { getSelectedText, makeMarkdownLink, showError } = require('./toolkit_utils');

try {
    popclip.copyText(makeMarkdownLink(getSelectedText()));
} catch (e) {
    showError(e.message || 'Invalid URL');
}
