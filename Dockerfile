FROM node:22-alpine AS frontend-build
WORKDIR /workspace
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci
COPY frontend ./frontend
COPY assets ./assets
RUN npm --prefix frontend run build

FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /workspace
COPY backend ./backend
COPY --from=frontend-build /workspace/frontend/dist ./frontend/dist
RUN ./backend/gradlew -p backend clean bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S archive && adduser -S archive -G archive && mkdir -p /app/data && chown -R archive:archive /app
COPY --from=backend-build /workspace/backend/build/libs/*.jar /app/application.jar
USER archive
EXPOSE 8080
ENV DATABASE_URL=jdbc:h2:file:/app/data/game-of-thrones
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
