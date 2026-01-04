// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
  await loadTracks();
  setupSearch();
});

async function loadTracks() {
  try {
    const tracks = await API.getTracks();
    player.loadTracks(tracks);
    renderTracks(tracks);
  } catch (error) {
    console.error('Ошибка загрузки треков:', error);
  }
}

function renderTracks(tracks) {
  const grid = document.getElementById('tracksGrid');
  grid.innerHTML = '';

  if (tracks.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #b3b3b3;">Нет загруженных треков. <a href="upload.html">Добавьте первый!</a></p>';
    return;
  }

  tracks.forEach(track => {
    const card = createTrackCard(track);
    grid.appendChild(card);
  });
}

function createTrackCard(track) {
  const card = document.createElement('div');
  card.className = 'track-card';
  card.onclick = () => player.playTrackById(track.id);
  
  card.innerHTML = `
    <img src="${track.coverUrl || 'https://via.placeholder.com/180'}" alt="${track.title}">
    <h3>${escapeHtml(track.title)}</h3>
    <p>${escapeHtml(track.artist)}</p>
  `;
  
  return card;
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const tracks = await API.getTracks();
    
    const filtered = tracks.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );
    
    renderTracks(filtered);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}