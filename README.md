# 单词记忆 (Word Memory)

一个基于 SM-2 间隔重复算法的单词记忆应用，帮助你科学高效地背单词。

## 功能

- 单词管理：添加、删除、搜索单词（含词性、例句、备注）
- 智能复习：SM-2 算法根据记忆情况自动计算下次复习时间
- 背诵练习：逐词背诵，0-5 评分，实时统计掌握情况
- 学习统计：总单词数、待复习数、平均易度、已掌握数

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Vue Router + Axios |
| 后端 | Flask + PyMySQL |
| 数据库 | MySQL (本地) |
| 部署 | Vercel (前端) + Railway (后端) |
| 算法 | SM-2 (Spaced Repetition) |

## 项目结构

```
├── backend/
│   ├── app.py              # Flask 后端，API 接口 + SM-2 算法
│   └── requirements.txt    # Python 依赖
├── frontend/
│   ├── src/
│   │   ├── views/          # 页面：WordList, AddWord, Practice
│   │   ├── components/     # 组件：StatsBar
│   │   ├── api/            # Axios API 封装
│   │   ├── router/         # Vue Router 配置
│   │   └── App.vue         # 根组件
│   ├── vite.config.js      # Vite 配置
│   └── package.json
└── README.md
```

## 前端路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/words` | WordList | 单词列表，搜索/删除 |
| `/words/add` | AddWord | 添加新单词 |
| `/practice` | Practice | 背诵练习 |
| `/` | → 重定向到 `/words` | |

## 安装与运行

### 1. 数据库

MySQL 8.0+，创建数据库：

```sql
CREATE DATABASE word_memory CHARACTER SET utf8mb4;
```

### 2. 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```
后端运行在 `http://localhost:5000`

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```
前端运行在 `http://localhost:3000`，开发模式自动代理 `/api` 到后端

## API 文档

见 [API接口文档.md](./API接口文档.md)

## 线上部署

| 服务 | 平台 | 链接 |
|------|------|------|
| 前端 | Vercel | https://word-memory.vercel.app |
| 后端 | Railway | https://word-memory.up.railway.app |

## 数据库表结构

**words 表**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | INT AUTO_INCREMENT | - | 主键 |
| word | VARCHAR NOT NULL | - | 单词 |
| translation | VARCHAR NOT NULL | - | 翻译 |
| part_of_speech | VARCHAR | '' | 词性 |
| example | VARCHAR | '' | 例句 |
| notes | VARCHAR | '' | 备注 |
| ease_factor | FLOAT | 2.5 | SM-2 易度因子 |
| review_interval | INT | 0 | 复习间隔(天) |
| repetitions | INT | 0 | 复习次数 |
| next_review_at | DATETIME | now() | 下次复习时间 |
| created_at | DATETIME | now() | 创建时间 |
| updated_at | DATETIME | now() | 更新时间 |
