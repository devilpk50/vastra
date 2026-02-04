document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure all elements are rendered
  setTimeout(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log('Token:', token);
    console.log('UserId:', userId);

    if (!token || !userId) {
      alert("Please login first!");
      window.location.href = '/login.html';
      return;
    }

    // Load user profile data
    loadUserProfile();

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      updateUserProfile();
    });
  }, 100);
});

async function loadUserProfile() {
  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    console.log('Loading profile for userId:', userId);
    console.log('Token:', token);

    const response = await fetch((window.API_BASE || '') + `/api/auth/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Check if response is HTML (error case)
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Profile response:', data);

    if (data.ok && data.user) {
      // Populate form fields
      console.log('User data from API:', data.user);
      document.getElementById('profileName').value = data.user.name || '';
      document.getElementById('profileEmail').value = data.user.email || '';
      document.getElementById('profilePhone').value = data.user.phone || '';
      document.getElementById('profileAddress').value = data.user.address || '';
      document.getElementById('profileCity').value = data.user.city || '';
      document.getElementById('profileZip').value = data.user.zip || '';
    } else {
      console.error('Failed to load profile:', data.message);
      alert('Failed to load profile: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Error loading profile: ' + err.message);
  }
}

async function updateUserProfile() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  const address = document.getElementById('profileAddress').value.trim();
  const city = document.getElementById('profileCity').value.trim();
  const zip = document.getElementById('profileZip').value.trim();

  const successMsg = document.getElementById('successMsg');
  const errorMsg = document.getElementById('errorMsg');

  successMsg.style.display = 'none';
  errorMsg.style.display = 'none';

  try {
    const response = await fetch((window.API_BASE || '') + `/api/auth/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ address, city, zip })
    });

    const data = await response.json();

    if (data.ok) {
      successMsg.textContent = 'Profile updated successfully!';
      successMsg.style.display = 'block';
    } else {
      errorMsg.textContent = data.message || 'Failed to update profile';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    errorMsg.textContent = 'Error updating profile: ' + err.message;
    errorMsg.style.display = 'block';
  }
}
