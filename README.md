# 🍌 TextGenie for PopClip

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE) [![Last commit](https://img.shields.io/github/last-commit/monkey-sking/TextGenie?style=flat-square)](https://github.com/monkey-sking/TextGenie/commits/main)

[🇨🇳 中文版](./README_zh.md)

**TextGenie** is a multi-action PopClip extension for macOS: currency conversion, translation, URL opening, terminal commands, and path recognition.

## 🚀 Install

**[⬇️ Download and install TextGenie](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz)**

Download the `.popclipextz` file and double-click it to install in PopClip. If no release has been published yet, see [Releases](https://github.com/monkey-sking/TextGenie/releases) or download the [source code](https://github.com/monkey-sking/TextGenie).

## ✨ Features

- **Currency conversion** — 15+ currencies; recognizes `$100`, `100 USD`, `100 美元`, and qualified symbols such as `JP¥3,000`. Same-currency sums such as `$58.83+56.26` are supported.
- **Translation** — Google, DeepL, OpenAI, Gemini, custom API, Bob, and Eudic integrations.
- **Open URL** — recognizes URLs, IP addresses, and localhost.
- **Terminal helper** — cleans shell prompts and safely fills commands into Terminal or iTerm2 without auto-running.
- **Path recognition** — opens absolute, home, and relative paths in supported file managers.

## ⚙️ Configuration

Configure translation service, target language, API key, target currency, preferred terminal and file manager in PopClip extension settings.

## 🔄 Updates

- Check [Releases](https://github.com/monkey-sking/TextGenie/releases) for the latest version and release notes.
- The direct download link above always points to the latest published release asset.
- PopClip extensions run when invoked, so this extension cannot reliably perform silent background update checks while idle. Automatic update notifications would require an explicit check action or a supported PopClip update mechanism.

## 👨‍💻 Development

Build the extension archive from the repository root:

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

See [LICENSE](LICENSE).
