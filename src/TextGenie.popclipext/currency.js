// PopClip Currency Converter
const axios = require('axios');

const text = String(popclip.input.text || '').trim();
const targetCurrency = popclip.options.targetCurrency || 'CNY';
const targetLanguage = popclip.options.targetLanguage || 'auto';
const HTTP_TIMEOUT_MS = 8000;

const CN_CURRENCY_NAMES = {
    '人民币': 'CNY', '美元': 'USD', '美金': 'USD', '欧元': 'EUR', '英镑': 'GBP',
    '日元': 'JPY', '日币': 'JPY', '日圆': 'JPY', '日圓': 'JPY', '円': 'JPY',
    '港币': 'HKD', '港元': 'HKD', '韩元': 'KRW', '台币': 'TWD', '新台币': 'TWD',
    '新加坡元': 'SGD', '新币': 'SGD', '澳元': 'AUD', '澳币': 'AUD',
    '加元': 'CAD', '加币': 'CAD', '瑞士法郎': 'CHF', '瑞郎': 'CHF',
    '泰铢': 'THB', '卢比': 'INR', '卢布': 'RUB'
};

const CURRENCY_SYMBOLS = {
    '$': 'USD', '¥': 'CNY', '￥': 'CNY', '€': 'EUR', '£': 'GBP',
    '₹': 'INR', '₩': 'KRW', '₽': 'RUB', '฿': 'THB'
};

const QUALIFIED_SYMBOLS = [
    { pattern: /(?:JP|JPN)\s*[¥￥]/i, currency: 'JPY' },
    { pattern: /(?:CN|CNY)\s*[¥￥]/i, currency: 'CNY' },
    { pattern: /(?:HK|HKD)\s*[¥￥]/i, currency: 'HKD' },
    { pattern: /HK\s*\$/i, currency: 'HKD' },
    { pattern: /NT\s*\$/i, currency: 'TWD' },
    { pattern: /(?:A|AUD)\s*\$/i, currency: 'AUD' },
    { pattern: /(?:C|CAD)\s*\$/i, currency: 'CAD' },
    { pattern: /(?:S|SGD)\s*\$/i, currency: 'SGD' },
    { pattern: /US\s*\$/i, currency: 'USD' }
];

const CN_NAMES = {
    CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元',
    HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元',
    AUD: '澳元', CAD: '加元', CHF: '瑞郎', NZD: '纽元', MYR: '马来西亚林吉特',
    THB: '泰铢', INR: '卢比', RUB: '卢布'
};
const CODES_PATTERN = 'USD|EUR|GBP|JPY|CNY|HKD|AUD|CAD|CHF|SGD|NZD|INR|KRW|THB|MYR|RUB|TWD';

function parseCurrency(input) {
    const cleaned = input.replace(/,/g, '').trim();
    const detectedCurrencies = new Set();

    for (const [name, code] of Object.entries(CN_CURRENCY_NAMES)) {
        if (cleaned.includes(name)) detectedCurrencies.add(code);
    }
    for (const qualified of QUALIFIED_SYMBOLS) {
        if (qualified.pattern.test(cleaned)) detectedCurrencies.add(qualified.currency);
    }

    const codeMatches = cleaned.match(new RegExp('\\b(' + CODES_PATTERN + ')\\b', 'ig')) || [];
    for (const code of codeMatches) detectedCurrencies.add(code.toUpperCase());

    const hasQualifiedYen = /(?:JP|JPN|CN|CNY|HK|HKD)\s*[¥￥]/i.test(cleaned);
    const hasQualifiedDollar = /(?:US|HK|NT|A|AUD|C|CAD|S|SGD)\s*\$/i.test(cleaned);
    for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
        if ((symbol === '¥' || symbol === '￥') && hasQualifiedYen) continue;
        if (symbol === '$' && hasQualifiedDollar) continue;
        if (cleaned.includes(symbol)) detectedCurrencies.add(code);
    }

    if (detectedCurrencies.size > 1) {
        throw new Error('Mixed currencies cannot be added directly. Convert each amount to the same currency first.');
    }
    const currency = detectedCurrencies.size === 1 ? Array.from(detectedCurrencies)[0] : null;

    const expression = cleaned
        .replace(/(?:US|JP|JPN|CN|CNY|HK|HKD|NT|AUD|A|CAD|C|SGD|S)\s*(?=[$¥￥])/ig, '')
        .replace(/[$¥￥€£₹₩₽฿]/g, '')
        .replace(new RegExp('\\b(?:' + CODES_PATTERN + ')\\b', 'ig'), '')
        .replace(/[()\s]/g, '');
    if (!/^-?\d+(?:\.\d+)?(?:\+-?\d+(?:\.\d+)?)*$/.test(expression)) {
        throw new Error('Unsupported amount format');
    }
    const terms = expression.split('+').map(Number);
    if (!terms.every(Number.isFinite)) throw new Error('Invalid amount');
    const amount = terms.reduce((sum, value) => sum + value, 0);
    if (!Number.isFinite(amount)) throw new Error('Amount is outside the supported numeric range');
    return { amount, currency };
}

async function convert() {
    try {
        const parsed = parseCurrency(text);
        let { amount, currency } = parsed;
        if (!currency) currency = 'CNY';
        const isChinese = targetLanguage === 'zh-CN' || targetLanguage === 'auto';

        if (currency === targetCurrency) {
            const name = isChinese ? (CN_NAMES[currency] || currency) : currency;
            return amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + name;
        }

        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/' + currency, {
            timeout: HTTP_TIMEOUT_MS,
            headers: { 'Accept': 'application/json' }
        });
        const rates = response.data && response.data.rates;
        if (!rates || typeof rates[targetCurrency] !== 'number' || !Number.isFinite(rates[targetCurrency])) {
            throw new Error('汇率服务未返回有效汇率，请稍后重试');
        }

        const converted = (amount * rates[targetCurrency]).toFixed(2);
        const formattedAmount = amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
        if (isChinese) {
            return formattedAmount + ' ' + (CN_NAMES[currency] || currency) + ' ≈ ' +
                Number(converted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
                ' ' + (CN_NAMES[targetCurrency] || targetCurrency);
        }
        return formattedAmount + ' ' + currency + ' = ' + converted + ' ' + targetCurrency;
    } catch (e) {
        const status = e.response?.status;
        let message = e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT' ? '汇率请求超时，请检查网络后重试' : e.message;
        if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') message = '无法连接汇率服务，请检查网络或 DNS';
        else if (status === 429) message = '汇率服务请求过于频繁，请稍后重试';
        else if (status >= 500) message = '汇率服务暂时不可用，请稍后重试';
        return '❌ 汇率转换失败：' + message;
    }
}

return await convert();
