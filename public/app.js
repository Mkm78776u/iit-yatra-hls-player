 document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const videoUrlInput = document.getElementById('videoUrlInput');
    const loadBtn = document.getElementById('loadBtn');
    const playerInfo = document.getElementById('playerInfo');
    
    let hls = null;
    
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
    
    // Load stream function
    function loadStream(url) {
        if (hls) {
            hls.destroy();
        }
        
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
                updatePlayerInfo('Stream loaded successfully!\n\n' + getPlayerStats());
            });
            
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            updatePlayerInfo('Fatal network error encountered. Trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            updatePlayerInfo('Fatal media error encountered. Trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            updatePlayerInfo('Fatal error encountered. Cannot recover.');
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari and other browsers that support native HLS
            video.src = url;
            video.addEventListener('loadedmetadata', function() {
                video.play();
                updatePlayerInfo('Stream loaded successfully (native HLS support)!\n\n' + getPlayerStats());
            });
        } else {
            updatePlayerInfo('HLS is not supported in this browser.');
        }
    }
    
    // Update player info display
    function updatePlayerInfo(info) {
    const watermark = "\n\n---\nMade by Mithilesh KMWT || Contact: mithileshkmwt@gmail.com";
    playerInfo.textContent = info + watermark;
}
    
    // Get player stats
    function getPlayerStats() {
        if (!hls) return 'No HLS instance available';
        
        const stats = [];
        stats.push(`HLS.js version: ${Hls.version}`);
        stats.push(`Video source: ${video.src}`);
        stats.push(`Current time: ${video.currentTime}`);
        stats.push(`Duration: ${video.duration}`);
        stats.push(`Volume: ${video.volume}`);
        stats.push(`Playback rate: ${video.playbackRate}`);
        
        if (hls.levels && hls.levels.length > 0) {
            stats.push('\nAvailable quality levels:');
            hls.levels.forEach((level, index) => {
                stats.push(`Level ${index}: ${level.height}p (bitrate: ${Math.round(level.bitrate / 1000)}kbps)`);
            });
            
            stats.push(`\nCurrent quality level: ${hls.currentLevel}`);
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
        if (hls && hls.levels) {
            updatePlayerInfo('Stream loaded successfully!\n\n' + getPlayerStats());
        }
    }, 3000);
});