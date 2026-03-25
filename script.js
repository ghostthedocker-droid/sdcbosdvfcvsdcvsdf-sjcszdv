// Pre-loaded GHunt-style data (in production, fetch from your API or GHunt datasets)
const ghuntData = {
    "target@gmail.com": {
        profile: {
            photo: "https://lh3.googleusercontent.com/a-/default.jpg",
            name: "Target User",
            givenName: "Target",
            familyName: "User"
        },
        photos: ["https://lh3.googleusercontent.com/photo1.jpg", "https://lh3.googleusercontent.com/photo2.jpg"],
        phones: ["+1-555-123-4567"],
        accounts: ["target@outlook.com", "target@yahoo.com"],
        locations: ["New York, NY", "San Francisco, CA"],
        devices: ["Pixel 8 Pro", "Chromebook"]
    },
    // Add more sample data or fetch dynamically
};

// Search function
async function searchEmail() {
    const email = document.getElementById('emailInput').value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // Simulate API delay + actual lookup
    setTimeout(() => {
        performGHuntLookup(email);
    }, 1500);
}

function performGHuntLookup(email) {
    document.getElementById('loading').classList.add('hidden');
    
    const results = document.getElementById('results');
    const data = ghuntData[email] || null;
    
    if (!data) {
        results.innerHTML = `
            <div class="no-results">
                ❌ No public Google data found for ${email}<br>
                <small>This email may not have public profile data or linked services</small>
            </div>
        `;
    } else {
        results.innerHTML = buildResultsHTML(data, email);
    }
    
    results.classList.remove('hidden');
}

function buildResultsHTML(data, email) {
    return `
        <div class="result-section">
            <div class="section-title">👤 Profile</div>
            <div style="display: flex; gap: 20px; align-items: center;">
                <img src="${data.profile.photo}" alt="Profile" class="profile-pic" onerror="this.src='https://via.placeholder.com/80/333/fff?text=?';">
                <div>
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${data.profile.name}</div>
                    <div style="margin-top: 10px;">
                        <span class="info-label">Email:</span> <span class="info-value">${email}</span>
                    </div>
                </div>
            </div>
        </div>
        
        ${data.photos.length ? `
        <div class="result-section">
            <div class="section-title">📸 Photos</div>
            <div class="info-grid">
                ${data.photos.map(photo => `
                    <div class="info-item">
                        <img src="${photo}" style="width:100%; height:120px; object-fit:cover; border-radius:8px;">
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${data.phones.length ? `
        <div class="result-section">
            <div class="section-title">📱 Phone Numbers</div>
            <div class="info-grid">
                ${data.phones.map(phone => `
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${phone}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${data.accounts.length ? `
        <div class="result-section">
            <div class="section-title">🔗 Linked Accounts</div>
            <div class="info-grid">
                ${data.accounts.map(account => `
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${account}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${data.locations.length ? `
        <div class="result-section">
            <div class="section-title">📍 Locations</div>
            <div class="info-grid">
                ${data.locations.map(loc => `
                    <div class="info-item">
                        <div class="info-label">Location</div>
                        <div class="info-value">${loc}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

// Enter key support
document.getElementById('emailInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchEmail();
});
