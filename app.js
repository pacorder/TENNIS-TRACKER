// Configuración fija de la aplicación
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4FImgcSvk5VDvhSuylGrpnJlHyi0g1FY9a9zp0YPWBaGPcQO2enI1T4G1p5R07e9qBQ/exec";

// Datos de ejemplo
const EXAMPLE_PLAYERS = {
    "Ana García": {
        name: "Ana García",
        age: 13,
        level: "Principiante",
        stats: {
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
    "Carlos Ruiz": {
        name: "Carlos Ruiz",
        age: 15,
        level: "Intermedio",
        stats: {
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
    "Sofia Martinez": {
        name: "Sofia Martinez",
        age: 16,
        level: "Avanzado",
        stats: {
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
};

// Variables globales
let radarChart;
let historyData = [];
let autoSaveEnabled = false;
let autoSaveTimeout;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Asegurar que el loading overlay esté oculto al cargar
    hideLoadingOverlay();
    
    initializeChart();
    setupEventListeners();
    loadDefaultData();
    updateAllDisplays();
});

// Mostrar loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// Ocultar loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Configuración del gráfico radar
function initializeChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'Primer Saque',
                'Puntos 1er Saque',
                'Puntos Resto',
                'Winners',
                'Velocidad',
                'Concentración',
                'Resistencia',
                'Adaptabilidad'
            ],
            datasets: [{
                label: 'Rendimiento',
                data: [65, 70, 40, 60, 48, 60, 70, 70],
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderColor: '#2196F3',
                borderWidth: 2,
                pointBackgroundColor: '#2196F3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        display: true,
                        backdropColor: 'transparent'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Configuración de event listeners
function setupEventListeners() {
    // Sincronización entre sliders y inputs numéricos
    const statControls = [
        { slider: 'primerSaque', number: 'primerSaqueNum' },
        { slider: 'puntosPrimerSaque', number: 'puntosPrimerSaqueNum' },
        { slider: 'puntosResto', number: 'puntosRestoNum' },
        { slider: 'winners', number: 'winnersNum' },
        { slider: 'velocidad', number: 'velocidadNum' },
        { slider: 'concentracion', number: 'concentracionNum' },
        { slider: 'resistencia', number: 'resistenciaNum' },
        { slider: 'adaptabilidad', number: 'adaptabilidadNum' }
    ];

    statControls.forEach(control => {
        const slider = document.getElementById(control.slider);
        const numberInput = document.getElementById(control.number);

        if (slider && numberInput) {
            slider.addEventListener('input', function() {
                numberInput.value = this.value;
                updateAllDisplays();
                handleAutoSave();
            });

            numberInput.addEventListener('input', function() {
                slider.value = this.value;
                updateAllDisplays();
                handleAutoSave();
            });
        }
    });

    // Botón guardar en Sheets
    const saveButton = document.getElementById('saveToSheets');
    if (saveButton) {
        saveButton.addEventListener('click', () => saveToGoogleSheets());
    }

    // Toggle auto-guardado
    const autoSaveToggle = document.getElementById('autoSave');
    if (autoSaveToggle) {
        autoSaveToggle.addEventListener('change', function() {
            autoSaveEnabled = this.checked;
            showToast(
                autoSaveEnabled ? 'Auto-guardado activado' : 'Auto-guardado desactivado',
                'info'
            );
        });
    }

    // Campos de información del jugador
    ['playerName', 'playerAge', 'playerLevel'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', handleAutoSave);
        }
    });
}

// Cargar datos por defecto
function loadDefaultData() {
    const defaultStats = {
        "Primer Saque (%)": 65,
        "Puntos Ganados Primer Saque (%)": 70,
        "Puntos Ganados Resto (%)": 40,
        "Winners por Partido": 15,
        "Velocidad (km/h)": 12,
        "Concentración (1-10)": 6,
        "Resistencia (1-10)": 7,
        "Adaptabilidad (1-10)": 7
    };

    setStatsValues(defaultStats);
}

// Cargar jugador de ejemplo
function loadExamplePlayer(playerName) {
    const player = EXAMPLE_PLAYERS[playerName];
    if (!player) return;

    // Cargar información del jugador
    const nameField = document.getElementById('playerName');
    const ageField = document.getElementById('playerAge');
    const levelField = document.getElementById('playerLevel');
    
    if (nameField) nameField.value = player.name;
    if (ageField) ageField.value = player.age;
    if (levelField) levelField.value = player.level;

    // Cargar estadísticas
    setStatsValues(player.stats);
    updateAllDisplays();

    showToast(`Perfil de ${playerName} cargado`, 'success');
}

// Establecer valores de estadísticas
function setStatsValues(stats) {
    const updates = [
        { id: 'primerSaque', value: stats["Primer Saque (%)"] },
        { id: 'primerSaqueNum', value: stats["Primer Saque (%)"] },
        { id: 'puntosPrimerSaque', value: stats["Puntos Ganados Primer Saque (%)"] },
        { id: 'puntosPrimerSaqueNum', value: stats["Puntos Ganados Primer Saque (%)"] },
        { id: 'puntosResto', value: stats["Puntos Ganados Resto (%)"] },
        { id: 'puntosRestoNum', value: stats["Puntos Ganados Resto (%)"] },
        { id: 'winners', value: stats["Winners por Partido"] },
        { id: 'winnersNum', value: stats["Winners por Partido"] },
        { id: 'velocidad', value: stats["Velocidad (km/h)"] },
        { id: 'velocidadNum', value: stats["Velocidad (km/h)"] },
        { id: 'concentracion', value: stats["Concentración (1-10)"] },
        { id: 'concentracionNum', value: stats["Concentración (1-10)"] },
        { id: 'resistencia', value: stats["Resistencia (1-10)"] },
        { id: 'resistenciaNum', value: stats["Resistencia (1-10)"] },
        { id: 'adaptabilidad', value: stats["Adaptabilidad (1-10)"] },
        { id: 'adaptabilidadNum', value: stats["Adaptabilidad (1-10)"] }
    ];

    updates.forEach(update => {
        const element = document.getElementById(update.id);
        if (element) {
            element.value = update.value;
        }
    });
}

// Obtener estadísticas actuales
function getCurrentStats() {
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || 0 : 0;
    };

    return {
        primerSaque: getValue('primerSaque'),
        puntosPrimerSaque: getValue('puntosPrimerSaque'),
        puntosResto: getValue('puntosResto'),
        winners: getValue('winners'),
        velocidad: getValue('velocidad'),
        concentracion: getValue('concentracion'),
        resistencia: getValue('resistencia'),
        adaptabilidad: getValue('adaptabilidad')
    };
}

// Normalizar estadísticas para el gráfico radar (escala 0-100)
function normalizeStatsForRadar(stats) {
    return [
        stats.primerSaque, // Ya está en %
        stats.puntosPrimerSaque, // Ya está en %
        stats.puntosResto, // Ya está en %
        Math.min((stats.winners / 50) * 100, 100), // Normalizar winners (máx 50)
        Math.min((stats.velocidad / 25) * 100, 100), // Normalizar velocidad (máx 25 km/h)
        (stats.concentracion / 10) * 100, // Normalizar concentración (1-10)
        (stats.resistencia / 10) * 100, // Normalizar resistencia (1-10)
        (stats.adaptabilidad / 10) * 100 // Normalizar adaptabilidad (1-10)
    ];
}

// Actualizar todas las visualizaciones
function updateAllDisplays() {
    const stats = getCurrentStats();
    const normalizedStats = normalizeStatsForRadar(stats);
    
    // Actualizar gráfico radar
    if (radarChart) {
        radarChart.data.datasets[0].data = normalizedStats;
        radarChart.update('none');
    }
    
    // Actualizar estadísticas numéricas
    updateStatsPanel(stats);
    
    // Actualizar puntuación general
    updateOverallScore(normalizedStats);
}

// Actualizar panel de estadísticas
function updateStatsPanel(stats) {
    const updates = [
        { id: 'statPrimerSaque', value: `${stats.primerSaque}%`, rating: getRating(stats.primerSaque, 'percentage') },
        { id: 'statPuntosPrimerSaque', value: `${stats.puntosPrimerSaque}%`, rating: getRating(stats.puntosPrimerSaque, 'percentage') },
        { id: 'statPuntosResto', value: `${stats.puntosResto}%`, rating: getRating(stats.puntosResto, 'percentage') },
        { id: 'statWinners', value: `${stats.winners}`, rating: getRating(stats.winners, 'winners') },
        { id: 'statVelocidad', value: `${stats.velocidad} km/h`, rating: getRating(stats.velocidad, 'velocidad') },
        { id: 'statConcentracion', value: `${stats.concentracion}/10`, rating: getRating(stats.concentracion, 'scale10') },
        { id: 'statResistencia', value: `${stats.resistencia}/10`, rating: getRating(stats.resistencia, 'scale10') },
        { id: 'statAdaptabilidad', value: `${stats.adaptabilidad}/10`, rating: getRating(stats.adaptabilidad, 'scale10') }
    ];

    updates.forEach(update => {
        const valueElement = document.getElementById(update.id);
        if (valueElement) {
            valueElement.textContent = update.value;
        }
        
        const ratingElement = document.getElementById(update.id.replace('stat', 'rating'));
        if (ratingElement) {
            ratingElement.textContent = update.rating.text;
            ratingElement.className = `stat-rating ${update.rating.class}`;
        }
    });
}

// Obtener calificación de una estadística
function getRating(value, type) {
    let thresholds;
    
    switch(type) {
        case 'percentage':
            thresholds = { excellent: 80, good: 60, average: 40 };
            break;
        case 'winners':
            thresholds = { excellent: 25, good: 15, average: 8 };
            break;
        case 'velocidad':
            thresholds = { excellent: 20, good: 15, average: 10 };
            break;
        case 'scale10':
            thresholds = { excellent: 8, good: 6, average: 4 };
            break;
        default:
            thresholds = { excellent: 80, good: 60, average: 40 };
    }

    if (value >= thresholds.excellent) {
        return { text: 'Excelente', class: 'excellent' };
    } else if (value >= thresholds.good) {
        return { text: 'Bueno', class: 'good' };
    } else if (value >= thresholds.average) {
        return { text: 'Regular', class: 'average' };
    } else {
        return { text: 'Mejorable', class: 'poor' };
    }
}

// Actualizar puntuación general
function updateOverallScore(normalizedStats) {
    const average = normalizedStats.reduce((sum, stat) => sum + stat, 0) / normalizedStats.length;
    const roundedScore = Math.round(average * 10) / 10;
    
    const scoreElement = document.getElementById('overallScore');
    const progressElement = document.getElementById('scoreProgress');
    
    if (scoreElement) {
        scoreElement.textContent = roundedScore;
    }
    if (progressElement) {
        progressElement.style.width = `${average}%`;
    }
}

// Manejar auto-guardado
function handleAutoSave() {
    if (!autoSaveEnabled) return;
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveToGoogleSheets(true);
    }, 3000); // Auto-guardar después de 3 segundos de inactividad
}

// Guardar en Google Sheets
async function saveToGoogleSheets(isAutoSave = false) {
    const playerName = document.getElementById('playerName')?.value || 'Jugador Anónimo';
    const playerAge = document.getElementById('playerAge')?.value || '';
    const playerLevel = document.getElementById('playerLevel')?.value || '';
    const stats = getCurrentStats();
    
    // Mostrar loading overlay solo si no es auto-guardado
    if (!isAutoSave) {
        showLoadingOverlay();
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        playerName,
        playerAge,
        playerLevel,
        ...stats
    };
    
    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showToast(
                isAutoSave ? 'Guardado automáticamente' : 'Datos guardados exitosamente',
                'success'
            );
            addToHistory(data);
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error al guardar:', error);
        showToast(
            `Error al guardar: ${error.message}`,
            'error'
        );
    } finally {
        // Ocultar loading overlay
        if (!isAutoSave) {
            hideLoadingOverlay();
        }
    }
}

// Agregar al historial
function addToHistory(data) {
    historyData.unshift(data);
    if (historyData.length > 5) {
        historyData = historyData.slice(0, 5);
    }
    updateHistoryDisplay();
}

// Actualizar visualización del historial
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (historyData.length === 0) {
        historyList.innerHTML = '<p class="text-muted">No hay entradas guardadas aún</p>';
        return;
    }
    
    historyList.innerHTML = historyData.map(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="history-item">
                <div style="font-weight: 500; margin-bottom: 4px;">
                    ${entry.playerName} - ${entry.playerLevel || 'Sin nivel'}
                </div>
                <div style="font-size: 11px; color: var(--color-text-secondary);">
                    ${formattedDate}
                </div>
            </div>
        `;
    }).join('');
}

// Sistema de notificaciones toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'info' ? 'ℹ️' : '⚠️';
    
    toast.innerHTML = `
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Eliminar toast después de 4 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Hacer funciones disponibles globalmente para los botones HTML
window.loadExamplePlayer = loadExamplePlayer;