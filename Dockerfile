FROM gradle:8.7-jdk21 AS builder
WORKDIR /src
COPY . .

RUN gradle -p backend/media-tracker-api clean bootJar -x test --no-daemon --stacktrace

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /src/backend/media-tracker-api/build/libs/*.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Xss256k -XX:+UseSerialGC"
RUN useradd -m spring && chown -R spring:spring /app
USER spring
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]