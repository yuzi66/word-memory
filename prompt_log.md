# AI Prompt 日志

本项目全程使用 Codex AI 辅助开发。以下为关键 Prompt 记录。

---

## 后端开发

### Prompt 1: 创建 Flask 单词记忆后端
**功能：** backend/app.py — 完整的 Flask API + SM-2 算法
**Prompt：**
> 帮我创建一个 Flask 后端，用于单词记忆应用。需要 SM-2 间隔重复算法，API 接口包括单词 CRUD、练习、统计。

**AI 输出：** [截图/代码块] 实现了完整的 backend/app.py，包含 6 个 API 接口和 SM-2 算法。

### Prompt 2: MySQL 数据库配置
**功能：** backend/app.py — 数据库连接配置
**Prompt：**
> 将数据库配置改为 MySQL，使用 pymysql，数据库名为 word_memory。

**AI 输出：** [截图/代码块] 修改了数据库连接部分，从 SQLite 切换到 PyMySQL。

---

## 前端开发

### Prompt 3: Vue 前端脚手架
**功能：** 整个 frontend/ 目录 — Vue 3 + Vite 初始化
**Prompt：**
> 帮我创建一个 Vue 3 + Vite 前端项目，包含 3 个页面：单词列表、添加单词、背诵练习。使用 axios 调用后端 API。

**AI 输出：** [截图/代码块] 创建了完整的 Vue 3 项目结构，3 个视图页面，API 封装，路由配置。

### Prompt 4: 背诵页修复
**功能：** frontend/src/views/Practice.vue — 修复"再来一遍"按钮无反应
**Prompt：**
> 背诵练习页面点击"再来一轮"按钮没有任何反应，检查并修复这个问题。

**AI 输出：** [截图/代码块] 定位到 newRound 函数问题，修复后按钮正常触发新一轮练习。

---

## 部署

### Prompt 5: Vercel 前端部署
**功能：** vercel.json — Vercel 部署配置
**Prompt：**
> 帮我在 Vercel 上部署 Vue 前端，项目在 frontend/ 子目录。

**AI 输出：** [截图/代码块] 创建 vercel.json，配置构建命令和输出路径。

### Prompt 6: Railway 后端部署
**功能：** railway.toml — Railway 部署配置
**Prompt：**
> 帮我在 Railway 上部署 Flask 后端。

**AI 输出：** [截图/代码块] 创建 railway.toml，配置 Python 环境和启动命令。

---

## 文档

### Prompt 7: 生成 API 文档和 README
**功能：** README.md, API接口文档.md
**Prompt：**
> 帮我根据考核方案的提交清单生成 README 和 API 接口文档。

**AI 输出：** [截图/代码块] 生成了完整的 README.md 和 API接口文档.md。
