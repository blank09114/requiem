# Requiem

**Requiem**은 **개인 창작물을 기록하고 정리하기 위한  웹 애플리케이션**입니다. 캐릭터 프로필, 글, 이미지, 방명록 등 창작 활동 전반을 한 공간에 모아 제공합니다.

🔗 [배포 주소](https://infected-requiem.com/)


---

## 📌 프로젝트 개요
- **개발 형태**: Spring Boot 기반 웹 애플리케이션(MVC 구조)
- **개발 인원**: 1인(외주 프로젝트 - 기획, 디자인, 개발, 배포 전 과정 단독 수행)
- **프로젝트 성격**: 개인 창작물 아카이빙 & 포트폴리오 사이트
- **핵심 목표**
  - 개인 창작물(글·이미지)의 체계적 기록 및 관리
  - 관리자 전용 콘텐츠 운영 구조 설계
  - 방문자와의 가벼운 소통(방명록) 제공
  - 장기 운영을 고려한 유지보수 친화적 구조 구축

---

## 🛠️ 기술 스택
| 분야 | 사용 기술 |
|------|-----------|
| Front-end | HTML, CSS, JavaScript, Thymeleaf |
| Back-end | Java(Spring Boot) |
| Database | MySQL |
| ORM | MyBatis |
| Library | Lombok, Spring Security, TinyMCE |
| Tools | IntelliJ IDEA, VS Code |
| Deploy | 가비아 컨테이너 호스팅 |

---

## 🧩 주요 기능
- **인트로 페이지**: 연출용 상태 머신
- **메인 페이지**: TinyMCE 기반 프로필 작성 
- **게시판 시스템**: 카테고리 기반 게시글 관리, 권한별 접근 제어, 페이지네이션
- **갤러리**: 이미지 업로드 및 메타 정보 관리, 이미지 확대 모달, 권한별 접근 제어, 페이지네이션
- **방명록**: 비밀글 지원, 답변 기능, 권한별 접근 제어, 페이지네이션, 특정 사용자 차단
- **회원 시스템**: 회원가입/로그인, JWT 기반 로그인 유지(HttpOnly Cookie), 관리자/일반 사용자 권한 분기

---

## ⚙️ 기술적 구현
- **Spring MVC 아키텍처**
  - Controller/Service/Mapper 계층 분리
  - View(Thymeleaf)와 REST API 병행 구성
  - 게시판·갤러리·방명록 공통 페이징 모듈화

- **보안**
  - Spring Security 기반 인증·인가
  - JWT 토큰을 HttpOnly Cookie로 관리
  - 관리자 전용 기능 UI·API 이중 제어
  - 입력값 검증 및 XSS 방어 처리

- **데이터 관리**
  - MyBatis XML 기반 SQL 관리
  - DTO 중심 데이터 전달 구조
  - 페이지네이션 및 조건별 조회 처리

- **이미지 처리**
  - 업로드 시 서버 측 리사이징
  - 확장자/MIME 타입/용량 검증
  - 이미지 파일과 메타 데이터 분리 관리

- **프론트엔드 구조**
  - 페이지별 JavaScript 모듈 분리
  - 공통 컴포넌트(Header/Nav/Footer/Toast) 재사용
  - 권한에 따른 동적 UI 렌더링

---

## 📁 디렉터리 구조
```
infected-requiem/
├── src/main/
│   ├── java/com/infected_requiem/requiem/
│   │   ├── api/ # REST API
│   │   ├── controller/ # Thymeleaf View 렌더링용 MVC Controller
│   │   ├── service/ # 비즈니스 로직
│   │   ├── repository/ # MyBatis Mapper Interface
│   │   ├── dto/ # 계층 간 데이터 전달용 DTO
│   │   ├── config/ # Security, JWT, Web 설정
│   │   └── RequiemApplication.java # 실행 파일 
│   └── resources/
│       ├── templates/ # Thymeleaf 템플릿
│       ├── static/ # 정적 리소스
│       │   ├── css/ # 스타일
│       │   ├── js/ # JS 모듈
│       │   └── file/ # 이미지, 음악 리소스
│       └── mapper/ # MyBatis XML
└── build.gradle
