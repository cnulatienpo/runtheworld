// == Real Shuffle for YouTube Music ==

// Grab all song elements in the current playlist view
function getPlaylistSongs() {
  // Update selector if YouTube updates their UI
  return Array.from(document.querySelectorAll('ytmusic-playlist-shelf-renderer ytmusic-playlist-shelf-item-renderer'));
}

// Get song title and artist from a song element
function getSongInfo(el) {
  const title = el.querySelector('.title')?.textContent.trim();
  const artist = el.querySelector('.byline')?.textContent.trim();
  return { title, artist, el };
}

// Fisher–Yates shuffle implementation
function fisherYatesShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build the shuffled queue
const playlistEls = getPlaylistSongs();
const playlist = playlistEls.map(getSongInfo);
const shuffled = fisherYatesShuffle(playlist);

// Store shuffled order and current index in the window for later use
window._realShuffleQueue = shuffled;
window._realShuffleIndex = 0;

// Play the next song in the real shuffle queue
window.playNextRealShuffledSong = function () {
  const queue = window._realShuffleQueue || [];
  let idx = window._realShuffleIndex || 0;
  if (queue.length === 0 || idx >= queue.length) {
    alert('\ud83c\udfb5 Real Shuffle: Queue finished!');
    return;
  }
  queue[idx].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  queue[idx].el.click();
  window._realShuffleIndex = idx + 1;
};

// Optionally play next shuffled song when the current one ends
let lastSongId = null;
setInterval(() => {
  const title = document.querySelector('.title.ytmusic-player-bar')?.textContent.trim();
  const artist = document.querySelector('.byline.ytmusic-player-bar')?.textContent.trim();
  const songId = title + ' — ' + artist;
  if (window._realShuffleQueue && window._realShuffleIndex !== undefined) {
    if (songId !== lastSongId && window._realShuffleIndex < window._realShuffleQueue.length) {
      lastSongId = songId;
      setTimeout(window.playNextRealShuffledSong, 2000);
    }
  }
}, 3000);

// This script can be used as a content script or userscript to provide real shuffle functionality.
