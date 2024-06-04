# **프로젝트 소개 및 Github**

기본적인 게시판의 형태를 띄고 있는 커뮤니티 프로젝트로 기술간의 장단점을 체감하기 위해 버전에 따라 다른 기술로 구현

-   ver1
    -   ver1.1 : `vanila` `express` `json`
        -   FE : https://github.com/jjikky/5-jikky-kim-vanila-fe
        -   BE : https://github.com/jjikky/5-jikky-kim-express-be/tree/json-archive
    -   ver1.2 : `jwt / cookie&session` 두가지 방식의 인증 인가 추가 ( 브랜치로 분기 )
        -   `cookie&session`
            -   FE : https://github.com/jjikky/5-jikky-kim-vanila-fe
            -   BE : https://github.com/jjikky/5-jikky-kim-express-be/tree/json-archive
        -   `jwt`
            -   FE : https://github.com/jjikky/5-jikky-kim-vanila-fe/tree/jwt-archive
            -   BE : https://github.com/jjikky/5-jikky-kim-express-be/tree/jwt-archive
-   ver2
    -   ver2.1 : `react` `express` `json`
        -   FE를 react로 변경 : https://github.com/jjikky/5-jikky-kim-react-fe/tree/json-archive
    -   ver2.2 : `react` `express` `mySQL`
        -   데이터 저장소 json → mySQL 변경
        -   FE : https://github.com/jjikky/5-jikky-kim-react-fe/tree/main
        -   BE : https://github.com/jjikky/5-jikky-kim-express-be/tree/main
            -   Service Layer Architecture로 변경
-   ver3 : `react` `spring` `mySQL`
    -   현재 개발 중

# 커뮤니티 게시판 ver 2.2

react + express + mySQL

## 프로젝트 기간

-   ver 2.2 : 2024.05.31 ~ 2024.06.03 ( 2영업일 )

## 사용 기술

`Express` `html/css` `javascript` `React` `mySQL`

## 개발 내용

**BE**

-   json → mySQL로 변환
-   데이터 물리적 삭제에서 논리적 삭제로 변경
-   updated_at, deleted_at 등의 테이블 구조 변경
-   디자인 패턴 변경
