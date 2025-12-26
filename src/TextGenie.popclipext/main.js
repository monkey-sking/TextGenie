// PopClip Smart Assistant - Currency Conversion & Translation
const axios = require('axios');
const text = popclip.input.text.trim();
const targetCurrency = popclip.options.targetCurrency || 'CNY';
const targetLanguage = popclip.options.targetLanguage || 'auto';
const pureNumberMode = popclip.options.pureNumberMode || 'currency';
const translationService = popclip.options.translationService || 'google';
const apiKey = popclip.options.apiKey || '';
const customApiUrl = popclip.options.customApiUrl || '';
const customModel = popclip.options.customModel || 'gpt-4o-mini';
const customPrompt = popclip.options.customPrompt || '';

const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'HKD', 'AUD', 'CAD', 'CHF', 'SGD', 'NZD', 'INR', 'KRW', 'THB', 'MYR', 'RUB', 'TWD'];

// ============ Currency Functions ============
const CN_CURRENCY_NAMES = {
    '人民币': 'CNY', '美元': 'USD', '美金': 'USD', '欧元': 'EUR', '英镑': 'GBP',
    '日元': 'JPY', '日币': 'JPY', '港币': 'HKD', '港元': 'HKD', '韩元': 'KRW',
    '台币': 'TWD', '新台币': 'TWD', '新加坡元': 'SGD', '新币': 'SGD',
    '澳元': 'AUD', '澳币': 'AUD', '加元': 'CAD', '加币': 'CAD',
    '瑞士法郎': 'CHF', '瑞郎': 'CHF', '泰铢': 'THB', '卢比': 'INR', '卢布': 'RUB'
};
const CN_NAMES_PATTERN = Object.keys(CN_CURRENCY_NAMES).join('|');

function isCurrency(t) {
    if (/[$¥€£₹₩₽฿₺₴₵]/.test(t)) return true;
    const codePattern = new RegExp(`\\d+[\\s,.]*(${CURRENCY_CODES.join('|')})`, 'i');
    if (codePattern.test(t)) return true;
    const reversePattern = new RegExp(`(${CURRENCY_CODES.join('|')})[\\s]*\\d+`, 'i');
    if (reversePattern.test(t)) return true;
    // Check Chinese currency names
    const cnPattern = new RegExp(`\\d+[\\s]*(${CN_NAMES_PATTERN})`);
    if (cnPattern.test(t)) return true;
    const cnReversePattern = new RegExp(`(${CN_NAMES_PATTERN})[\\s]*\\d+`);
    return cnReversePattern.test(t);
}

function detectTextType(t, mode) {
    if (isCurrency(t)) return 'currency';
    if (/^\s*[\d,]+\.?\d*\s*$/.test(t)) return mode;
    return 'text';
}

function parseCurrency(t) {
    const cleaned = t.replace(/,/g, '');

    // Check Chinese currency names first
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


// ============ Language Detection ============
function detectLanguage(t) {
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return 'ja';
    if (/[\uac00-\ud7af]/.test(t)) return 'ko';
    if (/[\u4e00-\u9fa5]/.test(t)) return 'zh';
    if (/[\u0400-\u04ff]/.test(t)) return 'ru';
    return 'en';
}

function getTargetLang(detectedLang, userTarget) {
    if (userTarget !== 'auto') return userTarget;
    return (detectedLang === 'zh') ? 'en' : 'zh-CN';
}

function getLangName(code) {
    const names = {
        'zh-CN': 'Chinese', 'en': 'English', 'ja': 'Japanese', 'ko': 'Korean',
        'fr': 'French', 'de': 'German', 'es': 'Spanish', 'ru': 'Russian',
        'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'ar': 'Arabic',
        'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'tr': 'Turkish',
        'pl': 'Polish', 'uk': 'Ukrainian'
    };
    return names[code] || 'English';
}

function getPrompt(targetLang) {
    if (customPrompt) {
        return customPrompt.replace(/{lang}/g, getLangName(targetLang));
    }
    return 'Translate to ' + getLangName(targetLang) + '. Output translation only.';
}

// ============ Translation Services ============
async function translateGoogle(text, targetLang) {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text);
    const response = await axios.get(url);
    const data = response.data;

    let translated = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
        for (let i = 0; i < data[0].length; i++) {
            if (Array.isArray(data[0][i]) && data[0][i][0]) {
                translated += String(data[0][i][0]);
            }
        }
    }
    return translated || 'Translation failed';
}

async function translateDeepL(text, targetLang, apiKey) {
    if (!apiKey) return '❌ DeepL requires API key';

    const langMap = { 'zh-CN': 'ZH', 'en': 'EN', 'ja': 'JA', 'ko': 'KO', 'fr': 'FR', 'de': 'DE', 'es': 'ES', 'ru': 'RU' };
    const deepLLang = langMap[targetLang] || 'EN';

    const response = await axios.post('https://api-free.deepl.com/v2/translate',
        'text=' + encodeURIComponent(text) + '&target_lang=' + deepLLang,
        { headers: { 'Authorization': 'DeepL-Auth-Key ' + apiKey, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (response.data?.translations?.[0]) {
        return response.data.translations[0].text;
    }
    return 'DeepL translation failed';
}

async function translateOpenAI(text, targetLang, apiKey) {
    if (!apiKey) return '❌ OpenAI requires API key';

    const response = await axios.post('https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: getPrompt(targetLang) },
                { role: 'user', content: text }
            ],
            max_tokens: 1000
        },
        { headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' } }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || 'OpenAI translation failed';
}

async function translateGemini(text, targetLang, apiKey) {
    if (!apiKey) return '❌ Gemini requires API key';

    const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        { contents: [{ parts: [{ text: getPrompt(targetLang) + '\n\n' + text }] }] },
        { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Gemini translation failed';
}

async function translateCustom(text, targetLang, apiKey, apiUrl, model) {
    if (!apiKey) return '❌ Custom API requires API key';
    if (!apiUrl) return '❌ Custom API URL not configured';

    const response = await axios.post(apiUrl,
        {
            model: model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: getPrompt(targetLang) },
                { role: 'user', content: text }
            ],
            max_tokens: 1000
        },
        { headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' } }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || 'Custom API translation failed';
}

function translateBob(text) {
    popclip.runAppleScript('tell application "Bob" to translate "' + text.replace(/"/g, '\\"') + '"');
    return '📖 Sent to Bob';
}

function translateEudic(text) {
    popclip.openUrl('eudic://dict/' + encodeURIComponent(text));
    return '📚 Sent to Eudic';
}

// ============ Main Logic (Translation) ============
if (!text) {
    return '❌ No text selected';
}

const detectedLang = detectLanguage(text);
const targetLang = getTargetLang(detectedLang, targetLanguage);

try {
    switch (translationService) {
        case 'deepl':
            return await translateDeepL(text, targetLang, apiKey);
        case 'openai':
            return await translateOpenAI(text, targetLang, apiKey);
        case 'gemini':
            return await translateGemini(text, targetLang, apiKey);
        case 'custom':
            return await translateCustom(text, targetLang, apiKey, customApiUrl, customModel);
        case 'bob':
            return translateBob(text);
        case 'eudic':
            return translateEudic(text);
        default:
            return await translateGoogle(text, targetLang);
    }
} catch (e) {
    return '❌ ' + (e.response?.data?.error?.message || e.message || 'Error');
}
