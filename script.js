const drinkSelector = document.getElementById("drinkSelector");
const addDrinkBtn = document.getElementById("addDrinkBtn");
const subtractDrinkBtn = document.getElementById("subtractDrinkBtn");
const resetBtn = document.getElementById("resetBtn");
const addDrinkForm = document.getElementById("addDrinkForm");
const addBarForm = document.getElementById("addBarForm");
const barSelector = document.getElementById("barSelector");
const isPaidCheckbox = document.getElementById("isPaidCheckbox");
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
function populateBarSelector() {
  let bars = JSON.parse(localStorage.getItem("bars")) || [];
  bars.forEach((bar) => {
    const option = document.createElement("option");
    option.value = bar;
    option.textContent = bar;
    barSelector.appendChild(option);
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
    bar: barSelector.value, // Añadir información del bar
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

function addNewBar(e) {
  e.preventDefault();

  const newBar = addBarForm.barName.value;
  let bars = JSON.parse(localStorage.getItem("bars")) || [];

  bars.push(newBar);
  localStorage.setItem("bars", JSON.stringify(bars));

  // Limpiar formulario
  addBarForm.reset();

  // Actualizar el selector de bares
  populateBarSelector();
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

  const unpaidDrinks = last12Hours.filter((entry) => !entry.isPaid);
  const unpaidDrinksCount = document.getElementById("unpaidDrinksCount");
  unpaidDrinksCount.textContent = unpaidDrinks.length;

  // Actualizar tabla
  const tbody = drinkTable.querySelector("tbody");
  tbody.innerHTML = "";

  for (let index = drinkHistory.length - 1; index >= 0; index--) {
    const entry = drinkHistory[index];
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = entry.name;
    row.appendChild(nameCell);

    const brandCell = document.createElement("td");
    brandCell.textContent = entry.brand;
    row.appendChild(brandCell);

    const alcoholCell = document.createElement("td");
    alcoholCell.textContent = entry.alcohol;
    row.appendChild(alcoholCell);

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

    const barCell = document.createElement("td");
    barCell.textContent = entry.bar;
    row.appendChild(barCell);

    const date = new Date(entry.timestamp);
    const dateCell = document.createElement("td");
    dateCell.textContent = `${date.getHours()}:${date.getMinutes()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;
    row.appendChild(dateCell);

    const paidCell = document.createElement("td");
    paidCell.className = "paid";
    paidCell.textContent = entry.isPaid ? "Sí" : "No";
    row.appendChild(paidCell);

    // Crea un input tipo checkbox para la celda de pagos
    const paidCheckbox = document.createElement("input");
    paidCheckbox.type = "checkbox";
    paidCheckbox.checked = entry.isPaid;
    paidCell.appendChild(paidCheckbox);

    // Crea un botón para eliminar el registro
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "delete";
    row.appendChild(deleteBtn);

    // Añade el evento de clic al botón de eliminar
    deleteBtn.addEventListener("click", () => {
      drinkHistory.splice(index, 1);
      localStorage.setItem("drinkHistory", JSON.stringify(drinkHistory));
      updateDisplay();
    });

    paidCheckbox.addEventListener("change", () => {
      entry.isPaid = !entry.isPaid;
      localStorage.setItem("drinkHistory", JSON.stringify(drinkHistory));
    });

    tbody.appendChild(row);
  }

  // Actualizar tabla de bebidas sin pagar por bar
  const unpaidDrinksTable = document.getElementById("unpaidDrinksTable");
  const unpaidDrinksTbody = unpaidDrinksTable.querySelector("tbody");
  unpaidDrinksTbody.innerHTML = "";

  const unpaidDrinksByBar = unpaidDrinks.reduce((result, drink) => {
    if (!result[drink.bar]) {
      result[drink.bar] = [];
    }
    result[drink.bar].push(drink);
    return result;
  }, {});

  Object.entries(unpaidDrinksByBar).forEach(([bar, drinks]) => {
    const row = document.createElement("tr");

    const barCell = document.createElement("td");
    barCell.textContent = bar;
    row.appendChild(barCell);

    const drinksCell = document.createElement("td");
    const drinksList = document.createElement("ol");
    const drinkCounts = drinks.reduce((acc, drink) => {
      acc[drink.name] = (acc[drink.name] || 0) + 1;
      return acc;
    }, {});

    for (const [drinkName, count] of Object.entries(drinkCounts)) {
      const listItem = document.createElement("li");
      listItem.textContent = `${drinkName} x${count}`;
      drinksList.appendChild(listItem);
    }

    drinksCell.appendChild(drinksList);
    row.appendChild(drinksCell);
    unpaidDrinksTbody.appendChild(row);
  });
}

// Event listeners
addDrinkBtn.addEventListener("click", addDrink);
subtractDrinkBtn.addEventListener("click", subtractDrink);
addDrinkForm.addEventListener("submit", addNewDrink);
addBarForm.addEventListener("submit", addNewBar);

// Inicialización
populateDrinkSelector();
populateBarSelector(); // Llama a la función para llenar el dropdown de bares
updateDisplay();
