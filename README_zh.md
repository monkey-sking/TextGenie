# 🍌 文灵 (TextGenie) PopClip 扩展

[🇺🇸 English](./README.md)

**文灵** 是一款智能 PopClip 扩展，提供多种快捷操作，旨在提升您的 macOS 使用效率。

## ✨ 功能特性

### 🔗 打开网址
- 自动识别 URL、IP 地址、localhost。
- 在默认浏览器中打开。

### 💱 汇率转换
- 支持 15 种货币 (CNY, USD, EUR, JPY 等)。
- 智能解析：`$100`、`100 USD`、`100 美元`。
- 简洁预览：`100 USD = 720.50 CNY`。

### 🅰️ 翻译
- **翻译引擎**：Google、DeepL、OpenAI、Gemini、自定义 API。
- **本地应用**：Bob、欧路词典同步跳转。
- **目标语言**：自动、中文、英文、日文、韩文、法文、德文、西班牙文、俄文。

### 🖥️ 终端增强
- **优于官方**：
  - **智能清洗**：自动剔除命令头部的 `$`, `#`, `>`, `%` 符号及多余空格。
  - **海量识别**：完美支持 `python3`, `pip3`, `docker`, `kubectl`, `bun`, `systemctl` 等 100+ 常用开发工具。
  - **安全填充**：直接将命令填入终端而非自动执行，方便您在执行前核对。
- **支持应用**：Terminal.app、iTerm2 (原生优化)。

### 📂 路径识别
- **全格式支持**：自动识别绝对路径 (`/`)、家目录路径 (`~/`) 及相对路径 (`./`)。
- **智能纠错补全**：自动补全缺失的斜杠（如 `Users/` -> `/Users/`）或波浪号（如 `Desktop/` -> `~/Desktop/`）。
- **占位符支持**：支持 `%user%` 动态占位符，自动解析当前系统用户名。
- **全家桶应用支持**：Finder, Path Finder, ForkLift, QSpace, Commander One, Marta。

## 🛠 安装方法

1. 下载 `TextGenie.popclipextz`
2. 双击安装

## ⚙️ 配置选项

| 选项 | 说明 |
| ---- | ---- |
| 翻译服务 | Google、DeepL、OpenAI、Gemini、自定义、Bob、欧路词典 |
| 目标语言 | 自动、中文、英文、日文等 |
| API 密钥 | DeepL、OpenAI、Gemini、自定义 API 需要 |
| 目标货币 | CNY、USD、EUR、GBP、JPY 等 |
| 首选终端 | Terminal, iTerm2, Auto 自动检测 |
| 首选文件管理器 | Finder, Path Finder, ForkLift, QSpace, Commander One, Marta |
| 在新标签页打开 | 在终端或文件管理器中新建标签页打开 |

## 👨‍💻 开发构建

```bash
cd src && zip -r ../extensions/TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 许可证

MIT
