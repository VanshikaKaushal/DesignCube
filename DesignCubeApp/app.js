/**
 * @file        app.js
 * @description Main JavaScript logic for DesignQube, a store management app for tiles and sanitaryware.
 *              Handles UI switching, product table rendering, sales tracking, and localStorage management.
 *              Supports Excel-based stock addition and real-time dashboard updates.
 * @author      Vanshika Kaushal
 */

//Load saved data from localStorage or initialize empty arrays
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

/* ===============================
     Section Switching Function
   =============================== */
function showSection(id) {
  // Show only the selected section
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = section.id === id ? 'block' : 'none';
  });

  // Load data when entering certain pages
  if (id === 'dashboard') updateDashboard();
  if (id === 'tiles-page') renderTilesTable();
  if (id === 'sanitary-page') renderSanitaryTable();
  if (id === 'others-page') renderOthersTable();
  if (id === 'sales') renderSalesTabs();
  if (id === 'sales-history') renderSalesHistoryTable();
}

/* ===============================
     Dashboard Summary Display
   =============================== */
function updateDashboard() {
  // Total products count
  document.getElementById('total-products').textContent = products.length;

  // Total stock calculation
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  document.getElementById('total-stock').textContent = totalStock;

  // Total sales calculation
  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  document.getElementById('total-sales').textContent = totalSales.toFixed(2);

  // Display low stock items (≤ 5)
  const lowStockList = document.getElementById('low-stock-ul');
  lowStockList.innerHTML = '';
  products.filter(p => (p.stock || 0) <= 5).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} - Stock: ${p.stock || 0}`;
    lowStockList.appendChild(li);
  });
}

/* ===============================
       Product Table Renderers
   =============================== */

// Render Tiles Table
function renderTilesTable() {
  const tbody = document.querySelector('#tiles-table tbody');
  tbody.innerHTML = '';
  products.filter(p => p.type?.toLowerCase() === 'tile').forEach(p => {
    const total = (p.numBoxes || 0) * (p.pricePerBox || 0);
    tbody.innerHTML += `
      <tr>
        <td>${p.serial}</td><td>${p.brand}</td><td>${p.name}</td><td>${p.size || '-'}</td>
        <td>${p.numBoxes || 0}</td><td>${p.numPieces || 0}</td>
        <td>₹${(p.pricePerBox || 0).toFixed(2)}</td><td>₹${total.toFixed(2)}</td>
      </tr>`;
  });
}

// Render Sanitary Table
function renderSanitaryTable() {
  const tbody = document.querySelector('#sanitary-table tbody');
  tbody.innerHTML = '';
  products.filter(p => p.type?.toLowerCase() === 'sanitary').forEach(p => {
    const total = (p.numBoxes || 0) * (p.pricePerBox || 0);
    tbody.innerHTML += `
      <tr>
        <td>${p.serial}</td><td>${p.brand}</td><td>${p.name}</td>
        <td>${p.numBoxes || 0}</td><td>${p.numPieces || 0}</td>
        <td>₹${(p.pricePerBox || 0).toFixed(2)}</td><td>₹${total.toFixed(2)}</td>
      </tr>`;
  });
}

// Render Others Table
function renderOthersTable() {
  const tbody = document.querySelector('#others-table tbody');
  tbody.innerHTML = '';
  products.filter(p => !['tile', 'sanitary'].includes(p.type?.toLowerCase())).forEach(p => {
    const total = (p.numBoxes || 0) * (p.pricePerBox || 0);
    tbody.innerHTML += `
      <tr>
        <td>${p.serial}</td><td>${p.type}</td><td>${p.brand}</td><td>${p.name}</td>
        <td>${p.size || '-'}</td><td>${p.numBoxes || 0}</td><td>${p.numPieces || 0}</td>
        <td>₹${(p.pricePerBox || 0).toFixed(2)}</td><td>₹${total.toFixed(2)}</td>
      </tr>`;
  });
}

/* ===============================
       Sales Tabs and History
   =============================== */

// Render Sales Tab View (by category)
function renderSalesTabs() {
  const map = {
    tile: document.querySelector('#sales-tiles tbody'),
    sanitary: document.querySelector('#sales-sanitary tbody'),
    others: document.querySelector('#sales-others tbody')
  };

  // Clear existing tables
  Object.values(map).forEach(tbody => tbody.innerHTML = '');

  // Add rows based on type
  sales.forEach(s => {
    const row = `<tr><td>${s.serial}</td><td>${s.name}</td><td>${s.quantity}</td><td>₹${s.total.toFixed(2)}</td><td>${s.date}</td></tr>`;
    const type = s.type?.toLowerCase();
    if (map[type]) map[type].innerHTML += row;
    else map['others'].innerHTML += row;
  });
}

// Render Full Sales History
function renderSalesHistoryTable() {
  const tbody = document.querySelector('#sales-table tbody');
  tbody.innerHTML = '';
  sales.forEach(s => {
    tbody.innerHTML += `<tr><td>${s.serial}</td><td>${s.name}</td><td>${s.quantity}</td><td>₹${s.total.toFixed(2)}</td><td>${s.date}</td></tr>`;
  });
}

// Toggle Sales Tab View
function toggleSalesTab(tabId) {
  document.querySelectorAll('.sales-tab').forEach(tab => {
    tab.style.display = tab.id === tabId ? 'block' : 'none';
  });
}

/* ===============================
           New Sale Entry
   =============================== */
function prepareNewSales(type) {
  let more = true;

  while (more) {
    const serial = prompt(`Enter serial number of ${type} product:`);
    const quantity = Number(prompt('Enter quantity sold:'));
    const date = new Date().toLocaleDateString();

    const product = products.find(p => p.serial === serial);

    // Error handling: invalid serial or insufficient stock
    if (!product || quantity > product.stock) {
      alert('Invalid serial or insufficient stock');
      more = confirm('Do you want to continue adding sales?');
      continue;
    }

    // Update stock and record sale
    product.stock -= quantity;
    const total = (product.pricePerBox || 0) * quantity;
    sales.push({ serial, name: product.name, quantity, total, date, type: product.type });

    more = confirm('Sale recorded! Add another?');
  }

  // Save to localStorage and re-render
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('sales', JSON.stringify(sales));

  renderSalesTabs();
  renderSalesHistoryTable();
  updateDashboard();
}

/* ===============================
      Initialize App on Load
   =============================== */
showSection('dashboard');
