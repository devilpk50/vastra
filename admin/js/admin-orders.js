// Orders Management

const API_BASE = '/api/admin';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

let allOrders = [];
let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;

// Load all orders
async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to load orders');
    }

    const data = await response.json();
    
    if (data.ok && data.carts) {
      allOrders = data.carts;
      // Store original orders for search filtering
      if (typeof window !== 'undefined') {
        window.originalOrders = data.carts;
      }
      currentPage = 1;
      displayOrders();
    } else {
      document.getElementById('ordersTableBody').innerHTML = 
        '<tr><td colspan="5" class="text-center text-danger">Failed to load orders</td></tr>';
      updatePagination();
    }
  } catch (err) {
    console.error('Error loading orders:', err);
    document.getElementById('ordersTableBody').innerHTML = 
      '<tr><td colspan="5" class="text-center text-danger">Error: ' + err.message + '</td></tr>';
    updatePagination();
  }
}

// Display orders in table with pagination
function displayOrders() {
  const tbody = document.getElementById('ordersTableBody');
  
  if (allOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
    updatePagination();
    return;
  }

  // Calculate pagination
  totalPages = Math.ceil(allOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = allOrders.slice(startIndex, endIndex);

  tbody.innerHTML = paginatedOrders.map(order => {
    const user = order.userId || {};
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const itemsList = items.map(item => {
      const product = item.productId || {};
      return `${escapeHtml(product.name || 'Unknown')} (Qty: ${item.quantity})`;
    }).join(', ');

    return `
      <tr>
        <td>
          <div>${escapeHtml(user.name || 'Unknown User')}</div>
          <small class="text-muted">${escapeHtml(user.email || 'N/A')}</small>
        </td>
        <td>
          <small>${itemsList || 'No items'}</small>
        </td>
        <td>
          <span class="badge badge-primary">${totalItems}</span>
        </td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="viewOrderDetails('${escapeJs(order._id)}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updatePagination();
}

// Update pagination controls
function updatePagination() {
  const paginationContainer = document.getElementById('paginationContainer');
  if (!paginationContainer) return;

  if (allOrders.length === 0) {
    paginationContainer.innerHTML = '';
    return;
  }

  totalPages = Math.ceil(allOrders.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, allOrders.length);

  let paginationHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <span class="text-muted">Showing ${startItem} to ${endItem} of ${allOrders.length} orders</span>
      </div>
      <nav>
        <ul class="pagination mb-0">
  `;

  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">Previous</a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
        </li>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `
        <li class="page-item disabled">
          <a class="page-link" href="#">...</a>
        </li>
      `;
    }
  }

  // Next button
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">Next</a>
    </li>
  `;

  paginationHTML += `
        </ul>
      </nav>
    </div>
  `;

  paginationContainer.innerHTML = paginationHTML;
}

// Navigate to specific page
function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  displayOrders();
  // Scroll to top of table
  document.querySelector('.card-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// View order details
function viewOrderDetails(orderId) {
  // This could open a modal with detailed order information
  alert('Order details view - To be implemented');
}

// Helper functions for escaping HTML/JS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

// Refresh orders
function refreshOrders() {
  loadOrders();
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  window.location.href = '/login.html';
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('userName');
  if (userName) {
    const adminNameEl = document.getElementById('adminUserNameTopbar');
    if (adminNameEl) {
      adminNameEl.textContent = userName;
    }
  }
  loadOrders();
});
