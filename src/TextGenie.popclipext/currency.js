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
    '马币': 'MYR', '马来西亚林吉特': 'MYR',
    '菲律宾比索': 'PHP',
    '印尼盾': 'IDR',
    '印尼卢比': 'IDR',
    '越南盾': 'VND',
    '阿联酋迪拉姆': 'AED',
    '沙特里亚尔': 'SAR',
    '巴西雷亚尔': 'BRL',
    '墨西哥比索': 'MXN',
    '土耳其里拉': 'TRY',
    '波兰兹罗提': 'PLN',
    '瑞典克朗': 'SEK',
    '挪威克朗': 'NOK',
    '丹麦克朗': 'DKK',
    '南非兰特': 'ZAR',
    '以色列新谢克尔': 'ILS',
    '新谢克尔': 'ILS',
    '乌克兰格里夫纳': 'UAH',
    '尼日利亚奈拉': 'NGN',
    '埃及镑': 'EGP',
    '阿根廷比索': 'ARS',
    '智利比索': 'CLP',
    '哥伦比亚比索': 'COP',
    '捷克克朗': 'CZK',
    '匈牙利福林': 'HUF',
    '罗马尼亚列伊': 'RON',
    '孟加拉塔卡': 'BDT',
    '巴基斯坦卢比': 'PKR',
    '肯尼亚先令': 'KES',
    '摩洛哥迪拉姆': 'MAD',
    '哈萨克斯坦坚戈': 'KZT',
    '格鲁吉亚拉里': 'GEL',
    '阿塞拜疆马纳特': 'AZN'
};

const CN_NAMES = {
    CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元',
    HKD: '港币', KRW: '韩元', TWD: '台币', SGD: '新加坡元',
    AUD: '澳元', CAD: '加元', CHF: '瑞郎', NZD: '纽元', MYR: '马币',
    THB: '泰铢', INR: '卢比', RUB: '卢布',
    PHP: '菲律宾比索', IDR: '印尼盾', VND: '越南盾', AED: '阿联酋迪拉姆',
    SAR: '沙特里亚尔', BRL: '巴西雷亚尔', MXN: '墨西哥比索', TRY: '土耳其里拉',
    PLN: '波兰兹罗提', SEK: '瑞典克朗', NOK: '挪威克朗', DKK: '丹麦克朗',
    ZAR: '南非兰特', ILS: '以色列新谢克尔', UAH: '乌克兰格里夫纳', NGN: '尼日利亚奈拉',
    EGP: '埃及镑', ARS: '阿根廷比索', CLP: '智利比索', COP: '哥伦比亚比索',
    CZK: '捷克克朗', HUF: '匈牙利福林', RON: '罗马尼亚列伊', BDT: '孟加拉塔卡',
    PKR: '巴基斯坦卢比', KES: '肯尼亚先令', MAD: '摩洛哥迪拉姆', KZT: '哈萨克斯坦坚戈',
    GEL: '格鲁吉亚拉里', AZN: '阿塞拜疆马纳特'
};

const SYMBOLS = {
    'R$': 'BRL', '₱': 'PHP', '₫': 'VND', '₺': 'TRY', '₪': 'ILS',
    '₦': 'NGN', '₴': 'UAH', '₸': 'KZT', '₾': 'GEL', '₼': 'AZN',
    '€': 'EUR', '£': 'GBP', '₹': 'INR', '₩': 'KRW', '₽': 'RUB', '฿': 'THB'
};
// Keep in sync with the exchange-rate provider's currently supported currency codes.
const CODE_PATTERN = 'AED|AFN|ALL|AMD|ANG|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BGN|BHD|BIF|BMD|BND|BOB|BRL|BSD|BTN|BWP|BYN|BZD|CAD|CDF|CHF|CLF|CLP|CNH|CNY|COP|CRC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|FOK|GBP|GEL|GGP|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HRK|HTG|HUF|IDR|ILS|IMP|INR|IQD|ISK|JEP|JMD|JOD|JPY|KES|KGS|KHR|KID|KMF|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRU|MUR|MVR|MWK|MXN|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLE|SOS|SRD|SSP|STN|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TVD|TWD|TZS|UAH|UGX|USD|UYU|UZS|VES|VND|VUV|WST|XAF|XCD|XDR|XOF|XPF|YER|ZAR|ZMW|ZWL';

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
        IN: 'INR', TH: 'THB', MY: 'MYR', RU: 'RUB', PH: 'PHP', ID: 'IDR', VN: 'VND',
        AE: 'AED', SA: 'SAR', BR: 'BRL', MX: 'MXN', TR: 'TRY', PL: 'PLN', SE: 'SEK',
        NO: 'NOK', DK: 'DKK', ZA: 'ZAR', IL: 'ILS', UA: 'UAH', NG: 'NGN', EG: 'EGP',
        AR: 'ARS', CL: 'CLP', CO: 'COP', CZ: 'CZK', HU: 'HUF', RO: 'RON', BD: 'BDT',
        PK: 'PKR', KE: 'KES', MA: 'MAD', KZ: 'KZT', GE: 'GEL', AZ: 'AZN', DE: 'EUR', FR: 'EUR',
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
    const matchedNames = Object.keys(CN_CURRENCY_NAMES).filter(name => token.includes(name));
    for (const name of matchedNames) {
        // Prefer specific names over a shorter alias contained inside them (e.g. Pakistani rupee vs. rupee).
        if (!matchedNames.some(other => other.length > name.length && other.includes(name))) {
            found.add(CN_CURRENCY_NAMES[name]);
        }
    }

    const qualified = [
        { re: /(?:JP|JPN)\s*[¥￥]/i, code: 'JPY' },
        { re: /(?:CN|CNY)\s*[¥￥]/i, code: 'CNY' },
        { re: /HK\s*\$/i, code: 'HKD' },
        { re: /NT\s*\$/i, code: 'TWD' },
        { re: /R\s*\$/i, code: 'BRL' },
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
    if (token.includes('$') && !/(?:US|HK|NT|A|AUD|C|CAD|S|SGD|R)\s*\$/i.test(token)) {
        const dollarCurrencies = ['USD', 'HKD', 'TWD', 'AUD', 'CAD', 'SGD'];
        found.add(dollarCurrencies.includes(localeCurrency) ? localeCurrency : 'USD');
    }

    if (found.size > 1) throw new Error('单笔金额中检测到多个币种，请明确写出币种代码，例如 USD 100 或 JP¥3,000。');
    return found.size ? Array.from(found)[0] : null;
}

function normalizeAmountNumber(value) {
    let numberText = value.replace(/[’']/g, '').replace(/[\s\u00A0\u202F]/g, '').replace(/−/g, '-');
    const hasComma = numberText.includes(',');
    const hasDot = numberText.includes('.');
    if (hasComma && hasDot) {
        const decimalSeparator = numberText.lastIndexOf(',') > numberText.lastIndexOf('.') ? ',' : '.';
        const groupingSeparator = decimalSeparator === ',' ? '.' : ',';
        numberText = numberText.split(groupingSeparator).join('');
        if (decimalSeparator === ',') numberText = numberText.replace(',', '.');
    } else if (hasComma) {
        const groups = numberText.split(',');
        if (groups.length > 1 && groups.slice(1).every(group => group.length === 3)) {
            numberText = groups.join('');
        } else if (groups.length === 2 && groups[1].length > 0) {
            numberText = groups[0] + '.' + groups[1];
        }
    } else if (hasDot) {
        const groups = numberText.split('.');
        if (groups.length > 2 && groups.slice(1).every(group => group.length === 3)) {
            numberText = groups.join('');
        }
    }
    return numberText;
}

function parseAmounts(input) {
    const locale = getLocaleDefaults();
    // Remove invisible direction/format controls added by rich-text sources (e.g. ⁦JP¥⁩2,640).
    const normalizedInput = input.replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069\u2060\uFEFF\u00AD\u200B]/g, '');
    const cleaned = normalizedInput.trim();
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
            .replace(/R\s*\$/ig, '')
            .replace(/[$¥￥€£₹₩₽฿₱₫₺₪₦₴₸₾₼]/g, '');
        for (const name of Object.keys(CN_CURRENCY_NAMES).sort((a, b) => b.length - a.length)) {
            numberText = numberText.replaceAll(name, '');
        }
        numberText = numberText.replace(/[()\s]/g, '');
        numberText = normalizeAmountNumber(numberText);
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
