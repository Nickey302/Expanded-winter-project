// 웹캠 스트림을 연결하는 함수
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        })
        const videoElement = document.getElementById('video')
        videoElement.srcObject = stream
    } catch (err) {
        alert('웹캠을 사용할 수 없습니다: ' + err.message)
    }
}

// 사진 찍기 기능
document.getElementById('captureButton').addEventListener('click', () => {
    const videoElement = document.getElementById('video')
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')

    // 비디오의 크기를 캔버스에 맞추기
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    // 비디오에서 현재 프레임을 캔버스에 그리기
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    // 캔버스를 이미지로 변환하여 base64로 저장
    const imageData = canvas.toDataURL('image/png')
    alert('사진이 찍혔습니다!')
})

// 폼 제출 함수
function submitForm() {
    const name = document.getElementById('name').value
    const value = document.getElementById('value').value
    const reason = document.getElementById('reason').value
    const canvas = document.getElementById('canvas')
    const image = canvas.toDataURL('image/png') // 이미지 데이터 얻기

    // 부모 창에 데이터 전달
    if (window.opener && window.opener.addGuestbookData) {
        window.opener.addGuestbookData(name, value, reason, image)
    }
    window.close() // 팝업을 닫음
}

// 웹캠 초기화
initCamera()