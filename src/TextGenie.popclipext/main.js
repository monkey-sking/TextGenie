// PopClip Smart Assistant - Translation Module
const axios = require('axios');

const text = popclip.input.text.trim();
const targetLanguage = popclip.options.targetLanguage || 'auto';
const translationService = popclip.options.translationService || 'google';
const apiKey = popclip.options.apiKey || '';
const customApiUrl = popclip.options.customApiUrl || '';
const customModel = popclip.options.customModel || 'gpt-4o-mini';
const customPrompt = popclip.options.customPrompt || '';

// ============ Language Detection (Precompiled) ============
const RE_JAPANESE = /[\u3040-\u309f\u30a0-\u30ff]/;
const RE_KOREAN = /[\uac00-\ud7af]/;
const RE_CHINESE = /[\u4e00-\u9fa5]/;
const RE_RUSSIAN = /[\u0400-\u04ff]/;

function detectLanguage(t) {
    if (RE_JAPANESE.test(t)) return 'ja';
    if (RE_KOREAN.test(t)) return 'ko';
    if (RE_CHINESE.test(t)) return 'zh';
    if (RE_RUSSIAN.test(t)) return 'ru';
    return 'en';
}

// ============ Language Utilities ============
const LANG_NAMES = {
    'zh-CN': 'Chinese', 'en': 'English', 'ja': 'Japanese', 'ko': 'Korean',
    'fr': 'French', 'de': 'German', 'es': 'Spanish', 'ru': 'Russian',
    'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'ar': 'Arabic',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'tr': 'Turkish',
    'pl': 'Polish', 'uk': 'Ukrainian'
};

const DEEPL_LANG_MAP = {
    'zh-CN': 'ZH', 'en': 'EN', 'ja': 'JA', 'ko': 'KO',
    'fr': 'FR', 'de': 'DE', 'es': 'ES', 'ru': 'RU'
};

function getTargetLang(detectedLang, userTarget) {
    if (userTarget !== 'auto') return userTarget;
    return (detectedLang === 'zh') ? 'en' : 'zh-CN';
}

function getPrompt(targetLang) {
    const langName = LANG_NAMES[targetLang] || 'English';
    if (customPrompt) {
        return customPrompt.replace(/{lang}/g, langName);
    }
    return 'Translate to ' + langName + '. Output translation only.';
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

    const deepLLang = DEEPL_LANG_MAP[targetLang] || 'EN';

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
    // Properly escape for AppleScript
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    popclip.runAppleScript('tell application "Bob" to translate "' + escaped + '"');
    return '📖 Sent to Bob';
}

function translateEudic(text) {
    popclip.openUrl('eudic://dict/' + encodeURIComponent(text));
    return '📚 Sent to Eudic';
}

// ============ Main Logic ============
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
