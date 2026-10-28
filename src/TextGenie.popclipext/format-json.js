const text = String(popclip.input.text || '').trim();
if (!text) return '❌ 请先选择 JSON 文本。';
try {
    const parsed = JSON.parse(text);
    const output = JSON.stringify(parsed, null, 2);
    popclip.copyText(output);
    return '✓ JSON 已格式化并复制到剪贴板。';
} catch (e) {
    return '❌ JSON 格式无效：' + e.message;
}
