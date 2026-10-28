// PopClip Currency Converter
const axios = require('axios');

const text = popclip.input.text.trim();
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
    AUD: '澳元', CAD: '加元', CHF: '瑞郎', THB: '泰铢', INR: '卢比', RUB: '卢布'
};
const CODES_PATTERN = 'USD|EUR|GBP|JPY|CNY|HKD|AUD|CAD|CHF|SGD|NZD|INR|KRW|THB|MYR|RUB|TWD';

function parseCurrency(input) {
    const cleaned = input.replace(/,/g, '').trim();
    let currency = null;

    for (const entry of Object.entries(CN_CURRENCY_NAMES)) {
        if (cleaned.includes(entry[0])) { currency = entry[1]; break; }
    }
    if (!currency) {
        for (const qualified of QUALIFIED_SYMBOLS) {
            if (qualified.pattern.test(cleaned)) { currency = qualified.currency; break; }
        }
    }
    if (!currency) {
        const codeMatch = cleaned.match(new RegExp('\\b(' + CODES_PATTERN + ')\\b', 'i'));
        if (codeMatch) currency = codeMatch[1].toUpperCase();
    }
    if (!currency) {
        for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
            if (cleaned.includes(symbol)) { currency = code; break; }
        }
    }

    // Support same-currency arithmetic such as "$58.83+56.26".
    // Only accept a simple sum of numeric terms; never evaluate arbitrary text.
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
            timeout: HTTP_TIMEOUT_MS
        });
        const rates = response.data && response.data.rates;
        if (!rates || !rates[targetCurrency]) throw new Error('Rate not available');

        const converted = (amount * rates[targetCurrency]).toFixed(2);
        const formattedAmount = amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
        if (isChinese) {
            return formattedAmount + ' ' + (CN_NAMES[currency] || currency) + ' ≈ ' +
                Number(converted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
                ' ' + (CN_NAMES[targetCurrency] || targetCurrency);
        }
        return formattedAmount + ' ' + currency + ' = ' + converted + ' ' + targetCurrency;
    } catch (e) {
        const message = e.code === 'ECONNABORTED' ? 'Request timed out' : e.message;
        return '❌ Currency error: ' + message;
    }
}

return await convert();
