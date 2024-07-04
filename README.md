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

# 커뮤니티 게시판 ver 2 BE

react + express + mySQL

## 프로젝트 기간

-   ver 2 : 2024.05.31 ~ 2024.06.03 ( 2영업일 )

## 사용 기술

`Express` `html/css` `javascript` `React` `mySQL`

## 개발 내용

**BE**

-   json → mySQL로 변환
-   데이터 물리적 삭제에서 논리적 삭제로 변경
-   updated_at, deleted_at 등의 테이블 구조 변경
-   디자인 패턴 변경
-   개발 용어 한국어 발음 검색 기능 추

## 시연 영상

https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/ff62193c-f658-489c-997e-8f3bdbd85828

## 테이블 설계

### 전체 테이블

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/257363bd-4951-4bd2-b4af-fcbf05f9560c)


### 회원정보 테이블

논리적 스키마

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/63e834bc-8b59-49c1-8a38-1b8cb9de35aa)


물리적 스키마
```SQL
CREATE TABLE USERS (
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(10) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (user_id)
);
```

속성 설명

- `user_id`: 사용자 고유의 ID. 자동 증가하며 기본 키로 사용
- `email`: 사용자의 이메일 주소. 고유해야 하며, 최대 255자까지 저장
- `nickname`: 사용자의 닉네임. 고유해야 하며, 최대 10자까지 저장
- `password`: 사용자의 비밀번호 해시값을 저장. 최대 255자까지 저장
- `avatar`: 사용자의 아바타 이미지 URL을 저장
- `created_at`: 레코드 생성 시간을 저장. 기본값은 현재 시간
- `updated_at`: 레코드 수정 시간을 저장. 기본값은 현재 시간이며, 레코드가 수정될 때마다 현재 시간으로 업데이트
- `deleted_at`: 게시글 삭제 시간을 저장. 기본값은 `NULL`이며, 레코드가 삭제될 때 현재 시간으로 업데이트 하여, 논리적 삭제
    - express에서와는 다르게 댓글 삭제 시간을 저장하여 논리적 삭제로 구현하여, 데이터 복구 시점 추적 및 삭제 이력 관리

---
 
### 게시글 테이블

논리적 스키마

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/6bd2f5f4-4064-41d4-bae8-385672bdca57)

물리적 스키마
```SQL
CREATE TABLE POSTS (
    post_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(26) NOT NULL,
    content TEXT NOT NULL,
    post_image TEXT NOT NULL,
    count_like INT NOT NULL DEFAULT 0,
    count_comment INT NOT NULL DEFAULT 0,
    count_view INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (post_id),
    FOREIGN KEY (user_id) REFERENCES USERS (user_id)
);

```

속성 설명

- `post_id`: 게시물 고유의 ID. 자동 증가하며 기본 키로 사용
- `user_id`: 게시물 생성자의 ID. `USERS` 테이블의 `user_id`를 참조하는 외래키
- `title`: 게시물의 제목. 최대 26자까지 저장
- `content`: 게시물의 내용
- `post_image`: 게시물에 포함된 이미지의 URL
- `count_like`: 게시물의 좋아요 수. 기본값은 0
- `count_comment`: 게시물의 댓글 수. 기본값은 0
- `count_view`: 게시물의 조회 수. 기본값은 0
- `created_at`: 게시물 생성 시간을 저장. 기본값은 현재 시각
- `updated_at`: 게시물 수정 시간을 저장. 기본값은 현재 시각이며, 레코드가 수정될 때마다 현재 시간으로 업데이트
- `deleted_at`: 게시글 삭제 시간을 저장. 기본값은 `NULL`이며, 레코드가 삭제될 때 현재 시간으로 업데이트 하여, 논리적 삭제
    - express에서와는 다르게 댓글 삭제 시간을 저장하여 논리적 삭제로 구현하여, 데이터 복구 시점 추적 및 삭제 이력 관리

---

### 댓글 테이블

논리적 스키마

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/e033d938-72f5-4a15-a29a-9c3edbd45c5c)


물리적 스키마
```SQL
CREATE TABLE COMMENTS (
    comment_id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (post_id) REFERENCES POSTS (post_id),
    FOREIGN KEY (user_id) REFERENCES USERS (user_id)
);
```

속성 설명

- `comment_id`: 댓글 고유의 ID. 자동 증가하며 기본 키로 사용
- `post_id`: 댓글이 달린 게시물의 ID. `POSTS` 테이블의 `post_id`를 참조하는 외래키
- `user_id`: 댓글을 작성한 사용자의 ID. `USERS` 테이블의 `user_id`를 참조하는 외래키
- `content`: 댓글의 내용.
- `created_at`: 댓글 생성 시간을 저장 기본값은 현재 시각입니다.
- `updated_at`: 댓글 수정 시간을 저장. 기본값은 현재 시각이며, 레코드가 수정될 때마다 현재 시간으로 업데이트
- `deleted_at`: 댓글 삭제 시간을 저장. 기본값은 `NULL`이며, 레코드가 삭제될 때 현재 시간으로 업데이트 하여, 논리적 삭제
    - express에서와는 다르게 댓글 삭제 시간을 저장하여 논리적 삭제로 구현하여, 데이터 복구 시점 추적 및 삭제 이력 관리
 
---

### 좋아요 테이블

논리적 스키마

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/f9e2b946-f706-4ea4-8882-cd824a6b4005)

물리적 스키마
```SQL
CREATE TABLE LIKES (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES USERS (user_id),
    FOREIGN KEY (post_id) REFERENCES POSTS (post_id)
);
```

속성 설명
- **`user_id`**: 좋아요를 누른 사용자의 ID. `USERS` 테이블의 `user_id`를 참조하는 외래키
- **`post_id`**: 좋아요가 눌린 게시글의 ID. `POSTS` 테이블의 `post_id`를 참조하는 외래키
- **`PRIMARY KEY (user_id, post_id)`**: 복합 키를 사용하여 각 사용자가 각 게시글에 대해 한 번만 좋아요를 누를 수 있도록 보장
- **`FOREIGN KEY (user_id)`**: `USERS` 테이블의 `user_id`를 참조하는 외래키 제약 조건
- **`FOREIGN KEY (post_id)`**: `POSTS` 테이블의 `post_id`를 참조하는 외래키 제약 조건

## word 테이블

### 논리적 스키마

![image](https://github.com/jjikky/5-jikky-kim-express-be/assets/59151187/97a15d0c-5c13-47e5-9d1c-da6f78e224bb)

### 물리적 스키마

```sql
CREATE TABLE WORDS (
    word_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(26) NOT NULL,
    content TEXT NOT NULL,
    count_like INT NOT NULL DEFAULT 0,
    count_view INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (word_id),
    FOREIGN KEY (user_id) REFERENCES USERS (user_id)
);

```

### 속성 설명

- `word_id`: 단어 고유의 ID. 자동 증가하며 기본 키로 사용
- `user_id`: 단어 생성자의 ID. `USERS` 테이블의 `user_id`를 참조하는 외래키
- `title`: 단어의 제목. 최대 26자까지 저장
- `content`: 단어의 내용
- `count_like`: 단어의 좋아요 수. 기본값은 0
- `count_view`: 단어의 조회 수. 기본값은 0
- `created_at`: 단어 생성 시간을 저장. 기본값은 현재 시각
- `updated_at`: 단어 수정 시간을 저장. 기본값은 현재 시각이며, 레코드가 수정될 때마다 현재 시간으로 업데이트
- `deleted_at`: 단어 삭제 시간을 저장. 기본값은 `NULL`이며, 레코드가 삭제될 때 현재 시간으로 업데이트 하여, 논리적 삭제
    - express에서와는 다르게 댓글 삭제 시간을 저장하여 논리적 삭제로 구현하여, 데이터 복구 시점 추적 및 삭제 이력 관리


### 폴더 구조
```bash
project-root/
│
├── node_modules/
│
├── passport/
│   ├── index.js
│   └── localStrategy.js
│
├── public/
│   └── uploads/
│
├── routes/
│   ├── post/
│   │   ├── post.controller.js
│   │   ├── post.repository.js
│   │   ├── post.route.js
│   │   └── post.service.js
│   │
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.repository.js
│   │   ├── user.route.js
│   │   └── user.service.js
│
├── utils/
│   ├── appError.js
│   ├── middleware.js
│   └── multer.js
│
├── .env
├── .eslintc.json
├── .gitignore
├── .prettierrc
├── app.js
├── db.js
├── package-lock.json
├── package.json
└── README.md

```
