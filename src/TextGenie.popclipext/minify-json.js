const text = String(popclip.input.text || '').trim();
if (!text) return '❌ 请先选择 JSON 文本。';
try {
    const output = JSON.stringify(JSON.parse(text));
    popclip.copyText(output);
    return '✓ JSON 已压缩并复制到剪贴板。';
} catch (e) {
    return '❌ JSON 格式无效：' + e.message;
}
