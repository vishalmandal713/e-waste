// script.js
window.onload = () => {
  document.querySelector('.fade-down').classList.add('animate-down');
  document.querySelector('.slide-left').classList.add('animate-left');
  document.querySelector('.slide-right').classList.add('animate-right');
  document.querySelector('.fade-up').classList.add('animate-up');
};

const style = document.createElement('style');
style.innerHTML = `
.animate-down{animation:down .8s forwards;} 
.animate-left{animation:left .8s .2s forwards;} 
.animate-right{animation:right .8s .4s forwards;} 
.animate-up{animation:up .8s .6s forwards;} 
@keyframes down{from{opacity:0;top:-30px}to{opacity:1;top:0}}
@keyframes left{from{opacity:0;left:-30px}to{opacity:1;left:0}}
@keyframes right{from{opacity:0;left:30px}to{opacity:1;left:0}}
@keyframes up{from{opacity:0;top:30px}to{opacity:1;top:0}}
`;
document.head.appendChild(style);

// ===== LOGIN FORM HANDLER =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const API_BASE_URL = isLocal 
      ? "http://127.0.0.1:5000" 
      : "https://e-waste-2-v31k.onrender.com";

    const data = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Login successful!');
        // Store token if provided
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
        loginForm.reset();
      } else {
        alert(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      alert('Error connecting to server.');
      console.error('Login error:', error);
    }
  });
}

// ===== PICKUP REQUEST FORM HANDLER =====
const pickupForm = document.getElementById('pickup-form');
if (pickupForm) {
  pickupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const API_BASE_URL = isLocal 
      ? "http://127.0.0.1:5000" 
      : "https://e-waste-2-v31k.onrender.com";

    const data = {
      device: document.getElementById('device-type').value,
      quantity: document.getElementById('quantity').value,
      address: document.getElementById('pickup-address').value,
      date: document.getElementById('pickup-date').value
    };

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/request`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Pickup request submitted successfully!');
        pickupForm.reset();
      } else {
        alert(result.message || 'Failed to submit pickup request.');
      }
    } catch (error) {
      alert('Error connecting to server. Please try again later.');
      console.error('Pickup request error:', error);
    }
  });
}

// ===== UTILITY FUNCTIONS =====
// Function to validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to log out
function logout() {
  localStorage.removeItem('auth_token');
  alert('Logged out successfully!');
  location.reload();
}
