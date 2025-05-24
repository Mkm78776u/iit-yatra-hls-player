document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrlInput');
    const loadBtn = document.getElementById('loadBtn');
    const playerInfo = document.getElementById('playerInfo');
    const playerWrap = document.createElement('div');
    playerWrap.className = 'player-wrap';
    document.querySelector('.player-container').appendChild(playerWrap);
    
    let videojsPlayer = null;
    
    // Function to parse query parameters
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Check for videourl in query parameters
    const initialVideoUrl = getQueryParam('videourl');
    if (initialVideoUrl) {
        videoUrlInput.value = decodeURIComponent(initialVideoUrl);
        loadStream(initialVideoUrl);
    }
    
    // Create video element
    function createVideoElement() {
        const video = document.createElement('video');
        video.id = 'video';
        video.className = 'video-js vjs-theme-city';
        video.controls = true;
        video.crossOrigin = true;
        video.playsInline = true;
        playerWrap.appendChild(video);
        return video;
    }
    
    // Determine MIME type from URL
    function getMimeType(url) {
        if (url.endsWith('.mpd')) {
            return 'application/dash+xml';
        } else if (url.endsWith('.mp4')) {
            return 'video/mp4';
        }
        return 'application/x-mpegurl'; // Default to HLS
    }
    
    // Load stream function using video.js
    function loadStream(url) {
        if (videojsPlayer) {
            videojsPlayer.dispose();
            playerWrap.innerHTML = '';
        }
        
        const videoElement = createVideoElement();
        const mimeType = getMimeType(url);
        
        const options = {
            bigPlayButton: false,
            controls: true,
            muted: true,
            autoplay: true,
            controlBar: {
                timeDivider: true,
                currentTimeDisplay: true,
                remainingTimeDisplay: false,
                playToggle: true,
                seekToLive: true,
                liveDisplay: true,
                volumePanel: {},
                fullscreenToggle: true,
                playbackRateMenuButton: false,
            },
            html5: {
                vhs: {
                    experimentalBufferBasedABR: true,
                    useDevicePixelRatio: true
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false,
                useBandwidthFromLocalStorage: true
            },
            techOrder: ['html5'],
            sources: [{
                src: url,
                type: mimeType
            }],
        };
        
        videojsPlayer = videojs(videoElement, options);
        videojsPlayer.volume(1);
        
        videojsPlayer.on("play", function() {
            updatePlayerInfo('Stream loaded successfully!\n\n' + getPlayerStats());
        });
        
        videojsPlayer.on("error", function() {
            updatePlayerInfo('Error occurred while playing the stream.');
        });
        
        // Handle player resize
        function resizePlayer() {
            const width = playerWrap.offsetWidth;
            playerWrap.style.height = (width / 1.7777777777) + 'px';
        }
        
        resizePlayer();
        window.addEventListener('resize', resizePlayer);
    }
    
    // Update player info display
    function updatePlayerInfo(info) {
        const watermark = "\n\n---\nMade by Mithilesh KMWT || Contact: mithileshkmwt@gmail.com";
        playerInfo.textContent = info + watermark;
    }
    
    // Get player stats
    function getPlayerStats() {
        if (!videojsPlayer) return 'No player instance available';
        
        const stats = [];
        const tech = videojsPlayer.tech({ IWillNotUseThisInPlugins: true });
        const vhs = tech && tech.vhs;
        
        stats.push(`Video.js version: ${videojs.VERSION}`);
        stats.push(`Current source: ${videojsPlayer.currentSrc()}`);
        stats.push(`Current time: ${videojsPlayer.currentTime()}`);
        stats.push(`Duration: ${videojsPlayer.duration()}`);
        stats.push(`Volume: ${videojsPlayer.volume()}`);
        stats.push(`Playback rate: ${videojsPlayer.playbackRate()}`);
        
        if (vhs && vhs.playlists && vhs.playlists.master) {
            stats.push('\nAvailable quality levels:');
            const qualityLevels = videojsPlayer.qualityLevels();
            
            if (qualityLevels && qualityLevels.length > 0) {
                for (let i = 0; i < qualityLevels.length; i++) {
                    const level = qualityLevels[i];
                    stats.push(`Level ${i}: ${level.height}p (bitrate: ${Math.round(level.bitrate / 1000)}kbps)`);
                }
                
                const selectedIndex = qualityLevels.selectedIndex;
                stats.push(`\nCurrent quality level: ${selectedIndex !== -1 ? selectedIndex : 'Auto'}`);
            }
        }
        
        return stats.join('\n');
    }
    
    // Event listeners
    loadBtn.addEventListener('click', function() {
        const url = videoUrlInput.value.trim();
        if (url) {
            loadStream(url);
            
            // Update URL with the new videourl parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('videourl', encodeURIComponent(url));
            window.history.pushState({}, '', newUrl);
        } else {
            updatePlayerInfo('Please enter a valid URL');
        }
    });
    
    // Periodically update player info
    setInterval(() => {
        if (videojsPlayer) {
            updatePlayerInfo('Stream loaded successfully!\n\n' + getPlayerStats());
        }
    }, 3000);
});
