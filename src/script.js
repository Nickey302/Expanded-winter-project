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
  let radius = 100;

  // 공이 10개마다 크기 변경
  if (totalBalls > 2) {
    radius = 10;
  }
  if (totalBalls > 3) {
    radius = 50;
  }
  if (totalBalls > 5) {
    radius = 30;
  }
  if (totalBalls > 7) {
    radius = 150;
  }
  if (totalBalls > 9) {
    radius = 50;
  }
  if (totalBalls > 11) {
    radius = 40;
  }

  const ball = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: radius,
    color: getRandomColor(),
    dx: Math.random() * 4 + 1,
    dy: Math.random() * 4 + 1,
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
    this.loadFromLocalStorage();
    this.modal = document.getElementById('guestbookModal');
    this.setupEventListeners();
    this.initCamera();
  }

  loadFromLocalStorage() {
    try {
      // localStorage에서 데이터 로드
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
              entry.image // 빈 이미지에 대한 기본값
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

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      alert('사진이 찍혔습니다!');
    });

    // 폼 제출
    document.getElementById('guestbookForm').addEventListener('submit', (event) => {
      event.preventDefault();
      
      const name = document.getElementById('name').value;
      const value = document.getElementById('value').value;
      const reason = document.getElementById('reason').value;
      const canvas = document.getElementById('canvas');
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

  addGuestbookData(name, value, reason, image) {
    // 유효한 데이터인지 확인
    if (!name || !value || !reason) {
      console.error('유효하지 않은 데이터입니다');
      return;
    }

    const newEntry = {
      name,
      value,
      reason,
      image: image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    };

    this.guestbook.push(newEntry);
    
    try {
      localStorage.setItem('guestbook', JSON.stringify(this.guestbook));
      createBall(name, value, reason, newEntry.image);
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  }
}

// GuestbookManager 인스턴스 생성
const guestbookManager = new GuestbookManager();

// 공(원) 그리기 함수
function drawBall(ball) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter"; // 겹치는 부분을 밝게 합성
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.clip();

  if (ball.imgLoaded) {
    ctx.drawImage(
      ball.img,
      ball.x - ball.radius,
      ball.y - ball.radius,
      ball.radius * 2,
      ball.radius * 2
    );
  } else {
    ctx.fillStyle = ball.color;
    ctx.fill();
  }

  ctx.restore();
}

// 공(원) 위치 업데이트 함수
function updateBall(ball) {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // 벽에 부딪히면 방향 반대로 변경
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
}

// 마우스 위치에 따른 툴팁 표시
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  let found = false;

  balls.forEach((ball) => {
    const distance = Math.sqrt(
      (mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2
    );
    if (distance < ball.radius) {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.innerHTML = `<strong>${ball.name}</strong><br>가치관: ${ball.value}<br>이유: ${ball.reason}`;
      tooltip.style.display = "block";
      found = true;
    }
  });

  if (!found) {
    tooltip.style.display = "none";
  }
});

// 애니메이션 함수
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    drawBall(ball);
    updateBall(ball);
  });

  requestAnimationFrame(animate);
}

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// 애니메이션 시작
animate();
