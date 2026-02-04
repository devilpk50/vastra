document.addEventListener("DOMContentLoaded", function () {
  // Hide Sign in button only on signup page
  const signinBtn =
    document.querySelector('.signin-btn') ||           // class
    document.querySelector('#signupin') ||             // id
    document.querySelector('a[href*="signin"]');        // link

  if (signinBtn) {
    signinBtn.style.display = 'none';
  }
});

document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const phone = document.getElementById("phone").value.trim();
  const name = document.getElementById("name")?.value.trim() || email.split('@')[0];
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.textContent = "";

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errorMsg.textContent = "Please enter a valid email address.";
    return;
  }

  // Password length
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters long.";
    return;
  }

  // Password match
  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  // Phone number validation (10 digits)
  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(phone)) {
    errorMsg.textContent = "Phone number must be 10 digits.";
    return;
  }

  // Send to backend
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await response.json();
    if (!data.ok) {
      errorMsg.textContent = data.message || 'Registration failed';
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', data.role || 'user');
    
    // Redirect admin users to admin panel
    if (data.role === 'admin') {
      alert("Registration successful! Redirecting to admin panel...");
      window.location.href = '/admin/index.html';
    } else {
      alert("Registration successful!");
      window.location.href = '/index.html';
    }
  } catch (err) {
    errorMsg.textContent = 'Registration error: ' + err.message;
  }
});
