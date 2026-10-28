// PopClip Currency Converter and mixed-currency sum calculator.
const axios = require('axios');

const text = String(popclip.input.text || '').trim();
const configuredTarget = popclip.options.targetCurrency || 'AUTO';
const targetLanguage = popclip.options.targetLanguage || 'auto';
const HTTP_TIMEOUT_MS = 8000;

const CN_CURRENCY_NAMES = {
    '人民币': 'CNY', '美金': 'USD', '美元': 'USD', '欧元': 'EUR', '英镑': 'GBP',
    '日元': 'JPY', '日币': 'JPY', '日圆': 'JPY', '日圓': 'JPY',
    '港币': 'HKD', '港元': 'HKD', '韩元': 'KRW', '台币': 'TWD', '新台币': 'TWD',
    '新加坡元': 'SGD', '新币': 'SGD', '澳元': 'AUD', '澳币': 'AUD',
    '加元': 'CAD', '加币': 'CAD', '瑞士法郎': 'CHF', '瑞郎': 'CHF',
    '纽元': 'NZD', '新西兰元': 'NZD', '泰铢': 'THB', '卢比': 'INR', '卢布': 'RUB',
    '马币': 'MYR', '马来西亚林吉特': 'MYR'
};

const CN_NAMES = {
    CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元',
    HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元',
    AUD: '澳元', CAD: '加元', CHF: '瑞郎', NZD: '纽元', MYR: '马币',
    THB: '泰铢', INR: '卢比', RUB: '卢布'
};

const SYMBOLS = {
    '€': 'EUR', '£': 'GBP', '₹': 'INR', '₩': 'KRW', '₽': 'RUB', '฿': 'THB'
};
const CODE_PATTERN = 'USD|EUR|GBP|JPY|CNY|HKD|AUD|CAD|CHF|SGD|NZD|INR|KRW|THB|MYR|RUB|TWD';

function getLocaleDefaults() {
    let locale = 'en-US';
    try { locale = Intl.DateTimeFormat().resolvedOptions().locale || locale; } catch (_) {}
    let region = '';
    try {
        const parts = new Intl.Locale(locale).maximize();
        region = parts.region || '';
    } catch (_) {
        const match = locale.match(/[-_]([A-Za-z]{2}|[0-9]{3})(?:$|[-_])/);
        region = match ? match[1].toUpperCase() : '';
    }
    const byRegion = {
        US: 'USD', GB: 'GBP', JP: 'JPY', CN: 'CNY', TW: 'TWD', HK: 'HKD',
        SG: 'SGD', AU: 'AUD', CA: 'CAD', NZ: 'NZD', KR: 'KRW', CH: 'CHF',
        IN: 'INR', TH: 'THB', MY: 'MYR', RU: 'RUB', DE: 'EUR', FR: 'EUR',
        ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR',
        PT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', EE: 'EUR', LV: 'EUR',
        LT: 'EUR', SK: 'EUR', SI: 'EUR', CY: 'EUR', MT: 'EUR'
    };
    return { locale, region, currency: byRegion[region] || 'CNY' };
}

function resolveTargetCurrency() {
    if (configuredTarget && configuredTarget !== 'AUTO') return configuredTarget;
    return getLocaleDefaults().currency;
}

function detectTokenCurrency(token, localeCurrency) {
    const upper = token.toUpperCase();
    const codes = upper.match(new RegExp('\\b(' + CODE_PATTERN + ')\\b', 'g')) || [];
    const found = new Set(codes);
    for (const [name, code] of Object.entries(CN_CURRENCY_NAMES)) {
        if (token.includes(name)) found.add(code);
    }

    const qualified = [
        { re: /(?:JP|JPN)\s*[¥￥]/i, code: 'JPY' },
        { re: /(?:CN|CNY)\s*[¥￥]/i, code: 'CNY' },
        { re: /HK\s*\$/i, code: 'HKD' },
        { re: /NT\s*\$/i, code: 'TWD' },
        { re: /(?:A|AUD)\s*\$/i, code: 'AUD' },
        { re: /(?:C|CAD)\s*\$/i, code: 'CAD' },
        { re: /(?:S|SGD)\s*\$/i, code: 'SGD' },
        { re: /US\s*\$/i, code: 'USD' }
    ];
    for (const q of qualified) if (q.re.test(token)) found.add(q.code);

    for (const [symbol, code] of Object.entries(SYMBOLS)) {
        if (token.includes(symbol)) found.add(code);
    }

    // A bare yen sign is ambiguous: use device locale only for CNY/JPY locales.
    if (/[¥￥]/.test(token) && !/(?:JP|JPN|CN|CNY)\s*[¥￥]/i.test(token)) {
        if (localeCurrency === 'JPY' || localeCurrency === 'CNY') found.add(localeCurrency);
        else found.add('CNY'); // Conservative, documented fallback for ambiguous yen.
    }
    // A bare dollar sign follows the device locale only when it is a dollar currency.
    if (token.includes('$') && !/(?:US|HK|NT|A|AUD|C|CAD|S|SGD)\s*\$/i.test(token)) {
        const dollarCurrencies = ['USD', 'HKD', 'TWD', 'AUD', 'CAD', 'SGD'];
        found.add(dollarCurrencies.includes(localeCurrency) ? localeCurrency : 'USD');
    }

    if (found.size > 1) throw new Error('单笔金额中检测到多个币种，请明确写出币种代码，例如 USD 100 或 JP¥3,000。');
    return found.size ? Array.from(found)[0] : null;
}

function parseAmounts(input) {
    const locale = getLocaleDefaults();
    const cleaned = input.replace(/,/g, '').trim();
    // The supported expression is a sum separated by +. Currency can be repeated or
    // inherited from the preceding amount, e.g. $58.83+56.26.
    const pieces = cleaned.split('+').map(s => s.trim()).filter(Boolean);
    if (pieces.length === 0) throw new Error('请先选择包含金额的文本。');

    const amounts = [];
    let inheritedCurrency = null;
    for (const piece of pieces) {
        const currency = detectTokenCurrency(piece, locale.currency) || inheritedCurrency || locale.currency;
        let numberText = piece
            .replace(new RegExp('\\b(?:' + CODE_PATTERN + ')\\b', 'ig'), '')
            .replace(/(?:JP|JPN|CN|CNY|HK|HKD|NT|AUD|A|CAD|C|SGD|S|US)\s*(?=[$¥￥])/ig, '')
            .replace(/[$¥￥€£₹₩₽฿]/g, '');
        for (const name of Object.keys(CN_CURRENCY_NAMES).sort((a, b) => b.length - a.length)) {
            numberText = numberText.replaceAll(name, '');
        }
        numberText = numberText.replace(/[()\s]/g, '');
        if (!/^-?\d+(?:\.\d+)?$/.test(numberText)) {
            throw new Error('无法识别金额「' + piece + '」。请使用 100 USD、€50、JP¥3,000 等格式。');
        }
        const amount = Number(numberText);
        if (!Number.isFinite(amount)) throw new Error('金额超出可处理范围。');
        amounts.push({ amount, currency });
        inheritedCurrency = currency;
    }
    return { amounts, locale };
}

async function getRate(base, target) {
    if (base === target) return 1;
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/' + base, {
        timeout: HTTP_TIMEOUT_MS,
        headers: { 'Accept': 'application/json' }
    });
    const rates = response.data && response.data.rates;
    if (!rates || typeof rates[target] !== 'number' || !Number.isFinite(rates[target])) {
        throw new Error('汇率服务未返回有效汇率（' + base + ' → ' + target + '）。');
    }
    return rates[target];
}

async function convert() {
    try {
        const parsed = parseAmounts(text);
        const target = resolveTargetCurrency();
        const rates = {};
        const sources = Array.from(new Set(parsed.amounts.map(x => x.currency)));
        await Promise.all(sources.map(async source => { rates[source] = await getRate(source, target); }));

        const total = parsed.amounts.reduce((sum, item) => sum + item.amount * rates[item.currency], 0);
        const formatAmount = value => value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const expression = parsed.amounts.map(item =>
            formatAmount(item.amount) + ' ' + item.currency
        ).join(' + ');
        const totalText = formatAmount(total);
        const relation = sources.length > 1 || sources[0] !== target ? ' ≈ ' : ' = ';
        return expression + relation + totalText + ' ' + target;
    } catch (e) {
        const status = e.response && e.response.status;
        let message = e.message || '未知错误';
        if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') message = '汇率请求超时，请检查网络后重试。';
        else if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') message = '无法连接汇率服务，请检查网络或 DNS。';
        else if (status === 429) message = '汇率服务请求过于频繁，请稍后重试。';
        else if (status >= 500) message = '汇率服务暂时不可用，请稍后重试。';
        return '❌ 汇率转换失败：' + message;
    }
}

return await convert();
