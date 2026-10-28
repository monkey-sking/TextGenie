const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const root = path.join(__dirname, '..', 'src', 'TextGenie.popclipext');
const source = fs.readFileSync(path.join(root, 'currency.js'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'Config.json'), 'utf8'));

const fakeRates = {
  USD: { USD: 1, CNY: 7.2 },
  EUR: { USD: 1.1, CNY: 7.8 },
  JPY: { USD: 0.01, CNY: 0.05 },
  CNY: { USD: 0.14, CNY: 1 }
};

async function runCurrency(input, targetCurrency = 'USD') {
  const calls = [];
  const axios = {
    get: async (url) => {
      const base = url.split('/').pop();
      calls.push(base);
      return { data: { rates: fakeRates[base] || {} } };
    }
  };
  const popclip = { input: { text: input }, options: { targetCurrency } };
  const action = new AsyncFunction('require', 'popclip', source);
  const output = await action((name) => {
    if (name !== 'axios') throw new Error('Unexpected dependency: ' + name);
    return axios;
  }, popclip);
  return { output, calls };
}

(async () => {
  const mixed = await runCurrency('$100+€50+JP¥3,000');
  assert.match(mixed.output, /100\.00 USD \+ 50\.00 EUR \+ 3,000\.00 JPY ≈ 185\.00 USD/);
  assert.match(mixed.output, /185\.00 USD/);
  assert.equal(mixed.calls.length, 2, 'same-currency source and target need no rate lookup');

  const same = await runCurrency('$58.83+56.26');
  assert.match(same.output, /115\.09 USD/);
  assert.equal(same.calls.length, 0, 'same-currency sums should need no external rate lookup');

  const explicit = await runCurrency('100 EUR+50 EUR');
  assert.match(explicit.output, /165\.00 USD/);

  const configActions = config.actions;
  for (const file of ['url-encode.js', 'url-decode.js', 'base64-encode.js', 'base64-decode.js']) {
    const action = configActions.find(item => item['javascript file'] === file);
    assert.ok(action && action['regular expression'], file + ' must have a content-matching regex');
  }
  const decode = configActions.find(item => item['javascript file'] === 'url-decode.js')['regular expression'];
  assert.match('%20'.match(new RegExp(decode.replace(/^\(\?i\)/, ''), 'i'))?.[0] || '', /%20/);
  async function runCustomTranslation(apiUrl) {
    const calls = [];
    const axios = {
      post: async (url, payload) => {
        calls.push({ url, payload });
        return { data: { output_text: 'translated text' } };
      },
      get: async () => { throw new Error('Unexpected GET'); }
    };
    const popclip = {
      input: { text: 'source text' },
      options: {
        translationService: 'custom',
        targetLanguage: 'en',
        customApiUrl: apiUrl,
        customModel: 'test-model',
        apiKey: ''
      }
    };
    const source = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
    const action = new AsyncFunction('require', 'popclip', source);
    const output = await action(name => {
      if (name !== 'axios') throw new Error('Unexpected dependency: ' + name);
      return axios;
    }, popclip);
    return { output, call: calls[0] };
  }
  const responsesTranslation = await runCustomTranslation('https://example.com/v1/responses');
  assert.equal(responsesTranslation.output, 'translated text');
  assert.equal(responsesTranslation.call.payload.input, 'source text');
  assert.equal(responsesTranslation.call.payload.model, 'test-model');
  assert.ok(!('messages' in responsesTranslation.call.payload), 'Responses API must not receive chat-completions payload');
  const chatTranslation = await runCustomTranslation('https://example.com/v1/chat/completions');
  assert.equal(chatTranslation.call.payload.messages[1].content, 'source text');
  assert.ok(!('input' in chatTranslation.call.payload), 'Chat Completions API must receive messages payload');

  async function runUrlAction(input) {
    let opened = '';
    const popclip = { input: { text: input }, openUrl: value => { opened = value; } };
    const source = fs.readFileSync(path.join(root, 'url.js'), 'utf8');
    const action = new AsyncFunction('popclip', source);
    const output = await action(popclip);
    return { opened, output };
  }
  assert.equal((await runUrlAction('HTTPS://example.com')).opened, 'HTTPS://example.com', 'uppercase URL schemes must not be prefixed twice');
  assert.equal((await runUrlAction('example.com')).opened, 'https://example.com', 'bare domains should receive https');
  assert.match((await runUrlAction('   ')).output, /请先选择网址/);

  const popclipRegex = (pattern) => {
    let flags = '';
    while (pattern.startsWith('(?')) {
      const match = pattern.match(/^\(\?([ims]+)\)/);
      if (!match) break;
      flags += match[1];
      pattern = pattern.slice(match[0].length);
    }
    return new RegExp(pattern, [...new Set(flags)].join(''));
  };
  const matches = (file, sample) => {
    const action = config.actions.find(item => item['javascript file'] === file);
    return popclipRegex(action['regular expression']).test(sample);
  };
  assert.equal(matches('url-encode.js', '普通中文文本'), false, 'URL Encode should not show for ordinary CJK text');
  assert.equal(matches('url-encode.js', 'https://example.com/a?x=1'), true, 'URL Encode should show for URL-like text');
  assert.equal(matches('base64-encode.js', '普通中文文本'), false, 'Base64 Encode should not show for ordinary single-line text');
  assert.equal(matches('base64-encode.js', '第一行\n第二行'), true, 'Base64 Encode should show for multiline text');
  assert.equal(matches('base64-encode.js', 'This is a longer single-line text that can be encoded'), true, 'Base64 Encode should show for long selected text');
  assert.equal(matches('base64-encode.js', '{\n  "a": 1\n}'), false, 'Base64 Encode should stay hidden for JSON');
  assert.equal(matches('base64-decode.js', 'Hello'), false, 'short ordinary words should not trigger Base64 Decode');
  assert.equal(matches('base64-decode.js', 'SGVsbG8gV29ybGQh'), true, 'valid unpadded Base64 should be recognized');
  assert.equal(matches('base64-decode.js', 'VGhpcyBpcyBhIGxvbmdlciBiYXNlNjQgc3RyaW5nLg=='), true, 'Base64 Decode should show for long encoded strings');

  assert.equal(matches('check-updates.js', 'hello world'), false, 'update checker must stay hidden for normal text');
  assert.equal(matches('check-updates.js', '检查文灵更新'), true, 'update checker must appear for its trigger phrase');
  assert.equal(matches('url.js', 'ordinary sentence'), false, 'Open URL must stay hidden for ordinary text');
  assert.equal(matches('url.js', 'https://example.com'), true, 'Open URL must show for URLs');
  assert.equal(matches('currency.js', 'ordinary sentence'), false, 'Currency must stay hidden for ordinary text');
  assert.equal(matches('currency.js', '$12.50'), true, 'Currency must show for currency-like text');
  assert.equal(matches('terminal.applescript', 'ordinary sentence'), false, 'Terminal must stay hidden for ordinary text');
  assert.equal(matches('terminal.applescript', 'git status'), true, 'Terminal must show for command-like text');
  assert.equal(matches('path.applescript', 'ordinary sentence'), false, 'Path opener must stay hidden for ordinary text');
  assert.equal(matches('path.applescript', '/Users/test/file.txt'), true, 'Path opener must show for absolute paths');

  for (const action of config.actions) {
    if (action['regular expression']) popclipRegex(action['regular expression']);
    if (action.icon) assert.ok(fs.existsSync(path.join(root, action.icon)), 'missing icon: ' + action.icon);
  }
  assert.notEqual(
    config.actions.find(item => item['javascript file'] === 'format-json.js').icon,
    config.actions.find(item => item['javascript file'] === 'minify-json.js').icon,
    'JSON format and minify should use distinct icons'
  );

  console.log('Regression tests passed: currency conversion, action matching, icon resources, and JSON action separation.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
