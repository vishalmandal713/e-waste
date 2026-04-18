const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://127.0.0.1:5000"
  : "https://e-waste-3-zmft.onrender.com";

// Check if user is already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    window.location.href = 'index.html';
  }
});

// Toggle between login and register forms
function toggleForm() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
  
  // Clear error messages
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('register-error').style.display = 'none';
  document.getElementById('register-success').style.display = 'none';
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  errorDiv.style.display = 'none';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', email);
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = data.message || 'Login failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = 'Error connecting to server. Please try again later.';
    errorDiv.style.display = 'block';
  }
}

// Handle Register
async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');
  
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  // Validate passwords match
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match!';
    errorDiv.style.display = 'block';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      successDiv.textContent = 'Registration successful! Redirecting to login...';
      successDiv.style.display = 'block';
      
      // Clear form
      document.getElementById('register').reset();
      
      // Switch to login after 2 seconds
      setTimeout(() => {
        toggleForm();
        document.getElementById('login-email').value = email;
      }, 2000);
    } else {
      errorDiv.textContent = data.message || 'Registration failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Register error:', error);
    errorDiv.textContent = 'Error connecting to server. Please try again later.';
    errorDiv.style.display = 'block';
  }
}
