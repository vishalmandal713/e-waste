
CREATE TABLE pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_type VARCHAR(100),
    quantity INT,
    address TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
);
