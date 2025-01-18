const canvas = document.getElementById("guestbookCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tooltip = document.getElementById("tooltip");
const balls = []; // 공(원) 객체 배열

// 랜덤 색상 생성 함수
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 방명록 데이터를 기반으로 공(원) 객체 생성 함수
function createBall(name, value, reason, image) {
  // 이미 존재하는 공인지 확인
  const existingBall = balls.find(ball => 
    ball.name === name && 
    ball.value === value && 
    ball.reason === reason
  );

  if (existingBall) {
    console.log('이미 존재하는 공입니다');
    return;
  }

  // 공의 크기 설정: 공의 개수에 따라 크기 조절
  const totalBalls = balls.length + 1; // 방금 추가한 공까지 포함한 개수
  let radius = 60;

  // 공의 개수에 따라 크기 변경
  const baseRadius = 60; // 기본 반지름 크기
  const decreaseAmount = 5; // 감소량
  const ballsPerDecrease = 10; // 10개마다 감소
  
  // 현재 공의 개수에 따라 감소할 크기 계산
  const decreaseCount = Math.floor(totalBalls / ballsPerDecrease);
  radius = Math.max(baseRadius - (decreaseCount * decreaseAmount), 20); // 최소 크기는 20으로 제한

  // 벽과의 여유 공간을 확보하여 시작 위치 설정
  const padding = radius + 10;
  const ball = {
    x: padding + Math.random() * (canvas.width - padding * 2),
    y: padding + Math.random() * (canvas.height - padding * 2),
    radius: radius,
    color: getRandomColor(),
    dx: (Math.random() - 0.5) * 4, // -2 ~ 2 사이의 속도
    dy: (Math.random() - 0.5) * 4,
    image: image,
    name: name,
    value: value,
    reason: reason,
    imgLoaded: false,
    img: new Image()
  };

  ball.img.onload = () => {
    ball.imgLoaded = true;
  };
  ball.img.src = image;

  balls.push(ball);  // 공 추가
}

// 방명록 데이터 처리를 위한 클래스 생성
class GuestbookManager {
  constructor() {
    this.guestbook = [];
    this.maxEntries = 100; // 최대 저장 가능한 엔트리 수
    this.loadFromLocalStorage();
    this.modal = document.getElementById('guestbookModal');
    this.setupEventListeners();
    this.initCamera();
  }

  // 이미지 압축 함수 추가
  async compressImage(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 이미지 크기 축소
        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // 압축된 이미지 품질 조정 (0.5는 50% 품질)
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = imageDataUrl;
    });
  }

  async addGuestbookData(name, value, reason, image) {
    try {
      // 유효한 데이터인지 확인
      if (!name || !value || !reason) {
        console.error('유효하지 않은 데이터입니다');
        return;
      }

      // 이미지 압축
      const compressedImage = await this.compressImage(image);

      const newEntry = {
        name,
        value,
        reason,
        image: compressedImage,
        timestamp: Date.now() // 타임스탬프 추가
      };

      // 최대 엔트리 수를 초과하는 경우 가장 오래된 항목 제거
      if (this.guestbook.length >= this.maxEntries) {
        this.guestbook.sort((a, b) => b.timestamp - a.timestamp); // 최신순 정렬
        this.guestbook = this.guestbook.slice(0, this.maxEntries - 1); // 가장 오래된 항목 제거
      }

      this.guestbook.push(newEntry);
      
      try {
        // localStorage 저장 시도
        localStorage.setItem('guestbook', JSON.stringify(this.guestbook));
        createBall(name, value, reason, newEntry.image);
      } catch (storageError) {
        // localStorage 저장 실패 시 더 오래된 항목들을 제거하고 재시도
        console.warn('Storage 저장 실패, 오래된 항목 제거 후 재시도');
        while (this.guestbook.length > 5 && storageError instanceof QuotaExceededError) {
          this.guestbook.shift(); // 가장 오래된 항목 제거
          try {
            localStorage.setItem('guestbook', JSON.stringify(this.guestbook));
            break;
          } catch (e) {
            if (this.guestbook.length <= 5) {
              throw new Error('최소 데이터도 저장할 수 없습니다');
            }
          }
        }
        // 새 항목 다시 추가
        this.guestbook.push(newEntry);
        localStorage.setItem('guestbook', JSON.stringify(this.guestbook));
        createBall(name, value, reason, newEntry.image);
      }
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      alert('방명록 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('guestbook');
      if (savedData) {
        this.guestbook = JSON.parse(savedData);
        // 모든 저장된 데이터로 공 생성
        this.guestbook.forEach(entry => {
          if (entry && entry.name && entry.value && entry.reason) {
            createBall(
              entry.name,
              entry.value,
              entry.reason,
              entry.image
            );
          }
        });
      }
    } catch (error) {
      console.error('localStorage 로드 중 오류 발생:', error);
      this.guestbook = [];
    }
  }

  setupEventListeners() {
    // 모달 열기 (팝업 창 대신 모달 표시)
    document.getElementById('guestbookButton').addEventListener('click', () => {
      this.modal.style.display = 'flex';
      // 웹캠 재시작 (모달이 열릴 때마다)
      this.initCamera();
    });

    // 모달 닫기
    document.getElementById('closeModal').addEventListener('click', () => {
      this.modal.style.display = 'none';
      // 웹캠 스트림 정지
      const videoElement = document.getElementById('video');
      if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    });

    // 배경 클릭시 모달 닫기
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.modal.style.display = 'none';
        // 웹캠 스트림 정지
        const videoElement = document.getElementById('video');
        if (videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    });

    // ESC 키로 모달 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.modal.style.display = 'none';
        // 웹캠 스트림 정지
        const videoElement = document.getElementById('video');
        if (videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    });

    // 사진 찍기
    document.getElementById('captureButton').addEventListener('click', () => {
      const videoElement = document.getElementById('video');
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');
      const controls = document.getElementById('controls');
    
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
      // 사진 미리보기 표시
      videoElement.style.display = 'none';
      canvas.style.display = 'block';
      controls.style.display = 'flex'; // 버튼 컨트롤 표시
    });
    
    document.getElementById('retakeButton').addEventListener('click', () => {
      const videoElement = document.getElementById('video');
      const canvas = document.getElementById('canvas');
      const controls = document.getElementById('controls');
    
      // 재촬영 모드로 전환
      canvas.style.display = 'none';
      videoElement.style.display = 'block';
      controls.style.display = 'none';
    });
    
    document.getElementById('okButton').addEventListener('click', () => {
      const canvas = document.getElementById('canvas');
      const image = canvas.toDataURL('image/png');
      
      alert('이미지가 저장되었습니다!');
      console.log('이미지 데이터:', image);
    
      // 재촬영과 같은 초기화
      const videoElement = document.getElementById('video');
      canvas.style.display = 'none';
      videoElement.style.display = 'block';
      document.getElementById('controls').style.display = 'none';
    });
    
    // 카메라 초기화
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
    
        // 비디오가 로드되면 재생 시작
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
      } catch (err) {
        alert('웹캠을 사용할 수 없습니다: ' + err.message);
      }
    }
    
    // 초기 설정
    document.addEventListener('DOMContentLoaded', () => {
      initCamera();
    });

    // 폼 제출
    document.getElementById('guestbookForm').addEventListener('submit', (event) => {
      event.preventDefault();
      
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');
      
      // 캔버스가 비어있는지 확인 (사진을 찍었는지 확인)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const hasImage = imageData.data.some(pixel => pixel !== 0);
      
      if (!hasImage) {
        alert('사진을 먼저 촬영해주세요!');
        return;
      }

      const name = document.getElementById('name').value;
      const value = document.getElementById('value').value;
      const reason = document.getElementById('reason').value;
      const image = canvas.toDataURL('image/png');

      this.addGuestbookData(name, value, reason, image);
      
      // 폼 초기화 및 모달 닫기
      event.target.reset();
      this.modal.style.display = 'none';
      
      // 웹캠 스트림 정지
      const videoElement = document.getElementById('video');
      if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    });
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.getElementById('video');
      videoElement.srcObject = stream;
      // 비디오가 로드되면 재생 시작
      videoElement.onloadedmetadata = () => {
        videoElement.play();
      };
    } catch (err) {
      alert('웹캠을 사용할 수 없습니다: ' + err.message);
    }
  }
}

// GuestbookManager 인스턴스 생성
const guestbookManager = new GuestbookManager();

// HTML에 팝업 요소 추가
document.body.insertAdjacentHTML('beforeend', `
  <div class="popup-overlay"></div>
  <div class="detail-popup">
    <button class="close-button">&times;</button>
    <img id="popup-image" src="" alt="방명록 이미지">
    <h2 id="popup-name"></h2>
    <p id="popup-value"></p>
    <p id="popup-reason"></p>
  </div>
`)

// 팝업 관련 변수
const detailPopup = document.querySelector('.detail-popup')
const popupOverlay = document.querySelector('.popup-overlay')
const closeButton = document.querySelector('.close-button')

// 팝업 닫기 함수
function closePopup() {
  detailPopup.style.display = 'none'
  popupOverlay.style.display = 'none'
}

// 팝업 이벤트 리스너
closeButton.addEventListener('click', closePopup)
popupOverlay.addEventListener('click', closePopup)

// 캔버스 클릭 이벤트
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  balls.forEach((ball) => {
    const distance = Math.sqrt(
      (mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2
    )
    if (distance < ball.radius) {
      // 팝업에 데이터 설정
      document.getElementById('popup-image').src = ball.image
      document.getElementById('popup-name').textContent = ball.name
      document.getElementById('popup-value').textContent = `가치관: ${ball.value}`
      document.getElementById('popup-reason').textContent = `이유: ${ball.reason}`
      
      // 팝업 표시
      detailPopup.style.display = 'block'
      popupOverlay.style.display = 'block'
    }
  })
})

// 호버 효과 개선
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  let found = false

  balls.forEach((ball) => {
    const distance = Math.sqrt(
      (mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2
    )
    if (distance < ball.radius) {
      tooltip.style.left = `${e.clientX + 10}px`
      tooltip.style.top = `${e.clientY + 10}px`
      tooltip.innerHTML = `<strong>${ball.name}</strong><br>가치관: ${ball.value}<br>이유: ${ball.reason}`
      tooltip.style.display = 'block'
      found = true
      
      // 호버된 공을 약간 확대
      ball.isHovered = true
    } else {
      ball.isHovered = false
    }
  })

  if (!found) {
    tooltip.style.display = 'none'
  }
})

// 공 그리기 함수 수정
function drawBall(ball) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  
  // 호버 효과
  const radius = ball.isHovered ? ball.radius * 1.03 : ball.radius
  
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
  ctx.clip()

  if (ball.imgLoaded) {
    ctx.drawImage(
      ball.img,
      ball.x - radius,
      ball.y - radius,
      radius * 2,
      radius * 2
    )
  } else {
    ctx.fillStyle = ball.color
    ctx.fill()
  }

  ctx.restore()
}

// 공 위치 업데이트 함수 수정 (부드러운 이동을 위해)
function updateBall(ball) {
  // 이전 위치 저장
  ball.prevX = ball.x
  ball.prevY = ball.y
  
  // 위치 업데이트
  ball.x += ball.dx
  ball.y += ball.dy

  // 버튼 요소의 위치와 크기 가져오기
  const button = document.getElementById('guestbookButton');
  const buttonRect = button.getBoundingClientRect();
  const padding = 10; // 충돌 영역을 줄이기 위한 여백

  // 공과 버튼의 충돌 감지 (여백을 적용한 더 작은 영역)
  if (ball.x + ball.radius > buttonRect.left + padding && 
      ball.x - ball.radius < buttonRect.right - padding && 
      ball.y + ball.radius > buttonRect.top + padding && 
      ball.y - ball.radius < buttonRect.bottom - padding) {
    
    // 충돌 방향에 따라 반사 및 위치 조정
    const leftDist = Math.abs(ball.x - (buttonRect.left + padding));
    const rightDist = Math.abs(ball.x - (buttonRect.right - padding));
    const topDist = Math.abs(ball.y - (buttonRect.top + padding));
    const bottomDist = Math.abs(ball.y - (buttonRect.bottom - padding));
    
    // 가장 가까운 면을 찾아 그 방향으로 공을 밀어냄
    const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
    
    if (minDist === leftDist) {
      ball.x = buttonRect.left + padding - ball.radius - 1;
      ball.dx = -Math.abs(ball.dx); // 왼쪽으로 강제 이동
    } else if (minDist === rightDist) {
      ball.x = buttonRect.right - padding + ball.radius + 1;
      ball.dx = Math.abs(ball.dx); // 오른쪽으로 강제 이동
    } else if (minDist === topDist) {
      ball.y = buttonRect.top + padding - ball.radius - 1;
      ball.dy = -Math.abs(ball.dy); // 위쪽으로 강제 이동
    } else if (minDist === bottomDist) {
      ball.y = buttonRect.bottom - padding + ball.radius + 1;
      ball.dy = Math.abs(ball.dy); // 아래쪽으로 강제 이동
    }
  }

  // 벽에 부딪히면 방향 반대로 변경 및 위치 조정
  if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx *= -1;
  } else if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx *= -1;
  }
  
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.dy *= -1;
  } else if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy *= -1;
  }
}

// 애니메이션 함수 수정
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  balls.forEach((ball) => {
    // 공의 위치 업데이트
    updateBall(ball)
    
    // 부드러운 이동을 위한 보간
    if (ball.prevX !== undefined) {
      ball.renderX = ball.prevX + (ball.x - ball.prevX) * 0.1
      ball.renderY = ball.prevY + (ball.y - ball.prevY) * 0.1
    } else {
      ball.renderX = ball.x
      ball.renderY = ball.y
    }

    // 렌더링 위치 사용
    const tempX = ball.x
    const tempY = ball.y
    ball.x = ball.renderX
    ball.y = ball.renderY
    
    drawBall(ball)
    
    // 원래 위치 복원
    ball.x = tempX
    ball.y = tempY
  })

  requestAnimationFrame(animate)
}

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// 애니메이션 시작
animate();