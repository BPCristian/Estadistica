document.addEventListener("DOMContentLoaded", () => {
    const consumoEntriesContainer = document.getElementById("consumoEntries");
    const addEntryBtn = document.getElementById("addEntryBtn");
    const submitDataBtn = document.getElementById("submitDataBtn");
    const avgDisplay = document.getElementById("avg");
    const stddevDisplay = document.getElementById("stddev");
    const q1Display = document.getElementById("q1");
    const medianDisplay = document.getElementById("median");
    const q3Display = document.getElementById("q3");
    const adviceDisplay = document.getElementById("advice");
    const ctx = document.getElementById("consumoChart").getContext("2d");

    let data = JSON.parse(localStorage.getItem("consumoData")) || [];

    const updateChart = () => {
        const labels = data.map(item => item.month);
        const values = data.map(item => item.amount);

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Consumo",
                    data: values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    fill: false,
                }]
            }
        });
    };

    const calculatePercentiles = (values) => {
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(0.25 * values.length)];
        const median = values[Math.floor(0.5 * values.length)];
        const q3 = values[Math.floor(0.75 * values.length)];
        return { q1, median, q3 };
    };

    const updateStats = () => {
        if (data.length === 0) {
            avgDisplay.textContent = "Promedio: -";
            stddevDisplay.textContent = "Desviación Estándar: -";
            q1Display.textContent = "Percentil Q1: -";
            medianDisplay.textContent = "Mediana: -";
            q3Display.textContent = "Percentil Q3: -";
            adviceDisplay.textContent = "Consejo: -";
            return;
        }

        const values = data.map(item => item.amount);
        const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
        const stddev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length);
        const { q1, median, q3 } = calculatePercentiles(values);

        avgDisplay.textContent = `Promedio: ${avg.toFixed(2)}`;
        stddevDisplay.textContent = `Desviación Estándar: ${stddev.toFixed(2)}`;
        q1Display.textContent = `Percentil Q1: ${q1}`;
        medianDisplay.textContent = `Mediana: ${median}`;
        q3Display.textContent = `Percentil Q3: ${q3}`;

        const currentMonthConsumption = values[values.length - 1];
        if (currentMonthConsumption < median) {
            adviceDisplay.textContent = "Consejo: Mantén tu consumo, está en un nivel estable.";
        } else if (currentMonthConsumption > q3) {
            adviceDisplay.textContent = "Consejo: Para el próximo mes, el consumo debe ser menor.";
        } else {
            adviceDisplay.textContent = "Consejo: Buen trabajo, el consumo está bajo control.";
        }
    };

    addEntryBtn.addEventListener("click", () => {
        const newEntry = document.createElement("div");
        newEntry.className = "mb-3";

        newEntry.innerHTML = `
            <label class="form-label">Mes:</label>
            <input type="text" class="form-control month" required>
            <label class="form-label">Consumo:</label>
            <input type="number" class="form-control amount" required>
        `;

        consumoEntriesContainer.appendChild(newEntry);
    });

    submitDataBtn.addEventListener("click", () => {
        const entries = document.querySelectorAll(".entry");

        entries.forEach(entry => {
            const month = entry.querySelector(".month").value;
            const amount = parseFloat(entry.querySelector(".amount").value);

            if (month && !isNaN(amount)) {
                data.push({ month, amount });
            }
        });

        localStorage.setItem("consumoData", JSON.stringify(data));
        updateStats();
        updateChart();

        // Limpiar las entradas después de guardar
        consumoEntriesContainer.innerHTML = "";
    });

    // Inicializar la gráfica y las estadísticas con datos existentes
    updateStats();
    updateChart();
});