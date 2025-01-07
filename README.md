# Expanded-winter-project
- ## 이 프로젝트에서 배울 수 있는 것들!!(아마 가장 중요...)
  - 개발환경 셋팅하기(Vite)
  - GitHub를 통해 팀원들과 협업하기
  - 기초적인 HTML, CSS, Vanila JavaScript로 개발하기
  - 프론트에서 Database 다뤄보기
    - SQL문법으로 CRUD(Create, Read, Update, Delete) 기능을 다뤄볼 것 같아요
  - node의 npm으로 라이브러리 설치 및 활용하기
  - 개발한 웹 사이트 배포해보기(Deploy)
  - 혼자서도 웹 개발 할 수 있다!!!(웹은 짱임)
- ### 개발환경: VScode, Vite(프론트엔드 개발 툴로 React 프레임워크에서 주로 쓰지만 셋팅하기 귀찮아서 요거 썼습니다...)
- ### 기술스택: HTML, CSS, Vanila JavaScript
  - (Vanila JavaScript: React, Vue, Angular 같은 프레임워크가 아닌 우리가 아는 일반적인 JavaScript를 Vanila JavaScript)
- ### 라이브러리: 미정, 고려중인 것: 재미있는 인터랙션이나 애니메이션 효과를 위해 사용할 수 있는 것들(p5.js, pixi.js, rapier.js, GSAP...)
- ### 데이터베이스: 미정 supabase 고민중... 백엔드 서버를 만들지 않고 무료로 사용할 수 있음(이외에도 MongoDB, MySQL, PostgressSQL 등등등)
- ### 배포(Deploy): Vercel 플랫폼에서 배포할 예정(무료 호스팅 사이트로 이외에도 netlify가 있습니다)
- ### 협업방식: GitHub를 통해 협업
  - #### 먼저 코드를 clone하기
    ```bash
    git clone
    ```
  - #### 이후 개발할 때 코드를 수정했다면 commit을 통해 개발진행
    ```bash
    git add .
    git commit -m "Example: 기능 구현이나 스타일 수정 등 작업한 내용 적기"
    git push origin main
    ```
  - #### 위 명령어로 커밋을 작성해서 날리기
  - #### 팀원들의 수정 사항을 본인의 컴퓨터(로컬환경)에서 확인하려면 아래 명령어를 실행
    ```bash
    git pull origin main
    ```
- ### 코드를 실행하는 방법
  - 컴퓨터의 Node.js가 설치되어 있지 않으면 우선 Node.js 먼저 설치하기!
  - 아래 명령어를 터미널에 입력해서 코드를 실행
    - npm install은 개발에서 사용할 라이브러리를 설치하는 명령어로 초기에 한번만 설치해주면 됩니다
    - 라이브러리를 npm install을 통해 설치하게 되면 node_modules 폴더와 package-lock.json을 생성함(만약에 이 폴더와 파일들이 갑자기 안보인다면 npm install을 다시 하기!)
    ```bash
    npm install
    npm run dev
    ```
    - 사용하는 라이브러리나 프로젝트 관련 정보들은 package.json 파일에 작성되어 있음
    - 아래 링크에서 package.json과 NPM에 대한 설명을 확인할 수 있습니다
      - https://hoya-kim.github.io/2021/09/14/package-json/
  - 만약 실행되지 않는다면 본인의 터미널 디렉터리가 Expanded-winter-project에 있는지 확인!
  - 없다면 cd 명령어나 VScode에서 폴더를 우클릭하여 Open in Intergreted Terminal 클릭으로 터미널 열기
 
- ### 개발환경 셋팅 방법
  - 혹시나 나중에 개발환경 설정하게 될 경우 참고하시면 좋을 것 같아요
  - Vanila JavaScript를 사용하시는 경우 일반적으로 그냥 index.html, style.css, script.js를 생성해서 코드를 적은 후 VScode내에 Live Server를 통해 실행해도 됩니다
  - 한번에 편하게 설정하려면 빈 폴더에 터미널을 열고 아래 명령어를 통해 셋팅 가능
    ```bash
    npx create-vite@latest
    ```
    위 명령어를 실행하게 되면 기본적인 HTML, CSS, JS 파일을 Vite 환경에서 돌아가도록 설정해줍니다
    파일을 설치되었다면 생성된 폴더 디렉토리로 이동하여 똑같이 필요한 라이브러리를 설치하고 실행하면 됩니다
    ```bash
    cd 폴더명
    npm install
    npm run dev
    ```
  - 이것외에도 npm init을 통해 수동으로 하나씩 설정하는 방법도 있습니다
  - 아래 문서 참고
      - https://velog.io/@jykim29/Vite-%EA%B8%B0%EB%B0%98%EC%9D%98-%EB%B0%94%EB%8B%90%EB%9D%BCjs-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0
      - https://vite.dev/guide/
- ### 폴더 및 파일 설명
  - src 폴더: CSS, JS 같이 우리가 작성하는 코드들이 들어가는 폴더
  - public 폴더: 이미지나 영상 등 코드에 필요한 에셋들을 모아놓는 폴더
  - node_moudles: 그냥 라이브러리 저장소(수정하거나 열어볼 일이 없음!)
  - .gitignore 파일: GitHub에 코드를 업로드할 때 올라가면 안되는 파일(.env처럼 비밀키값들을 저장하는 파일) or 굳이 업로드 하지 않아도 되는 파일(node_modules, 대용량 에셋)을 GitHub에 올라가지 않도록 막아주는 파일
    - 수정하면 안돼요!!
  - README.md: 마크다운 형식의 파일(지금 보고있는 이 문서입니다)
  - package.json: 사용하는 라이브러리, 라이센스, 버전, 저자 등을 작성하는 파일(수정x)
# 기타(추후에 추가할 예정)
     
    
 


