# 🍌 TextGenie for PopClip

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE) [![Last commit](https://img.shields.io/github/last-commit/monkey-sking/TextGenie?style=flat-square)](https://github.com/monkey-sking/TextGenie/commits/main)

[🇨🇳 中文版](./README_zh.md)

**TextGenie** is a multi-action PopClip extension for macOS: currency conversion, translation, URL opening, terminal commands, and path recognition.

## 🚀 Install

**[⬇️ Open downloads and install TextGenie](https://github.com/monkey-sking/TextGenie/releases)**

Open the [Releases page](https://github.com/monkey-sking/TextGenie/releases) and download the `TextGenie.popclipextz` asset from the latest release, then double-click it to install in PopClip. After the first release is published, you can also use the [direct latest-version download link](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz).

## ✨ Features

- **Currency conversion** — supports same-currency and mixed-currency sums, e.g. `$100+€50+JP¥3,000`. The target currency defaults from the device locale and can be overridden in PopClip settings. Unmarked amounts inherit the previous amount's currency; if the first amount is unmarked, the device-region currency is used.
- **Translation** — Google, DeepL, OpenAI, Gemini, custom API, Bob, and Eudic integrations, with categorized timeout/network/auth/model/rate-limit/server errors and prompts that preserve Markdown, code, URLs, and variable names.
- **Open URL** — recognizes URLs, IP addresses, and localhost.
- **Terminal helper** — fills commands into Terminal or iTerm2 without auto-running; recognizes Git, Node.js, Python, Docker, Kubernetes, Swift/Xcode, Homebrew, Codex, Claude Code, OpenCode, Gemini CLI, and common network/system diagnostics. Supports the current window or a new tab.
- **Path recognition** — recognizes absolute, home, and relative paths.
- **Developer text tools** — format/minify JSON, URL encode/decode, and Base64 encode/decode; results are copied to the clipboard.

## ⚙️ Configuration

Configure translation service, target language, API key, target currency, preferred terminal and file manager in PopClip extension settings.

## 🔄 Updates

Use the **Check for Updates** action in PopClip to check the latest stable GitHub release. If a newer version is found, it opens the release page; download the `.popclipextz` asset and double-click it to install. You can also visit [GitHub Releases](https://github.com/monkey-sking/TextGenie/releases) directly. The release workflow builds the archive when a `v*` tag is pushed. You can also run the workflow manually and provide a version to create a release.

PopClip extensions run when invoked, so this extension does not perform silent background update checks while idle. The existing user-triggered **Check for Updates** action checks the latest stable release and opens its release page when an update is available.

## 👨‍💻 Development

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

See [LICENSE](LICENSE).
