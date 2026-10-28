// TextGenie update checker
const axios = require('axios');

// Keep this in sync with the version used for the published release.
const CURRENT_VERSION = '1.0.0';
const RELEASE_API = 'https://api.github.com/repos/monkey-sking/TextGenie/releases/latest';
const RELEASES_PAGE = 'https://github.com/monkey-sking/TextGenie/releases';
const TIMEOUT_MS = 8000;

function normalizeVersion(value) {
    return String(value || '').trim().replace(/^v/i, '').split('-')[0];
}

function compareVersions(a, b) {
    const left = normalizeVersion(a).split('.').map(n => parseInt(n, 10) || 0);
    const right = normalizeVersion(b).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const x = left[i] || 0;
        const y = right[i] || 0;
        if (x > y) return 1;
        if (x < y) return -1;
    }
    return 0;
}

try {
    const response = await axios.get(RELEASE_API, {
        timeout: TIMEOUT_MS,
        headers: {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    const release = response.data || {};
    const latestVersion = String(release.tag_name || '').replace(/^v/i, '');
    if (!latestVersion) throw new Error('GitHub release did not include a version tag.');

    if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
        popclip.openUrl(release.html_url || RELEASES_PAGE);
        return '✨ TextGenie ' + latestVersion + ' is available. Opened the release page; download the .popclipextz asset and double-click to update. Current version: ' + CURRENT_VERSION + '.';
    }

    return '✅ TextGenie is up to date (' + CURRENT_VERSION + ').';
} catch (e) {
    const status = e.response?.status;
    if (status === 404) {
        popclip.openUrl(RELEASES_PAGE);
        return 'No published release found yet. Opened the Releases page; the first release must be published before update checks can work.';
    }
    const message = e.code === 'ECONNABORTED' ? 'Request timed out' : (e.message || 'Unknown error');
    return '❌ Could not check for updates: ' + message + '. You can check manually at ' + RELEASES_PAGE;
}
