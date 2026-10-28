# 🍌 文灵（TextGenie）PopClip 扩展

[🇺🇸 English](./README.md)

**文灵** 是一款 macOS PopClip 多功能扩展，提供汇率转换、翻译、打开网址、终端命令和路径识别。

## 🚀 直接安装

**[⬇️ 下载并安装文灵 TextGenie](https://github.com/monkey-sking/TextGenie/releases/latest/download/TextGenie.popclipextz)**

下载 `.popclipextz` 文件后双击，即可交给 PopClip 安装。如果暂时没有已发布的 Release，请查看 [版本发布页](https://github.com/monkey-sking/TextGenie/releases) 或 [项目源码](https://github.com/monkey-sking/TextGenie)。

## ✨ 功能特性

- **汇率转换**：支持多种货币；识别 `$100`、`100 USD`、`100 美元`、`JP¥3,000` 等格式；支持 `$58.83+56.26` 这类同币种加法后换汇。
- **翻译**：支持 Google、DeepL、OpenAI、Gemini、自定义 API、Bob 和欧路词典。
- **打开网址**：识别 URL、IP 地址和 localhost。
- **终端增强**：清理命令前缀，并将命令填入 Terminal/iTerm2，执行前可再次检查，不会自动运行。
- **路径识别**：识别绝对路径、家目录和相对路径，并在支持的文件管理器中打开。

## ⚙️ 配置

在 PopClip 扩展设置中配置翻译服务、目标语言、API 密钥、目标货币、首选终端和文件管理器。

## 🔄 更新

- 在 [Releases 版本发布页](https://github.com/monkey-sking/TextGenie/releases)查看最新版本和更新说明。
- 上方直装链接会指向最新一次已发布版本的安装包。
- PopClip 扩展通常在用户触发动作时运行，空闲时无法可靠地静默后台检查更新。若要主动提醒更新，需要增加显式的“检查更新”动作，或使用 PopClip 支持的更新机制。

## 👨‍💻 开发构建

在项目根目录执行：

```bash
cd src
zip -r ../TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 许可证

详见 [LICENSE](LICENSE)。
