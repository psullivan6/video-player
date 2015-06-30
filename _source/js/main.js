// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var videoPlayer;
var onYouTubeIframeAPIReady = function() {
  videoPlayer = new YT.Player('video-player', {
    height: '100%',
    width: '100%',
    // videoId: '7V-fIGMDsmE', // long duration
    videoId: '-CmadmM5cOk', // normal duration
    events: {
      'onReady': onVideoReady,
      'onStateChange': onVideoStateChange
    },
    playerVars: {
      'autohide': 1,
      'controls': 0,
      'showinfo': 0
    }
  });
};

var videoConfig = {
  jumpAmount: 10 // Number representing seconds for L & R scrubber jump keys
};

var updateInterval = setInterval(updateVideoInfo, 400);

// The API calls this function when the player's state changes.
var onVideoStateChange = function(event) {
  var videoStateData = event.data;
  
  if (videoStateData === YT.PlayerState.PLAYING) {
    $('.button-playPause').addClass('playing');
    updateInterval = setInterval(updateVideoInfo, 400);
  } else {
    clearInterval(updateInterval);
    
    if ((videoStateData === YT.PlayerState.ENDED) || videoStateData === YT.PlayerState.PAUSED) {
      $('.button-playPause').removeClass('playing');
    }
  }
};

var updateVideoInfo = function(config){
  var currentTime, totalTime;
  
  if (!totalTime) {
    totalTime = getTimeStamp(videoPlayer.getDuration());
  };
  
  if (typeof config === 'undefined') {
    currentTime = getTimeStamp(Math.round(videoPlayer.getCurrentTime()));
  } else {
    if (config.currentTime) {
      currentTime = getTimeStamp(Math.round(config.currentTime));
    }
  }
  
  $('.video-time-current').html(currentTime);
  $('.video-time-total').html(totalTime);
};

var visibleFlag = true;

var onVideoReady = function(event) {
  updateVideoInfo();
  
  // Only listen for scroll after videoPlayer has been initialized. Otherwise
  // the videoAdctions.videoPause(); will call a function on an undefined Object
  $(window).scroll(function(event){
    var visibleCheck = isVisible({ id: 'video', multiplier: 0.8 });
    if (visibleFlag !== visibleCheck) {
      visibleFlag = visibleCheck;
      if (!visibleFlag) { videoActions.videoPause(); };
    };
  });
};

var getTimeStamp = function(value){
  var hours, minutes, seconds;
  
  if (value > 3600) {
    hours   = Math.floor(value / 3600);
    minutes = Math.floor((value - (hours * 3600)) / 60);
    seconds = Math.floor(value - (hours * 3600) - (minutes * 60));
    if (minutes < 10) { minutes = '0' + minutes; }
  } else if (value >= 60){
    minutes = Math.floor(value / 60);
    seconds = Math.floor(value - (minutes * 60));
  } else if (value < 60){
    minutes = 0;
    seconds = value;
  }
  
  if (seconds < 10) { seconds = '0' + seconds; }
  
  time = (hours) ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
  
  return time;
};

var videoActions = {
  videoPlay: function(){
    videoPlayer.playVideo();
  },
  videoPause: function(){
    videoPlayer.pauseVideo();
  },
  videoJumpForward: function(){
    var currentTime = videoPlayer.getCurrentTime();
    videoPlayer.seekTo(currentTime + videoConfig.jumpAmount);
    updateVideoInfo({ currentTime: currentTime + videoConfig.jumpAmount });
  },
  videoJumpBack: function(){
    var currentTime = videoPlayer.getCurrentTime();
    if (currentTime > videoConfig.jumpAmount) {
      videoPlayer.seekTo(currentTime - videoConfig.jumpAmount);
      updateVideoInfo({ currentTime: currentTime - videoConfig.jumpAmount });
    }
  }
};

$('.button-playPause').click(function(event){
  event.preventDefault();
  
  var $this = $(event.currentTarget);
  
  if ($this.hasClass('playing')) {
    videoActions.videoPause();
  } else {
    videoActions.videoPlay();
  }
});

// [TODO] Wrap this whole keydown listener in a hasKeyboard function or similar
// that will return true if the device has a keyboard. For instance, bluetooth
// keyboard attached to a tablet. <-- Need to test what this conditional needs
// to be to work
$(document).keydown(function(event){
  var isVideoVisible = isVisible({ id: 'video', multiplier: 0.8 });
  var capturedKeyCodes = [32, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
  var keyPressed = event.keyCode;
  
  if ((capturedKeyCodes.indexOf(keyPressed) > -1) && isVideoVisible) {
    
    // Only change volume if the video is already playing
    if ((videoPlayer.getPlayerState() === 1) && ((keyPressed === 38) || (keyPressed === 40))) {
      event.preventDefault();
      console.log('CHANGE VOLUME');
    };
    
    // If SPACEBAR is pressed, then play/pause the video accordingly
    if (keyPressed === 32) {
      event.preventDefault();
      if (videoPlayer.getPlayerState() === 1) {
        videoActions.videoPause();
      } else {
        videoActions.videoPlay();
      }
    }
    
    // LEFT and RIGHT 10s jumping
    if (keyPressed === 39) {
      event.preventDefault();
      videoActions.videoJumpForward();
    }
    if (keyPressed === 37) {
      event.preventDefault();
      videoActions.videoJumpBack();
    }
  }
  
  // 32 - SPACE - play/pause
  // 37 - LEFT  - 10s back
  // 39 - RIGHT - 10s forward
  // 38 - UP    - Volume Up
  // 40 - DOWN  - Volume Down
  // 48 - 0     - scrub to start
  // 49 - 1     - scrub to 10% of video
  // 50 - 2     - scrub to 20% of video
  // 51 - 3     - scrub to 30% of video
  // 52 - 4     - scrub to 40% of video
  // 53 - 5     - scrub to 50% of video
  // 54 - 6     - scrub to 60% of video
  // 55 - 7     - scrub to 70% of video
  // 56 - 8     - scrub to 80% of video
  // 57 - 9     - scrub to 90% of video
});

$(window).load(function(){
  visibleFlag = isVisible({ id: 'video', multiplier: 0.8 });
});

var isVisible = function(config){
  var $element = document.getElementById(config.id);
  var elementOffsetTop = $element.offsetTop;
  var elementHeight = $element.scrollHeight; // use 'scrollHeight' b/c it accounts for margin
  var multiplier = (config.multiplier) ? config.multiplier : 0.9;
  
  return (window.scrollY < (elementOffsetTop + (elementHeight * multiplier))) && (window.scrollY > ((elementOffsetTop - window.innerHeight) + (elementHeight * (1 - multiplier))));
};