# 文灵（TextGenie）PopClip 扩展

[![CI](https://github.com/monkey-sking/TextGenie/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/monkey-sking/TextGenie/actions/workflows/release.yml) [![Latest Release](https://img.shields.io/github/v/release/monkey-sking/TextGenie?display_name=tag&style=flat-square)](https://github.com/monkey-sking/TextGenie/releases/latest) [![Downloads](https://img.shields.io/github/downloads/monkey-sking/TextGenie/total?style=flat-square)](https://github.com/monkey-sking/TextGenie/releases) [![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE) [![Last commit](https://img.shields.io/github/last-commit/monkey-sking/TextGenie?style=flat-square)](https://github.com/monkey-sking/TextGenie/commits/main)

[🇺🇸 English](./README.md)

**文灵** 是一款 macOS PopClip 多功能扩展，提供汇率转换、翻译、打开网址、终端命令和路径识别。

## 🚀 安装

**[⬇️ 打开下载页面并安装文灵 TextGenie](https://github.com/monkey-sking/TextGenie/releases)**

进入 [Releases 版本发布页](https://github.com/monkey-sking/TextGenie/releases) 下载最新版本附件中的 `TextGenie.popclipextz`，然后双击安装到 PopClip。首次 Release 发布后，也可以使用[最新版直装链接](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz)。

## ✨ 功能特性

- **汇率转换**：支持同币种加总与跨币种自动换算，例如 `$100+€50+JP¥3,000`；目标币种默认按设备地区自动选择，也可在 PopClip 设置中手动指定。无币种数字继承前一项币种；首项没有币种时使用设备地区默认币种。对网络、限流和无效汇率给出错误提示。
- **翻译**：支持 Google、DeepL、OpenAI、Gemini、自定义 API、Bob 和欧路词典；对超时、网络错误、认证失败、模型不存在、限流和服务端错误提供分类提示，默认提示词尽量保留 Markdown、代码块、URL 和变量名。
- **打开网址**：识别 URL、IP 地址和 localhost。
- **终端增强**：将命令填入 Terminal/iTerm2，默认不自动执行；识别 Git、Node.js、Python、Docker、Kubernetes、Swift/Xcode、Homebrew、Codex、Claude Code、OpenCode、Gemini CLI、常见网络诊断与系统维护命令等。支持复用当前窗口或新标签页。
- **路径识别**：识别绝对路径、家目录和相对路径。
- **开发者文本工具**：JSON 格式化/压缩、URL 编码/解码、Base64 编码/解码；处理结果复制到剪贴板。

## ⚙️ 配置

在 PopClip 扩展设置中配置翻译服务、目标语言、API 密钥、目标货币、首选终端和文件管理器。

## 🔄 更新

选中专用触发词 **「检查文灵更新」** 或 `textgenie update`，即可检查 GitHub 上最新的正式版本；发现新版本时会打开版本发布页。下载最新的 `.popclipextz` 后双击安装即可。也可以直接打开 [Releases 版本发布页](https://github.com/monkey-sking/TextGenie/releases)查看更新说明。推送 `v*` 版本标签会自动构建并发布安装包；也可以在 GitHub Actions 中手动运行发布工作流并填写版本号。

PopClip 扩展通常在用户触发动作时运行，因此不会在空闲时静默后台检查更新。当前通过专用触发词触发更新检查，避免它在普通选中文本时占据工具栏。

## 🧪 快速测试用例

在任意文本输入框中选中下面的样例，检查 PopClip 是否只显示相关动作，以及动作执行结果是否正确。选中普通句子时，不应出现无关工具。

| 功能 | 直接选中这段文本 | 预期检查 |
|---|---|---|
| 同币种加总 | `$58.83 + 56.26` | 第二个金额继承 USD，合计为 115.09 USD。 |
| 多币种转换 | `$58.83 + €56.26 + JP¥3,000` | 分别识别 USD、EUR、JPY，并转换到设置的目标币种。 |
| 普通文本 | `今天需要检查项目的构建结果和更新逻辑。` | 不应无故显示货币、网址或 Base64 动作。 |
| 翻译 | `The best way to predict the future is to create it.` | 显示翻译动作并返回译文。 |
| 打开网址 | `https://github.com/monkey-sking/TextGenie` | 显示打开网址动作，并打开对应地址。 |
| JSON 格式化 | `{"name":"TextGenie","features":["currency","translation"],"enabled":true}` | 输出缩进清晰且有效的 JSON。 |
| URL 编码/解码 | `https://example.com/search?q=hello%20world&lang=zh` | URL 类文本显示相关动作；编码后解码应能还原。 |
| Base64 往返 | `Hello, TextGenie! 12345` | 先编码再解码，解码结果必须与原文一致。 |
| 终端命令 | `git status` | 显示终端动作并填入命令；不得自动执行。 |
| 检查更新 | `textgenie update` 或 `检查文灵更新` | 只有选中专用触发词时才显示更新检测动作。 |

完整人工测试矩阵还包括网络故障、无效 JSON、自定义翻译 API、路径处理和更新检测失败等情况，见[测试用例与发布前验收清单](./QA_TEST_CASES.md)。

自动化测试使用模拟汇率和模拟 API 响应。真实汇率准确性、第三方翻译服务可用性、PopClip 工具栏表现，以及已安装扩展的真实更新链路，仍需在 macOS 上人工验证。

## 🧪 测试用例

自动与人工测试场景见[测试用例与发布前验收清单](./QA_TEST_CASES.md)。

## 👨‍💻 开发构建

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 许可证

详见 [LICENSE](LICENSE)。
