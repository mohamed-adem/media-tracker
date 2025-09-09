FROM gradle:8.7-jdk21 AS builder
WORKDIR /src
COPY . .

RUN gradle -p backend/media-tracker-api clean bootJar -x test --no-daemon --stacktrace

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /src/backend/media-tracker-api/build/libs/*.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]