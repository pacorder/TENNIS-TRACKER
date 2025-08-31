// Application Data
const applicationData = {
  "example_players": [
    {
      "name": "Ana García",
      "age": 13,
      "level": "Principiante",
      "stats": {
        "Primer Saque (%)": 55,
        "Puntos Ganados Primer Saque (%)": 60,
        "Puntos Ganados Resto (%)": 30,
        "Winners por Partido": 8,
        "Velocidad (km/h)": 10,
        "Concentración (1-10)": 5,
        "Resistencia (1-10)": 6,
        "Adaptabilidad (1-10)": 5
      }
    },
    {
      "name": "Carlos Ruiz",
      "age": 15,
      "level": "Intermedio",
      "stats": {
        "Primer Saque (%)": 70,
        "Puntos Ganados Primer Saque (%)": 75,
        "Puntos Ganados Resto (%)": 40,
        "Winners por Partido": 18,
        "Velocidad (km/h)": 15,
        "Concentración (1-10)": 7,
        "Resistencia (1-10)": 8,
        "Adaptabilidad (1-10)": 7
      }
    },
    {
      "name": "Sofia Martinez",
      "age": 16,
      "level": "Avanzado",
      "stats": {
        "Primer Saque (%)": 80,
        "Puntos Ganados Primer Saque (%)": 85,
        "Puntos Ganados Resto (%)": 50,
        "Winners por Partido": 25,
        "Velocidad (km/h)": 18,
        "Concentración (1-10)": 9,
        "Resistencia (1-10)": 9,
        "Adaptabilidad (1-10)": 8
      }
    }
  ]
};

// Global variables
let radarChart;
let currentPlayerData = {
  name: "Jugador Ejemplo",
  age: 14,
  stats: {
    "Primer Saque (%)": 65,
    "Puntos Ganados Primer Saque (%)": 70,
    "Puntos Ganados Resto (%)": 40,
    "Winners por Partido": 15,
    "Velocidad (km/h)": 12,
    "Concentración (1-10)": 6,
    "Resistencia (1-10)": 7,
    "Adaptabilidad (1-10)": 7
  }
};

// Utility functions
function normalizeStatValue(statName, value) {
  switch(statName) {
    case "Primer Saque (%)":
    case "Puntos Ganados Primer Saque (%)":
    case "Puntos Ganados Resto (%)":
      return value; // Already 0-100
    case "Winners por Partido":
      return Math.min(value * 2, 100); // 0-50 -> 0-100
    case "Velocidad (km/h)":
      return Math.min(value * 3.33, 100); // 0-30 -> 0-100
    case "Concentración (1-10)":
    case "Resistencia (1-10)":
    case "Adaptabilidad (1-10)":
      return value * 10; // 1-10 -> 10-100
    default:
      return value;
  }
}

function getPerformanceLevel(normalizedValue) {
  if (normalizedValue >= 86) return { level: 'Excelente', class: 'status--info' };
  if (normalizedValue >= 71) return { level: 'Bueno', class: 'status--success' };
  if (normalizedValue >= 41) return { level: 'Promedio', class: 'status--warning' };
  return { level: 'Necesita Mejora', class: 'status--error' };
}

function calculateOverallScore(stats) {
  const normalizedStats = Object.keys(stats).map(key => normalizeStatValue(key, stats[key]));
  const average = normalizedStats.reduce((sum, val) => sum + val, 0) / normalizedStats.length;
  return Math.round(average);
}

function formatStatDisplay(statName, value) {
  switch(statName) {
    case "Primer Saque (%)":
    case "Puntos Ganados Primer Saque (%)":
    case "Puntos Ganados Resto (%)":
      return `${value}%`;
    case "Winners por Partido":
      return `${value}`;
    case "Velocidad (km/h)":
      return `${value} km/h`;
    case "Concentración (1-10)":
    case "Resistencia (1-10)":
    case "Adaptabilidad (1-10)":
      return `${value}/10`;
    default:
      return `${value}`;
  }
}

// Chart functions
function createRadarChart() {
  const ctx = document.getElementById('radarChart').getContext('2d');
  
  const labels = [
    'Primer Saque',
    'Puntos 1er Saque',
    'Puntos Resto',
    'Winners',
    'Velocidad',
    'Concentración',
    'Resistencia',
    'Adaptabilidad'
  ];

  const data = Object.values(currentPlayerData.stats).map((value, index) => {
    const statName = Object.keys(currentPlayerData.stats)[index];
    return normalizeStatValue(statName, value);
  });

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: currentPlayerData.name,
        data: data,
        fill: true,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196F3',
        borderWidth: 3,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#1976D2',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          min: 0,
          ticks: {
            stepSize: 20,
            color: 'rgba(255, 255, 255, 0.6)',
            font: {
              size: 11
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.2)',
            lineWidth: 1
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.2)',
            lineWidth: 1
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutCubic'
      }
    }
  });
}

function updateRadarChart() {
  if (!radarChart) return;

  const data = Object.values(currentPlayerData.stats).map((value, index) => {
    const statName = Object.keys(currentPlayerData.stats)[index];
    return normalizeStatValue(statName, value);
  });

  radarChart.data.datasets[0].data = data;
  radarChart.data.datasets[0].label = currentPlayerData.name;
  radarChart.update('active');
}

// UI Update functions
function updateFormValues() {
  document.getElementById('playerName').value = currentPlayerData.name;
  document.getElementById('playerAge').value = currentPlayerData.age;

  // Update sliders and their display values
  Object.keys(currentPlayerData.stats).forEach((statName, index) => {
    const value = currentPlayerData.stats[statName];
    const sliderIds = [
      'primerSaque', 'puntosPrimerSaque', 'puntosResto', 'winners',
      'velocidad', 'concentracion', 'resistencia', 'adaptabilidad'
    ];
    
    const slider = document.getElementById(sliderIds[index]);
    if (slider) {
      slider.value = value;
      updateSliderDisplay(slider);
    }
  });
}

function updateSliderDisplay(slider) {
  const container = slider.parentElement;
  const valueSpan = container.querySelector('.stat-value');
  const statName = Object.keys(currentPlayerData.stats)[getSliderIndex(slider.id)];
  
  if (valueSpan && statName) {
    valueSpan.textContent = formatStatDisplay(statName, parseInt(slider.value));
  }
}

function getSliderIndex(sliderId) {
  const sliderIds = [
    'primerSaque', 'puntosPrimerSaque', 'puntosResto', 'winners',
    'velocidad', 'concentracion', 'resistencia', 'adaptabilidad'
  ];
  return sliderIds.indexOf(sliderId);
}

function updateStatsDisplay() {
  const statIds = [
    'stat-primer-saque', 'stat-puntos-primer-saque', 'stat-puntos-resto', 'stat-winners',
    'stat-velocidad', 'stat-concentracion', 'stat-resistencia', 'stat-adaptabilidad'
  ];
  
  const levelIds = [
    'level-primer-saque', 'level-puntos-primer-saque', 'level-puntos-resto', 'level-winners',
    'level-velocidad', 'level-concentracion', 'level-resistencia', 'level-adaptabilidad'
  ];

  Object.values(currentPlayerData.stats).forEach((value, index) => {
    const statName = Object.keys(currentPlayerData.stats)[index];
    const statElement = document.getElementById(statIds[index]);
    const levelElement = document.getElementById(levelIds[index]);
    
    if (statElement) {
      statElement.textContent = formatStatDisplay(statName, value);
    }
    
    if (levelElement) {
      const normalizedValue = normalizeStatValue(statName, value);
      const performance = getPerformanceLevel(normalizedValue);
      
      levelElement.textContent = performance.level;
      levelElement.className = `status ${performance.class}`;
    }
  });

  // Update overall score
  const overallScore = calculateOverallScore(currentPlayerData.stats);
  const overallElement = document.getElementById('overallScore');
  if (overallElement) {
    overallElement.textContent = `Puntuación General: ${overallScore}/100`;
    const performance = getPerformanceLevel(overallScore);
    overallElement.className = `status ${performance.class}`;
  }
}

function updatePlayerInfo() {
  const titleElement = document.getElementById('chartTitle');
  const infoElement = document.getElementById('playerInfo');
  
  if (titleElement) {
    titleElement.textContent = `Gráfico Radar - ${currentPlayerData.name}`;
  }
  
  if (infoElement) {
    infoElement.textContent = `Edad: ${currentPlayerData.age} años`;
  }
}

function updateCurrentPlayerFromForm() {
  const playerName = document.getElementById('playerName').value || 'Jugador Sin Nombre';
  const playerAge = parseInt(document.getElementById('playerAge').value) || 14;
  
  currentPlayerData.name = playerName;
  currentPlayerData.age = playerAge;

  const sliderIds = [
    'primerSaque', 'puntosPrimerSaque', 'puntosResto', 'winners',
    'velocidad', 'concentracion', 'resistencia', 'adaptabilidad'
  ];
  
  const statNames = Object.keys(currentPlayerData.stats);
  
  sliderIds.forEach((sliderId, index) => {
    const slider = document.getElementById(sliderId);
    if (slider && statNames[index]) {
      currentPlayerData.stats[statNames[index]] = parseInt(slider.value);
    }
  });
}

function loadExamplePlayer(playerIndex) {
  if (playerIndex >= 0 && playerIndex < applicationData.example_players.length) {
    const examplePlayer = applicationData.example_players[playerIndex];
    currentPlayerData = {
      name: examplePlayer.name,
      age: examplePlayer.age,
      stats: { ...examplePlayer.stats }
    };
    
    updateFormValues();
    updateAllDisplays();
  }
}

function updateAllDisplays() {
  updatePlayerInfo();
  updateStatsDisplay();
  updateRadarChart();
}

function exportChart() {
  if (radarChart) {
    const canvas = document.getElementById('radarChart');
    const link = document.createElement('a');
    link.download = `${currentPlayerData.name}_radar_chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Event Listeners
function setupEventListeners() {
  // Slider change events
  const sliders = document.querySelectorAll('.stat-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      updateSliderDisplay(this);
      updateCurrentPlayerFromForm();
      updateStatsDisplay();
    });
    
    slider.addEventListener('change', function() {
      updateRadarChart();
    });
  });

  // Player name and age change events
  const playerName = document.getElementById('playerName');
  const playerAge = document.getElementById('playerAge');
  
  [playerName, playerAge].forEach(input => {
    if (input) {
      input.addEventListener('input', function() {
        updateCurrentPlayerFromForm();
        updatePlayerInfo();
      });
    }
  });

  // Update chart button
  const updateButton = document.getElementById('updateChart');
  if (updateButton) {
    updateButton.addEventListener('click', function() {
      updateCurrentPlayerFromForm();
      updateAllDisplays();
      
      // Visual feedback
      const chartContainer = document.querySelector('.chart-container');
      chartContainer.classList.add('chart-updating');
      setTimeout(() => {
        chartContainer.classList.remove('chart-updating');
      }, 1000);
    });
  }

  // Export chart button
  const exportButton = document.getElementById('exportChart');
  if (exportButton) {
    exportButton.addEventListener('click', exportChart);
  }

  // Example player buttons
  const exampleButtons = document.querySelectorAll('[data-player]');
  exampleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const playerIndex = parseInt(this.getAttribute('data-player'));
      loadExamplePlayer(playerIndex);
      
      // Visual feedback
      exampleButtons.forEach(btn => btn.classList.remove('btn--primary'));
      this.classList.remove('btn--secondary');
      this.classList.add('btn--primary');
      
      setTimeout(() => {
        this.classList.remove('btn--primary');
        this.classList.add('btn--secondary');
      }, 1000);
    });
  });
}

// Initialization
function initializeApp() {
  // Setup event listeners
  setupEventListeners();
  
  // Initialize form values
  updateFormValues();
  
  // Initialize displays
  updateAllDisplays();
  
  // Create the radar chart
  createRadarChart();
  
  console.log('🎾 Tennis Statistics App initialized successfully!');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}