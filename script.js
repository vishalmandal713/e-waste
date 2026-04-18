document.getElementById('pickupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Determine API URL based on environment
    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const API_BASE_URL = isLocal 
        ? "http://127.0.0.1:5000" 
        : "https://e-waste-2-v31k.onrender.com/api/requests"; // Replace with your actual URL after deploying

    const data = {
        device: document.getElementById('device').value,
        quantity: document.getElementById('quantity').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const messageElement = document.getElementById('message');
        
        messageElement.innerText = result.message;
        messageElement.style.color = response.ok ? "green" : "red";

        if(response.ok) document.getElementById('pickupForm').reset();
        
    } catch (error) {
        document.getElementById('message').innerText = "Error connecting to server.";
        console.error("Fetch error:", error);
    }
});

