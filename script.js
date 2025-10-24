// Get video element and controls
const video = document.getElementById('mainVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const slowBtn = document.getElementById('slowBtn');
const normalBtn = document.getElementById('normalBtn');
const fastBtn = document.getElementById('fastBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const contentArea = document.getElementById('contentArea');
const cuepointsList = document.getElementById('cuepointsList');
const addCuepointBtn = document.getElementById('addCuepointBtn');
const transcriptBtn = document.getElementById('transcriptBtn');
const transcriptContainer = document.getElementById('transcriptContainer');
const transcriptContent = document.getElementById('transcriptContent');
const languageSelect = document.getElementById('languageSelect');

// Get audio elements
const audio = document.getElementById('audioPodcast');
const audioPlayBtn = document.getElementById('audioPlayBtn');
const audioProgressBar = document.getElementById('audioProgressBar');
const audioProgressFill = document.getElementById('audioProgressFill');
const audioTimeEl = document.getElementById('audioTime');

// Cuepoints storage
let cuepoints = [
    { time: 5, label: '💡 Introduction to Student Entrepreneurship', content: 'Welcome! This section introduces the key concepts of starting a business while studying.' },
    { time: 30, label: '📊 Market Research Basics', content: 'Learn how to identify your target market and validate your business idea.' },
    { time: 60, label: '💰 Funding Options for Students', content: 'Explore scholarships, grants, and other funding sources available to student entrepreneurs.' }
];

// Transcript state
let transcriptVisible = false;
let transcriptCues = [];
let currentLanguage = 'en';

// Track elements
const tracks = {
    en: document.getElementById('englishTrack'),
    es: document.getElementById('spanishTrack'),
    fr: document.getElementById('frenchTrack')
};

// Initialize
function init() {
    renderCuepoints();
    updateSpeedButtons();
    loadTranscript();
}

// Play/Pause functionality
playPauseBtn.addEventListener('click', togglePlayPause);

function togglePlayPause() {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<span class="play-icon">⏸</span>';
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<span class="play-icon">▶</span>';
    }
}

// Rewind and Forward
rewindBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
});

forwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
});

// Playback speed controls
slowBtn.addEventListener('click', () => {
    video.playbackRate = 0.5;
    updateSpeedButtons();
});

normalBtn.addEventListener('click', () => {
    video.playbackRate = 1.0;
    updateSpeedButtons();
});

fastBtn.addEventListener('click', () => {
    video.playbackRate = 2.0;
    updateSpeedButtons();
});

function updateSpeedButtons() {
    [slowBtn, normalBtn, fastBtn].forEach(btn => {
        btn.style.background = 'white';
        btn.style.color = '#333';
    });

    if (video.playbackRate === 0.5) {
        slowBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        slowBtn.style.color = 'white';
    } else if (video.playbackRate === 1.0) {
        normalBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        normalBtn.style.color = 'white';
    } else if (video.playbackRate === 2.0) {
        fastBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        fastBtn.style.color = 'white';
    }
}

// Mute/Unmute
muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
    volumeSlider.value = video.muted ? 0 : video.volume * 100;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    video.volume = volume;
    video.muted = volume === 0;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
});

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
});

// Progress bar
video.addEventListener('timeupdate', updateProgress);

function updateProgress() {
    const percentage = (video.currentTime / video.duration) * 100;
    progressFill.style.width = `${percentage}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
    
    // Check for cuepoint triggers
    checkCuepoints();
    
    // Highlight active transcript cue
    highlightActiveTranscriptCue();
}

video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
});

// Seeking
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    video.currentTime = percentage * video.duration;
});

// Format time helper
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Transcript functionality
transcriptBtn.addEventListener('click', toggleTranscript);

function toggleTranscript() {
    transcriptVisible = !transcriptVisible;
    
    if (transcriptVisible) {
        transcriptContainer.style.display = 'block';
        transcriptBtn.classList.add('active');
    } else {
        transcriptContainer.style.display = 'none';
        transcriptBtn.classList.remove('active');
    }
}

// Load and parse VTT transcript
function loadTranscript() {
    const track = tracks[currentLanguage];
    
    if (track) {
        // Disable all tracks first
        Object.values(tracks).forEach(t => {
            if (t && t.track) {
                t.track.mode = 'hidden';
            }
        });
        
        // Enable selected track
        track.track.mode = 'hidden'; // Load cues but don't display default captions
        
        const textTrack = track.track;
        
        textTrack.addEventListener('load', () => {
            transcriptCues = Array.from(textTrack.cues || []);
            renderTranscript();
        });
        
        // If cues are already loaded
        if (textTrack.cues && textTrack.cues.length > 0) {
            transcriptCues = Array.from(textTrack.cues);
            renderTranscript();
        } else {
            // Force load by setting mode
            textTrack.mode = 'hidden';
            
            // Check again after a short delay
            setTimeout(() => {
                if (textTrack.cues && textTrack.cues.length > 0) {
                    transcriptCues = Array.from(textTrack.cues);
                    renderTranscript();
                }
            }, 500);
        }
    }
    
    // Fallback if track doesn't load
    setTimeout(() => {
        if (transcriptCues.length === 0) {
            const languageNames = {
                en: 'english.vtt',
                es: 'spanish.vtt',
                fr: 'french.vtt'
            };
            transcriptContent.innerHTML = `
                <p style="text-align: center; color: #666;">
                    Transcript file not found. Please ensure <strong>media/${languageNames[currentLanguage]}</strong> exists.
                </p>
                <p style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #888;">
                    Sample VTT format:<br>
                    <code style="display: block; margin-top: 5px; padding: 10px; background: white; border-radius: 5px;">
                        WEBVTT<br><br>
                        00:00:00.000 --> 00:00:05.000<br>
                        Welcome to starting a business as a student
                    </code>
                </p>
            `;
        }
    }, 2000);
}

// Language selector change event
languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    transcriptCues = []; // Clear existing cues
    loadTranscript();
    
    // Update active captions track
    Object.entries(tracks).forEach(([lang, track]) => {
        if (track && track.track) {
            track.track.mode = lang === currentLanguage ? 'showing' : 'hidden';
        }
    });
});

function renderTranscript() {
    if (transcriptCues.length === 0) {
        transcriptContent.innerHTML = '<p class="loading">No transcript available.</p>';
        return;
    }
    
    transcriptContent.innerHTML = '';
    
    transcriptCues.forEach((cue, index) => {
        const cueDiv = document.createElement('div');
        cueDiv.className = 'transcript-cue';
        cueDiv.dataset.index = index;
        cueDiv.dataset.startTime = cue.startTime;
        
        cueDiv.innerHTML = `
            <span class="transcript-timestamp">${formatTime(cue.startTime)}</span>
            <span class="transcript-text">${cue.text}</span>
        `;
        
        cueDiv.addEventListener('click', () => {
            video.currentTime = cue.startTime;
            video.play();
        });
        
        transcriptContent.appendChild(cueDiv);
    });
}

function highlightActiveTranscriptCue() {
    if (!transcriptVisible || transcriptCues.length === 0) return;
    
    const currentTime = video.currentTime;
    const cueElements = transcriptContent.querySelectorAll('.transcript-cue');
    
    cueElements.forEach((el, index) => {
        const cue = transcriptCues[index];
        if (cue && currentTime >= cue.startTime && currentTime <= cue.endTime) {
            el.classList.add('active');
            // Auto-scroll to active cue
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            el.classList.remove('active');
        }
    });
}

// Cuepoints functionality
function renderCuepoints() {
    cuepointsList.innerHTML = '';
    cuepoints.sort((a, b) => a.time - b.time).forEach((cuepoint, index) => {
        const cuepointEl = document.createElement('div');
        cuepointEl.className = 'cuepoint-item';
        cuepointEl.innerHTML = `
            <span class="cuepoint-time">${formatTime(cuepoint.time)}</span>
            <span class="cuepoint-label">${cuepoint.label}</span>
            <button class="delete-cuepoint" data-index="${index}">Delete</button>
        `;
        
        cuepointEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-cuepoint')) {
                video.currentTime = cuepoint.time;
                video.play();
            }
        });
        
        cuepointsList.appendChild(cuepointEl);
    });
    
    // Add delete listeners
    document.querySelectorAll('.delete-cuepoint').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            cuepoints.splice(index, 1);
            renderCuepoints();
        });
    });
}

// Add new cuepoint
addCuepointBtn.addEventListener('click', () => {
    const time = parseFloat(prompt('Enter time in seconds:', Math.floor(video.currentTime)));
    const label = prompt('Enter a label for this moment:');
    const content = prompt('Enter content to display:');
    
    if (time !== null && !isNaN(time) && label) {
        cuepoints.push({
            time: time,
            label: label,
            content: content || 'No additional content provided.'
        });
        renderCuepoints();
    }
});

// Check and trigger cuepoints
let lastTriggered = -1;

function checkCuepoints() {
    const currentTime = video.currentTime;
    
    cuepoints.forEach((cuepoint, index) => {
        // Trigger if we're within 0.5 seconds of the cuepoint
        if (Math.abs(currentTime - cuepoint.time) < 0.5 && lastTriggered !== index) {
            triggerCuepoint(cuepoint, index);
        }
    });
}

function triggerCuepoint(cuepoint, index) {
    lastTriggered = index;
    contentArea.classList.add('triggered');
    contentArea.innerHTML = `
        <h3>💡 ${cuepoint.label}</h3>
        <p><strong>Timestamp:</strong> ${formatTime(cuepoint.time)}</p>
        <p>${cuepoint.content}</p>
    `;
    
    setTimeout(() => {
        contentArea.classList.remove('triggered');
    }, 500);
    
    // Reset after 2 seconds so it can trigger again if replayed
    setTimeout(() => {
        if (video.currentTime < cuepoint.time - 1 || video.currentTime > cuepoint.time + 2) {
            lastTriggered = -1;
        }
    }, 2000);
}

// Audio Player Controls
audioPlayBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        audioPlayBtn.textContent = '⏸ Pause Podcast';
    } else {
        audio.pause();
        audioPlayBtn.textContent = '▶ Play Podcast';
    }
});

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        audioProgressFill.style.width = `${percentage}%`;
        audioTimeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
});

audioProgressBar.addEventListener('click', (e) => {
    const rect = audioProgressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percentage * audio.duration;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            video.currentTime -= 5;
            break;
        case 'ArrowRight':
            e.preventDefault();
            video.currentTime += 5;
            break;
        case 'ArrowUp':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.1);
            volumeSlider.value = video.volume * 100;
            break;
        case 'ArrowDown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.1);
            volumeSlider.value = video.volume * 100;
            break;
        case 'm':
        case 'M':
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? '🔇' : '🔊';
            break;
        case 'f':
        case 'F':
            fullscreenBtn.click();
            break;
        case 't':
        case 'T':
            toggleTranscript();
            break;
    }
});

// Initialize the app
init();