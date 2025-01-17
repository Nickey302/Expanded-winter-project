// 캔버스 설정
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
  const ball = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 100,
    color: getRandomColor(),
    dx: Math.random() * 4 + 1, // x축 속도
    dy: Math.random() * 4 + 1, // y축 속도
    image: image,
    name: name,
    value: value,
    reason: reason,
    imgLoaded: false,
    img: new Image(),
  };

  ball.img.src = image;
  ball.img.onload = () => {
    ball.imgLoaded = true;
  };
  balls.push(ball);
}

// LocalStorage에서 데이터 불러오기
const guestbook = JSON.parse(localStorage.getItem("guestbook")) || [];
guestbook.forEach((entry) => {
  createBall(entry.name, entry.value, entry.reason, entry.image);
});

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

// 방명록 버튼 이벤트 리스너 추가
document.getElementById('guestbookButton').addEventListener('click', () => {
  const popupUrl = 'src/guestbook/guestbook.html'
  window.open(
    popupUrl,
    '방명록 작성',
    'width=600,height=400,scrollbars=no,resizable=no'
  )
})

// 팝업 창에서 전달받은 데이터를 LocalStorage에 저장하고 화면에 즉시 반영하는 함수
function addGuestbookData(name, value, reason, image) {
  // 새로운 데이터 추가
  const newEntry = { name, value, reason, image };
  guestbook.push(newEntry);
  localStorage.setItem("guestbook", JSON.stringify(guestbook));

  // 공(원) 생성 및 애니메이션에 추가
  createBall(name, value, reason, image);
}