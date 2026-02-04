const userId = localStorage.getItem('userId');

// Load cart on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (!userId) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }
  await loadCart();
});

async function loadCart() {
  try {
    const response = await fetch((window.API_BASE || '') + `/api/cart/${userId}`);
    const data = await response.json();
    if (!data.ok) {
      console.error('Failed to load cart:', data.message);
      return;
    }
    displayCart(data.cart.items || []);
  } catch (err) {
    console.error('Error loading cart:', err.message);
  }
}

function displayCart(items) {
  const container = document.querySelector('.cart-items');
  if (!container) {
    console.error('Cart items container not found');
    return;
  }
  
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<p class="text-center py-5">Your cart is empty</p>';
    updateTotal();
    updateCartCount();
    // Disable checkout button if cart is empty
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Cart is Empty';
    }
    return;
  }
  
  // Enable checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Proceed to Checkout';
  }
  
  items.forEach(item => {
    const product = item.productId;
    // Skip if product is not populated or doesn't exist
    if (!product || !product._id) {
      console.warn('Product not found for cart item:', item);
      return;
    }
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = product._id;
    div.innerHTML = `
      <img src="${product.image || '/assets/placeholder.png'}" alt="${product.name}" />
      <div class="item-details">
        <h6>${product.name}</h6>
        <p class="price">₹ ${product.price}</p>
        <div class="quantity">
          <button onclick="changeQty(this, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(this, 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(this)">
        <i class="bi bi-trash"></i>
      </button>
    `;
    container.appendChild(div);
  });
  updateTotal();
  updateCartCount();
}

async function changeQty(btn, change) {
  const cartItem = btn.closest('.cart-item');
  const productId = cartItem.dataset.productId;
  const qtySpan = btn.parentElement.querySelector("span");
  let qty = parseInt(qtySpan.innerText) + change;
  
  if (qty < 1) {
    // If quantity becomes 0, remove the item
    await removeItem(btn.closest('.cart-item').querySelector('.remove-btn'));
    return;
  }
  
  try {
    const response = await fetch((window.API_BASE || '') + `/api/cart/${userId}/update/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty })
    });
    
    const data = await response.json();
    if (!data.ok) {
      alert('Failed to update quantity: ' + data.message);
      // Reload cart to get correct state
      await loadCart();
      return;
    }
    
    // Update UI
    qtySpan.innerText = qty;
    updateTotal();
    updateCartCount();
  } catch (err) {
    console.error('Error updating quantity:', err);
    alert('Error updating quantity: ' + err.message);
    // Reload cart to get correct state
    await loadCart();
  }
}

async function removeItem(btn) {
  const cartItem = btn.closest('.cart-item');
  const productId = cartItem.dataset.productId;
  
  if (!confirm('Are you sure you want to remove this item from your cart?')) {
    return;
  }
  
  try {
    const response = await fetch((window.API_BASE || '') + `/api/cart/${userId}/remove/${productId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.ok) {
      alert('Failed to remove item: ' + data.message);
      return;
    }
    // Reload cart to ensure UI is in sync
    await loadCart();
  } catch (err) {
    console.error('Error removing item:', err);
    alert('Error: ' + err.message);
  }
}

function proceedToCheckout() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }
  window.location.href = '/checkout.html';
}

function updateCartCount() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  fetch((window.API_BASE || '') + `/api/cart/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.ok && data.cart) {
        const count = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
          cartCountEl.textContent = count;
        }
      }
    })
    .catch(err => console.error('Error updating cart count:', err));
}

function updateTotal() {
  let subtotal = 0;

  document.querySelectorAll(".cart-item").forEach(item => {
    const priceText = item.querySelector(".price").innerText.replace("₹", "").replace("$", "");
    const price = parseFloat(priceText);
    const qty = parseInt(item.querySelector(".quantity span").innerText);
    subtotal += price * qty;
  });

  const totalElem = document.getElementById("total");
  const subtotalElem = document.getElementById("subtotal");
  if (subtotalElem) subtotalElem.innerText = "₹ " + subtotal;
  if (totalElem) totalElem.innerText = "₹ " + (subtotal + 50);
}
