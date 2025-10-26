-- init.sql
-- 목적: 애플리케이션 최초 기동 시 Postgres에 기본 스키마/테이블을 생성합니다.
-- 컨셉: 영화/드라마/웹툰 작품(works)과 한줄평(reviews) 저장

CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('movie','drama','webtoon')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 샘플 데이터
INSERT INTO works (title, kind) VALUES
('인터스텔라', 'movie'),
('나의 해방일지', 'drama'),
('약한영웅', 'webtoon')
ON CONFLICT DO NOTHING;

-- 샘플 리뷰 (title 기준으로 id를 찾아 삽입)
INSERT INTO reviews (work_id, user_name, rating, comment) VALUES
((SELECT id FROM works WHERE title='인터스텔라' LIMIT 1), '홍길동', 5, '우주 스케일의 감동!'),
((SELECT id FROM works WHERE title='인터스텔라' LIMIT 1), '김철수', 4, 'OST가 미쳤다.'),
((SELECT id FROM works WHERE title='나의 해방일지' LIMIT 1), '이영희', 5, '잔잔하지만 강렬함'),
((SELECT id FROM works WHERE title='약한영웅' LIMIT 1), '박민수', 4, '웹툰 액션의 정석');
