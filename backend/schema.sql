CREATE TABLE pickup_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_type VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    address TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_status ON pickup_requests(status);
CREATE INDEX idx_device_type ON pickup_requests(device_type);
