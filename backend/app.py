from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = 'database.db'

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_type TEXT,
                quantity INTEGER,
                address TEXT,
                status TEXT DEFAULT 'Pending'
            )
        ''')
    conn.close()

@app.route('/api/request', methods=['POST'])
def pickup_request():
    data = request.json
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO pickup_requests (device_type, quantity, address) VALUES (?, ?, ?)",
                (data['device'], data['quantity'], data['address'])
            )
            conn.commit()
        return jsonify({"message": "Pickup request submitted successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Error saving request", "error": str(e)}), 500

@app.route('/api/requests', methods=['GET'])
def get_requests():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pickup_requests")
        rows = cursor.fetchall()
        # Convert sqlite rows to list of dictionaries
        requests_list = [dict(row) for row in rows]
    return jsonify(requests_list)

if __name__ == '__main__':
    init_db()
    # Bind to PORT provided by the cloud provider
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
