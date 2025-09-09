// Local storage simulation
let users = JSON.parse(localStorage.getItem("smartSpendUsers")) || [];

// Signup form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (users.find((u) => u.email === email)) {
      alert("User already exists!");
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("smartSpendUsers", JSON.stringify(users));
    alert("Account created successfully!");
    window.location.href = "login.html";
  });
}

// Login form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      alert("Welcome back, " + user.name);
      window.location.href = "index.html";
    } else {
      alert("Invalid credentials!");
    }
  });
}
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        alert('Login successful! Welcome ' + user.name);
        loginModal.style.display = "none";
        document.getElementById('loginForm').reset();
        // Redirect to dashboard
        window.location.href = "dashboard.html";
    } else {
        alert('Invalid credentials!');
    }
});

document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (users.find(u => u.email === email)) {
        alert('User already exists!');
        return;
    }

    users.push({name, email, password});
    localStorage.setItem('smartSpendUsers', JSON.stringify(users));
    alert('Account created successfully!');
    signupModal.style.display = "none";
    document.getElementById('signupForm').reset();

    // Redirect to dashboard after signup
    window.location.href = "dashboard.html";
});

// Savings calculator
const calcBtn = document.getElementById("calculateBtn");
if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    const income = parseFloat(document.getElementById("income").value) || 0;
    const expenses = parseFloat(document.getElementById("expenses").value) || 0;
    const result = document.getElementById("result");

    if (income > expenses) {
      result.textContent = `Potential Monthly Savings: $${(income - expenses).toFixed(2)}`;
    } else {
      result.textContent = "Consider reducing expenses to save!";
    }
  });
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-fadeInUp");
    }
  });
});

document.querySelectorAll(".feature-card, .text-center").forEach((el) => {
  observer.observe(el);
});
// Load user session
const currentUser = JSON.parse(localStorage.getItem("smartSpendCurrentUser"));

// Redirect if not logged in
if (window.location.pathname.includes("dashboard.html") && !currentUser) {
  window.location.href = "login.html";
}

// Show user name
const welcomeUser = document.getElementById("welcomeUser");
if (welcomeUser && currentUser) {
  welcomeUser.textContent = `Hi, ${currentUser.name}`;
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("smartSpendCurrentUser");
    window.location.href = "login.html";
  });
}

// Expenses & Goals
let expenses = JSON.parse(localStorage.getItem("smartSpendExpenses")) || [];
let goal = JSON.parse(localStorage.getItem("smartSpendGoal")) || null;

// Expense Form
const expenseForm = document.getElementById("expenseForm");
if (expenseForm) {
  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("expenseName").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    const newExpense = { name, amount, date: new Date().toLocaleDateString() };
    expenses.push(newExpense);
    localStorage.setItem("smartSpendExpenses", JSON.stringify(expenses));
    renderExpenses();
    updateSummary();
    expenseForm.reset();
  });
}

// Goal Form
const goalForm = document.getElementById("goalForm");
if (goalForm) {
  goalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    goal = parseFloat(document.getElementById("goalAmount").value);
    localStorage.setItem("smartSpendGoal", JSON.stringify(goal));
    updateGoalProgress();
  });
}

// Render Expenses
function renderExpenses() {
  const expenseList = document.getElementById("expenseList");
  if (!expenseList) return;
  expenseList.innerHTML = "";
  expenses.slice(-5).reverse().forEach((exp) => {
    const li = document.createElement("li");
    li.className = "flex justify-between bg-gray-100 px-4 py-2 rounded";
    li.innerHTML = `<span>${exp.name} (${exp.date})</span><span>-$${exp.amount}</span>`;
    expenseList.appendChild(li);
  });
}

// Update Summary
function updateSummary() {
  const totalIncome = 3000; // demo static income
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const savings = totalIncome - totalExpenses;

  const incomeEl = document.getElementById("summaryIncome");
  const expenseEl = document.getElementById("summaryExpenses");
  const savingsEl = document.getElementById("summarySavings");

  if (incomeEl) incomeEl.textContent = `$${totalIncome}`;
  if (expenseEl) expenseEl.textContent = `$${totalExpenses}`;
  if (savingsEl) savingsEl.textContent = `$${savings}`;
}

// Update Goal
function updateGoalProgress() {
  const goalEl = document.getElementById("goalProgress");
  if (!goalEl || !goal) return;

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalIncome = 3000;
  const savings = totalIncome - totalExpenses;

  goalEl.textContent = `Goal: $${goal} | Saved: $${savings} | Progress: ${Math.min(((savings/goal)*100).toFixed(1), 100)}%`;
}

// Init
if (window.location.pathname.includes("dashboard.html")) {
  renderExpenses();
  updateSummary();
  updateGoalProgress();
}
let categoryChart, summaryChart;

// Render Charts
function renderCharts() {
  const ctxCategory = document.getElementById("categoryChart");
  const ctxSummary = document.getElementById("summaryChart");

  if (!ctxCategory || !ctxSummary) return;

  // Group expenses by category (simple logic based on name keywords)
  const categories = {};
  expenses.forEach(exp => {
    let category = "Other";
    if (exp.name.toLowerCase().includes("food")) category = "Food";
    else if (exp.name.toLowerCase().includes("rent")) category = "Rent";
    else if (exp.name.toLowerCase().includes("travel")) category = "Travel";
    else if (exp.name.toLowerCase().includes("shopping")) category = "Shopping";
    categories[category] = (categories[category] || 0) + exp.amount;
  });

  // Destroy old charts before re-render
  if (categoryChart) categoryChart.destroy();
  if (summaryChart) summaryChart.destroy();

  // Pie Chart for categories
  categoryChart = new Chart(ctxCategory, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: "Expenses",
        data: Object.values(categories),
        backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"]
      }]
    },
    options: { responsive: true }
  });

  // Bar Chart for Income vs Expenses
  const totalIncome = 3000;
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  summaryChart = new Chart(ctxSummary, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses", "Savings"],
      datasets: [{
        label: "Amount ($)",
        data: [totalIncome, totalExpenses, totalIncome - totalExpenses],
        backgroundColor: ["#10b981", "#ef4444", "#3b82f6"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Update functions
function renderExpenses() {
  const expenseList = document.getElementById("expenseList");
  if (!expenseList) return;
  expenseList.innerHTML = "";
  expenses.slice(-5).reverse().forEach((exp) => {
    const li = document.createElement("li");
    li.className = "flex justify-between bg-gray-100 px-4 py-2 rounded";
    li.innerHTML = `<span>${exp.name} (${exp.date})</span><span>-$${exp.amount}</span>`;
    expenseList.appendChild(li);
  });

  renderCharts(); // update charts whenever expenses update
}
window.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && document.getElementById("userName")) {
        document.getElementById("userName").textContent = loggedInUser.name;
    }
});