import os
import json
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

CONSOLES_JSON = os.path.join(os.path.dirname(__file__), 'public', 'consoles.json')
SCHEMA_SQL = os.path.join(os.path.dirname(__file__), 'db', 'schema.sql')

def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    with open(SCHEMA_SQL, 'r') as f:
        cur.execute(f.read())
    conn.commit()

    if os.path.exists(CONSOLES_JSON):
        with open(CONSOLES_JSON, 'r') as f:
            j = json.load(f)
        consoles = j.get('consoles', [])
        cur.execute("DELETE FROM consoles;")
        conn.commit()
        for c in consoles:
            name = c.get('name') or c.get('console') or ''
            manufacturer = c.get('manufacturer', '')
            release_date = c.get('release_date', None)
            age = c.get('age', None)
            image_url = c.get('image_url', 'https://example.com/default.png')
            cur.execute(
                "INSERT INTO consoles (name, manufacturer, release_date, age, image_url) VALUES (%s,%s,%s,%s,%s);",
                (name, manufacturer, release_date, age, image_url)
            )
        conn.commit()

    cur.close()
    conn.close()
    print("DB init complete.")

if __name__ == '__main__':
    main()