// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form submitted successfully!');
    e.target.reset();
});

// Search Functionality
document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    if (!query) {
        document.getElementById('search-results').innerHTML = '<p class="text-danger">Please enter a search term.</p>';
        return;
    }
    console.log('Search query:', query); // Debug: Log the query
    fetchRecommendations(query);
});

// Clear Button
document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    clearInterval(window.timeUpdateInterval); // Stop time updates when clearing results
});

// Fetch Recommendations
function fetchRecommendations(query) {
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data); // Debug: Log the JSON data
            let results = [];
            const lowerQuery = query.toLowerCase();

            // Category-based searches
            if (lowerQuery.includes('beach')) {
                results = data.beaches;
                console.log('Beach search results:', results);
            } else if (lowerQuery.includes('temple')) {
                results = data.temples;
                console.log('Temple search results:', results);
            }
            // Country-based searches
            else if (data.countries.some(country => country.name.toLowerCase().includes(lowerQuery))) {
                results = data.countries.find(country => country.name.toLowerCase().includes(lowerQuery)).cities;
                console.log('Country search results:', results);
            }
            // Specific destination search
            else {
                // Search beaches
                const beachMatch = data.beaches.find(beach => beach.name.toLowerCase().includes(lowerQuery));
                if (beachMatch) {
                    results = [beachMatch];
                    console.log('Beach match:', beachMatch);
                }
                // Search temples
                const templeMatch = data.temples.find(temple => temple.name.toLowerCase().includes(lowerQuery));
                if (templeMatch) {
                    results = [templeMatch];
                    console.log('Temple match:', templeMatch);
                }
                // Search cities
                const cityMatch = data.countries
                    .flatMap(country => country.cities)
                    .find(city => city.name.toLowerCase().includes(lowerQuery));
                if (cityMatch) {
                    results = [cityMatch];
                    console.log('City match:', cityMatch);
                }
            }

            console.log('Final results:', results); // Debug: Log the final results
            displayResults(results);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('search-results').innerHTML = '<p class="text-danger">Error loading recommendations: ' + error.message + '</p>';
        });
}

// Function to get current time in a given timezone
function getLocalTime(timeZone) {
    const options = { timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date().toLocaleTimeString('en-US', options);
}

// Display Results with Time
function displayResults(results) {
    const resultsDiv = document.getElementById('search-results');
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = '<p>No recommendations found.</p>';
        clearInterval(window.timeUpdateInterval); // Stop any existing time updates
        return;
    }
    resultsDiv.innerHTML = '<h3>Recommendations</h3>';
    const row = document.createElement('div');
    row.className = 'row';
    results.forEach((item, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        const timeId = `time-${index}`; // Unique ID for each time display
        col.innerHTML = `
            <div class="card">
                <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    ${item.timeZone ? `<p class="card-text">Local Time: <span id="${timeId}">${getLocalTime(item.timeZone)}</span></p>` : ''}
                </div>
            </div>
        `;
        row.appendChild(col);
    });
    resultsDiv.appendChild(row);

    // Update time every second
    clearInterval(window.timeUpdateInterval); // Clear any previous interval
    window.timeUpdateInterval = setInterval(() => {
        results.forEach((item, index) => {
            if (item.timeZone) {
                const timeElement = document.getElementById(`time-${index}`);
                if (timeElement) {
                    timeElement.textContent = getLocalTime(item.timeZone);
                }
            }
        });
    }, 1000);
}