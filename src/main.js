import RAPIER from '@dimforge/rapier2d'

<<<<<<< HEAD
async function init() {
  //
  // [1] Rapier 공식 예시 스니펫 (동적 임포트 + 기본 월드 구성 샘플)
  //
  console.log("[Rapier] 라이브러리 로드 완료!");

  // 중력: -9.81(m/s^2) 아래로
  let gravity = { x: 0.0, y: -9.81 };
  // Rapier 월드 생성
  let world = new RAPIER.World(gravity);
=======
document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`


>>>>>>> 7e003ac002f554c2f44fd46e1c0b17bfe3aad0b1

  // 땅(ground)으로 쓸 콜라이더(아주 얇은 직사각형)
  let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1)
    .setTranslation(0, -0.5); // 월드 좌표 Y=-0.5 부근에 생성
  world.createCollider(groundColliderDesc);

  // 테스트용 동적 바디(박스)
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 1.0);
  let rigidBody = world.createRigidBody(rigidBodyDesc);
  let colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5);
  let boxCollider = world.createCollider(colliderDesc, rigidBody);

  console.log("[Rapier] 샘플 박스, ground 생성 완료.");

  //
  // [2] Canvas / Button / 2D 렌더링 및 충돌 데모
  //
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  // 화면 크기
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // -- 가운데 직사각형(고정 바디) --
  let centerBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(WIDTH / 2, HEIGHT / 2);
  let centerBody = world.createRigidBody(centerBodyDesc);
  // 폭 150, 높이 50
  let centerColliderDesc = RAPIER.ColliderDesc.cuboid(75, 25)
    .setRestitution(1.0);
  world.createCollider(centerColliderDesc, centerBody);

  // -- 화면 밖 경계(위, 아래, 왼, 오른쪽) --
  // 상단벽
  let topBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(WIDTH / 2, -10)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(WIDTH / 2, 10).setRestitution(1.0),
    topBody
  );
  // 하단벽
  let bottomBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(WIDTH / 2, HEIGHT + 10)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(WIDTH / 2, 10).setRestitution(1.0),
    bottomBody
  );
  // 왼쪽벽
  let leftBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(-10, HEIGHT / 2)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(10, HEIGHT / 2).setRestitution(1.0),
    leftBody
  );
  // 오른쪽벽
  let rightBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(WIDTH + 10, HEIGHT / 2)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(10, HEIGHT / 2).setRestitution(1.0),
    rightBody
  );

  // 원(방명록) 정보 배열
  const circles = [];

  // '추가하기' 버튼 클릭 시 -> 새 원 생성
  document.getElementById('addBtn').addEventListener('click', () => {
    // 원의 초기 위치 (화면 안 임의)
    const x = Math.random() * (WIDTH - 60) + 30;
    const y = Math.random() * (HEIGHT - 60) + 30;

    // 초기 속도 (랜덤 방향)
    const angle = Math.random() * Math.PI * 2;
    const speed = 150;
    const vx = speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);

    // 동적 바디 생성
    let circleBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setLinvel(vx, vy); // 선형 속도
    let circleBody = world.createRigidBody(circleBodyDesc);

    // 콜라이더(원의 반지름=20), 원끼리 반발=0
    const radius = 20;
    let circleColliderDesc = RAPIER.ColliderDesc.ball(radius)
      .setRestitution(0.0)
      .setFriction(0.0);
    world.createCollider(circleColliderDesc, circleBody);

    circles.push({
      body: circleBody,
      radius: radius
    });
  });

  // 물리 루프 + 캔버스 렌더링
  function animate() {
    // 1) 물리 엔진 step
    // (두 번째 매개변수는 시간 간격(초 단위), 여기서는 대충 1/60초 가정)
    world.step();

    // 2) 캔버스 초기화
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // (샘플 박스) 위치 확인 & 그리기
    //  - Rapier 공식 샘플에서 만든 박스 rigidBody
    let boxPos = rigidBody.translation();
    let boxAngle = rigidBody.rotation(); // 라디안
    // 간단히 사각형 그려보기
    ctx.save();
    ctx.translate(boxPos.x, HEIGHT - boxPos.y);
    // ↑ 이 부분은 y축이 위로 증가하는 Rapier와, 캔버스가 아래로 증가하는 차이 맞추려면 필요
    // (데모 성격이므로, 실제로는 좌표계를 통일하거나 더 세밀한 매핑 필요)
    ctx.rotate(-boxAngle);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-25, -25, 50, 50); // 0.5×0.5 크기를 px로 단순 매핑(여기도 스케일 조정 필요)
    ctx.restore();

    // 가운데 직사각형 시각화
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(WIDTH / 2 - 75, HEIGHT / 2 - 25, 150, 50);

    // -- 원끼리 겹치면 단색(red) 표시를 위한 세팅 --
    const overlappingSet = new Set();
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const c1 = circles[i];
        const c2 = circles[j];
        const pos1 = c1.body.translation();
        const pos2 = c2.body.translation();
        // 라피어 좌표: (pos1.x, pos1.y)  (여기선 y축 ↑이 양수)
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (c1.radius + c2.radius)) {
          overlappingSet.add(i);
          overlappingSet.add(j);
        }
      }
    }

    // -- 원들 그리기 --
    circles.forEach((circle, index) => {
      const pos = circle.body.translation();
      ctx.beginPath();
      // y축 반전이 필요하면 (HEIGHT - pos.y) 사용
      ctx.arc(pos.x, pos.y, circle.radius, 0, 2 * Math.PI);

      if (overlappingSet.has(index)) {
        ctx.fillStyle = 'red';
      } else {
        ctx.fillStyle = 'black';
      }
      ctx.fill();
    });

    // 콘솔에 박스 위치 로그 (샘플)
    // console.log("Rigid-body position: ", boxPos.x.toFixed(2), boxPos.y.toFixed(2));

    // 3) 다음 프레임 요청
    requestAnimationFrame(animate);
  }

  // 루프 시작
  animate();
};

init()