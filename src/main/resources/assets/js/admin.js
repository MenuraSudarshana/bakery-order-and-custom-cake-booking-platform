const apiBaseUrl = "http://localhost:8080";
const adminSessionKey = "bakery_admin_session";
let cachedProducts = [];

const byId = (id) => document.getElementById(id);
const setStatus = (element, message, isError = false) => {
  element.textContent = message;
  element.classList.toggle("error", isError);
};
const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
};
const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const renderPurchaseDetails = (orderItemsRaw) => {
  if (!orderItemsRaw) return "-";
  try {
    const items = JSON.parse(orderItemsRaw);
    if (!Array.isArray(items) || !items.length) return "-";
    return `<ol class="purchase-list">${items.map((item) => `
      <li>
        Product Name: ${item.name || "-"}<br>
        Product ID: ${item.id || "-"}<br>
        Quantity: ${item.qty ?? 0}<br>
        Unit Price: ${formatPrice(Number(item.unitPrice || 0))}
      </li>
    `).join("")}</ol>`;
  } catch {
    return `<pre>${orderItemsRaw}</pre>`;
  }
};

const loadSummary = async () => {
  const response = await fetch(`${apiBaseUrl}/api/admin/summary`);
  const summary = await response.json();
  byId("kpi-products").textContent = summary.totalProducts || 0;
  byId("kpi-low-stock").textContent = summary.lowStockProducts || 0;
  byId("kpi-pending").textContent = summary.pendingOrders || 0;
  byId("kpi-success").textContent = summary.successfulOrders || 0;
  byId("kpi-reservations").textContent = summary.reservationCount || 0;
};

const fillEditForm = (productId) => {
  const product = cachedProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;
  byId("edit-product-name").value = product.name || "";
  byId("edit-product-category").value = product.category || "";
  byId("edit-product-flavour").value = product.flavour || "";
  byId("edit-product-price").value = product.price || 0;
  byId("edit-product-rating").value = product.rating || 0;
  byId("edit-product-stock").value = product.stock || 0;
  byId("edit-product-image-url").value = product.imageUrl || "";
  byId("edit-product-description").value = product.description || "";
};

const loadProducts = async () => {
  const response = await fetch(`${apiBaseUrl}/api/admin/products`);
  cachedProducts = await response.json();
  const tableBody = byId("products-table-body");
  const select = byId("edit-product-select");

  if (!cachedProducts.length) {
    tableBody.innerHTML = `<tr><td colspan="7">No products found.</td></tr>`;
    select.innerHTML = `<option value="">No products</option>`;
    return;
  }

  select.innerHTML = cachedProducts.map((p) => `<option value="${p.id}">#${p.id} - ${p.name}</option>`).join("");
  fillEditForm(select.value || cachedProducts[0].id);

  tableBody.innerHTML = cachedProducts.map((item) => `
    <tr>
      <td>${item.id}</td><td>${item.name}</td><td>${item.category}</td><td>${formatPrice(item.price)}</td>
      <td><input type="number" min="0" value="${item.stock}" data-stock-input="${item.id}"></td>
      <td>${item.active ? "Yes" : "No"}</td>
      <td>
        <button class="btn" type="button" data-save-stock="${item.id}">Save Stock</button>
        <button class="btn ${item.active ? "danger" : ""}" type="button" data-toggle-active="${item.id}" data-active="${item.active}">
          ${item.active ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  `).join("");

  tableBody.querySelectorAll("[data-save-stock]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.saveStock;
      const stock = Number(tableBody.querySelector(`[data-stock-input="${id}"]`).value);
      await fetch(`${apiBaseUrl}/api/admin/products/${id}/stock?stock=${stock}`, { method: "PATCH" });
      await Promise.all([loadSummary(), loadProducts()]);
    });
  });

  tableBody.querySelectorAll("[data-toggle-active]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.toggleActive;
      const active = button.dataset.active === "true";
      await fetch(`${apiBaseUrl}/api/admin/products/${id}/active?active=${!active}`, { method: "PATCH" });
      await Promise.all([loadSummary(), loadProducts()]);
    });
  });
};

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "successful") return "successful";
  if (normalized === "cancelled") return "cancelled";
  return "pending";
};

const loadOrders = async () => {
  const status = byId("order-status-filter").value;
  const response = await fetch(`${apiBaseUrl}/api/admin/orders?status=${encodeURIComponent(status)}`);
  const orders = await response.json();
  const tableBody = byId("orders-table-body");

  if (!orders.length) {
    tableBody.innerHTML = `<tr><td colspan="9">No orders found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = orders.map((order) => `
    <tr>
      <td>#${order.id}</td><td>${order.customerName}<br><small>${order.customerEmail}</small></td>
      <td>${formatPrice(order.total)}</td><td>${order.paymentMethod}</td>
      <td><span class="pill ${statusClassName(order.orderStatus)}">${order.orderStatus}</span></td>
      <td>${order.cancelRequested ? "Yes" : "No"}</td>
      <td>${order.pickupDate} ${order.pickupTime}</td><td><details><summary>View Items</summary>${renderPurchaseDetails(order.orderItems)}</details></td>
      <td>
        <button class="btn" type="button" data-order-status="${order.id}" data-status="Pending">Pending</button>
        <button class="btn" type="button" data-order-status="${order.id}" data-status="Successful">Successful</button>
        <button class="btn danger" type="button" data-order-status="${order.id}" data-status="Cancelled">Cancel</button>
      </td>
    </tr>
  `).join("");

  tableBody.querySelectorAll("[data-order-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.orderStatus;
      const statusValue = button.dataset.status;
      const response = await fetch(`${apiBaseUrl}/api/admin/orders/${id}/status?status=${encodeURIComponent(statusValue)}`, { method: "PATCH" });
      if (!response.ok) {
        const payload = await safeJson(response);
        alert(payload.message || "Unable to update order status.");
        return;
      }
      await Promise.all([loadSummary(), loadOrders(), loadProducts(), loadAnalytics()]);
    });
  });
};

const loadReservations = async () => {
  const response = await fetch(`${apiBaseUrl}/api/admin/reservations`);
  const reservations = await response.json();
  const tableBody = byId("reservations-table-body");

  if (!reservations.length) {
    tableBody.innerHTML = `<tr><td colspan="10">No reservations found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = reservations.map((item) => `
    <tr>
      <td>#${item.id}</td><td>${item.name || "-"}</td><td>${item.phone || "-"}</td><td>${item.persons || 0}</td>
      <td>${item.reservationDate || "-"}</td><td>${item.reservationTime || "-"}</td><td>${item.message || "-"}</td>
      <td><span class="pill ${statusClassName(item.reservationStatus || "Pending")}">${item.reservationStatus || "Pending"}</span></td>
      <td>${item.cancelRequested ? "Yes" : "No"}</td>
      <td>
        <button class="btn" type="button" data-reservation-status="${item.id}" data-status="Pending">Pending</button>
        <button class="btn" type="button" data-reservation-status="${item.id}" data-status="Successful">Successful</button>
        <button class="btn danger" type="button" data-reservation-status="${item.id}" data-status="Cancelled">Cancel</button>
      </td>
    </tr>
  `).join("");

  tableBody.querySelectorAll("[data-reservation-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.reservationStatus;
      const statusValue = button.dataset.status;
      const response = await fetch(`${apiBaseUrl}/api/admin/reservations/${id}/status?status=${encodeURIComponent(statusValue)}`, { method: "PATCH" });
      if (!response.ok) return;
      await Promise.all([loadSummary(), loadReservations(), loadAnalytics()]);
    });
  });
};

const renderSingleSeriesChart = (elementId, labels, values, color, formatter = (v) => `${v}`) => {
  const host = byId(elementId);
  const max = Math.max(...values, 0);
  host.innerHTML = labels.map((label, idx) => {
    const value = Number(values[idx] || 0);
    const width = max === 0 ? 0 : Math.round((value / max) * 100);
    return `<div class="bar-row"><span class="bar-label">${label.slice(-2)}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${color};"></div></div><span class="bar-value">${formatter(value)}</span></div>`;
  }).join("");
};

const renderTripleDailyChart = (elementId, labels, a, b, c) => {
  const host = byId(elementId);
  const max = Math.max(...a, ...b, ...c, 0);
  host.innerHTML = labels.map((label, idx) => {
    const av = Number(a[idx] || 0), bv = Number(b[idx] || 0), cv = Number(c[idx] || 0);
    const wa = max === 0 ? 0 : Math.round((av / max) * 100);
    const wb = max === 0 ? 0 : Math.round((bv / max) * 100);
    const wc = max === 0 ? 0 : Math.round((cv / max) * 100);
    return `<div class="bar-row"><span class="bar-label">${label.slice(-2)}</span><div class="bar-track"><div class="bar-fill" style="width:${wa}%;background:#2f7ef3;"></div><div class="bar-fill" style="width:${wb}%;background:#19a64b;opacity:0.75;margin-top:-16px;"></div><div class="bar-fill" style="width:${wc}%;background:#f59c2a;opacity:0.75;margin-top:-16px;"></div></div><span class="bar-value">${av}/${bv}/${cv}</span></div>`;
  }).join("");
};

const loadExpenses = async () => {
  const response = await fetch(`${apiBaseUrl}/api/admin/expenses`);
  const expenses = await response.json();
  const tableBody = byId("expense-table-body");
  if (!expenses.length) {
    tableBody.innerHTML = `<tr><td colspan="5">No expenses added.</td></tr>`;
    return;
  }
  tableBody.innerHTML = expenses.map((item) => `
    <tr><td>${item.id}</td><td>${item.monthKey}</td><td>${item.category}</td><td>${formatPrice(item.amount)}</td><td>${item.note || "-"}</td></tr>
  `).join("");
};

const loadDailyStock = async () => {
  const status = byId("daily-stock-status");
  const tableBody = byId("daily-stock-table-body");
  const selectedDate = byId("daily-stock-date").value || todayIsoDate();
  byId("daily-stock-date").value = selectedDate;
  setStatus(status, "Loading daily stock...");

  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/daily-stock?date=${encodeURIComponent(selectedDate)}`);
    const rows = await safeJson(response);
    if (!response.ok) {
      setStatus(status, rows.message || "Unable to load daily stock.", true);
      return;
    }

    if (!rows.length) {
      tableBody.innerHTML = `<tr><td colspan="5">No daily stock entries.</td></tr>`;
      setStatus(status, "");
      return;
    }

    tableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.productId}</td>
        <td>${row.productName}</td>
        <td><input type="number" min="0" value="${row.dailyStock ?? ""}" placeholder="Not set" data-daily-input="${row.id}"></td>
        <td>
          <button class="btn" type="button" data-save-daily="${row.id}">Update</button>
          <button class="btn danger" type="button" data-delete-daily="${row.id}">Delete</button>
        </td>
      </tr>
    `).join("");

    tableBody.querySelectorAll("[data-save-daily]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.saveDaily;
        const value = tableBody.querySelector(`[data-daily-input="${id}"]`).value;
        const stock = Number(value);
        if (value === "" || Number.isNaN(stock) || stock < 0) {
          setStatus(status, "Enter a valid stock value (0 or greater).", true);
          return;
        }
        const response = await fetch(`${apiBaseUrl}/api/admin/daily-stock/${id}?stock=${stock}`, { method: "PATCH" });
        const payload = await safeJson(response);
        if (!response.ok) {
          setStatus(status, payload.message || "Unable to update daily stock.", true);
          return;
        }
        setStatus(status, "Daily stock updated.");
      });
    });

    tableBody.querySelectorAll("[data-delete-daily]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.deleteDaily;
        const response = await fetch(`${apiBaseUrl}/api/admin/daily-stock/${id}`, { method: "DELETE" });
        const payload = await safeJson(response);
        if (!response.ok) {
          setStatus(status, payload.message || "Unable to delete daily stock row.", true);
          return;
        }
        await loadDailyStock();
      });
    });

    setStatus(status, "");
  } catch {
    setStatus(status, "Unable to connect daily stock API.", true);
  }
};

const loadAnalytics = async () => {
  const status = byId("analytics-status");
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/analytics`);
    const data = await safeJson(response);
    if (!response.ok) {
      setStatus(status, data.message || "Unable to load analytics.", true);
      return;
    }

    byId("kpi-month-revenue").textContent = formatPrice(data.currentMonthRevenue);
    byId("kpi-month-cost").textContent = formatPrice(data.currentMonthCost);
    byId("kpi-month-profit").textContent = formatPrice(data.currentMonthProfit);

    const dailyLabels = Object.keys(data.dailyOrders || {});
    renderTripleDailyChart(
      "daily-count-chart",
      dailyLabels,
      Object.values(data.dailyOrders || {}),
      Object.values(data.dailySuccessfulOrders || {}),
      Object.values(data.dailyReservations || {})
    );
    renderSingleSeriesChart("daily-revenue-chart", dailyLabels, Object.values(data.dailyRevenue || {}), "#19a64b", (v) => formatPrice(v));

    const monthlyLabels = Object.keys(data.monthlyRevenue || {});
    renderSingleSeriesChart("monthly-finance-chart", monthlyLabels, Object.values(data.monthlyRevenue || {}), "#2f7ef3", (v) => formatPrice(v));
    renderSingleSeriesChart("monthly-profit-chart", monthlyLabels, Object.values(data.monthlyProfit || {}), "#8a5cf6", (v) => formatPrice(v));
    setStatus(status, "");
  } catch {
    setStatus(status, "Unable to load analytics API.", true);
  }
};

const loadDashboard = async () => {
  await Promise.all([loadSummary(), loadProducts(), loadOrders(), loadReservations(), loadExpenses(), loadDailyStock(), loadAnalytics()]);
};

const setLoggedInView = (isLoggedIn) => {
  byId("admin-login-card").classList.toggle("is-hidden", isLoggedIn);
  byId("admin-content").classList.toggle("is-hidden", !isLoggedIn);
};

byId("admin-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginStatus = byId("admin-login-status");
  const username = byId("admin-username").value.trim();
  const password = byId("admin-password").value;
  setStatus(loginStatus, "Checking login...");
  const response = await fetch(`${apiBaseUrl}/api/users/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password })
  });
  const result = (await response.text()).trim();
  if (result !== "SUCCESS") return setStatus(loginStatus, "Invalid admin credentials.", true);
  localStorage.setItem(adminSessionKey, JSON.stringify({ username, loginTime: new Date().toISOString() }));
  setLoggedInView(true);
  setStatus(loginStatus, "");
  await loadDashboard();
});

byId("add-product-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("add-product-status");
  setStatus(status, "Creating product...");
  const payload = {
    name: byId("product-name").value.trim(),
    category: byId("product-category").value.trim(),
    flavour: byId("product-flavour").value.trim(),
    description: byId("product-description").value.trim(),
    imageUrl: byId("product-image-url").value.trim(),
    price: Number(byId("product-price").value),
    rating: Number(byId("product-rating").value),
    stock: Number(byId("product-stock").value)
  };
  const response = await fetch(`${apiBaseUrl}/api/admin/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await safeJson(response);
  if (!response.ok) return setStatus(status, data.message || "Unable to create product.", true);
  byId("add-product-form").reset(); byId("product-rating").value = "4.5"; byId("product-stock").value = "0";
  setStatus(status, "Product created successfully.");
  await Promise.all([loadSummary(), loadProducts()]);
});

byId("import-catalog-products").addEventListener("click", async () => {
  const status = byId("add-product-status");
  setStatus(status, "Importing website products...");
  const response = await fetch(`${apiBaseUrl}/api/admin/products/import-catalog`, { method: "POST" });
  const data = await safeJson(response);
  if (!response.ok) {
    setStatus(status, data.message || "Unable to import products.", true);
    return;
  }
  setStatus(status, `Imported ${data.inserted || 0} products from website catalog.`);
  await Promise.all([loadSummary(), loadProducts(), loadDailyStock()]);
});

byId("edit-product-select").addEventListener("change", (event) => fillEditForm(event.target.value));
byId("edit-product-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("edit-product-status");
  const productId = byId("edit-product-select").value;
  const payload = {
    name: byId("edit-product-name").value.trim(),
    category: byId("edit-product-category").value.trim(),
    flavour: byId("edit-product-flavour").value.trim(),
    description: byId("edit-product-description").value.trim(),
    imageUrl: byId("edit-product-image-url").value.trim(),
    price: Number(byId("edit-product-price").value),
    rating: Number(byId("edit-product-rating").value),
    stock: Number(byId("edit-product-stock").value)
  };
  setStatus(status, "Updating product...");
  const response = await fetch(`${apiBaseUrl}/api/admin/products/${productId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await safeJson(response);
  if (!response.ok) return setStatus(status, data.message || "Unable to update product.", true);
  setStatus(status, "Product updated successfully.");
  await Promise.all([loadProducts(), loadSummary()]);
});

byId("expense-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("expense-status");
  setStatus(status, "Saving cost entry...");
  const payload = {
    monthKey: byId("expense-month").value,
    category: byId("expense-category").value.trim(),
    amount: Number(byId("expense-amount").value),
    note: byId("expense-note").value.trim()
  };
  const response = await fetch(`${apiBaseUrl}/api/admin/expenses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await safeJson(response);
  if (!response.ok) return setStatus(status, data.message || "Unable to add cost.", true);
  byId("expense-form").reset();
  setStatus(status, "Cost added successfully.");
  await Promise.all([loadExpenses(), loadAnalytics()]);
});

byId("refresh-dashboard").addEventListener("click", loadSummary);
byId("refresh-products").addEventListener("click", loadProducts);
byId("refresh-orders").addEventListener("click", loadOrders);
byId("refresh-reservations").addEventListener("click", loadReservations);
byId("refresh-daily-stock").addEventListener("click", loadDailyStock);
byId("refresh-analytics").addEventListener("click", loadAnalytics);
byId("order-status-filter").addEventListener("change", loadOrders);

window.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem(adminSessionKey) || "null");
  const isLoggedIn = Boolean(session?.username);
  setLoggedInView(isLoggedIn);
  byId("expense-month").value = new Date().toISOString().slice(0, 7);
  byId("daily-stock-date").value = todayIsoDate();
  if (isLoggedIn) await loadDashboard();
});
