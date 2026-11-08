
const API_URL = '/api';

// Store records loaded from MongoDB
const records = {
    businesses: [],
    applications: [],
    inspections: [],
    violations: [],
    users: []
};

const endpoints = {
    businesses: 'businesses',
    applications: 'license-applications',
    inspections: 'inspections',
    violations: 'violations',
    users: 'users'
};

const tableBodies = {
    businesses: 'businessTableBody',
    applications: 'applicationTableBody',
    inspections: 'inspectionTableBody',
    violations: 'violationTableBody',
    users: 'userTableBody'
};


// Safely display database values
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}


// API request helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed.');
    }

    return data;
}


// Fetch data from backend
async function fetchData(endpoint) {
    return apiRequest(endpoint);
}


// Helpers
function getId(record) {
    return String(record?._id || '');
}

function getBusinessName(id) {
    const business = records.businesses.find(item => getId(item) === String(id));
    return business?.name || 'Unknown business';
}

function getUserName(id) {
    const user = records.users.find(item => getId(item) === String(id));
    return user?.name || 'Unknown user';
}

function formatDate(value) {
    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString();
}

function dateInputValue(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
}

function statusBadge(value) {
    const status = String(value || 'N/A');
    const cssClass = status.toLowerCase().replace(/[^a-z0-9-]/g, '');

    return `<span class="status status-${cssClass}">${escapeHTML(status)}</span>`;
}

function emptyRow(columns, message = 'No records found.') {
    return `<tr><td colspan="${columns}" class="empty-message">${escapeHTML(message)}</td></tr>`;
}


// Load all database collections
async function loadAllData() {
    try {
        const [
            businesses,
            applications,
            inspections,
            violations,
            users
        ] = await Promise.all([
            fetchData('businesses'),
            fetchData('license-applications'),
            fetchData('inspections'),
            fetchData('violations'),
            fetchData('users')
        ]);

        records.businesses = businesses;
        records.applications = applications;
        records.inspections = inspections;
        records.violations = violations;
        records.users = users;

        loadDashboard();
        renderAllTables();

    } catch (error) {
        console.error('Data loading error:', error);
        alert(`Unable to load records: ${error.message}`);
    }
}


// Dashboard statistics
function loadDashboard() {
    document.getElementById('businessCount').textContent =
        records.businesses.length;

    document.getElementById('applicationCount').textContent =
        records.applications.length;

    document.getElementById('inspectionCount').textContent =
        records.inspections.length;

    document.getElementById('violationCount').textContent =
        records.violations.length;

    displayBusinesses(records.businesses);
}


// Dashboard business cards
function displayBusinesses(businesses) {
    const container = document.getElementById('businessList');

    if (!businesses.length) {
        container.innerHTML = '<p class="empty-message">No businesses found.</p>';
        return;
    }

    container.innerHTML = businesses.slice(0, 5).map(business => `
        <div class="business-card">
            <h3>${escapeHTML(business.name)}</h3>
            <p>Category: ${escapeHTML(business.category)}</p>
            <p>City: ${escapeHTML(business.address?.city || 'N/A')}</p>
            ${statusBadge(business.status)}
        </div>
    `).join('');
}


// Render all management tables
function renderAllTables() {
    renderBusinessTable();
    renderApplicationTable();
    renderInspectionTable();
    renderViolationTable();
    renderUserTable();
}


// Businesses table
function renderBusinessTable() {
    const body = document.getElementById('businessTableBody');

    body.innerHTML = records.businesses.length
        ? records.businesses.map(business => `
            <tr>
                <td>${escapeHTML(business.name)}</td>
                <td>${escapeHTML(business.category)}</td>
                <td>${escapeHTML(business.address?.city || 'N/A')}</td>
                <td>${statusBadge(business.status)}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="edit" data-type="businesses"
                        data-id="${escapeHTML(getId(business))}">Edit</button>
                    <button class="action-button delete-button"
                        data-action="delete" data-type="businesses"
                        data-id="${escapeHTML(getId(business))}">Delete</button>
                </td>
            </tr>
        `).join('')
        : emptyRow(5);
}


// Applications table
function renderApplicationTable() {
    const body = document.getElementById('applicationTableBody');

    body.innerHTML = records.applications.length
        ? records.applications.map(application => `
            <tr>
                <td>${escapeHTML(getBusinessName(application.businessId))}</td>
                <td>${escapeHTML(formatDate(application.applicationDate))}</td>
                <td>${statusBadge(application.status)}</td>
                <td>${escapeHTML(application.reviewedBy
            ? getUserName(application.reviewedBy)
            : 'Not reviewed')}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="edit" data-type="applications"
                        data-id="${escapeHTML(getId(application))}">Edit</button>
                    <button class="action-button delete-button"
                        data-action="delete" data-type="applications"
                        data-id="${escapeHTML(getId(application))}">Delete</button>
                </td>
            </tr>
        `).join('')
        : emptyRow(5);
}


// Inspections table
function renderInspectionTable() {
    const body = document.getElementById('inspectionTableBody');

    body.innerHTML = records.inspections.length
        ? records.inspections.map(inspection => `
            <tr>
                <td>${escapeHTML(getBusinessName(inspection.businessId))}</td>
                <td>${escapeHTML(getUserName(inspection.inspectorId))}</td>
                <td>${escapeHTML(formatDate(inspection.inspectionDate))}</td>
                <td>${escapeHTML(inspection.score)} / 100</td>
                <td>${statusBadge(inspection.result)}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="edit" data-type="inspections"
                        data-id="${escapeHTML(getId(inspection))}">Edit</button>
                    <button class="action-button delete-button"
                        data-action="delete" data-type="inspections"
                        data-id="${escapeHTML(getId(inspection))}">Delete</button>
                </td>
            </tr>
        `).join('')
        : emptyRow(6);
}


// Violations table
function renderViolationTable() {
    const body = document.getElementById('violationTableBody');

    body.innerHTML = records.violations.length
        ? records.violations.map(violation => `
            <tr>
                <td>${escapeHTML(getBusinessName(violation.businessId))}</td>
                <td>${escapeHTML(
            records.inspections.find(item =>
                getId(item) === String(violation.inspectionId)
            )?.inspectionDate
                ? formatDate(records.inspections.find(item =>
                    getId(item) === String(violation.inspectionId)
                ).inspectionDate)
                : 'N/A'
        )}</td>
                <td>${escapeHTML(violation.type)}</td>
                <td>${statusBadge(violation.severity)}</td>
                <td>${statusBadge(violation.status)}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="edit" data-type="violations"
                        data-id="${escapeHTML(getId(violation))}">Edit</button>
                    <button class="action-button delete-button"
                        data-action="delete" data-type="violations"
                        data-id="${escapeHTML(getId(violation))}">Delete</button>
                </td>
            </tr>
        `).join('')
        : emptyRow(6);
}


// Users table
function renderUserTable() {
    const body = document.getElementById('userTableBody');

    body.innerHTML = records.users.length
        ? records.users.map(user => `
            <tr>
                <td>${escapeHTML(user.name)}</td>
                <td>${escapeHTML(user.email)}</td>
                <td>${statusBadge(user.role)}</td>
                <td>${escapeHTML(user.phone || 'N/A')}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="edit" data-type="users"
                        data-id="${escapeHTML(getId(user))}">Edit</button>
                    <button class="action-button delete-button"
                        data-action="delete" data-type="users"
                        data-id="${escapeHTML(getId(user))}">Delete</button>
                </td>
            </tr>
        `).join('')
        : emptyRow(5);
}


// Sidebar navigation
function showPage(pageId) {
    const page = document.getElementById(pageId);

    if (!page) return;

    document.querySelectorAll('.page').forEach(section => {
        section.classList.remove('active');
    });

    page.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        showPage(link.dataset.page);
    });
});

document.querySelectorAll('[data-page-link]').forEach(button => {
    button.addEventListener('click', () => {
        showPage(button.dataset.pageLink);
    });
});


// Business text search
async function searchBusinesses() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');

    if (!searchTerm) {
        resultsContainer.textContent =
            'Please enter a business name or category.';
        return;
    }

    resultsContainer.textContent = 'Searching...';

    try {
        const data = await apiRequest(
            `search/businesses?search=${encodeURIComponent(searchTerm)}`
        );

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML =
                '<p class="empty-message">No matching businesses found.</p>';
            return;
        }

        resultsContainer.innerHTML = data.results.map(business => `
            <div class="business-card">
                <h3>${escapeHTML(business.name)}</h3>
                <p>Category: ${escapeHTML(business.category)}</p>
                <p>City: ${escapeHTML(business.address?.city || 'N/A')}</p>
                <p>Search Score: ${escapeHTML(business.score)}</p>
                ${statusBadge(business.status)}
            </div>
        `).join('');

    } catch (error) {
        resultsContainer.textContent = error.message;
    }
}

document.getElementById('searchButton')
    .addEventListener('click', searchBusinesses);

document.getElementById('searchInput')
    .addEventListener('keydown', event => {
        if (event.key === 'Enter') searchBusinesses();
    });


// Analytics
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

        renderAnalytics(
            'categoryChart',
            categories,
            item => item._id,
            item => item.totalBusinesses
        );

        renderAnalytics(
            'applicationChart',
            applications,
            item => item._id,
            item => item.totalApplications
        );

        renderAnalytics(
            'inspectionChart',
            inspections,
            item => item.category,
            item => item.averageScore,
            value => `${Number(value).toFixed(2)} / 100`
        );

        renderAnalytics(
            'violationChart',
            violations,
            item => `${item._id.type} (${item._id.severity})`,
            item => item.totalViolations
        );

        renderAnalytics(
            'businessViolationChart',
            businessViolations,
            item => item.name,
            item => item.totalViolations
        );

    } catch (error) {
        console.error('Analytics loading error:', error);

        document.querySelectorAll('.analytics-card').forEach(card => {
            const chart = card.querySelector('div');
            if (chart) chart.textContent = 'Unable to load analytics data.';
        });
    }
}


function renderAnalytics(containerId, items, labelFunction, valueFunction, formatFunction) {
    const container = document.getElementById(containerId);

    if (!items || !items.length) {
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
            <div class="analytics-bar">
                <p>
                    <span>${escapeHTML(label)}</span>
                    <strong>${escapeHTML(displayValue)}</strong>
                </p>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// Form field definitions
function getFormFields(type) {
    const businessOptions = records.businesses.map(item => ({
        value: getId(item),
        label: item.name
    }));

    const businessOwnerOptions = records.users
        .filter(user => user.role === 'business_owner')
        .map(user => ({
            value: getId(user),
            label: user.name
        }));

    const inspectorOptions = records.users
        .filter(user => user.role === 'inspector')
        .map(user => ({
            value: getId(user),
            label: user.name
        }));

    const adminOptions = records.users
        .filter(user => user.role === 'admin')
        .map(user => ({
            value: getId(user),
            label: user.name
        }));

    const inspectionOptions = records.inspections.map(item => ({
        value: getId(item),
        label: `${getBusinessName(item.businessId)} - ${formatDate(item.inspectionDate)}`
    }));

    const fields = {
        businesses: [
            { name: 'name', label: 'Business Name', required: true },
            { name: 'category', label: 'Category', required: true },
            {
                name: 'ownerId',
                label: 'Business Owner',
                type: 'select',
                required: true,
                options: businessOwnerOptions
            },
            { name: 'area', label: 'Area', required: true },
            { name: 'city', label: 'City', required: true },
            { name: 'province', label: 'Province', required: true },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                required: true,
                options: ['active', 'pending', 'inactive']
            }
        ],

        applications: [
            {
                name: 'businessId',
                label: 'Business',
                type: 'select',
                required: true,
                options: businessOptions
            },
            {
                name: 'applicationDate',
                label: 'Application Date',
                type: 'date',
                required: true
            },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                required: true,
                options: ['pending', 'approved', 'rejected']
            },
            {
                name: 'reviewedBy',
                label: 'Reviewed By (Optional)',
                type: 'select',
                options: adminOptions,
                optional: true
            }
        ],

        inspections: [
            {
                name: 'businessId',
                label: 'Business',
                type: 'select',
                required: true,
                options: businessOptions
            },
            {
                name: 'inspectorId',
                label: 'Inspector',
                type: 'select',
                required: true,
                options: inspectorOptions
            },
            {
                name: 'inspectionDate',
                label: 'Inspection Date',
                type: 'date',
                required: true
            },
            {
                name: 'score',
                label: 'Inspection Score (0-100)',
                type: 'number',
                required: true,
                min: 0,
                max: 100
            },
            {
                name: 'result',
                label: 'Result',
                type: 'select',
                required: true,
                options: ['Passed', 'Failed']
            },
            {
                name: 'remarks',
                label: 'Remarks',
                type: 'textarea'
            }
        ],

        violations: [
            {
                name: 'businessId',
                label: 'Business',
                type: 'select',
                required: true,
                options: businessOptions
            },
            {
                name: 'inspectionId',
                label: 'Inspection',
                type: 'select',
                required: true,
                options: inspectionOptions
            },
            {
                name: 'type',
                label: 'Violation Type',
                required: true
            },
            {
                name: 'severity',
                label: 'Severity',
                type: 'select',
                required: true,
                options: ['Low', 'Medium', 'High']
            },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                required: true,
                options: ['Open', 'Resolved']
            }
        ],

        users: [
            { name: 'name', label: 'Full Name', required: true },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: true
            },
            {
                name: 'role',
                label: 'Role',
                type: 'select',
                required: true,
                options: ['admin', 'inspector', 'business_owner']
            },
            { name: 'phone', label: 'Phone Number' }
        ]
    };

    return fields[type] || [];
}


// Get current form values for editing
function getFormValues(type, record) {
    if (!record) return {};

    if (type === 'businesses') {
        return {
            name: record.name || '',
            category: record.category || '',
            ownerId: record.ownerId || '',
            area: record.address?.area || '',
            city: record.address?.city || '',
            province: record.address?.province || '',
            status: record.status || ''
        };
    }

    return {
        ...record,
        applicationDate: dateInputValue(record.applicationDate),
        inspectionDate: dateInputValue(record.inspectionDate)
    };
}


// Build form input HTML
function buildFormField(field, value) {
    const required = field.required ? 'required' : '';
    const safeValue = escapeHTML(value ?? '');

    if (field.type === 'select') {
        const options = field.options || [];

        return `
            <div class="form-group">
                <label for="${field.name}">${escapeHTML(field.label)}</label>
                <select id="${field.name}" name="${field.name}" ${required}>
                    <option value="">Select ${escapeHTML(field.label)}</option>
                    ${options.map(option => {
            const optionValue = typeof option === 'object'
                ? option.value
                : option;

            const optionLabel = typeof option === 'object'
                ? option.label
                : option;

            return `
                            <option value="${escapeHTML(optionValue)}"
                                ${String(optionValue) === String(value ?? '') ? 'selected' : ''}>
                                ${escapeHTML(optionLabel)}
                            </option>
                        `;
        }).join('')}
                </select>
            </div>
        `;
    }

    if (field.type === 'textarea') {
        return `
            <div class="form-group">
                <label for="${field.name}">${escapeHTML(field.label)}</label>
                <textarea id="${field.name}" name="${field.name}">${safeValue}</textarea>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label for="${field.name}">${escapeHTML(field.label)}</label>
            <input
                id="${field.name}"
                name="${field.name}"
                type="${field.type || 'text'}"
                value="${safeValue}"
                ${required}
                ${field.min !== undefined ? `min="${field.min}"` : ''}
                ${field.max !== undefined ? `max="${field.max}"` : ''}
            >
        </div>
    `;
}


// Open add/edit modal
function openForm(type, id = null) {
    const existingRecord = id
        ? records[type].find(item => getId(item) === String(id))
        : null;

    const fields = getFormFields(type);
    const values = getFormValues(type, existingRecord);

    const titles = {
        businesses: 'Business',
        applications: 'License Application',
        inspections: 'Inspection',
        violations: 'Violation',
        users: 'User'
    };

    const title = `${existingRecord ? 'Edit' : 'Add'} ${titles[type]}`;

    const container = document.getElementById('modalContainer');

    container.innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <h2>${escapeHTML(title)}</h2>

                <form id="recordForm" data-type="${type}" data-id="${escapeHTML(id || '')}">
                    ${fields.map(field =>
        buildFormField(field, values[field.name])
    ).join('')}

                    <p id="formError" class="error-message"></p>

                    <div class="form-actions">
                        <button type="button" class="cancel-button" id="cancelForm">
                            Cancel
                        </button>
                        <button type="submit" class="primary-button">
                            ${existingRecord ? 'Save Changes' : 'Add Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('cancelForm').addEventListener('click', closeForm);

    document.getElementById('modalOverlay').addEventListener('click', event => {
        if (event.target.id === 'modalOverlay') closeForm();
    });

    // Only show inspections belonging to the selected business
    if (type === 'violations') {
        const businessSelect = document.getElementById('businessId');
        const inspectionSelect = document.getElementById('inspectionId');

        function updateInspectionOptions() {
            const selectedBusinessId = businessSelect.value;
            const currentValue = inspectionSelect.value;

            const matchingInspections = records.inspections.filter(item =>
                String(item.businessId) === String(selectedBusinessId)
            );

            inspectionSelect.innerHTML = `
                <option value="">Select Inspection</option>
                ${matchingInspections.map(item => `
                    <option value="${escapeHTML(getId(item))}">
                        ${escapeHTML(formatDate(item.inspectionDate))}
                    </option>
                `).join('')}
            `;

            if (matchingInspections.some(item => getId(item) === currentValue)) {
                inspectionSelect.value = currentValue;
            }
        }

        businessSelect.addEventListener('change', updateInspectionOptions);
        updateInspectionOptions();

        if (existingRecord) {
            inspectionSelect.value = String(existingRecord.inspectionId || '');
        }
    }

    document.getElementById('recordForm')
        .addEventListener('submit', submitRecordForm);
}


// Close modal
function closeForm() {
    document.getElementById('modalContainer').innerHTML = '';
}


// Submit add/edit form
async function submitRecordForm(event) {
    event.preventDefault();

    const form = event.target;
    const type = form.dataset.type;
    const id = form.dataset.id;

    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            payload[key] = value.trim();
        }
    }

    if (type === 'businesses') {
        const existingBusiness = records.businesses.find(
            item => getId(item) === id
        );

        payload.address = {
            ...(existingBusiness?.address || {}),
            area: payload.area,
            city: payload.city,
            province: payload.province
        };

        delete payload.area;
        delete payload.city;
        delete payload.province;
    }

    if (type === 'inspections') {
        payload.score = Number(payload.score);
    }

    if (type === 'applications' && !payload.reviewedBy) {
        if (id) {
            payload.reviewedBy = null;
        } else {
            delete payload.reviewedBy;
        }
    }

    const errorContainer = document.getElementById('formError');
    const submitButton = form.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        const endpoint = `${endpoints[type]}${id ? `/${encodeURIComponent(id)}` : ''}`;

        await apiRequest(endpoint, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });

        closeForm();
        await loadAllData();

        if (document.getElementById('analytics').classList.contains('active')) {
            await loadAnalytics();
        }

        alert(`${type.slice(0, -1)} ${id ? 'updated' : 'added'} successfully!`);

    } catch (error) {
        errorContainer.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = id ? 'Save Changes' : 'Add Record';
    }
}


// Delete record
async function deleteRecord(type, id) {
    const confirmed = confirm(
        'Are you sure you want to delete this record? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
        await apiRequest(
            `${endpoints[type]}/${encodeURIComponent(id)}`,
            { method: 'DELETE' }
        );

        await loadAllData();

        alert('Record deleted successfully.');

    } catch (error) {
        alert(`Unable to delete record: ${error.message}`);
    }
}


// Handle Add buttons
document.querySelectorAll('[data-add]').forEach(button => {
    button.addEventListener('click', () => {
        openForm(button.dataset.add);
    });
});


// Handle Edit and Delete buttons
document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');

    if (!button) return;

    const type = button.dataset.type;
    const id = button.dataset.id;

    if (button.dataset.action === 'edit') {
        openForm(type, id);
    }

    if (button.dataset.action === 'delete') {
        deleteRecord(type, id);
    }
});


// Load everything when the portal opens
loadAllData();
loadAnalytics();
