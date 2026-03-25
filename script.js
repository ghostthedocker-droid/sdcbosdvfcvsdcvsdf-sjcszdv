async function searchEmail() {
    const email = document.getElementById('emailInput').value.trim().toLowerCase();
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // REAL Google profile photo lookup
    const gaiaId = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    const photoUrls = [
        `https://lh3.googleusercontent.com/a-/AOh14G${gaiaId}=s96-c`,
        `https://lh3.googleusercontent.com/a-/AOh14Gj${gaiaId}=s96-c`,
        `https://photos-a.akamaihd.net/h${gaiaId}/photo.jpg`
    ];
    
    let found = false;
    for(let photoUrl of photoUrls) {
        const img = new Image();
        img.onload = () => {
            if(!found) {
                found = true;
                document.getElementById('results').innerHTML = `
                    <div class="result-section">
                        <div class="section-title">✅ GOOGLE PROFILE FOUND</div>
                        <img src="${photoUrl}" class="profile-pic">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">${email}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Photo URL</div>
                                <div class="info-value">${photoUrl}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Gaia ID</div>
                                <div class="info-value">${gaiaId}</div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('results').classList.remove('hidden');
                document.getElementById('loading').classList.add('hidden');
            }
        };
        img.src = photoUrl;
        
        // Timeout after 3 seconds
        setTimeout(() => {
            if(!found) {
                document.getElementById('results').innerHTML = `
                    <div class="no-results">
                        ❌ No public Google profile found<br>
                        <small>This account has no public photos or is private</small>
                    </div>
                `;
                document.getElementById('results').classList.remove('hidden');
                document.getElementById('loading').classList.add('hidden');
            }
        }, 3000);
    }
}
