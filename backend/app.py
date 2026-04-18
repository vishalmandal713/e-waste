from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', static_url_path='/')
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024
DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'database.db'))

def init_db():
    try:
        db_dir = os.path.dirname(DB_PATH)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        
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
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if filename in ['style.css', 'script.js', 'index.html']:
        return send_from_directory('.', filename)
    return jsonify({"message": "Not found"}), 404

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

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
        logger.info(f"Pickup request created: {data['device']}")
        return jsonify({"message": "Pickup request submitted successfully"}), 201
    except Exception as e:
        logger.error(f"Error saving request: {e}")
        return jsonify({"message": "Error saving request"}), 500

@app.route('/api/requests', methods=['GET'])
def get_requests():
    status = request.args.get('status')
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if status:
                cursor.execute("SELECT * FROM pickup_requests WHERE status = ? ORDER BY created_at DESC", (status,))
            else:
                cursor.execute("SELECT * FROM pickup_requests ORDER BY created_at DESC")
            
            rows = cursor.fetchall()
            requests_list = [dict(row) for row in rows]
        return jsonify(requests_list)
    except Exception as e:
        logger.error(f"Error fetching requests: {e}")
        return jsonify({"message": "Error fetching requests"}), 500

@app.route('/api/request/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    data = request.json or {}
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({"message": "Status is required"}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE pickup_requests SET status = ? WHERE id = ?",
                (new_status, request_id)
            )
            conn.commit()
        logger.info(f"Request {request_id} updated to {new_status}")
        return jsonify({"message": "Request updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating request: {e}")
        return jsonify({"message": "Error updating request"}), 500

@app.route('/api/request/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM pickup_requests WHERE id = ?", (request_id,))
            conn.commit()
        logger.info(f"Request {request_id} deleted")
        return jsonify({"message": "Request deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting request: {e}")
        return jsonify({"message": "Error deleting request"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({"message": "Internal server error"}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
