# 🍌 文灵（TextGenie）PopClip 扩展

[🇺🇸 English](./README.md)

**文灵** 是一款 macOS PopClip 多功能扩展，提供汇率转换、翻译、打开网址、终端命令和路径识别。

## 🚀 安装

**[⬇️ 打开下载页面并安装文灵 TextGenie](https://github.com/monkey-sking/TextGenie/releases)**

进入 [Releases 版本发布页](https://github.com/monkey-sking/TextGenie/releases) 下载最新版本附件中的 `TextGenie.popclipextz`，然后双击安装到 PopClip。首次 Release 发布后，也可以使用[最新版直装链接](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz)。

## ✨ 功能特性

- **汇率转换**：识别 `JP¥3,000`，支持 `$58.83+56.26` 这类同币种金额相加；可选择人民币、美元、欧元、英镑、日元、港币、韩元、台币、新加坡元、澳元、加元、瑞郎、纽元、卢比、泰铢、马币和卢布作为目标币种，并对网络、限流和无效汇率给出错误提示。
- **翻译**：支持 Google、DeepL、OpenAI、Gemini、自定义 API、Bob 和欧路词典；对超时、网络错误、认证失败、模型不存在、限流和服务端错误提供分类提示，默认提示词尽量保留 Markdown、代码块、URL 和变量名。
- **打开网址**：识别 URL、IP 地址和 localhost。
- **终端增强**：将命令填入 Terminal/iTerm2，默认不自动执行；识别 Git、Node.js、Python、Docker、Kubernetes、Swift/Xcode、Homebrew、Codex、Claude Code、OpenCode、Gemini CLI、常见网络诊断与系统维护命令等。支持复用当前窗口或新标签页。
- **路径识别**：识别绝对路径、家目录和相对路径。

## ⚙️ 配置

在 PopClip 扩展设置中配置翻译服务、目标语言、API 密钥、目标货币、首选终端和文件管理器。

## 🔄 更新

在 PopClip 中选择 **「检查更新」** 动作，可以检查 GitHub 上最新的正式版本；发现新版本时会打开版本发布页。下载最新的 `.popclipextz` 后双击安装即可。也可以直接打开 [Releases 版本发布页](https://github.com/monkey-sking/TextGenie/releases)查看更新说明。推送 `v*` 版本标签会自动构建并发布安装包；也可以在 GitHub Actions 中手动运行发布工作流并填写版本号。

PopClip 扩展通常在用户触发动作时运行，空闲时无法可靠地静默后台检查更新。当前采用用户主动触发的「检查更新」动作。

## 👨‍💻 开发构建

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 许可证

详见 [LICENSE](LICENSE)。
