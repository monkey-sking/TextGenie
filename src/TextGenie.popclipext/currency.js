// PopClip Currency Converter
const axios = require('axios');

const text = popclip.input.text.trim();
const targetCurrency = popclip.options.targetCurrency || 'CNY';
const targetLanguage = popclip.options.targetLanguage || 'auto';

// ============ Currency Constants (Precompiled) ============
const CN_CURRENCY_NAMES = {
    '人民币': 'CNY', '美元': 'USD', '美金': 'USD', '欧元': 'EUR', '英镑': 'GBP',
    '日元': 'JPY', '日币': 'JPY', '港币': 'HKD', '港元': 'HKD', '韩元': 'KRW',
    '台币': 'TWD', '新台币': 'TWD', '新加坡元': 'SGD', '新币': 'SGD',
    '澳元': 'AUD', '澳币': 'AUD', '加元': 'CAD', '加币': 'CAD',
    '瑞士法郎': 'CHF', '瑞郎': 'CHF', '泰铢': 'THB', '卢比': 'INR', '卢布': 'RUB'
};

const CURRENCY_SYMBOLS = {
    '$': 'USD', '¥': 'CNY', '€': 'EUR', '£': 'GBP',
    '₹': 'INR', '₩': 'KRW', '₽': 'RUB', '฿': 'THB'
};

const CN_NAMES = {
    CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元',
    HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元',
    AUD: '澳元', CAD: '加元', CHF: '瑞郎', THB: '泰铢', INR: '卢比', RUB: '卢布'
};

// Precompiled regex patterns
const CODES_PATTERN = 'USD|EUR|GBP|JPY|CNY|HKD|AUD|CAD|CHF|SGD|NZD|INR|KRW|THB|MYR|RUB|TWD';
const RE_CODE_AFTER_NUM = new RegExp(`(\\d+\\.?\\d*)\\s*(${CODES_PATTERN})`, 'i');
const RE_CODE_BEFORE_NUM = new RegExp(`(${CODES_PATTERN})\\s*(\\d+\\.?\\d*)`, 'i');
const RE_NUMBER = /(\d+\.?\d*)/;

function parseCurrency(t) {
    const cleaned = t.replace(/,/g, '');
    const numMatch = cleaned.match(RE_NUMBER);
    if (!numMatch) throw new Error('Could not parse currency');
    const amount = parseFloat(numMatch[1]);

    for (const [name, code] of Object.entries(CN_CURRENCY_NAMES)) {
        if (cleaned.includes(name)) return { amount, currency: code };
    }

    let match = cleaned.match(RE_CODE_AFTER_NUM);
    if (match) return { amount: parseFloat(match[1]), currency: match[2].toUpperCase() };
    match = cleaned.match(RE_CODE_BEFORE_NUM);
    if (match) return { amount: parseFloat(match[2]), currency: match[1].toUpperCase() };

    for (const [sym, code] of Object.entries(CURRENCY_SYMBOLS)) {
        if (cleaned.includes(sym)) return { amount, currency: code };
    }

    return { amount, currency: null };
}

// ============ Main Logic ============
async function convert() {
    try {
        const parsed = parseCurrency(text);
        let { amount, currency } = parsed;
        if (!currency) currency = 'CNY';

        const isChinese = targetLanguage === 'zh-CN' || targetLanguage === 'auto';

        if (currency === targetCurrency) {
            const name = isChinese ? (CN_NAMES[currency] || currency) : currency;
            return amount + ' ' + name;
        }

        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/' + currency);
        const rates = response.data.rates;

        if (!rates?.[targetCurrency]) {
            throw new Error('Rate not available');
        }

        const converted = (amount * rates[targetCurrency]).toFixed(2);

        if (isChinese) {
            const fromName = CN_NAMES[currency] || currency;
            const toName = CN_NAMES[targetCurrency] || targetCurrency;
            return amount + ' ' + fromName + ' ≈ ' + converted + ' ' + toName;
        } else {
            return amount + ' ' + currency + ' = ' + converted + ' ' + targetCurrency;
        }
    } catch (e) {
        return '❌ Currency error: ' + e.message;
    }
}

return await convert();
