class GHuntOnline {
    constructor() {
        this.results = {};
        this.init();
    }

    init() {
        document.getElementById('scanBtn').addEventListener('click', () => this.scan());
        document.getElementById('exportJson').addEventListener('click', () => this.exportResults());
        document.getElementById('copyResults').addEventListener('click', () => this.copyResults());
    }

    async scan() {
        const email = document.getElementById('emailInput').value.trim();
        if (!email || !email.includes('@gmail.com')) {
            this.showStatus('Please enter a valid Gmail address', 'error');
            return;
        }

        this.showLoading(true);
        this.results = { email, timestamp: new Date().toISOString(), modules: {} };

        try {
            // Parallel OSINT modules
            const [social, photos, breaches, recon] = await Promise.all([
                this.socialScan(email),
                this.photoScan(email),
                this.breachScan(email),
                this.reconScan(email)
            ]);

            this.results.modules = { social, photos, breaches, recon };
            this.displayResults();
            this.showStatus(`GHunt completed! Found ${this.getTotalFindings()} data points`, 'success');

        } catch (error) {
            this.showStatus('Scan failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async socialScan(email) {
        const profiles = [];
        
        // Facebook
        const fbData = await this.fetchOSINT(`https://www.facebook.com/search/top?q=${encodeURIComponent(email)}`);
        if (fbData.profiles?.length) profiles.push(...fbData.profiles.map(p => ({ platform: 'Facebook', url: p.url, name: p.name })));

        // LinkedIn
        const liData = await this.fetchOSINT(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(email)}`);
        if (liData.profiles?.length) profiles.push(...liData.profiles.map(p => ({ platform: 'LinkedIn', url: p.url, name: p.name })));

        // Twitter/X
        const twData = await this.fetchOSINT(`https://twitter.com/search?q=${encodeURIComponent(email)}&src=typed_query`);
        if (twData.users?.length) profiles.push(...twData.users.map(u => ({ platform: 'Twitter', url: u.url, name: u.name })));

        return { profiles, count: profiles.length };
    }

    async photoScan(email) {
        const photos = [];
        // Google Photos reverse lookup via multiple endpoints
        const photoEndpoints = [
            `https://picasaweb.google.com/search?q=${encodeURIComponent(email)}`,
            `https://photos.google.com/search/_tra_=photos%3A0?q=${encodeURIComponent(email)}`
        ];

        for (const endpoint of photoEndpoints) {
            const data = await this.fetchOSINT(endpoint);
            if (data.albums?.length) {
                photos.push(...data.albums.map(a => ({ url: a.url, title: a.title, thumbnail: a.thumbnail })));
            }
        }
        return { photos, count: photos.length };
    }

    async breachScan(email) {
        const breaches = [];
        // Multiple breach sources
        const breachSources = [
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(this.results.email)}`,
            `https://monitor.firefox.com/breaches/email/${encodeURIComponent(this.results.email)}`
        ];

        for (const source of breachSources) {
            try {
                const data = await fetch(source, { headers: { 'User-Agent': 'GHuntOnline/1.0' } });
                if (data.ok) {
                    const breachData = await data.json();
                    breaches.push(...breachData.map(b => ({ name: b.Name || b.name, date: b.BreachDate || b.date, domain: b.Domain })));
                }
            } catch (e) {}
        }
        return { breaches, count: breaches.length };
    }

    async reconScan(email) {
        const recon = [];
        
        // WHOIS/registrar lookup
        const domain = email.split('@')[1];
        const whois = await this.fetchOSINT(`https://who.is/whois/${domain}`);
        if (whois.registrar) recon.push({ type: 'Domain Registrar', value: whois.registrar, source: 'WHOIS' });

        // Reverse email lookup
        const reverse = await this.fetchOSINT(`https://emailrep.io/${encodeURIComponent(email)}`);
        if (reverse.reputation) recon.push({ type: 'Email Reputation', value: reverse.reputation, details: reverse.details, source: 'EmailRep' });

        // Google dorks
        const dorks = [
            `intext:"${email}"`,
            `from:${email}`,
            `"${email}" -inurl:(login | signin)`
        ];
        
        for (const dork of dorks) {
            const results = await this.fetchOSINT(`https://www.google.com/search?q=${encodeURIComponent(dork)}`);
            if (results.urls?.length) {
                recon.push({ type: 'Google Dork', query: dork, urls: results.urls.slice(0, 3), source: 'Google' });
                break;
            }
        }

        return { recon, count: recon.length };
    }

    async fetchOSINT(url) {
        try {
            // CORS proxy for browser compatibility
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (GHuntOnline OSINT)' }
            });
            return await response.json();
        } catch {
            return { profiles: [], albums: [], urls: [] };
        }
    }

    displayResults() {
        document.getElementById('results').style.display = 'block';
        
        // Summary stats
        const stats = document.getElementById('summaryStats');
        stats.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${this.results.modules.social?.count || 0}</div>
                <div>Social Profiles</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.results.modules.photos?.count || 0}</div>
                <div>Photo Albums</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.results.modules.breaches?.count || 0}</div>
                <div>Breaches</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.results.modules.recon?.count || 0}</div>
                <div>Recon Points</div>
            </div>
        `;

        // Social results
        this.renderList('socialList', this.results.modules.social?.profiles || [], 'No social profiles found');
        
        // Photo results
        this.renderList('photoList', this.results.modules.photos?.photos || [], 'No Google Photos found', true);
        
        // Breach results
        this.renderList('breachList', this.results.modules.breaches?.breaches || [], 'No breaches found');
        
        // Recon results
        this.renderList('reconList', this.results.modules.recon?.recon || [], 'No additional recon data');
    }

    renderList(containerId, items, emptyMsg, isPhotos = false) {
        const container = document.getElementById(containerId);
        if (items.length === 0) {
            container.innerHTML = `<div class="result-item empty">${emptyMsg}</div>`;
            return;
        }

        container.innerHTML = items.map(item => {
            if (isPhotos) {
                return `
                    <div class="result-item">
                        <img src="${item.thumbnail}" alt="Photo" style="width:60px;height:60px;border-radius:8px;float:left;margin-right:15px;">
                        <div><strong>${item.title || 'Album'}</strong></div>
                        <a href="${item.url}" target="_blank">View Album</a>
                    </div>
                `;
            }
            return `
                <div class="result-item">
                    <strong>${item.platform || item.type}:</strong> 
                    ${item.name || item.value || 'Found'}
                    ${item.url ? `<br><a href="${item.url}" target="_blank">${item.url}</a>` : ''}
                </div>
            `;
        }).join('');
    }

    getTotalFindings() {
        return Object.values(this.results.modules).reduce((sum, module) => sum + (module?.count || 0), 0);
    }

    exportResults() {
        const dataStr = JSON.stringify(this.results, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghunt_${this.results.email.replace(/[@.]/g, '_')}.json`;
        a.click();
    }

    copyResults() {
        navigator.clipboard.writeText(JSON.stringify(this.results, null, 2));
        this.showStatus('Results copied to clipboard!', 'success');
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        document.getElementById('results').style.display = show ? 'none' : 'block';
        document.getElementById('scanBtn').disabled = show;
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => new GHuntOnline());
