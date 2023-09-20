/*
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"

const actionBtn = document.getElementById("actionBtn")
const video = document.getElementById('preview')

let stream;
let recorder;
let videoFile;

const files = {
    input: 'recording.webm',
    output: 'output.mp4',
    thumb: 'thumbnail.jpg'
}

const downloadFile = (fileUrl, FileName) => {
    const a = document.createElement('a')
    a.href = fileUrl
    //a태그에 download을 추가하면 어디 보내는게 아니라 다운로드한다.
    a.download = FileName//다운로드 시키는 기능(유용). FileName은 다운로드 할 때 이름. 확장자를 입력하지 않으면 텍스트로 뜸
    document.body.appendChild(a)
    a.click()//유저가 클릭한 것 같은 효과
}

const handleDownload = async () => {

    actionBtn.removeEventListener('click', handleDownload)//유저가 다운로드 버튼을 또 누르는 것을 방지
    actionBtn.innerText = 'TransCoding...'
    actionBtn.disabled = true//disabled 속성을 활성화하여 사용자가 해당 요소를 조작 못 하게 함

    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true
    })//무슨일이 벌어지는지 콘솔로 확인
    await ffmpeg.load()//사용자가 소프트웨어를 사용할 것이기 때문에 선언(js가 아닌 코드)

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile))//ffmpeg의 세계에 파일을 만듦

    await ffmpeg.run('-i', files.input, '-r', '60', 'output.mp4')//recording.webm을 output.mp4로 변환
    await ffmpeg.run('-i', files.input, '-ss', '00:00:01', '-frames:v', '1', 'thumbnail.jpg')

    const mp4File = ffmpeg.FS('readFile', files.output)//FS(파일 시스템)을 이용해서 mp4 파일을 가져왔다
    const thumbFile = ffmpeg.FS('readFile', files.thumb)

    const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' })//Blob은 배열 안에 배열들을 받을 수 있음
    const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' })

    const mp4Url = URL.createObjectURL(mp4Blob)//mp4Blob을 가르키는 url 생성
    const thumbUrl = URL.createObjectURL(thumbBlob)

    downloadFile(mp4Url, 'MyRecording.jpg')
    downloadFile(thumbUrl, 'MyThumnail.jpg')

    //속도를 위해 링크를 해제
    ffmpeg.FS('unlink', files.input)
    ffmpeg.FS('unlink', files.output)
    ffmpeg.FS('unlink', files.thumb)

    URL.revokeObjectURL(thumbUrl)
    URL.revokeObjectURL(mp4File)
    URL.revokeObjectURL(videoFile)

    actionBtn.disabled = false
    actionBtn.innerText = 'record Again'
    actionBtn.addEventListener('click', handleStart)
}

const handleStart = () => {
    actionBtn.innerText = "Recording"
    actionBtn.disabled = true
    actionBtn.removeEventListener("click", handleStart)

    recorder = new window.MediaRecorder(stream, { mimeType: 'video/mp4' }) //{mimeType: 'video/mp4'}가 필요없을 시 빼도 됨
    ondataavailable = (event) => {
        // videoFile: 녹화된 데이터를 Blob URL로 변환하여 video 요소에 적용, 브라우저 메모리에 있는 파일을 보려면 url에 접근해야 한다.
        videoFile = window.URL.createObjectURL(event.data)
        video.srcObject = null// video 요소의 srcObject 초기화, src와는 용도가 다르기 때문이다.
        video.src = videoFile// video 요소의 src에 Blob URL 설정
        video.loop = true// video를 루프 재생
        video.play()// video 재생 시작
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click", handleDownload)
    };
    recorder.start()
    setTimeout(() => {
        recorder.stop();
    }, 5000);
}

const init = async () => { //카메라에 찍힌 것을 화면에 띄워서 미리보기
    try {
        stream = await navigator.mediaDevices.getUserMedia({//1.디바이스에 액세스하고,  미디어 스트림을 가져옴
            audio: (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) ? true : false,
            video: (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) ? true : false,
        });
        video.srcObject = stream//2.srcObject에 카메라로부터 얻은 stream을 videoElemint에 담는다=>미디어 스트림을 설정하거나 변경 가능해짐
        video.play()//3.재생
    } catch (error) {
        if (error.name === "NotAllowedError") {
            alert("User denied permission for media devices");
        } else if (error.name === "NotFoundError") {
            alert("No media devices available");
        } else {
            alert("Error accessing media devices: " + error.message);
        }
    }
};

init()

actionBtn.addEventListener("click", handleStart);

*/