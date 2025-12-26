# 🍌 文灵 (TextGenie) PopClip 扩展

[🇺🇸 English](./README.md)

**文灵** 是一款智能 PopClip 扩展，提供三大功能：**打开网址**、**汇率转换**、**翻译**。

## ✨ 功能特性

### 🔗 打开网址

- 自动识别 URL、IP 地址、localhost
- 在默认浏览器中打开

### 💱 汇率转换

- 支持 15 种货币 (CNY, USD, EUR, JPY 等)
- 智能解析：`$100`、`100 USD`、`100 美元`
- 简洁输出：`100 美元 ≈ 720.50 人民币`

### 🅰️ 翻译

- **翻译引擎**：Google、DeepL、OpenAI、Gemini、自定义 API
- **本地应用**：Bob、欧路词典
- **目标语言**：自动、中文、英文、日文、韩文、法文、德文、西班牙文、俄文

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

## 👨‍💻 开发构建

```bash
cd src && zip -r ../extensions/TextGenie.popclipextz TextGenie.popclipext/
```

## 📜 许可证

MIT
