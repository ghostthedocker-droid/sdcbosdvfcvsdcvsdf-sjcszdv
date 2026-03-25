const channels = [
    // US Channels
    {id: 1, name: "ABC News", country: "US", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UC7m9oxfJ64J96W5Mn-FT1lw", logo: "📰"},
    {id: 2, name: "CBS News", country: "US", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw", logo: "📺"},
    {id: 3, name: "NASA Live", country: "US", category: "science", embed: "https://www.youtube.com/embed/live_stream?channel=UC8aYbV-qlWAwBN6XJ3XPGDQ", logo: "🚀"},
    
    // UK Channels
    {id: 4, name: "BBC News", country: "UK", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCB7juaBKIaA9dtV43hRR9IQ", logo: "🇬🇧"},
    {id: 5, name: "Sky News", country: "UK", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCsSsgPaZ2GSmO6il8Cb5iGA", logo: "📰"},
    
    // International
    {id: 6, name: "France 24", country: "FR", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg", logo: "🇫🇷"},
    {id: 7, name: "DW News", country: "DE", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCC355x7b2eXUnxeK8vaV7Sg", logo: "🇩🇪"},
    {id: 8, name: "Al Jazeera", country: "QA", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCYHa6vHngM4oD5F6ffQsGcw", logo: "🌍"},
    {id: 9, name: "NDTV", country: "IN", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UC8cSt2IaUvl36f0_tHpT0OA", logo: "🇮🇳"},
    {id: 10, name: "ABC Australia", country: "AU", category: "news", embed: "https://www.youtube.com/embed/live_stream?channel=UCocbQaKa1gOOvBgvG0cO2Zw", logo: "🇦🇺"}
];

const channelGrid = document.getElementById('channelGrid');
const countryFilter = document.getElementById('countryFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('search');
const playerModal = document.getElementById('playerModal');
const videoPlayer = document.getElementById('videoPlayer');
const channelTitle = document.getElementById('channelTitle');
const channelDesc = document.getElementById('channelDesc');
const closeBtn = document.querySelector('.close');

function renderChannels(channelsToShow) {
    channelGrid.innerHTML = channelsToShow.map(channel => `
        <div class="channel-card" onclick="playChannel(${channel.id})">
            <div class="channel-logo">${channel.logo}</div>
            <div class="channel-name">${channel.name}</div>
            <div class="channel-country">🇺🇸 ${channel.country}</div>
            <div class="channel-category">${channel.category}</div>
        </div>
    `).join('');
}

function playChannel(channelId) {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
        videoPlayer.src = channel.embed;
        channelTitle.textContent = channel.name;
        channelDesc.textContent = `${channel.country} • ${channel.category}`;
        playerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function filterChannels() {
    const country = countryFilter.value;
    const category = categoryFilter.value;
    const search = searchInput.value.toLowerCase();
    
    const filtered = channels.filter(channel => {
        return (!country || channel.country === country) &&
               (!category || channel.category === category) &&
               (search === '' || channel.name.toLowerCase().includes(search));
    });
    
    renderChannels(filtered);
}

// Event listeners
countryFilter.addEventListener('change', filterChannels);
categoryFilter.addEventListener('change', filterChannels);
searchInput.addEventListener('input', filterChannels);

closeBtn.addEventListener('click', () => {
    playerModal.style.display = 'none';
    videoPlayer.src = '';
    document.body.style.overflow = 'auto';
});

playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) {
        closeBtn.click();
    }
});

// Initial render
renderChannels(channels);
