var musicList = [];

let yt_iframe = document.querySelector("body > iframe");
const hbplayer = document.getElementById("hbplayer");

// API 로드
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 플레이어 객체 생성
var player;
var currentIndex = 0;
var readyaaa = 0;

// API 로드 후 호출될 함수
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 플레이어 준비 완료 후 실행할 함수
function onPlayerReady(event) {
  event.target.loadVideoById("HaEYUJ2aRHs");
  event.target.playVideo();
  readyaaa = 1;
  console.log("onPlayerReady");
}

// 다음 노래 재생
function playNextSong() {
  if (currentIndex < musicList.length) {
    currentIndex++;
    player.loadVideoById(musicList[currentIndex].id);
  }
}

// 이전 노래 재생
function playPrevSong() {
  if (currentIndex > 0) {
    currentIndex--;
    player.loadVideoById(musicList[currentIndex].id);
  }
}

let totalTime;
let progressBar;
let currentTime;
let elapsed;
let remaining;

// 프로그래스바 엘리먼트 가져오기
progressBar = document.getElementById("progressbar");

// 노래가 끝나면 다음 노래 재생
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    console.log("playing");
    // // 현재 노래 정보 가져오기
    // var currentSong = musicList[currentIndex];
    // // 노래 제목과 아티스트 정보 업데이트
    // document.getElementById('song-title').textContent = currentSong.title;
    // document.getElementById('song-artist').textContent = currentSong.artist;

    const videoData = player.getVideoData();
    document.getElementById("song-title").textContent = videoData.title;
    document.getElementById("song-artist").textContent = "";

    // 노래 전체 길이 가져오기
    totalTime = player.getDuration();

    // 1초마다 프로그래스바 업데이트
    //      setInterval(function() {
    // 현재 노래의 현재 위치 가져오기
    currentTime = player.getCurrentTime();
    // 경과 시간 계산
    elapsed = formatTime(currentTime);
    // 남은 시간 계산
    remaining = formatTime(totalTime - currentTime);
    // 경과 시간 업데이트
    document.getElementById("elapsed-time").textContent = elapsed;
    // 남은 시간 업데이트
    document.getElementById("remaining-time").textContent = "-" + remaining;
    // 프로그래스바 업데이트
    progressBar.style.width = (currentTime / totalTime) * 100 + "%";
    //      }, 1000);
  }

  if (event.data === YT.PlayerState.ENDED) {
    playNextSong();
  }
}

// 초단위 갱신
setInterval(function () {
  //console.log("hehehe");
  // 현재 노래의 현재 위치 가져오기
  currentTime = player.getCurrentTime();
  // 경과 시간 계산
  elapsed = formatTime(currentTime);
  // 남은 시간 계산
  remaining = formatTime(totalTime - currentTime);
  // 경과 시간 업데이트
  document.getElementById("elapsed-time").textContent = elapsed;
  // 남은 시간 업데이트
  document.getElementById("remaining-time").textContent = "-" + remaining;
  // 프로그래스바 업데이트
  progressBar.style.width = (currentTime / totalTime) * 100 + "%";
}, 1000);

// 시간을 포맷하는 함수
function formatTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time % 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}

const m_btn_play = document.getElementById("m_btn_play");
const m_btn_pause = document.getElementById("m_btn_pause");

function handlePlayVideo() {
  player.playVideo();
}

function handlePauseVideo() {
  player.pauseVideo();
}

m_btn_play.addEventListener("click", handlePlayVideo);
m_btn_pause.addEventListener("click", handlePauseVideo);

console.log("ready");
console.log(readyaaa);

function handleClick(event) {
  const div = event.currentTarget;
  //console.log(div.id);
  player.loadVideoById(div.id);
}

const divs = document.querySelectorAll(".hblist__content__column_play");
divs.forEach((div) => {
  div.addEventListener("click", handleClick);
});
