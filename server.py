import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def consoles_path():
    return os.path.join(os.path.dirname(__file__), 'public', 'consoles.json')

@app.route('/add-console', methods=['POST'])
def add_console():
    try:
        new_console = request.get_json()
        # Validate required fields
        required_fields = ['name', 'manufacturer', 'release_date']
        for field in required_fields:
            if field not in new_console or not str(new_console[field]).strip():
                return jsonify({'error': f'Missing or empty field: {field}'}), 400
        
        # Load existing consoles
        json_path = consoles_path()
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Append new console
        data['consoles'].append(new_console)
        
        # Save back to file
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=4)
        
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-console', methods=['POST'])
def update_console():
    payload = request.get_json(silent=True)
    print("update-console received:", payload)
    if not payload:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    # validate
    if 'index' not in payload:
        return jsonify({'error': 'Missing index'}), 400
    try:
        idx = int(payload['index'])
    except Exception:
        return jsonify({'error': 'Index must be an integer'}), 400

    for f in ('name', 'manufacturer', 'release_date'):
        if f not in payload or not str(payload[f]).strip():
            return jsonify({'error': f'Missing or empty field: {f}'}), 400

    path = consoles_path()
    print("consoles.json path:", path)
    with open(path, 'r') as f:
        data = json.load(f)

    if idx < 0 or idx >= len(data.get('consoles', [])):
        return jsonify({'error': 'Index out of range'}), 400

    updated_console = {
        'name': payload['name'].strip(),
        'manufacturer': payload['manufacturer'].strip(),
        'release_date': payload['release_date'],
        'image_url': payload.get('image_url', data['consoles'][idx].get('image_url', 'https://example.com/default.png'))
    }

    # replace existing entry (do not append)
    data['consoles'][idx] = updated_console

    with open(path, 'w') as f:
        json.dump(data, f, indent=4)
        f.flush()
        os.fsync(f.fileno())

    print(f"updated index {idx}")
    return jsonify(updated_console), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)