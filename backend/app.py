from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

tasks = []
next_id = 1

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    global next_id
    data = request.get_json()
    task = {
        'id': next_id,
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'status': 'todo',
        'priority': 'medium',
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    next_id += 1
    tasks.append(task)
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task), 200

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    data = request.get_json()
    task['title'] = data.get('title', task['title'])
    task['description'] = data.get('description', task['description'])
    task['status'] = data.get('status', task['status'])
    task['priority'] = data.get('priority', task['priority'])
    task['updated_at'] = datetime.now().isoformat()
    return jsonify(task), 200

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({'message': 'Task deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
