# 🍌 TextGenie for PopClip

[🇨🇳 中文版](./README_zh.md)

**TextGenie** is a magical PopClip extension with multiple intelligent actions.

## ✨ Features

### 🔗 Open URL
- Auto-detects URLs, IPs, localhost.
- Opens in default browser.

### 💱 Currency Conversion
- 15 currencies (CNY, USD, EUR, JPY, etc.).
- Smart parsing: `$100`, `100 USD`, `100 美元`.
- Clean output: `100 USD = 720.50 CNY`.

### 🅰️ Translation
- **Engines**: Google, DeepL, OpenAI, Gemini, Custom API.
- **Apps**: Bob, Eudic integration.
- **Languages**: Auto, Chinese, English, Japanese, Korean, French, German, Spanish, Russian.

### 🖥️ Terminal Action
- **Better than Official**:
  - **Smart Cleaning**: Automatically strips leading prompts (`$`, `#`, `>`, `%`) and extra whitespace.
  - **Modern Recognition**: Supports `python3`, `pip3`, `docker`, `kubectl`, `bun`, `systemctl`, `vercel`, and 100+ dev tools.
  - **Non-Destructive**: Fills the command in Terminal/iTerm2 without auto-running, allowing for review.
- **Support**: Terminal.app, iTerm2 (Native optimized).

### 📂 Path Recognition
- **Universal Recognition**: Detects absolute (`/`), home (`~/`), and relative (`./`) paths.
- **Smart Auto-Correction**: Automatically prepends `/` or `~/` to common patterns (e.g., `Users/`, `Desktop/`, `Downloads/`).
- **Placeholder Support**: Supports `%user%` placeholder for dynamic resolution.
- **Wide App Support**: Finder, Path Finder, ForkLift, QSpace, Commander One, Marta.

## 🛠 Installation

1. Download `TextGenie.popclipextz`
2. Double-click to install

## ⚙️ Configuration

| Option | Description |
| ------ | ----------- |
| Translation Service | Google, DeepL, OpenAI, Gemini, Custom, Bob, Eudic |
| Translation Target | Auto, Chinese, English, Japanese, etc. |
| API Key | Required for DeepL, OpenAI, Gemini, Custom |
| Target Currency | CNY, USD, EUR, GBP, JPY, etc. |
| Preferred Terminal | Terminal, iTerm2, Auto |
| Preferred File Manager | Finder, Path Finder, ForkLift, QSpace, Commander One, Marta |
| Use New Tab | Open terminal/path in a new tab |

## 👨‍💻 Development

```bash
cd src && zip -r ../extensions/TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

MIT
