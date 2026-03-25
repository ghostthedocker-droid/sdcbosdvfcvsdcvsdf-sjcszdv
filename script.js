async fetchOSINT(url) {
    // Use multiple working proxies + fallbacks
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/'
    ];
    
    for (const proxy of proxies) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url), {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (response.ok) return { success: true, data: await response.text() };
        } catch {}
    }
    return { success: false };
}
