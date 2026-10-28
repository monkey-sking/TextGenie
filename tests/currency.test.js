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
  assert.match(mixed.output, /跨币种合计/);
  assert.match(mixed.output, /180\.00 USD/);
  assert.equal(mixed.calls.length, 3, 'should fetch one rate table per unique source currency');

  const same = await runCurrency('$58.83+56.26');
  assert.match(same.output, /115\.09 USD/);
  assert.equal(same.calls.length, 1, 'same-currency sums should need no external rate lookup');

  const explicit = await runCurrency('100 EUR+50 EUR');
  assert.match(explicit.output, /165\.00 USD/);

  const configActions = config.actions;
  for (const file of ['url-encode.js', 'url-decode.js', 'base64-encode.js', 'base64-decode.js']) {
    const action = configActions.find(item => item['javascript file'] === file);
    assert.ok(action && action['regular expression'], file + ' must have a content-matching regex');
  }
  const decode = configActions.find(item => item['javascript file'] === 'url-decode.js')['regular expression'];
  assert.match('%20'.match(new RegExp(decode.replace(/^\(\?i\)/, ''), 'i'))?.[0] || '', /%20/);
  console.log('Currency tests passed: mixed-currency sum, inherited currency, repeated currency, content-sensitive action configuration.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
