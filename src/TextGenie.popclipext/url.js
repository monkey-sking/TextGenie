const text = popclip.input.text.trim();
const url = text.startsWith('http') ? text : 'https://' + text;
popclip.openUrl(url);
return '🌐 Opening URL...';
