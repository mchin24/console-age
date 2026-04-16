import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/add-console', methods=['POST'])
def add_console():
    try:
        new_console = request.get_json()
        # Validate required fields
        required_fields = ['console', 'manufacturer', 'release_date']
        for field in required_fields:
            if field not in new_console or not str(new_console[field]).strip():
                return jsonify({'error': f'Missing or empty field: {field}'}), 400
        
        # Load existing consoles
        json_path = os.path.join(os.path.dirname(__file__), 'public', 'consoles.json')
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)