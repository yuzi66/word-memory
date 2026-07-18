import pymysql
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins='*', supports_credentials=False)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'word_memory',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
}

def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(**DB_CONFIG)
    return g.db

@app.teardown_appcontext
def close_db(e):
    db = g.pop('db', None)
    if db: db.close()


# - SM-2 algorithm: quality 0-5, 0=blackout, 5=perfect recall
def sm2(quality, ease_factor, review_interval, repetitions):
    if quality < 3:
        return max(1.3, ease_factor - 0.2), 1, 0
    if repetitions == 0:
        new_interval = 1
    elif repetitions == 1:
        new_interval = 6
    else:
        new_interval = max(1, round(review_interval * ease_factor))
    new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    return max(1.3, new_ef), new_interval, repetitions + 1


def serialize_word(row):
    return {
        'id': row['id'], 'word': row['word'], 'translation': row['translation'],
        'part_of_speech': row['part_of_speech'], 'example': row['example'],
        'notes': row['notes'], 'ease_factor': float(row['ease_factor']),
        'review_interval': row['review_interval'], 'repetitions': row['repetitions'],
        'next_review_at': row['next_review_at'].strftime('%Y-%m-%d %H:%M:%S') if row['next_review_at'] else None,
        'created_at': row['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': row['updated_at'].strftime('%Y-%m-%d %H:%M:%S'),
    }


# GET /api/words - list all words (optional ?q=search)
@app.route('/api/words', methods=['GET'])
def list_words():
    db = get_db()
    search = request.args.get('q', '').strip()
    with db.cursor() as cur:
        if search:
            cur.execute(
                'SELECT * FROM words WHERE word LIKE %s OR translation LIKE %s ORDER BY created_at DESC',
                (f'%{search}%', f'%{search}%'))
        else:
            cur.execute('SELECT * FROM words ORDER BY created_at DESC')
        rows = cur.fetchall()
    return jsonify([serialize_word(r) for r in rows])


# POST /api/words - add a word
@app.route('/api/words', methods=['POST'])
def add_word():
    data = request.get_json(silent=True) or {}
    word = data.get('word', '').strip()
    translation = data.get('translation', '').strip()
    if not word or not translation:
        return jsonify({'error': 'word and translation required'}), 400
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            'INSERT INTO words (word, translation, part_of_speech, example, notes) VALUES (%s, %s, %s, %s, %s)',
            (word, translation, data.get('part_of_speech', '').strip(),
             data.get('example', '').strip(), data.get('notes', '').strip()))
        new_id = cur.lastrowid
        cur.execute('SELECT * FROM words WHERE id = %s', (new_id,))
        row = cur.fetchone()
        db.commit()
    return jsonify(serialize_word(row)), 201


# DELETE /api/words/<id>
@app.route('/api/words/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    db = get_db()
    with db.cursor() as cur:
        cur.execute('SELECT id FROM words WHERE id = %s', (word_id,))
        if not cur.fetchone():
            return jsonify({'error': 'word not found'}), 404
        cur.execute('DELETE FROM words WHERE id = %s', (word_id,))
        db.commit()
    return jsonify({'message': 'deleted'})


# GET /api/words/practice - words due for review
@app.route('/api/words/practice', methods=['GET'])
def get_practice_words():
    db = get_db()
    limit = request.args.get('limit', 10, type=int)
    now = datetime.now()
    with db.cursor() as cur:
        cur.execute(
            'SELECT * FROM words WHERE next_review_at <= %s ORDER BY next_review_at ASC LIMIT %s',
            (now, min(limit, 50)))
        rows = cur.fetchall()
    return jsonify([serialize_word(r) for r in rows])


# PATCH /api/words/<id>/review - submit review with SM-2
@app.route('/api/words/<int:word_id>/review', methods=['PATCH'])
def review_word(word_id):
    data = request.get_json(silent=True) or {}
    quality = data.get('quality', 0)
    if not isinstance(quality, int) or quality < 0 or quality > 5:
        return jsonify({'error': 'quality must be 0-5'}), 400
    db = get_db()
    with db.cursor() as cur:
        cur.execute('SELECT * FROM words WHERE id = %s', (word_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'word not found'}), 404
        ef, interval, reps = sm2(quality, float(row['ease_factor']), row['review_interval'], row['repetitions'])
        next_review = datetime.now() + timedelta(days=interval)
        cur.execute(
            'UPDATE words SET ease_factor=%s, review_interval=%s, repetitions=%s, next_review_at=%s WHERE id=%s',
            (ef, interval, reps, next_review, word_id))
        db.commit()
        cur.execute('SELECT * FROM words WHERE id = %s', (word_id,))
        updated = cur.fetchone()
    return jsonify(serialize_word(updated))


# GET /api/words/stats
@app.route('/api/words/stats', methods=['GET'])
def get_stats():
    db = get_db()
    now = datetime.now()
    with db.cursor() as cur:
        cur.execute('SELECT COUNT(*) AS total FROM words')
        total = cur.fetchone()['total']
        cur.execute('SELECT COUNT(*) AS due FROM words WHERE next_review_at <= %s', (now,))
        due = cur.fetchone()['due']
        cur.execute('SELECT AVG(ease_factor) AS avg_ef FROM words')
        avg_ef = cur.fetchone()['avg_ef'] or 0
        cur.execute('SELECT COUNT(*) AS mastered FROM words WHERE repetitions >= 5')
        mastered = cur.fetchone()['mastered']
    return jsonify({
        'total': total, 'due': due,
        'avg_ease_factor': round(float(avg_ef), 2),
        'mastered': mastered,
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
