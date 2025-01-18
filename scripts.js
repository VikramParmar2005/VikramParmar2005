const songs = [
    { title: "Coldplay - Hymn For The Weekend", file: "C:/Users/Vikra/OneDrive/Desktop/songs/Coldplay - Hymn For The Weekend (Official Video)(MP3_320K).mp3" },
    { title: "Dancing with your Ghost by Sasha Sloan", file: "C:/Users/Vikra/OneDrive/Desktop/songs/Dancing with your Ghost by Sasha Sloan _ Male version (Lyrics)(MP3_70K).mp3" },
    { title: "Famy - Ava (Speed Up Tiktok Version)", file: "C:/Users/Vikra/OneDrive/Desktop/songs/Famy - Ava (Speed Up Tiktok Version)_ Lyrics(MP3_128K).mp3" },
    { title: "One Direction - Night Changes", file: "C:/Users/Vikra/OneDrive/Desktop/songs/One Direction - Night Changes(MP3_320K).mp3" },
    { title: "Rosa Linn - Snap", file: "C:/Users/Vikra/OneDrive/Desktop/songs/Rosa Linn - Snap - (Official Eurovision Music Video)(MP3_128K).mp3" },
    { title: "Ho gayi galti mujhse", file: "C:/Users/Vikra/OneDrive/Desktop/songs/Ho gayi galti mujhse Lyrics(MP3_160K).mp3" }
];

let playlists = JSON.parse(localStorage.getItem('playlists')) || {};
let isLooping = false;

// Load Songs
function loadSongs(filteredSongs = songs) {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = ''; // Clear existing playlist

    filteredSongs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('song-item');
        li.innerHTML = `
            <input type="checkbox" class="songCheckbox" data-index="${index}">
            <span class="songTitle">${song.title}</span>
            <audio id="audio-${index}" class="audio" src="${song.file}"></audio>
            <button class="playPauseBtn" onclick="togglePlayPause(${index}, this)">▶️</button>
            <input type="range" class="progress" min="0" max="100" value="0" onchange="seekSong(${index}, this)">
            <span class="currentTime" id="currentTime-${index}">0:00</span> / <span class="duration" id="duration-${index}">0:00</span>
            <button class="removeBtn" onclick="removeSong(${index})">Remove</button>
        `;
        playlist.appendChild(li);

        const audioElement = document.getElementById(`audio-${index}`);
        audioElement.onloadedmetadata = function() {
            const durationDisplay = document.getElementById(`duration-${index}`);
            durationDisplay.textContent = formatTime(audioElement.duration);
        };
    });
}

function togglePlayPause(index, playPauseBtn) {
    const audioElement = document.getElementById(`audio-${index}`);

    if (audioElement.paused) {
        document.querySelectorAll('audio').forEach(audio => audio.pause());
        document.querySelectorAll('.playPauseBtn').forEach(btn => btn.textContent = '▶️');

        audioElement.play();
        playPauseBtn.textContent = '⏸️'; // Play button becomes Pause
    } else {
        audioElement.pause();
        playPauseBtn.textContent = '▶️'; // Pause button becomes Play
    }
}

// Remove song from playlist
function removeSong(index) {
    songs.splice(index, 1);
    loadSongs();
}

// Update progress bar and time
function updateProgress(index) {
    const audioElement = document.getElementById(`audio-${index}`);
    const progressElement = document.querySelector(`.progress[data-index="${index}"]`);
    const currentTimeSpan = document.getElementById(`currentTime-${index}`);
    const durationSpan = document.getElementById(`duration-${index}`);

    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;

    progressElement.value = (currentTime / duration) * 100;
    currentTimeSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = formatTime(duration);
}

// Seek song when moving progress bar
function seekSong(index, progressElement) {
    const audioElement = document.getElementById(`audio-${index}`);
    audioElement.currentTime = (progressElement.value / 100) * audioElement.duration;
}

// Format time (convert seconds to mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Create a new playlist
function createNewPlaylist() {
    const playlistName = document.getElementById('newPlaylistName').value.trim();
    if (!playlistName) {
        alert('Please enter a valid playlist name.');
        return;
    }

    const selectedSongs = Array.from(document.querySelectorAll('.songCheckbox:checked')).map(cb => {
        return songs[cb.dataset.index].title;
    });

    if (selectedSongs.length === 0) {
        alert('Please select at least one song.');
        return;
    }

    playlists[playlistName] = selectedSongs;
    localStorage.setItem('playlists', JSON.stringify(playlists));

    loadSavedPlaylists();
}

// Load saved playlists
function loadSavedPlaylists() {
    const savedPlaylists = document.getElementById('savedPlaylists');
    savedPlaylists.innerHTML = '';

    for (const playlistName in playlists) {
        const li = document.createElement('li');
        li.classList.add('saved-playlist-item');
        li.textContent = playlistName;
        li.onclick = function() {
            openPlaylist(playlistName);
        };
        savedPlaylists.appendChild(li);
    }
}

// Open a saved playlist
// Open a saved playlist
function openPlaylist(playlistName) {
    const playlist = playlists[playlistName];
    const playlistContainer = document.getElementById('playlist');
    playlistContainer.innerHTML = ''; // Clear current playlist

    playlist.forEach((songTitle, index) => {
        const song = songs.find(s => s.title === songTitle);
        const li = document.createElement('li');
        li.classList.add('song-item');
        li.innerHTML = `
            <span class="songTitle">${song.title}</span>
            <audio id="audio-${index}" class="audio" src="${song.file}"></audio>
            <button class="playPauseBtn" onclick="togglePlayPause(${index}, this)">▶️</button>
            <input type="range" class="progress" min="0" max="100" value="0" onchange="seekSong(${index}, this)">
            <span class="currentTime" id="currentTime-${index}">0:00</span> / <span class="duration" id="duration-${index}">0:00</span>
        `;
        playlistContainer.appendChild(li);

        const audioElement = document.getElementById(`audio-${index}`);
        audioElement.onloadedmetadata = function() {
            const durationDisplay = document.getElementById(`duration-${index}`);
            durationDisplay.textContent = formatTime(audioElement.duration);
        };

        // Update the progress when playing
        audioElement.addEventListener('timeupdate', () => {
            updateProgress(index);
        });
    });
}
// Search for songs in playlist
function searchSongs() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filteredSongs = songs.filter(song => song.title.toLowerCase().includes(query));
    loadSongs(filteredSongs);
}

// Sort Playlist
function sortPlaylist(criteria) {
    if (criteria === 'alphabet') {
        songs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === 'duration') {
        songs.sort((a, b) => {
            const durationA = document.getElementById(`audio-${a.title}`).duration;
            const durationB = document.getElementById(`audio-${b.title}`).duration;
            return durationA - durationB;
        });
    }
    loadSongs();
}

// Shuffle Playlist
function shufflePlaylist() {
    songs.sort(() => Math.random() - 0.5);
    loadSongs();
}

// Adjust volume
function adjustVolume(volume) {
    document.querySelectorAll('audio').forEach(audio => {
        audio.volume = volume;
    });
}

// Toggle Loop
function toggleLoop() {
    isLooping = !isLooping;
    document.getElementById('loopBtn').textContent = isLooping ? 'Loop: On' : 'Loop: Off';
    document.querySelectorAll('audio').forEach(audio => {
        audio.loop = isLooping;
    });
}

// Initialize the playlist when page loads
loadSongs();
loadSavedPlaylists();
