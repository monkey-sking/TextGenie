# TextGenie for PopClip

[![CI](https://github.com/monkey-sking/TextGenie/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/monkey-sking/TextGenie/actions/workflows/release.yml) [![Latest Release](https://img.shields.io/github/v/release/monkey-sking/TextGenie?display_name=tag&style=flat-square)](https://github.com/monkey-sking/TextGenie/releases/latest) [![Downloads](https://img.shields.io/github/downloads/monkey-sking/TextGenie/total?style=flat-square)](https://github.com/monkey-sking/TextGenie/releases) [![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE) [![Last commit](https://img.shields.io/github/last-commit/monkey-sking/TextGenie?style=flat-square)](https://github.com/monkey-sking/TextGenie/commits/main)

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

Select the dedicated trigger phrase `textgenie update` or `检查文灵更新` to check the latest stable GitHub release. If a newer version is found, it opens the release page; download the `.popclipextz` asset and double-click it to install. You can also visit [GitHub Releases](https://github.com/monkey-sking/TextGenie/releases) directly. The release workflow builds the archive when a `v*` tag is pushed. You can also run the workflow manually and provide a version to create a release.

PopClip extensions run when invoked, so this extension does not perform silent background update checks while idle. The update checker is restricted to dedicated trigger phrases so it does not clutter the toolbar for ordinary selected text.

## 🧪 Quick smoke tests

Select each sample below in any text field to check whether the relevant PopClip action appears and works. Ordinary prose should not trigger unrelated tools.

| Feature | Select this text | Expected check |
|---|---|---|
| Same-currency sum | `$58.83 + 56.26` | Treat the second amount as USD and sum to 115.09 USD. |
| Mixed currencies | `$58.83 + €56.26 + JP¥3,000` | Recognize USD, EUR, and JPY separately and convert to the configured target currency. |
| Ordinary prose | `今天需要检查项目的构建结果和更新逻辑。` | Currency, URL, and Base64 actions should not appear without a matching pattern. |
| Translation | `The best way to predict the future is to create it.` | Translation action appears and returns a translation. |
| URL | `https://github.com/monkey-sking/TextGenie` | Open URL action appears and opens the selected address. |
| Format JSON | `{"name":"TextGenie","features":["currency","translation"],"enabled":true}` | Format JSON produces readable, valid JSON. |
| URL encode/decode | `https://example.com/search?q=hello%20world&lang=zh` | URL actions appear for URL-like text; encoding and decoding can be round-tripped. |
| Base64 round-trip | `Hello, TextGenie! 12345` | Encode then decode; the decoded text must match the original. |
| Terminal | `git status` | Terminal action fills the command; it must not execute it automatically. |
| Check updates | `textgenie update` or `检查文灵更新` | Update checker appears only for a dedicated trigger phrase. |

For the full manual test matrix—including network failures, invalid JSON, custom translation APIs, path handling, and update-check failure cases—see [QA test cases and release checklist](./QA_TEST_CASES.md).

Automated tests use mocked exchange rates and API responses. Real exchange-rate accuracy, third-party translation availability, PopClip toolbar behavior, and the installed-extension update flow still require manual verification on macOS.

## 🧪 Test cases

See [QA test cases and release checklist](./QA_TEST_CASES.md) for automated and manual verification scenarios.

## 👨‍💻 Development

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 License

See [LICENSE](LICENSE).
