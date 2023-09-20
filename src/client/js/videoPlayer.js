//watch.pug를 기반으로
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;//id가 숫자이기에 null, 아니면 let controlsTimeout;
let controlsMovementTimeout = null
let volumeValue = 0.5
video.volume = volumeValue

const handlePlayClick = (e) => {
    if (video.paused) {
        video.play()
    } else {
        video.pause()
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

const handleMute = (e) => {//e=이벤트
    if (video.muted) {
        video.muted = false
    } else {
        video.muted = true
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue
}

const handleVolumeChange = (event) => {
    const { target: { value } } = event
    if (video.muted) {
        video.muted = false
        muteBtn.innerText = 'Mute'
    }
    volumeValue = value//글로벌 볼륨 업데이트
    video.volume = value//비디오 볼륨 바꾸기
}

//00:00으로 표현해주는 함수
const formatTime = (seconds) => {
    if (seconds <= 3600) {
        return new Date(seconds * 1000).toISOString().substring(14, 19);
    } else {
        return new Date(seconds * 1000).toISOString().substring(11, 19);
    }
}

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration)) //duration:미디어의 지속 시간을 초 단위로 나타내는 배정밀도 부동 소수점 값
    timeline.max = Math.floor(video.duration)
}

const handleTimeUpdate = () => { //비디오의 현재 시간 표시
    currenTime.innerText = formatTime(Math.floor(video.currentTime))
    timeline.value = Math.floor(video.currentTime)
}

const handleTimeLineChange = (event) => {//비디오의 재생구간을 수동으로 조절
    const { target: { value } } = event
    video.currentTime = value
}

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement
    if (fullscreen) {
        document.exitFullscreen()
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen()
        fullScreenIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {//마우스가 움직이 땐 서로를 취소하다 멈추면 취소할 수 없는 3.을 발동
    if (controlsTimeout) {//마우스가 다시 화면에 오면(=true값일 경우)
        clearTimeout(controlsTimeout) //clearTimeout()로 타이머를 취소하고
        controlsTimeout = null //다시 null값으로 설정
    }
    if (controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout)
        controlsMovementTimeout = null
    }
    videoControls.classList.add('showing')
    controlsMovementTimeout = setTimeout(hideControls, 1700)//3.
}

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(() => //setTimeout()는 함수 감싸기가 안전, mdn참고
        hideControls, 1700);
}

const handleEnded = () => {
    const { id } = videoContainer.dataset; //url이 아니라 watch.pug에서 가져온 data-id
    fetch(`/api/videos/${id}/view`, {//fetch post로 컨트롤러에서 정보를 준다
        method: 'POST',//라우터가 post로 돼있기에
    })
}

playBtn.addEventListener('click', handlePlayClick) //함수의 재활용성을 깨달았다!
//비디오 화면 클릭해서 일시정지/재생
video.addEventListener('click', handlePlayClick)
//스페이스바로 일시정지/재생
document.addEventListener("keydown", (event) => {
    if (event.target === document.body && event.code === "Space") {
        handlePlayClick();
    }
});
muteBtn.addEventListener('click', handleMute)
volumeRange.addEventListener('input', handleVolumeChange)
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate)//timeupdate: 비디오 시간의 변화를 감지하면 handleTimeUpdate를 실행, 비디오만 사용가능
video.addEventListener('ended', handleEnded)
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener('input', handleTimeLineChange)
fullScreenBtn.addEventListener('click', handleFullscreen)

