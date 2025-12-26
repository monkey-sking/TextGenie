# 🍌 TextGenie for PopClip

[🇨🇳 中文版](./README_zh.md)

**TextGenie** is a magical PopClip extension with 3 intelligent actions: **Open URL**, **Convert Currency**, and **Translate**.

## ✨ Features

### 🔗 Open URL

- Auto-detects URLs, IPs, localhost
- Opens in default browser

### 💱 Currency Conversion

- 15 currencies (CNY, USD, EUR, JPY, etc.)
- Smart parsing: `$100`, `100 USD`, `100 美元`
- Clean output: `100 USD = 720.50 CNY`

### 🅰️ Translation

- **Engines**: Google, DeepL, OpenAI, Gemini, Custom API
- **Apps**: Bob, Eudic integration
- **Languages**: Auto, Chinese, English, Japanese, Korean, French, German, Spanish, Russian

## 🛠 Installation

1. Download `TextGenie.popclipextz`
2. Double-click to install

## ⚙️ Configuration

| Option | Description |
| ------ | ----------- |
| Translation Service | Google, DeepL, OpenAI, Gemini, Custom, Bob, Eudic |
| Target Language | Auto, Chinese, English, Japanese, etc. |
| API Key | Required for DeepL, OpenAI, Gemini, Custom |
| Target Currency | CNY, USD, EUR, GBP, JPY, etc. |

## 👨‍💻 Development

```bash
cd src && zip -r ../extensions/TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

MIT
