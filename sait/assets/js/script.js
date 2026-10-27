const byId = (id) => document.getElementById(id);

function setupNavButtons() {
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-go");
      if (target) window.location.href = target;
    });
  });
}

function setupStatusForm() {
  const form = byId("statusForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = byId("orderId").value.trim();
    const result = byId("statusResult");

    if (!value) {
      result.textContent = "Введите номер заказа.";
      return;
    }

    const orders = JSON.parse(localStorage.getItem("mbt_orders") ?? "[]");
    const order = orders.find((item) => item.orderId.toLowerCase() === value.toLowerCase());
    result.textContent = order
      ? `Заказ ${order.orderId}: ${order.status}`
      : "Заказ с таким номером не найден.";
  });
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setupAuthForm() {
  const form = byId("authForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mode = byId("authMode").value;
    const email = byId("authEmail").value.trim().toLowerCase();
    const password = byId("authPassword").value;
    const result = byId("authResult");

    if (!email || password.length < 6) {
      result.textContent = "Проверьте email и пароль (минимум 6 символов).";
      return;
    }

    const passwordHash = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem("mbt_users") ?? "[]");

    if (mode === "register") {
      const exists = users.some((u) => u.email === email);
      if (exists) {
        result.textContent = "Пользователь уже существует.";
        return;
      }

      users.push({ email, passwordHash, createdAt: new Date().toISOString() });
      localStorage.setItem("mbt_users", JSON.stringify(users));
      result.textContent = "Регистрация успешна.";
      return;
    }

    const found = users.find((u) => u.email === email && u.passwordHash === passwordHash);
    result.textContent = found ? "Авторизация успешна." : "Неверный email или пароль.";
  });
}

function setupOrderForm() {
  const form = byId("orderForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const customerName = byId("customerName").value.trim();
    const productType = byId("productType").value;
    const deliveryType = byId("deliveryType").value;
    const paymentType = byId("paymentType").value;
    const result = byId("orderResult");

    if (!customerName || !productType || !deliveryType || !paymentType) {
      result.textContent = "Заполните все поля формы заказа.";
      return;
    }

    const productPrices = {
      "Чизкейк с вишней": 2800,
      "Чизкейк с голубикой": 2800,
      "Клубника в шоколаде": 1200,
      "Медовик": 2400,
      "Пирожки с вишней": 480,
      "Ватрушки с малиной и творогом": 520
    };
    const cart = getCart();
    const items = cart.length ? cart : [{ item: productType, price: productPrices[productType], qty: 1 }];
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderId = `MBT-${Date.now().toString().slice(-8)}`;
    const orders = JSON.parse(localStorage.getItem("mbt_orders") ?? "[]");
    orders.push({
      orderId,
      customerName,
      productType,
      items,
      total,
      deliveryType,
      paymentType,
      status: "Принят",
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("mbt_orders", JSON.stringify(orders));
    clearCart();

    result.textContent = `Заказ оформлен. Номер: ${orderId}`;
    form.reset();
  });
}

/* ===== Утилиты корзины ===== */
function getCart() {
  return JSON.parse(localStorage.getItem("mbt_cart") ?? "[]");
}

function saveCart(cart) {
  localStorage.setItem("mbt_cart", JSON.stringify(cart));
}

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find((i) => i.item === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ item: name, price, qty: 1 });
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function changeQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem("mbt_cart");
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const countEl = byId("cartCount");
  const itemsEl = byId("cartItems");
  const totalEl = byId("cartTotal");

  // Обновляем счётчик
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  if (countEl) countEl.textContent = totalQty;

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
    if (totalEl) totalEl.textContent = "Итого: 0 ₽";
    return;
  }

  let html = "";
  let total = 0;
  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.item}</p>
          <p class="cart-item-price">${item.price} ₽ × ${item.qty} = ${subtotal} ₽</p>
        </div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" onclick="changeQty(${idx}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart(${idx})" title="Удалить">✕</button>
        </div>
      </div>`;
  });
  itemsEl.innerHTML = html;
  if (totalEl) totalEl.textContent = `Итого: ${total} ₽`;
}

/* ===== Открытие / закрытие корзины ===== */
function setupCartModal() {
  const toggle = byId("cartToggle");
  const overlay = byId("cartOverlay");
  const closeBtn = byId("cartClose");
  const clearBtn = byId("cartClear");

  if (toggle && overlay) {
    toggle.addEventListener("click", () => overlay.classList.add("open"));
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  }
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => clearCart());
  }

  // Первоначальная отрисовка
  renderCart();
}

/* ===== Кнопки «В корзину» ===== */
function setupQuickOrderButton() {
  // Для кнопок на странице товаров (product.html)
  const productAddBtns = document.querySelectorAll(".product-add-btn");
  productAddBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".product-layout");
      if (!section) return;
      
      const title = section.querySelector(".section-title")?.textContent || "Товар";
      
      // Ищем цену в параграфах
      let price = 0;
      const paragraphs = section.querySelectorAll(".info-card p");
      paragraphs.forEach(p => {
        const text = p.textContent;
        if (text.includes("₽")) {
          const match = text.match(/(\d+(?:\s+)?\d*)\s*₽/);
          if (match) {
            price = parseInt(match[1].replace(/\s+/g, "")) || 0;
          }
        }
      });
      
      addToCart(title, price);
      
      // Показываем уведомление на кнопке
      const originalText = btn.textContent;
      btn.textContent = "✓ Добавлено!";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    });
  });

  // Для кнопки на главной (если будет)
  const quickBtn = byId("quickOrderBtn");
  if (quickBtn) {
    quickBtn.addEventListener("click", () => {
      const result = byId("quickOrderResult");
      addToCart("Торт «Малина»", 2600);
      result.textContent = "✓ Товар добавлен в корзину.";
      
      setTimeout(() => {
        result.textContent = "";
      }, 3000);
    });
  }
}

async function setupDealsApi() {
  const button = byId("loadDealsBtn");
  const list = byId("dealsList");
  if (!button || !list) return;

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Загрузка...";

    try {
      const response = await fetch("https://dummyjson.com/products/search?q=cake&limit=5");
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      list.innerHTML = "";

      (data.products ?? []).forEach((product) => {
        const item = document.createElement("li");
        item.textContent = `${product.title}: скидка ${product.discountPercentage}%`;
        list.appendChild(item);
      });
    } catch {
      list.innerHTML = "<li>Не удалось загрузить данные API.</li>";
    } finally {
      button.disabled = false;
      button.textContent = "Загрузить акции и новинки";
    }
  });
}

function setupTogglePassword() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = byId(targetId);
      if (!input) return;
      
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁";
      }
    });
  });
}

setupNavButtons();
setupStatusForm();
setupAuthForm();
setupOrderForm();
setupQuickOrderButton();
setupDealsApi();
setupTogglePassword();
setupCartModal();
