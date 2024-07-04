# **프로젝트 소개**

기본적인 게시판의 형태를 띄고 있는 커뮤니티 프로젝트로 기술간의 장단점을 체감하기 위해 버전에 따라 다른 기술로 구현

-   ver1 : `vanila` `express` `json`
    -   [🔗FE Github](https://github.com/jjikky/5-jikky-kim-vanila-fe)
    -   [🔗BE Github](https://github.com/jjikky/5-jikky-kim-express-be/tree/json-archive)
-   ver2 : `react` `express` `mySQL`

    -   [🔗FE Github](https://github.com/jjikky/5-jikky-kim-react-fe)
    -   [🔗BE Github](https://github.com/jjikky/5-jikky-kim-react-fe/tree/with-express)

-   ver3 : `react` `spring` `mySQL`
    -   개발 진행 중

# 커뮤니티 게시판 ver 1

## 프로젝트 기간

2024.04.05 ~ 2024.04.28 ( 16 영업일 )

## GitHub

[🔗FE : vanila JS](https://github.com/jjikky/5-jikky-kim-vanila-fe) [🔗BE : Express](https://github.com/jjikky/5-jikky-kim-express-be/tree/json-archive)

## 사용 기술

`express` `html/css` `javascript`

## 주요 기능

-   로그인, 회원가입, 자동 로그인
    -   main branch는 cookie-session방식 / archive-jwt branch는 jwt방식
-   게시글 댓글 CRUD, 이미지 업로드, 무한스크롤, 토스트메세지
-   회원 닉네임, 비밀번호 변경, 회원탈퇴
-   DB 대신 BE서버에 json 파일로 데이터를 저장

## 개발 내용

**FE**

-   무한 스크롤 구현
-   로딩, 토스트 메세지 구현
-   `preload` 방식의 font import로 지연 시간 없이 웹폰트 서빙
    -   좋은 사용자 경험을 위해 브라우저가 최대한 빨리 폰트를 가져올 수 있게 함
-   웹 콘텐츠 접근성 지침에 따른 대체 텍스트(`Alt`값) 제공, `label` 태그를 활용 하고, 웹 콘텐츠 접근성 지침을 이해하기 위해 노력
-   디바운싱을 활용하여 불필요한 요청을 최대한 제거하여 서버 부담 감소

**BE**

-   route - controller - model 구조를 이용해 서버 구현
-   custom error 클래스를 작성하여 error response 핸들링
-   STATUS CODE, HTTP METHOD, 응답 형식, URL NAMING등 REST 하게 구현

## 인증 구현

### JWT

FE BE 모두 JWT방식은 jwt-archive 브랜치로 분기했습니다.
로그인시 token을 발급하여 클라이언트의 localStorage에 저장 후, 필요시마다 요청 헤더에 Authorization: Bearer <credentials> 형식으로 담는 방식으로 구현 했습니다.

### Cookie & Session

**회원가입**

-   bcrypt로 비밀번호 암호화하는 방식으로 변경
-   로그인시 `bcrypt.compare` 메서드로 비밀번호 검증

**로그인**

-   http only 쿠키를 사용해 구현
-   로그인시 쿠키 발급, 세션에 사용자 아이디의 키 값 저장
-   req.user 객체 등록

**인증**

-   매 요청마다 passport.session() 미들웨어가 passport.deserializeUser() 메서드를 호출하며 사용자 정보를 req.user객체에 저장

그 외

-   인증이 필요한 라우터에 유저 검증 미들웨어를 앞에 배치해서 guard
-   자동로그인 구현

## 구현 결과

https://github.com/jjikky/5-jikky-kim-vanila-fe/assets/59151187/562da72f-46c7-4b6f-916f-7344027848ee

## 회고 및 개발 일지

-   [🔗3주차 회고](https://velog.io/@jikky/%EC%B9%B4%EC%B9%B4%EC%98%A4-%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C-%EC%8A%A4%EC%BF%A8-3%EC%A3%BC%EC%B0%A8-%ED%9A%8C%EA%B3%A0)
-   [🔗2주차 회고](https://velog.io/@jikky/%EC%B9%B4%EC%B9%B4%EC%98%A4-%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C-%EC%8A%A4%EC%BF%A8-2%EC%A3%BC%EC%B0%A8-%ED%9A%8C%EA%B3%A0)
-   [🔗1주차 회고](https://velog.io/@jikky/%EC%B9%B4%EC%B9%B4%EC%98%A4-%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C-%EC%8A%A4%EC%BF%A8-1%EC%A3%BC%EC%B0%A8-%ED%9A%8C%EA%B3%A0)
-   [🔗2024-04-26 : 쿠키 & 세션 구현](https://github.com/jjikky/jikky-til/blob/main/Apr/2024-04-26.md)
-   [🔗2024-04-25 : 디바운싱 / jwt 저장 시나리](https://github.com/jjikky/jikky-til/blob/main/Apr/2024-04-25.md)
-   [🔗2024-04-24 : FE JWT처리와 FE 리팩토링](https://github.com/jjikky/jikky-til/blob/main/Apr/2024-04-24.md)
-   [🔗2024-04-23 : 화살표 함수 인자 전달 방식](https://github.com/jjikky/jikky-til/blob/main/Apr/2024-04-23.md)
