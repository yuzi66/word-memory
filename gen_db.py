import sqlite3
db = sqlite3.connect(r'E:\aa\server\word_memory.db')
cur = db.execute('PRAGMA table_info(words)')
cols = cur.fetchall()
with open(r'E:\1\01_数据库表结构.txt', 'w', encoding='utf-8') as f:
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
