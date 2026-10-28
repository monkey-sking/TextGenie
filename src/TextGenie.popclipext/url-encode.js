const text = String(popclip.input.text || '');
try {
    const output = encodeURIComponent(text);
    popclip.copyText(output);
    return '✓ URL 编码结果已复制到剪贴板。';
} catch (e) {
    return '❌ URL 编码失败：' + e.message;
}
