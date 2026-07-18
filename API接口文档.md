# API 接口文档

后端地址：`http://localhost:5000` | 线上：`https://word-memory.up.railway.app`

---

## 1. 获取单词列表

**GET** `/api/words`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词，匹配单词或翻译 |

**响应示例：**
```json
[
  {
    "id": 1,
    "word": "apple",
    "translation": "苹果",
    "part_of_speech": "n.",
    "example": "I ate an apple.",
    "notes": "常见水果",
    "ease_factor": 2.5,
    "review_interval": 0,
    "repetitions": 0,
    "next_review_at": "2026-07-18 12:00:00",
    "created_at": "2026-07-18 10:00:00",
    "updated_at": "2026-07-18 10:00:00"
  }
]
```

---

## 2. 添加单词

**POST** `/api/words`

**请求体：**
```json
{
  "word": "apple",
  "translation": "苹果",
  "part_of_speech": "n.",
  "example": "I ate an apple.",
  "notes": "常见水果"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | 是 | 单词 |
| translation | string | 是 | 翻译 |
| part_of_speech | string | 否 | 词性 |
| example | string | 否 | 例句 |
| notes | string | 否 | 备注 |

**响应：** 201，返回新创建的单词对象

---

## 3. 删除单词

**DELETE** `/api/words/:id`

**响应：** `{ "message": "deleted" }`

---

## 4. 获取待复习单词

**GET** `/api/words/practice`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | int | 否 | 数量限制，默认 10，最大 50 |

返回 `next_review_at <= 当前时间` 的单词列表。

---

## 5. 提交复习评分

**PATCH** `/api/words/:id/review`

**请求体：**
```json
{ "quality": 4 }
```

| 分值 | 说明 |
|------|------|
| 0 | 完全忘记 |
| 1 | 有点印象 |
| 2 | 勉强记得 |
| 3 | 基本记住 |
| 4 | 比较熟练 |
| 5 | 完全掌握 |

使用 SM-2 算法自动更新 `ease_factor`、`review_interval`、`repetitions`、`next_review_at`。

---

## 6. 获取学习统计

**GET** `/api/words/stats`

**响应示例：**
```json
{
  "total": 50,
  "due": 12,
  "avg_ease_factor": 2.38,
  "mastered": 8
}
```

| 字段 | 说明 |
|------|------|
| total | 总单词数 |
| due | 待复习数量 |
| avg_ease_factor | 平均易度因子 |
| mastered | 已掌握（repetitions >= 5） |

---

## 错误响应

```json
{ "error": "word and translation required" }
```

| 状态码 | 说明 |
|--------|------|
| 400 | 参数校验失败 |
| 404 | 单词不存在 |
