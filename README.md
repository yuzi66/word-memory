# 个人任务看板 (Personal Task Board)

一个全栈任务管理应用，前端使用 Next.js，后端使用 Flask。

## 技术栈

- **前端:** Next.js (App Router + TypeScript + Tailwind CSS)
- **后端:** Flask + SQLite (开发阶段使用内存存储)
- **API:** RESTful API

## 项目结构

```
task-board/
├── frontend/          # Next.js 前端应用
│   └── src/app/       # 前端页面路由
├── backend/           # Flask 后端 API
│   └── app.py         # API 入口
├── .gitignore
└── README.md
```

## 快速开始

### 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端将在 http://localhost:5000 启动。

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动。

## API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取所有任务 |
| POST | /api/tasks | 创建新任务 |
| GET | /api/tasks/:id | 获取单个任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |

## 部署

- 前端: Vercel
- 后端: Render / Railway
