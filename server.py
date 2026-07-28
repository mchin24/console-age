import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME')

# read DB url from environment (set by .env or host)
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

def get_conn():
    return psycopg2.connect(DATABASE_URL)

@app.route('/consoles', methods=['GET'])
def list_consoles():
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, manufacturer,
                       release_date::text AS release_date,
                       age, image_url
                FROM consoles
                ORDER BY release_date DESC NULLS LAST, id;
            """)
            consoles = cur.fetchall()
    return jsonify({'consoles': consoles}), 200

@app.route('/add-console', methods=['POST'])
def add_console():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    name = payload.get('name') or payload.get('console')
    manufacturer = payload.get('manufacturer', '')
    release_date = payload.get('release_date')
    age = payload.get('age')
    image_url = payload.get('image_url', 'https://example.com/default.png')

    if not name or not release_date:
        return jsonify({'error': 'Missing required fields'}), 400

    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO consoles (name, manufacturer, release_date, age, image_url)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, manufacturer,
                          release_date::text AS release_date,
                          age, image_url;
                """,
                (name, manufacturer, release_date, age, image_url)
            )
            row = cur.fetchone()

    return jsonify(row), 201

@app.route('/update-console', methods=['POST'])
def update_console():
    payload = request.get_json(silent=True)
    print("update-console received:", payload)
    if not payload:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    record_id = payload.get('id', payload.get('index'))
    try:
        record_id = int(record_id)
    except Exception:
        return jsonify({'error': 'Missing or invalid id'}), 400

    name = payload.get('name')
    manufacturer = payload.get('manufacturer')
    release_date = payload.get('release_date')
    age = payload.get('age')
    image_url = payload.get('image_url')

    if not name or not manufacturer or not release_date:
        return jsonify({'error': 'Missing required fields'}), 400

    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT 1 FROM consoles WHERE id = %s;", (record_id,))
            if cur.fetchone() is None:
                return jsonify({'error': 'Record not found'}), 404

            cur.execute(
                """
                UPDATE consoles
                SET name = %s,
                    manufacturer = %s,
                    release_date = %s,
                    age = %s,
                    image_url = COALESCE(%s, image_url)
                WHERE id = %s
                RETURNING id, name, manufacturer,
                          release_date::text AS release_date,
                          age, image_url;
                """,
                (name, manufacturer, release_date, age, image_url, record_id)
            )
            updated = cur.fetchone()

    return jsonify(updated), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)