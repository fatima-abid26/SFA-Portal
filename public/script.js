
const API_URL = 'http://localhost:5000/api';


// Fetch data from backend
async function fetchData(endpoint) {
    const response = await fetch(`${API_URL}/${endpoint}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
    }

    return await response.json();
}


// Display dashboard statistics
async function loadDashboard() {
    try {
        const [businesses, applications, inspections, violations] =
            await Promise.all([
                fetchData('businesses'),
                fetchData('license-applications'),
                fetchData('inspections'),
                fetchData('violations')
            ]);

        document.getElementById('businessCount').textContent =
            businesses.length;

        document.getElementById('applicationCount').textContent =
            applications.length;

        document.getElementById('inspectionCount').textContent =
            inspections.length;

        document.getElementById('violationCount').textContent =
            violations.length;

        displayBusinesses(businesses);

    } catch (error) {
        console.error('Dashboard loading error:', error);

        document.getElementById('businessList').textContent =
            'Unable to load dashboard data. Please check the backend server.';
    }
}


// Display registered businesses
function displayBusinesses(businesses) {
    const businessList = document.getElementById('businessList');

    if (!businesses.length) {
        businessList.textContent = 'No businesses found.';
        return;
    }

    businessList.innerHTML = businesses.map(business => `
        <div class="business-card">
            <h3>${escapeHTML(business.name)}</h3>
            <p>Category: ${escapeHTML(business.category)}</p>
            <p>City: ${escapeHTML(business.address?.city || 'N/A')}</p>
            <span class="status">
                ${escapeHTML(business.status)}
            </span>
        </div>
    `).join('');
}


// Safely display text received from the database
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}


// Search businesses using MongoDB Text Search API
async function searchBusinesses() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        searchResults.textContent = 'Please enter a business name or category.';
        return;
    }

    searchResults.textContent = 'Searching...';

    try {
        const response = await fetch(
            `${API_URL}/search/businesses?search=${encodeURIComponent(searchTerm)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Search failed.');
        }

        if (data.results.length === 0) {
            searchResults.textContent = 'No matching businesses found.';
            return;
        }

        searchResults.innerHTML = data.results.map(business => `
            <div class="business-card">
                <h3>${escapeHTML(business.name)}</h3>
                <p>Category: ${escapeHTML(business.category)}</p>
                <p>City: ${escapeHTML(business.address?.city || 'N/A')}</p>
                <p>Search Score: ${escapeHTML(business.score)}</p>
                <span class="status">${escapeHTML(business.status)}</span>
            </div>
        `).join('');

    } catch (error) {
        searchResults.textContent = error.message;
    }
}


// Search button click event
document.getElementById('searchButton')
    .addEventListener('click', searchBusinesses);


// Load dashboard when page opens
loadDashboard();


// Display aggregation results on the dashboard
async function loadAnalytics() {
    try {
        const [
            categories,
            applications,
            inspections,
            violations,
            businessViolations
        ] = await Promise.all([
            fetchData('aggregations/businesses-by-category'),
            fetchData('aggregations/applications-by-status'),
            fetchData('aggregations/average-inspection-score'),
            fetchData('aggregations/violations-analysis'),
            fetchData('aggregations/businesses-most-violations')
        ]);

        // 1. Businesses by Category
        renderAnalytics(
            'categoryChart',
            categories,
            item => item._id,
            item => item.totalBusinesses
        );

        // 2. Applications by Status
        renderAnalytics(
            'applicationChart',
            applications,
            item => item._id,
            item => item.totalApplications
        );

        // 3. Average Inspection Scores
        renderAnalytics(
            'inspectionChart',
            inspections,
            item => item.category,
            item => item.averageScore,
            value => `${Number(value).toFixed(2)} / 100`
        );

        // 4. Violations Analysis
        renderAnalytics(
            'violationChart',
            violations,
            item => `${item._id.type} (${item._id.severity})`,
            item => item.totalViolations
        );

        // 5. Businesses with Most Violations
        renderAnalytics(
            'businessViolationChart',
            businessViolations,
            item => item.name,
            item => item.totalViolations
        );

    } catch (error) {
        console.error('Analytics loading error:', error);

        document.querySelectorAll('.analytics-card div').forEach(element => {
            element.textContent = 'Unable to load analytics data.';
        });
    }
}


// Reusable function to display analytics with bars
function renderAnalytics(containerId, items, labelFunction, valueFunction, formatFunction) {
    const container = document.getElementById(containerId);

    if (!items || items.length === 0) {
        container.textContent = 'No data available.';
        return;
    }

    const maxValue = Math.max(
        ...items.map(item => Number(valueFunction(item)) || 0),
        1
    );

    container.innerHTML = items.map(item => {
        const label = labelFunction(item);
        const value = Number(valueFunction(item)) || 0;
        const width = Math.max((value / maxValue) * 100, 0);

        const displayValue = formatFunction
            ? formatFunction(value)
            : value;

        return `
            <div>
                <p>
                    ${escapeHTML(label)}
                    <span class="analytics-value">
                        ${escapeHTML(displayValue)}
                    </span>
                </p>
                <div class="bar" style="width: ${width}%"></div>
            </div>
        `;
    }).join('');
}


// Load analytics when dashboard opens
loadAnalytics();
