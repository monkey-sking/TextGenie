const text = String(popclip.input.text || '');
try {
    const output = btoa(unescape(encodeURIComponent(text)));
    popclip.copyText(output);
    return '✓ Base64 编码结果已复制到剪贴板。';
} catch (e) {
    return '❌ Base64 编码失败：' + e.message;
}
