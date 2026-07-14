import sqlite3
import os
from datetime import datetime
from flask import Flask, jsonify, request, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), 'tasks.db')
ALLOWED_STATUSES = ('todo', 'in_progress', 'done')
ALLOWED_PRIORITIES = ('low', 'medium', 'high')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                status TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
                priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        db.commit()

def row_to_dict(row):
    return {
        'id': row['id'],
        'title': row['title'],
        'description': row['description'],
        'status': row['status'],
        'priority': row['priority'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at']
    }

def validate_task_data(data):
    errors = {}
    if 'title' in data:
        title = data['title'].strip()
        if not title:
            errors['title'] = 'Title is required'
        elif len(title) > 200:
            errors['title'] = 'Title must be less than 200 characters'
    if 'status' in data and data['status'] not in ALLOWED_STATUSES:
        errors['status'] = f'Status must be one of: {", ".join(ALLOWED_STATUSES)}'
    if 'priority' in data and data['priority'] not in ALLOWED_PRIORITIES:
        errors['priority'] = f'Priority must be one of: {", ".join(ALLOWED_PRIORITIES)}'
    return errors

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    db = get_db()
    query = "SELECT * FROM tasks WHERE 1=1"
    params = []
    search = request.args.get('q', '').strip()
    if search:
        query += " AND (title LIKE ? OR description LIKE ?)"
        like = f'%{search}%'
        params.extend([like, like])
    status_filter = request.args.get('status', '').strip()
    if status_filter and status_filter in ALLOWED_STATUSES:
        query += " AND status = ?"
        params.append(status_filter)
    priority_filter = request.args.get('priority', '').strip()
    if priority_filter and priority_filter in ALLOWED_PRIORITIES:
        query += " AND priority = ?"
        params.append(priority_filter)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return jsonify([row_to_dict(r) for r in rows]), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    errors = validate_task_data({**data, 'title': data.get('title', '')})
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    now = datetime.now().isoformat()
    db = get_db()
    cursor = db.execute(
        'INSERT INTO tasks (title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        (data['title'].strip(), data.get('description', '').strip(), 'todo', 'medium', now, now)
    )
    db.commit()
    row = db.execute('SELECT * FROM tasks WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(row_to_dict(row)), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    row = get_db().execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(row_to_dict(row)), 200

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    row = get_db().execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Task not found'}), 404
    data = request.get_json() or {}
    task = row_to_dict(row)
    errors = validate_task_data({**data, 'title': data.get('title', task['title'])})
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    title = data.get('title', task['title']).strip()
    description = data.get('description', task['description']).strip()
    status = data.get('status', task['status'])
    priority = data.get('priority', task['priority'])
    now = datetime.now().isoformat()
    db = get_db()
    db.execute(
        'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?',
        (title, description, status, priority, now, task_id)
    )
    db.commit()
    row = db.execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
    return jsonify(row_to_dict(row)), 200

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    row = get_db().execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Task not found'}), 404
    get_db().execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    get_db().commit()
    return jsonify({'message': 'Task deleted'}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
