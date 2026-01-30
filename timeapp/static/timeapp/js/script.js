// World Clocks JavaScript
// Handles automatic time updates and timezone selection

// Global timezones data
let timezonesData = {};

/**
 * Updates the local time display with the user's browser time
 */
function updateLocalTime() {
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formatted = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    const localTimeElement = document.getElementById('local-time');
    if (localTimeElement) {
        localTimeElement.textContent = formatted;
    }
}

/**
 * Updates UTC time display
 */
function updateUTCTime() {
    const now = new Date();
    
    const day = String(now.getUTCDate()).padStart(2, '0');
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    const formatted = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    const utcTimeElement = document.getElementById('utc-time');
    if (utcTimeElement) {
        utcTimeElement.textContent = formatted;
    }
}

/**
 * Updates time for a specific timezone
 * @param {string} timezone - IANA timezone identifier
 * @param {HTMLElement} element - DOM element to update
 */
function updateTimezone(timezone, element) {
    try {
        const now = new Date();
        
        const formatter = new Intl.DateTimeFormat('el-GR', {
            timeZone: timezone,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const formatted = formatter.format(now);
        element.textContent = formatted;
    } catch (error) {
        element.textContent = 'Λάθος timezone';
        console.error('Error updating timezone:', timezone, error);
    }
}

/**
 * Updates all city times in the table
 */
function updateAllCityTimes() {
    const cityRows = document.querySelectorAll('tr[data-timezone]');
    
    cityRows.forEach(row => {
        const timezone = row.getAttribute('data-timezone');
        const timeCell = row.querySelector('.time');
        
        if (timezone && timeCell) {
            updateTimezone(timezone, timeCell);
        }
    });
}

/**
 * Updates all times on the page
 */
function updateAllTimes() {
    updateLocalTime();
    updateUTCTime();
    updateAllCityTimes();
}

/**
 * Removes a city row from the table
 * @param {HTMLElement} button - The remove button clicked
 */
function removeCity(button) {
    const row = button.closest('tr');
    if (row) {
        row.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => row.remove(), 300);
    }
}

/**
 * Adds a new city to the table
 * @param {string} region - Region name
 * @param {string} city - City name
 * @param {string} timezone - Timezone identifier
 */
function addCity(region, city, timezone) {
    const tbody = document.getElementById('cities-tbody');
    
    // Check if city already exists
    const existingRows = tbody.querySelectorAll(`tr[data-timezone="${timezone}"]`);
    if (existingRows.length > 0) {
        alert('Αυτή η πόλη υπάρχει ήδη στη λίστα!');
        return;
    }
    
    // Create new row
    const row = document.createElement('tr');
    row.setAttribute('data-timezone', timezone);
    row.style.animation = 'slideIn 0.3s ease-out';
    
    row.innerHTML = `
        <td class="country">${region}</td>
        <td class="city">${city}</td>
        <td class="time">Φόρτωση...</td>
        <td>
            <button class="remove-btn" onclick="removeCity(this)">🗑️</button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Update time immediately
    const timeCell = row.querySelector('.time');
    updateTimezone(timezone, timeCell);
}

/**
 * Handles region selection change
 */
function onRegionChange() {
    const regionSelect = document.getElementById('region-select');
    const citySelect = document.getElementById('city-select');
    const addBtn = document.getElementById('add-city-btn');
    
    const selectedRegion = regionSelect.value;
    
    // Clear city select
    citySelect.innerHTML = '<option value="">Επιλέξτε πόλη...</option>';
    citySelect.disabled = !selectedRegion;
    addBtn.disabled = true;
    
    if (selectedRegion && timezonesData[selectedRegion]) {
        // Populate cities
        timezonesData[selectedRegion].forEach(tz => {
            const option = document.createElement('option');
            option.value = tz.timezone;
            option.textContent = tz.city;
            citySelect.appendChild(option);
        });
        
        citySelect.disabled = false;
    }
}

/**
 * Handles city selection change
 */
function onCityChange() {
    const citySelect = document.getElementById('city-select');
    const addBtn = document.getElementById('add-city-btn');
    
    addBtn.disabled = !citySelect.value;
}

/**
 * Handles add city button click
 */
function onAddCity() {
    const regionSelect = document.getElementById('region-select');
    const citySelect = document.getElementById('city-select');
    
    const region = regionSelect.value;
    const timezone = citySelect.value;
    const cityName = citySelect.options[citySelect.selectedIndex].text;
    
    if (region && timezone && cityName) {
        addCity(region, cityName, timezone);
        
        // Reset selects
        regionSelect.value = '';
        citySelect.value = '';
        citySelect.innerHTML = '<option value="">Επιλέξτε πρώτα περιοχή...</option>';
        citySelect.disabled = true;
        document.getElementById('add-city-btn').disabled = true;
    }
}

/**
 * Load timezones data from hidden script tag
 */
function loadTimezonesData() {
    const dataElement = document.getElementById('timezones-data');
    if (dataElement) {
        try {
            const jsonText = dataElement.textContent.trim();
            timezonesData = JSON.parse(jsonText);
        } catch (error) {
            console.error('Error parsing timezones data:', error);
        }
    }
}

/**
 * Initialize the application
 */
function init() {
    // Load timezones data
    loadTimezonesData();
    
    // Update all times immediately
    updateAllTimes();
    
    // Update all times every second
    setInterval(updateAllTimes, 1000);
    
    // Setup event listeners
    const regionSelect = document.getElementById('region-select');
    const citySelect = document.getElementById('city-select');
    const addBtn = document.getElementById('add-city-btn');
    
    if (regionSelect) {
        regionSelect.addEventListener('change', onRegionChange);
    }
    
    if (citySelect) {
        citySelect.addEventListener('change', onCityChange);
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', onAddCity);
    }
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
`;
document.head.appendChild(style);

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make removeCity available globally
window.removeCity = removeCity;
