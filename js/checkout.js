const userId = localStorage.getItem('userId');

// Load cart on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (!userId) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }
  await loadCartForCheckout();
});

function selectPayment(method) {
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  document.getElementById(method).checked = true;
}

async function loadCartForCheckout() {
  try {
    const response = await fetch((window.API_BASE || '') + `/api/cart/${userId}`);
    const data = await response.json();
    if (!data.ok) {
      alert('Failed to load cart: ' + data.message);
      window.location.href = '/cart.html';
      return;
    }

    const items = data.cart.items || [];
    if (items.length === 0) {
      alert('Your cart is empty');
      window.location.href = '/cart.html';
      return;
    }

    displayOrderSummary(items);
  } catch (err) {
    console.error('Error loading cart:', err);
    alert('Error loading cart: ' + err.message);
    window.location.href = '/cart.html';
  }
}

function displayOrderSummary(items) {
  const container = document.getElementById('orderItems');
  let subtotal = 0;

  container.innerHTML = items.map(item => {
    const product = item.productId;
    if (!product || !product._id) {
      return '';
    }
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="order-summary-item">
        <div>
          <strong>${product.name}</strong>
          <br>
          <small class="text-muted">Qty: ${item.quantity} × ₹${product.price}</small>
        </div>
        <span>₹ ${itemTotal}</span>
      </div>
    `;
  }).join('');

  const delivery = 50;
  const total = subtotal + delivery;

  document.getElementById('checkoutSubtotal').textContent = `₹ ${subtotal}`;
  document.getElementById('checkoutDelivery').textContent = `₹ ${delivery}`;
  document.getElementById('checkoutTotal').textContent = `₹ ${total}`;
}

async function placeOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const zip = document.getElementById('zip').value.trim();

  // Validation
  if (!name || !phone || !address || !city || !zip) {
    alert('Please fill in all shipping address fields');
    return;
  }

  // Phone validation
  if (phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }

  const shippingAddress = { name, phone, address, city, zip };

  // Disable button to prevent double submission
  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing Order...';

  try {
    const response = await fetch((window.API_BASE || '') + `/api/orders/${userId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddress })
    });

    const data = await response.json();

    if (!data.ok) {
      alert('Failed to place order: ' + data.message);
      btn.disabled = false;
      btn.textContent = 'Place Order';
      return;
    }

    // Order placed successfully
    alert('Order placed successfully! Order ID: ' + data.order._id);
    window.location.href = '/index.html';
  } catch (err) {
    console.error('Error placing order:', err);
    alert('Error placing order: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}
