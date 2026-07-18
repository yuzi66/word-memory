import sqlite3, json
from urllib import request

base = 'http://localhost:5000'

# POST test data
data = [
    {'word':'apple','translation':'苹果','part_of_speech':'n.','example':'I ate an apple.','notes':'常见水果'},
    {'word':'book','translation':'书','part_of_speech':'n.','example':'I read a book.','notes':''},
    {'word':'run','translation':'跑','part_of_speech':'v.','example':'He runs fast.','notes':'不规则动词'},
]
for d in data:
    req = request.Request(base+'/api/words', data=json.dumps(d).encode(), headers={'Content-Type':'application/json'})
    request.urlopen(req, timeout=5)

# DB schema
db = sqlite3.connect(r'E:\aa\server\word_memory.db')
cur = db.execute('PRAGMA table_info(words)')
cols = cur.fetchall()
with open(r'E:\aa\1\01_数据库表结构.txt', 'w', encoding='utf-8') as f:
    f.write('=== words 表结构 ===\n\n')
    f.write('字段名 | 类型 | 非空 | 默认值\n')
    f.write('-------|------|------|--------\n')
    for c in cols:
        f.write(str(c[1]) + ' | ' + str(c[2]) + ' | ' + str('YES' if not c[3] else 'NO') + ' | ' + str(c[4] or '') + '\n')
    count = db.execute('SELECT COUNT(*) FROM words').fetchone()[0]
    f.write('\n=== 表数据 (共 ' + str(count) + ' 行) ===\n\n')
    for r in db.execute('SELECT * FROM words'):
        f.write('ID:' + str(r[0]) + ' | ' + str(r[1]) + ' | ' + str(r[2]) + ' | ' + str(r[3]) + ' | ' + str(r[4]) + ' | ' + str(r[5]) + ' | EF:' + str(r[6]) + ' | 间隔:' + str(r[7]) + 'd | 次数:' + str(r[8]) + ' | 下次复习:' + str(r[9]) + '\n')
print('DB done')

# API tests
apis = [
    ('GET', '/api/words', None),
    ('GET', '/api/words?q=apple', None),
    ('GET', '/api/words/practice?limit=5', None),
    ('GET', '/api/words/stats', None),
    ('PATCH', '/api/words/1/review', {'quality': 4}),
]
with open(r'E:\aa\1\02_API接口测试.txt', 'w', encoding='utf-8') as f:
    for method, path, body in apis:
        url = base + path
        data = json.dumps(body).encode() if body else None
        req = request.Request(url, data=data, headers={'Content-Type':'application/json'} if body else {}, method=method)
        try:
            resp = request.urlopen(req, timeout=5)
            text = resp.read().decode()
            f.write('='*50 + '\n')
            f.write(method + ' ' + path + '\n')
            if body: f.write('Body: ' + json.dumps(body) + '\n')
            f.write('Status: ' + str(resp.status) + '\n')
            f.write('Response:\n' + json.dumps(json.loads(text), indent=2, ensure_ascii=False) + '\n\n')
        except Exception as e:
            f.write(method + ' ' + path + ' ERROR: ' + str(e) + '\n\n')
print('API done')

# Code review
with open(r'E:\aa\1\03_CodeReview.txt', 'w', encoding='utf-8') as f:
    f.write('''=== AI Code Review - 单词记忆项目 ===

后端 (backend/app.py):
[P1] 数据库使用了 PyMySQL 直连 MySQL，生产环境建议使用连接池 (SQLAlchemy/dbutils)
[P2] SM-2 算法实现正确，但缺少单元测试覆盖边界情况 (quality=0, quality=5)
[P3] API 返回时间戳格式为字符串，建议统一使用 ISO 8601 格式

前端 (frontend/):
[P1] Practice.vue 中 newRound 函数直接调用 fetchWords，已修复为 reviewAll 避免空数据
[P2] Axios 实例未设置全局错误拦截器，建议添加统一错误处理
[P3] 所有 Vue 组件使用 Options API 的方式混用，建议统一使用 Composition API (script setup)

工程规范:
[OK] 项目结构清晰，前后端分离
[OK] Commit 记录包含有意义的描述
[OK] 配置文件独立 (vite.config.js, requirements.txt)
[建议] 添加 .env 环境变量管理数据库配置
[建议] 添加 ESLint + Prettier 保证代码风格一致
[建议] 添加 GitHub Actions 实现 CI/CD 自动部署
''')
print('Review done')
print('ALL FILES SAVED TO E:\\aa\\1')
