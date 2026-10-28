const text = String(popclip.input.text || '');
try {
    const output = decodeURIComponent(text.replace(/\+/g, '%20'));
    popclip.copyText(output);
    return '✓ URL 解码结果已复制到剪贴板。';
} catch (e) {
    return '❌ URL 编码格式无效：' + e.message;
}
