# 🍌 TextGenie for PopClip

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE) [![Last commit](https://img.shields.io/github/last-commit/monkey-sking/TextGenie?style=flat-square)](https://github.com/monkey-sking/TextGenie/commits/main)

[🇨🇳 中文版](./README_zh.md)

**TextGenie** is a multi-action PopClip extension for macOS: currency conversion, translation, URL opening, terminal commands, and path recognition.

## 🚀 Install

**[⬇️ Open downloads and install TextGenie](https://github.com/monkey-sking/TextGenie/releases)**

Open the [Releases page](https://github.com/monkey-sking/TextGenie/releases) and download the `TextGenie.popclipextz` asset from the latest release, then double-click it to install in PopClip. After the first release is published, you can also use the [direct latest-version download link](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz).

## ✨ Features

- **Currency conversion** — recognizes qualified symbols such as `JP¥3,000` and same-currency sums such as `$58.83+56.26`.
- **Translation** — Google, DeepL, OpenAI, Gemini, custom API, Bob, and Eudic integrations.
- **Open URL** — recognizes URLs, IP addresses, and localhost.
- **Terminal helper** — fills commands into Terminal or iTerm2 without auto-running; recognizes Git, Node.js, Python, Docker, Kubernetes, Swift/Xcode, Homebrew, Codex, Claude Code, OpenCode, Gemini CLI, and common network/system diagnostics. Supports the current window or a new tab.
- **Path recognition** — recognizes absolute, home, and relative paths.

## ⚙️ Configuration

Configure translation service, target language, API key, target currency, preferred terminal and file manager in PopClip extension settings.

## 🔄 Updates

Use the **Check for Updates** action in PopClip to check the latest stable GitHub release. If a newer version is found, it opens the release page; download the `.popclipextz` asset and double-click it to install. You can also visit [GitHub Releases](https://github.com/monkey-sking/TextGenie/releases) directly. The release workflow builds the archive when a `v*` tag is pushed. You can also run the workflow manually and provide a version to create a release.

PopClip extensions run when invoked, so this extension cannot reliably perform silent background update checks while idle. A user-triggered “Check for Updates” action can be added separately.

## 👨‍💻 Development

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

See [LICENSE](LICENSE).
