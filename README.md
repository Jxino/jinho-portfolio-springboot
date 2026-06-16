# Jinho Kim Portfolio

Spring Boot and Gradle based portfolio website. Static frontend files are served by Spring Boot, and project cards are loaded dynamically from the backend API.

## Requirements

- Java 17
- Node.js 18 or newer

## Project Structure

```text
src/main/java                         Spring Boot backend
src/main/resources/application.yml   Application configuration
src/main/resources/static            HTML, CSS, JavaScript, and assets
```

## Run

```powershell
.\gradlew.bat bootRun
```

Open `http://127.0.0.1:8081/`.

Spring Boot DevTools is enabled for development. Static resources are read directly from `src/main/resources` while using `bootRun`.

## Build Tailwind CSS

Tailwind is compiled locally instead of loading the Tailwind CDN at runtime.

```powershell
npm install
npm run build:css
```

Use `npm run watch:css` while adding or changing Tailwind utility classes.

## Build

```powershell
.\gradlew.bat clean test bootJar
```

The executable JAR is created under `build/libs`.

## Deploy To Render

This project is ready to deploy to Render as a Docker-based Web Service.

Required Render setup:

- Service type: `Web Service`
- Runtime: `Docker`
- Branch: your deploy branch
- Instance type: paid plan for always-on service

Render will provide the `PORT` environment variable automatically. The app is configured to use it in [application.yml](C:\dev\webcraft\src\main\resources\application.yml).
