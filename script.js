const drinkSelector = document.getElementById("drinkSelector");
const addDrinkBtn = document.getElementById("addDrinkBtn");
const subtractDrinkBtn = document.getElementById("subtractDrinkBtn");
const addDrinkForm = document.getElementById("addDrinkForm");
const isInvitedCheckbox = document.getElementById("isInvitedCheckbox");
const isPaidCheckbox = document.getElementById("isPaidCheckbox");
const resetBtn = document.getElementById("resetBtn");
const drinkCount = document.getElementById("drinkCount");
const alcoholCount = document.getElementById("alcoholCount");
const drinkTable = document.getElementById("drinkTable");

let drinks = JSON.parse(localStorage.getItem("drinks")) || [];
let drinkHistory = JSON.parse(localStorage.getItem("drinkHistory")) || [];

function populateDrinkSelector() {
  drinks.forEach((drink) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(drink);
    option.textContent = `${drink.name} - ${drink.brand} (${drink.alcohol}%)`;
    drinkSelector.appendChild(option);
  });
}

// Función para añadir una bebida al historial
function addDrink() {
  const selectedDrink = JSON.parse(drinkSelector.value);
  if (!selectedDrink) return;

  const drinkEntry = {
    ...selectedDrink,
    isPaid: isPaidCheckbox.checked, // Añadir información de "pagada"
    isInvited: isInvitedCheckbox.checked, // Añadir información de "invitada"
    timestamp: new Date().getTime(),
  };

  drinkHistory.push(drinkEntry);
  localStorage.setItem("drinkHistory", JSON.stringify(drinkHistory));

  updateDisplay();
}

function subtractDrink() {
  // Función para restar una bebida del historial
  if (drinkHistory.length === 0) return;

    drinkHistory.pop();
    localStorage.setItem("drinkHistory", JSON.stringify(drinkHistory));

    updateDisplay();
}

function addNewDrink(e) {
    e.preventDefault();

    const newDrink = {
        name: addDrinkForm.name.value,
        brand: addDrinkForm.brand.value,
        alcohol: parseFloat(addDrinkForm.alcohol.value),
    };

    drinks.push(newDrink);
    localStorage.setItem("drinks", JSON.stringify(drinks));

    // Limpiar formulario
    addDrinkForm.reset();

    // Actualizar el selector de bebidas y la vista
    populateDrinkSelector();
    updateDisplay();
}

// Función para resetear el contador de bebidas en las últimas 12 horas
function resetDrinkCounter() {
  const currentTime = new Date().getTime();
  const twelveHoursAgo = currentTime - 12 * 60 * 60 * 1000;

  drinkHistory = drinkHistory.filter(
    (entry) => entry.timestamp >= twelveHoursAgo
  );
  localStorage.setItem("drinkHistory", JSON.stringify(drinkHistory));

  updateDisplay();
}

// Función para actualizar la vista
function updateDisplay() {
  // Actualizar contador de bebidas y alcohol en las últimas 12 horas
  const currentTime = new Date().getTime();
  const twelveHoursAgo = currentTime - 12 * 60 * 60 * 1000;
  const last12Hours = drinkHistory.filter(
    (entry) => entry.timestamp >= twelveHoursAgo
  );

  drinkCount.textContent = last12Hours.length;
  alcoholCount.textContent = last12Hours
    .reduce((total, entry) => total + entry.alcohol, 0)
    .toFixed(2);

  // Actualizar tabla
  const tbody = drinkTable.querySelector("tbody");
  tbody.innerHTML = "";

  drinkHistory.forEach((entry, index) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = entry.name;
    row.appendChild(nameCell);

    const alcoholCell = document.createElement("td");
    alcoholCell.textContent = entry.alcohol;
    row.appendChild(alcoholCell);

    const date = new Date(entry.timestamp);
    const dateCell = document.createElement("td");
    dateCell.textContent = `${date.getHours()}:${date.getMinutes()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;
    row.appendChild(dateCell);

    const timeDifference =
      index === 0 ? 0 : entry.timestamp - drinkHistory[index - 1].timestamp;
    const timeDifferenceCell = document.createElement("td");
    const hours = Math.floor(timeDifference / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeDifference % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((timeDifference % (60 * 1000)) / 1000);
    timeDifferenceCell.textContent = `${hours}:${minutes}:${seconds}`;
    row.appendChild(timeDifferenceCell);

    const invitedCell = document.createElement("td");
    invitedCell.className = "invited";
    invitedCell.textContent = entry.isInvited ? "Sí" : "No";
    row.appendChild(invitedCell);

    const paidCell = document.createElement("td");
    paidCell.className = "paid";
    paidCell.textContent = entry.isPaid ? "Sí" : "No";
    row.appendChild(paidCell);

    tbody.appendChild(row);
  });
}

// Event listeners
addDrinkBtn.addEventListener("click", addDrink);
subtractDrinkBtn.addEventListener("click", subtractDrink);
addDrinkForm.addEventListener("submit", addNewDrink);
resetBtn.addEventListener("click", resetDrinkCounter);

// Inicialización
populateDrinkSelector();
updateDisplay();
