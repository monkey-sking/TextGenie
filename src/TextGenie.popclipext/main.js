// PopClip Smart Assistant - Translation Module
const axios = require('axios');

const text = String(popclip.input.text || '').trim();
const targetLanguage = popclip.options.targetLanguage || 'auto';
const translationService = popclip.options.translationService || 'google';
const apiKey = String(popclip.options.apiKey || '').trim();
const customApiUrl = String(popclip.options.customApiUrl || '').trim();
const customModel = String(popclip.options.customModel || '').trim();
const customPrompt = String(popclip.options.customPrompt || '').trim();
const HTTP_TIMEOUT_MS = 8000;

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

function joinTextParts(parts) {
    if (!Array.isArray(parts)) return '';
    let text = '';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (typeof part === 'string') {
            text += part;
        } else if (typeof part?.text === 'string') {
            text += part.text;
        }
    }

    return text.trim();
}

function extractResponseText(data) {
    if (typeof data === 'string') return data.trim();

    const messageContent = data?.choices?.[0]?.message?.content;
    if (typeof messageContent === 'string' && messageContent.trim()) {
        return messageContent.trim();
    }

    const messageParts = joinTextParts(messageContent);
    if (messageParts) return messageParts;

    const choiceText = data?.choices?.[0]?.text;
    if (typeof choiceText === 'string' && choiceText.trim()) {
        return choiceText.trim();
    }

    const outputText = data?.output_text;
    if (typeof outputText === 'string' && outputText.trim()) {
        return outputText.trim();
    }

    const candidateParts = joinTextParts(data?.candidates?.[0]?.content?.parts);
    if (candidateParts) return candidateParts;

    if (Array.isArray(data?.output)) {
        for (let i = 0; i < data.output.length; i++) {
            const item = data.output[i];
            const contentText = joinTextParts(item?.content);
            if (contentText) return contentText;
        }
    }

    return '';
}

function summarizeResponseBody(data) {
    if (typeof data === 'string') return data.trim();
    if (typeof data?.message === 'string') return data.message.trim();
    if (typeof data?.detail === 'string') return data.detail.trim();
    if (typeof data?.error === 'string') return data.error.trim();
    if (typeof data?.error?.message === 'string') return data.error.message.trim();
    return '';
}

function normalizeCustomApiUrl(apiUrl) {
    const raw = String(apiUrl || '').trim();
    if (!raw) return '';

    try {
        const parsed = new URL(raw);
        const pathname = parsed.pathname.replace(/\/+$/, '');

        if (/(\/chat\/completions|\/completions|\/responses)$/.test(pathname)) {
            return parsed.toString();
        }

        if (!pathname || pathname === '/') {
            parsed.pathname = '/v1/chat/completions';
            return parsed.toString();
        }

        if (/\/v[0-9]+$/.test(pathname)) {
            parsed.pathname = pathname + '/chat/completions';
            return parsed.toString();
        }

        return parsed.toString();
    } catch (e) {
        return raw;
    }
}

// ============ Translation Services ============
async function translateGoogle(text, targetLang) {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text);
    const response = await axios.get(url, { timeout: HTTP_TIMEOUT_MS });
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
        {
            headers: { 'Authorization': 'DeepL-Auth-Key ' + apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: HTTP_TIMEOUT_MS
        }
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
        {
            headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
            timeout: HTTP_TIMEOUT_MS
        }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || 'OpenAI translation failed';
}

async function translateGemini(text, targetLang, apiKey) {
    if (!apiKey) return '❌ Gemini requires API key';

    const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        { contents: [{ parts: [{ text: getPrompt(targetLang) + '\n\n' + text }] }] },
        { headers: { 'Content-Type': 'application/json' }, timeout: HTTP_TIMEOUT_MS }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Gemini translation failed';
}

async function translateCustom(text, targetLang, apiKey, apiUrl, model) {
    if (!apiUrl) return '❌ Custom API URL not configured';
    if (!model) return '❌ Custom model not configured';

    const requestUrl = normalizeCustomApiUrl(apiUrl);
    const headers = { 'Content-Type': 'application/json' };

    if (apiKey) {
        headers.Authorization = 'Bearer ' + apiKey;
    }

    const response = await axios.post(requestUrl,
        {
            model: model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: getPrompt(targetLang) },
                { role: 'user', content: text }
            ],
            max_tokens: 1000
        },
        {
            headers,
            timeout: HTTP_TIMEOUT_MS
        }
    );

    return extractResponseText(response.data) || 'Custom API translation failed';
}

function translateBob(text) {
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    popclip.runAppleScript(
        'with timeout of 3 seconds\n' +
        'tell application "Bob" to translate "' + escaped + '"\n' +
        'end timeout'
    );
    return '📖 Sent to Bob';
}

function translateEudic(text) {
    popclip.openUrl('eudic://dict/' + encodeURIComponent(text));
    return '📚 Sent to Eudic';
}

function getErrorMessage(e) {
    if (e.code === 'ECONNABORTED') return 'Request timed out';
    return summarizeResponseBody(e.response?.data) || e.message || 'Error';
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
    return '❌ ' + getErrorMessage(e);
}
