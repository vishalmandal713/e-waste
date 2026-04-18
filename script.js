// script.js
const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://127.0.0.1:5000"
  : "https://e-waste-3-zmft.onrender.com";

window.onload = () => {
  // Check authentication
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display user email in navbar
  const userEmail = localStorage.getItem('user_email');
  const userEmailDiv = document.getElementById('user-email');
  if (userEmailDiv) {
    userEmailDiv.textContent = userEmail;
  }
  
  document.querySelector('.fade-down')?.classList.add('animate-down');
  document.querySelector('.slide-left')?.classList.add('animate-left');
  document.querySelector('.slide-right')?.classList.add('animate-right');
  document.querySelector('.fade-up')?.classList.add('animate-up');
  
  // Load dashboard data on page load
  loadPickupRequests();
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

// ===== PICKUP REQUEST FORM HANDLER =====
const pickupForm = document.getElementById('pickup-form');
if (pickupForm) {
  pickupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      device: document.getElementById('device-type').value,
      quantity: document.getElementById('quantity').value,
      address: document.getElementById('pickup-address').value
    };

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Pickup request submitted successfully!');
        pickupForm.reset();
        loadPickupRequests();
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('auth_token');
        window.location.href = 'login.html';
      } else {
        alert(result.message || 'Failed to submit pickup request.');
      }
    } catch (error) {
      alert('Error connecting to server. Please try again later.');
      console.error('Pickup request error:', error);
    }
  });
}

// ===== LOAD PICKUP REQUESTS FOR DASHBOARD =====
async function loadPickupRequests() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('auth_token');
      window.location.href = 'login.html';
      return;
    }
    
    const requests = await response.json();

    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No requests found</td></tr>';
      return;
    }

    requests.forEach(req => {
      const row = document.createElement('tr');
      const statusClass = req.status.toLowerCase();
      row.innerHTML = `
        <td>${req.id}</td>
        <td>${req.device_type}</td>
        <td>${req.quantity}</td>
        <td>${req.address}</td>
        <td><span class="status ${statusClass}">${req.status}</span></td>
        <td>
          <button class="btn-update" onclick="updateStatus(${req.id})">Update</button>
          <button class="btn-delete" onclick="deleteRequest(${req.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading requests:', error);
    alert('Failed to load requests');
  }
}

// ===== UPDATE REQUEST STATUS =====
async function updateStatus(requestId) {
  const newStatus = prompt('Enter new status (Pending, Processing, Collected, Completed):');
  if (!newStatus) return;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/request/${requestId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Request updated successfully!');
      loadPickupRequests();
    } else {
      alert(result.message || 'Failed to update request');
    }
  } catch (error) {
    alert('Error updating request');
    console.error('Update error:', error);
  }
}

// ===== DELETE REQUEST =====
async function deleteRequest(requestId) {
  if (!confirm('Are you sure you want to delete this request?')) return;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/request/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (response.ok) {
      alert('Request deleted successfully!');
      loadPickupRequests();
    } else {
      alert(result.message || 'Failed to delete request');
    }
  } catch (error) {
    alert('Error deleting request');
    console.error('Delete error:', error);
  }
}

// ===== LOGOUT FUNCTION =====
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  }
}

// ===== UTILITY FUNCTIONS =====
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
