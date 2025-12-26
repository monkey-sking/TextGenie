// PopClip Currency Converter
const axios = require('axios');
const text = popclip.input.text.trim();
const targetCurrency = popclip.options.targetCurrency || 'CNY';
const targetLanguage = popclip.options.targetLanguage || 'auto';

const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'HKD', 'AUD', 'CAD', 'CHF', 'SGD', 'NZD', 'INR', 'KRW', 'THB', 'MYR', 'RUB', 'TWD'];
const CN_CURRENCY_NAMES = {
    '人民币': 'CNY', '美元': 'USD', '美金': 'USD', '欧元': 'EUR', '英镑': 'GBP',
    '日元': 'JPY', '日币': 'JPY', '港币': 'HKD', '港元': 'HKD', '韩元': 'KRW',
    '台币': 'TWD', '新台币': 'TWD', '新加坡元': 'SGD', '新币': 'SGD',
    '澳元': 'AUD', '澳币': 'AUD', '加元': 'CAD', '加币': 'CAD',
    '瑞士法郎': 'CHF', '瑞郎': 'CHF', '泰铢': 'THB', '卢比': 'INR', '卢布': 'RUB'
};

function parseCurrency(t) {
    const cleaned = t.replace(/,/g, '');
    for (const [name, code] of Object.entries(CN_CURRENCY_NAMES)) {
        if (cleaned.includes(name)) {
            const numMatch = cleaned.match(/(\d+\.?\d*)/);
            if (numMatch) return { amount: parseFloat(numMatch[1]), currency: code };
        }
    }
    let match = cleaned.match(/(\d+\.?\d*)\s*([A-Z]{3})/i);
    if (match) return { amount: parseFloat(match[1]), currency: match[2].toUpperCase() };
    match = cleaned.match(/([A-Z]{3})\s*(\d+\.?\d*)/i);
    if (match) return { amount: parseFloat(match[2]), currency: match[1].toUpperCase() };

    const symbols = { '$': 'USD', '¥': 'CNY', '€': 'EUR', '£': 'GBP', '₹': 'INR', '₩': 'KRW', '₽': 'RUB', '฿': 'THB' };
    for (const [sym, code] of Object.entries(symbols)) {
        if (cleaned.includes(sym)) {
            const numMatch = cleaned.match(/(\d+\.?\d*)/);
            if (numMatch) return { amount: parseFloat(numMatch[1]), currency: code };
        }
    }
    const numMatch = cleaned.match(/(\d+\.?\d*)/);
    if (numMatch) return { amount: parseFloat(numMatch[1]), currency: null };
    throw new Error('Could not parse currency');
}

async function convert() {
    try {
        const parsed = parseCurrency(text);
        let { amount, currency } = parsed;
        if (!currency) currency = 'CNY';

        if (currency === targetCurrency) {
            const isChinese = targetLanguage === 'zh-CN' || targetLanguage === 'auto';
            const cnNames = { CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元', HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元', AUD: '澳元', CAD: '加元', CHF: '瑞郎', THB: '泰铢', INR: '卢比', RUB: '卢布' };
            const name = isChinese ? (cnNames[currency] || currency) : currency;
            return amount + ' ' + name;
        }

        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/' + currency);
        const rates = response.data.rates;

        if (!rates?.[targetCurrency]) {
            throw new Error('Rate not available');
        }

        const converted = (amount * rates[targetCurrency]).toFixed(2);

        const isChinese = targetLanguage === 'zh-CN' || targetLanguage === 'auto';
        if (isChinese) {
            const cnNames = { CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元', HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元', AUD: '澳元', CAD: '加元', CHF: '瑞郎', THB: '泰铢', INR: '卢比', RUB: '卢布' };
            const fromName = cnNames[currency] || currency;
            const toName = cnNames[targetCurrency] || targetCurrency;
            return amount + ' ' + fromName + ' ≈ ' + converted + ' ' + toName;
        } else {
            return amount + ' ' + currency + ' = ' + converted + ' ' + targetCurrency;
        }
    } catch (e) {
        return '❌ Currency error: ' + e.message;
    }
}

return await convert();
