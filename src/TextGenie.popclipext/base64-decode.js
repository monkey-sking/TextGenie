const text = String(popclip.input.text || '').replace(/\s+/g, '');
try {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1) {
        throw new Error('输入不是有效的 Base64 字符串');
    }
    const output = decodeURIComponent(escape(atob(text)));
    popclip.copyText(output);
    return '✓ Base64 解码结果已复制到剪贴板。';
} catch (e) {
    return '❌ Base64 解码失败：' + e.message;
}
