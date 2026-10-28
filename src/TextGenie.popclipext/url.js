const text = String(popclip.input.text || '').trim();
if (!text) return '❌ 请先选择网址。';
const url = /^https?:\/\//i.test(text) ? text : 'https://' + text;
popclip.openUrl(url);
return '🌐 正在打开网址…';
