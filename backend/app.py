```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

requests_db = []

@app.route('/api/request', methods=['POST'])
def pickup_request():
    data = request.json
    requests_db.append(data)
    return jsonify({"message": "Pickup request submitted successfully"})

@app.route('/api/requests', methods=['GET'])
def get_requests():
    return jsonify(requests_db)

if __name__ == '__main__':
    app.run(debug=True)
```
