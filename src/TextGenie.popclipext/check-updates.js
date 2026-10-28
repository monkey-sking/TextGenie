// TextGenie update checker. The release workflow replaces the version placeholder at build time.
const axios = require('axios');

const CURRENT_VERSION = '__TEXTGENIE_VERSION__';
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
    if (!latestVersion || !/^\d+\.\d+\.\d+$/.test(latestVersion)) {
        throw new Error('GitHub release did not include a valid stable version tag.');
    }

    if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
        popclip.openUrl(release.html_url || RELEASES_PAGE);
        return '✨ 文灵有新版本 ' + latestVersion + '，当前版本 ' + CURRENT_VERSION + '。已打开下载页面。';
    }

    return '✅ 文灵已是最新版本（' + CURRENT_VERSION + '）。';
} catch (e) {
    const status = e.response?.status;
    if (status === 404) {
        popclip.openUrl(RELEASES_PAGE);
        return '尚无正式发布版本，已打开 Releases 页面。首次发布后即可检查更新。';
    }
    const message = e.code === 'ECONNABORTED' ? '请求超时' : (e.message || '未知错误');
    return '❌ 检查更新失败：' + message + '。可手动查看 ' + RELEASES_PAGE;
}
