class Player {
  constructor() {
    this.audio = new Audio();
    this.tracks = [];
    this.currentTrackIndex = -1;
    this.isPlaying = false;
    
    this.initElements();
    this.initEvents();
  }

  initElements() {
    this.elements = {
      playBtn: document.getElementById('playBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      progressFill: document.getElementById('progressFill'),
      currentTime: document.getElementById('currentTime'),
      totalTime: document.getElementById('totalTime'),
      volumeSlider: document.getElementById('volumeSlider'),
      trackTitle: document.getElementById('trackTitle'),
      trackArtist: document.getElementById('trackArtist'),
      trackCover: document.getElementById('trackCover')
    };
  }

  initEvents() {
    this.elements.playBtn.addEventListener('click', () => this.togglePlay());
    this.elements.prevBtn.addEventListener('click', () => this.playPrevious());
    this.elements.nextBtn.addEventListener('click', () => this.playNext());
    this.elements.volumeSlider.addEventListener('input', (e) => {
      this.audio.volume = e.target.value / 100;
    });

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
  }

  loadTracks(tracks) {
    this.tracks = tracks;
  }

  playTrackById(trackId) {
    const index = this.tracks.findIndex(t => t.id == trackId);
    if (index !== -1) {
      this.playTrack(index);
    }
  }

  playTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;

    this.currentTrackIndex = index;
    const track = this.tracks[index];
    
    this.audio.src = track.filePath;
    this.elements.trackTitle.textContent = track.title;
    this.elements.trackArtist.textContent = `${track.artist} • ${track.album}`;
    
    this.audio.play();
    this.isPlaying = true;
    this.elements.playBtn.textContent = '⏸️';
  }

  togglePlay() {
    if (this.currentTrackIndex === -1 && this.tracks.length > 0) {
      this.playTrack(0);
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.elements.playBtn.textContent = '▶️';
    } else {
      this.audio.play();
      this.elements.playBtn.textContent = '⏸️';
    }
    this.isPlaying = !this.isPlaying;
  }

  playNext() {
    if (this.tracks.length === 0) return;
    const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.playTrack(nextIndex);
  }

  playPrevious() {
    if (this.tracks.length === 0) return;
    const prevIndex = this.currentTrackIndex === 0 
      ? this.tracks.length - 1 
      : this.currentTrackIndex - 1;
    this.playTrack(prevIndex);
  }

  updateProgress() {
    const progress = (this.audio.currentTime / this.audio.duration) * 100 || 0;
    this.elements.progressFill.style.width = progress + '%';
    this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
  }

  updateDuration() {
    this.elements.totalTime.textContent = this.formatTime(this.audio.duration);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Создаем глобальный плеер
const player = new Player();