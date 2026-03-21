function getSelectedText() {
    return String(popclip.input.matchedText || popclip.input.text || '').trim();
}

function showError(message) {
    popclip.showFailure();
    popclip.showText(String(message || 'Unknown error'));
}

function showAndCopy(text) {
    pasteboard.text = String(text);
    popclip.showText(String(text));
}

function normalizeUrlText(text) {
    const raw = String(text || '').trim();
    if (!raw) throw new Error('No URL selected');

    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
    return new URL(hasScheme ? raw : 'https://' + raw);
}

const TRACKING_PARAM_EXACT = new Set([
    'fbclid',
    'gclid',
    'dclid',
    'gbraid',
    'wbraid',
    'mc_cid',
    'mc_eid',
    'mkt_tok',
    '_hsenc',
    '_hsmi',
    'igshid',
    'si'
]);

function cleanUrl(text) {
    const url = normalizeUrlText(text);
    const keys = Array.from(url.searchParams.keys());

    for (const key of keys) {
        const lower = key.toLowerCase();
        if (lower.startsWith('utm_') || TRACKING_PARAM_EXACT.has(lower)) {
            url.searchParams.delete(key);
        }
    }

    return url.toString();
}

function readableHost(url) {
    return url.hostname.replace(/^www\./i, '');
}

function escapeMarkdownLabel(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function sameUrl(left, right) {
    try {
        return normalizeUrlText(left).toString() === normalizeUrlText(right).toString();
    } catch (e) {
        return false;
    }
}

function makeMarkdownLink(text) {
    const url = normalizeUrlText(text);
    let label = readableHost(url);

    if (popclip.context?.browserUrl && sameUrl(popclip.context.browserUrl, url.toString()) && popclip.context.browserTitle) {
        label = String(popclip.context.browserTitle).trim() || label;
    }

    return '[' + escapeMarkdownLabel(label) + '](' + url.toString() + ')';
}

function shellQuote(text) {
    return "'" + String(text).replace(/'/g, "'\\''") + "'";
}

function parentPath(pathText) {
    const value = String(pathText || '').trim();
    if (!value || value === '/') return '/';

    const normalized = value.replace(/\/+$/, '') || '/';
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash <= 0) return '/';
    return normalized.slice(0, lastSlash);
}

function prettyJson(text) {
    return JSON.stringify(JSON.parse(String(text)), null, 2);
}

function minifyJson(text) {
    return JSON.stringify(JSON.parse(String(text)));
}

function normalizeBase64(text) {
    let value = String(text || '').trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!value) throw new Error('No Base64 text selected');

    const remainder = value.length % 4;
    if (remainder === 1) throw new Error('Invalid Base64');
    if (remainder > 0) {
        value += '='.repeat(4 - remainder);
    }

    return value;
}

function hasTooManyControlChars(text) {
    const matches = String(text).match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g);
    return Boolean(matches && matches.length > Math.max(2, Math.floor(String(text).length / 20)));
}

function decodeBase64Text(text) {
    const normalized = normalizeBase64(text);
    const buffer = Buffer.from(normalized, 'base64');
    if (!buffer.length) throw new Error('Invalid Base64');

    const canonical = buffer.toString('base64').replace(/=+$/, '');
    if (canonical !== normalized.replace(/=+$/, '')) {
        throw new Error('Invalid Base64');
    }

    const decoded = buffer.toString('utf8');
    if (hasTooManyControlChars(decoded)) {
        throw new Error('Decoded content is not plain text');
    }

    return decoded;
}

function decodeJwtPayload(token) {
    const parts = String(token || '').trim().split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');

    const decoded = decodeBase64Text(parts[1]);
    try {
        return JSON.stringify(JSON.parse(decoded), null, 2);
    } catch (e) {
        return decoded;
    }
}

function parseQueryText(text) {
    const raw = String(text || '').trim();
    if (!raw) throw new Error('No query string selected');

    let query = raw;

    if (raw.includes('://')) {
        const url = normalizeUrlText(raw);
        query = url.search.replace(/^\?/, '');
    } else if (raw.startsWith('?') || raw.startsWith('&')) {
        query = raw.slice(1);
    }

    const params = new URLSearchParams(query);
    const entries = Array.from(params.entries());
    if (!entries.length) {
        throw new Error('No query parameters found');
    }

    return entries.map(([key, value]) => key + ' = ' + value).join('\n');
}

module.exports = {
    cleanUrl,
    decodeBase64Text,
    decodeJwtPayload,
    getSelectedText,
    makeMarkdownLink,
    minifyJson,
    normalizeUrlText,
    parentPath,
    parseQueryText,
    prettyJson,
    readableHost,
    shellQuote,
    showAndCopy,
    showError
};
