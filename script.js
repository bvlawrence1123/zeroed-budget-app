//JAVASCRIPT FUNCTIONALITY
//-------
//--CONST REFERENCES--
const incomeInput = document.getElementById("income");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const addButton = document.getElementById("add-expense");
const expenseList = document.getElementById("expense-list");
const remainingDisplay = document.getElementById("remaining-display");
const budgetNameInput = document.getElementById("budget-name");
const saveBudgetButton = document.getElementById("save-budget");
const loadBudgetDropdown = document.getElementById("load-budget");
const deleteBudgetButton = document.getElementById("delete-budget");
const newBudgetButton = document.getElementById("new-budget");
const totalExpensesDisplay = document.getElementById("total-expenses");

let income = 0;
let expenses = [];

//--SAVE BUDGET BY NAME--
saveBudgetButton.addEventListener("click", () => {
  const name = budgetNameInput.value.trim();
  if (!name) {
    alert("Please enter a budget name before saving.");
    return;
  }

  const allBudgets = JSON.parse(localStorage.getItem("budgetArchive")) || {};
  allBudgets[name] = {
    income,
    expenses,
  };

  localStorage.setItem("budgetArchive", JSON.stringify(allBudgets));
  alert(`Budget "${name}" saved!`);

  updateBudgetDropdown();
  loadBudgetDropdown.selectedIndex = 0;
});

//--LOAD A SAVED BUDGET--
loadBudgetDropdown.addEventListener("change", () => {
  const selected = loadBudgetDropdown.value;
  const allBudgets = JSON.parse(localStorage.getItem("budgetArchive")) || {};

  if (allBudgets[selected]) {
    income = allBudgets[selected].income;
    expenses = allBudgets[selected].expenses;
    incomeInput.value = income;
    budgetNameInput.value = selected;
    renderExpenses();
    updateRemaining();
    alert(`Loaded budget: ${selected}`);
  }
});

//--DELETE A SAVED BUDGET--
deleteBudgetButton.addEventListener("click", () => {
  const selected = loadBudgetDropdown.value;

  if (!selected || selected === "Load a saved budget") {
    alert("Please select a budget to delete.");
    return;
  }

  const allBudgets = JSON.parse(localStorage.getItem("budgetArchive")) || {};

  if (allBudgets[selected]) {
    const confirmDelete = confirm(`Are you sure you want to delete "${selected}"?`);
    if (confirmDelete) {
      delete allBudgets[selected];
      localStorage.setItem("budgetArchive", JSON.stringify(allBudgets));
      updateBudgetDropdown();
      alert(`Budget "${selected}" deleted.`);
    }
  }
});

//--NEW BUDGET : CLEAR UI ONLY--
newBudgetButton.addEventListener("click", () => {
  const confirmNew = confirm("Start a new budget? This will clear all visible data but won't affect your saved budgets.");
  if (!confirmNew) return;

  income = 0;
  expenses = [];

  incomeInput.value = "";
  nameInput.value = "";
  amountInput.value = "";
  budgetNameInput.value = "";
  loadBudgetDropdown.selectedIndex = 0;

  renderExpenses();
  updateRemaining();
});

//--DROPDOWN UPDATE OF SAVED BUDGETS--
function updateBudgetDropdown() {
  const allBudgets = JSON.parse(localStorage.getItem("budgetArchive")) || {};
  loadBudgetDropdown.innerHTML = `<option disabled selected>Load a saved budget</option>`;
  Object.keys(allBudgets).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    loadBudgetDropdown.appendChild(option);
  });
}

//--INCOME INPUT CHANGE--
incomeInput.addEventListener("input", () => {
  income = parseFloat(incomeInput.value) || 0;
  updateRemaining();
});

//--ADD EXPENSE--
addButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (name && !isNaN(amount) && amount > 0) {
    expenses.push({ name, amount });
    nameInput.value = "";
    amountInput.value = "";
    nameInput.focus(); // autofocus
    renderExpenses();
    updateRemaining();
  }
});

//--RENDER ALL EXPENSES--
function renderExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML = "<li style='text-align:center; color:#9ca3af;'>No expenses yet. Add something to begin.</li>";
    return;
  }

  expenses.forEach((exp, index) => {
    const li = document.createElement("li");

    if (exp.editing) {
      li.innerHTML = `
        <input type="text" id="edit-name-${index}" value="${exp.name}" />
        <input type="number" id="edit-amount-${index}" value="${exp.amount}" />
        <button class="save-btn" onclick="saveEdit(${index})">Save</button>
        <button class="cancel-btn" onclick="cancelEdit(${index})">Cancel</button>
      `;
    } else {
      li.innerHTML = `
        <span>${exp.name} - $${exp.amount.toFixed(2)}</span>
        <div>
          <button onclick="startEdit(${index})">✏️</button>
          <button class="remove-btn" onclick="removeExpense(${index})">✖</button>
        </div>
      `;
    }

    expenseList.appendChild(li);
  });
}

//--EDIT EXPENSE FUNCTIONS--
function startEdit(index) {
  expenses[index].editing = true;
  renderExpenses();
}

function cancelEdit(index) {
  delete expenses[index].editing;
  renderExpenses();
}

function saveEdit(index) {
  const newName = document.getElementById(`edit-name-${index}`).value.trim();
  const newAmount = parseFloat(document.getElementById(`edit-amount-${index}`).value);

  if (newName && !isNaN(newAmount) && newAmount >= 0) {
    expenses[index].name = newName;
    expenses[index].amount = newAmount;
    delete expenses[index].editing;
    renderExpenses();
    updateRemaining();
  } else {
    alert("Please enter a valid name and amount.");
  }
}

//--REMOVE EXPENSE--
function removeExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
  updateRemaining();
}

//--UPDATE REMAINING BALANCE--
function updateRemaining() {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = income - totalExpenses;

  remainingDisplay.textContent = `Remaining: $${remaining.toFixed(2)}`;
  totalExpensesDisplay.textContent = `Total Expenses: $${totalExpenses.toFixed(2)}`;
}

//--INIT--
updateBudgetDropdown();
