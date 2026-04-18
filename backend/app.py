from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Use environment variable or default
DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'database.db'))

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_type VARCHAR(100) NOT NULL,
                quantity INTEGER NOT NULL,
                address TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/request', methods=['POST'])
def pickup_request():
    data = request.json or {}
    
    if not all([data.get('device'), data.get('quantity'), data.get('address')]):
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        quantity = int(data['quantity'])
        if quantity <= 0:
            return jsonify({"message": "Quantity must be positive"}), 400
    except ValueError:
        return jsonify({"message": "Invalid quantity format"}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO pickup_requests (device_type, quantity, address) VALUES (?, ?, ?)",
                (data['device'], quantity, data['address'])
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
        requests_list = [dict(row) for row in rows]
    return jsonify(requests_list)

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
