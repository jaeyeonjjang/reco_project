# frontend/Dockerfile (v4) - use npm install to avoid lock mismatch errors
# 목적: Vite로 React 앱을 빌드하고, Nginx로 정적 파일을 서빙합니다.

FROM node:20 AS build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 lock 파일을 먼저 복사하여 캐시 레이어 활용
COPY package*.json ./

# 의존성 설치 (npm ci 대신 npm install 사용: lock 불일치 시 자동 동기화)
RUN npm install

# 나머지 소스 복사
COPY . .

# 빌드
RUN npm run build

# ---- Nginx stage ----
FROM nginx:1.27-alpine

# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

# React 라우팅 고려: 404 대신 index.html로 fallback
RUN sed -i 's|try_files \\$uri \\$uri/ =404;|try_files \\$uri \\$uri/ /index.html;|g' /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
