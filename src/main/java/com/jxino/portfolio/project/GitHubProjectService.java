package com.jxino.portfolio.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GitHubProjectService {
    private static final String OWNER = "Jxino";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final List<String> REPOSITORIES = List.of(
            "sentinel-ai",
            "phishing-shield",
            "deepfake-forensics",
            "jinho-portfolio-springboot",
            "zero-trust-gateway",
            "malware-sandbox",
            "privacy-guard-ai"
    );
    private static final Map<String, String> PROJECT_IMAGES = Map.of(
            "sentinel-ai", "/assets/projects/campus-linker.png",
            "phishing-shield", "/assets/projects/payflow-api.png",
            "deepfake-forensics", "/assets/projects/study-orbit.png",
            "jinho-portfolio-springboot", "/assets/projects/portfolio-website-capture.png",
            "zero-trust-gateway", "/assets/projects/booknest.png",
            "malware-sandbox", "/assets/projects/health-mate.png",
            "privacy-guard-ai", "/assets/projects/market-pulse.png"
    );
    private static final Map<String, String> PROJECT_TITLES = Map.of(
            "sentinel-ai", "Sentinel AI",
            "phishing-shield", "Phishing Shield",
            "deepfake-forensics", "Deepfake Forensics",
            "jinho-portfolio-springboot", "Portfolio Website",
            "zero-trust-gateway", "Zero Trust Gateway",
            "malware-sandbox", "Malware Sandbox",
            "privacy-guard-ai", "Privacy Guard AI"
    );
    private static final Map<String, String> PROJECT_DESCRIPTIONS = Map.of(
            "jinho-portfolio-springboot",
            "Spring Boot와 Thymeleaf 기반으로 제작한 개인 포트폴리오 웹사이트입니다. Education, Certification, Tech Stack, GitHub Projects를 한 화면에서 보여주며, 프로젝트 섹션은 GitHub API와 연동해 동적으로 렌더링되도록 구성했습니다."
    );
    private static final Map<String, List<String>> PROJECT_TECH_STACKS = Map.of(
            "jinho-portfolio-springboot",
            List.of("Spring Boot", "Thymeleaf", "Java", "GSAP", "Render", "GitHub API")
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile List<ProjectDto> cachedProjects = List.of();
    private volatile Instant cacheExpiresAt = Instant.EPOCH;

    public List<ProjectDto> findPortfolioProjects() {
        Instant now = Instant.now();
        if (!cachedProjects.isEmpty() && now.isBefore(cacheExpiresAt)) {
            return cachedProjects;
        }

        try {
            Map<String, JsonNode> repositoriesByName = fetchRepositories();
            List<ProjectDto> projects = REPOSITORIES.stream()
                    .map(repoName -> toProject(repoName, repositoriesByName.get(repoName)))
                    .toList();
            cachedProjects = projects;
            cacheExpiresAt = now.plus(CACHE_TTL);
            return projects;
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            if (!cachedProjects.isEmpty()) {
                return cachedProjects;
            }

            return REPOSITORIES.stream()
                    .map(this::fallbackProject)
                    .toList();
        }
    }

    private Map<String, JsonNode> fetchRepositories() throws IOException, InterruptedException {
        JsonNode response = requestJson("https://api.github.com/users/" + OWNER + "/repos?per_page=100&sort=updated");
        Map<String, JsonNode> repositoriesByName = new HashMap<>();
        response.forEach(repo -> repositoriesByName.put(repo.path("name").asText(), repo));
        return repositoriesByName;
    }

    private ProjectDto toProject(String repoName, JsonNode repo) {
        if (repo == null || repo.isMissingNode() || repo.isNull()) {
            return fallbackProject(repoName);
        }

        return new ProjectDto(
                repoName,
                PROJECT_TITLES.getOrDefault(repoName, toTitle(repo.path("name").asText(repoName))),
                PROJECT_DESCRIPTIONS.getOrDefault(
                        repoName,
                        repo.path("description").asText("AI and cybersecurity portfolio project")
                ),
                PROJECT_IMAGES.get(repoName),
                PROJECT_TECH_STACKS.getOrDefault(repoName, readTopics(repo)),
                repo.path("html_url").asText("https://github.com/" + OWNER + "/" + repoName)
        );
    }

    private JsonNode requestJson(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/vnd.github+json")
                .header("User-Agent", "portfolio-spring-boot")
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("GitHub API returned " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    private List<String> readTopics(JsonNode repo) {
        List<String> topics = new ArrayList<>();
        repo.path("topics").forEach(topic -> topics.add(formatTopic(topic.asText())));
        return topics;
    }

    private ProjectDto fallbackProject(String repoName) {
        return new ProjectDto(
                repoName,
                PROJECT_TITLES.getOrDefault(repoName, toTitle(repoName)),
                PROJECT_DESCRIPTIONS.getOrDefault(
                        repoName,
                        "GitHub API 응답을 가져오지 못했을 때 표시되는 AI·보안 포트폴리오 프로젝트입니다."
                ),
                PROJECT_IMAGES.get(repoName),
                PROJECT_TECH_STACKS.getOrDefault(repoName, List.of("Python", "Docker")),
                "https://github.com/" + OWNER + "/" + repoName
        );
    }

    private String toTitle(String repoName) {
        StringBuilder title = new StringBuilder();
        for (String part : repoName.split("-")) {
            if (part.isBlank()) {
                continue;
            }
            title.append(Character.toUpperCase(part.charAt(0)))
                    .append(part.substring(1))
                    .append(' ');
        }
        return title.toString().trim();
    }

    private String formatTopic(String topic) {
        if ("jpa".equals(topic)) {
            return "JPA";
        }
        if ("mysql".equals(topic)) {
            return "MySQL";
        }
        if ("redis".equals(topic)) {
            return "Redis";
        }
        if ("java".equals(topic)) {
            return "Java";
        }
        if ("spring-boot".equals(topic)) {
            return "Spring Boot";
        }
        if ("fastapi".equals(topic)) {
            return "FastAPI";
        }
        if ("pytorch".equals(topic)) {
            return "PyTorch";
        }
        if ("opencv".equals(topic)) {
            return "OpenCV";
        }
        if ("scikit-learn".equals(topic)) {
            return "Scikit-learn";
        }
        if ("langchain".equals(topic)) {
            return "LangChain";
        }
        if ("golang".equals(topic)) {
            return "Go";
        }
        if ("oauth2".equals(topic)) {
            return "OAuth 2.0";
        }
        if ("jwt".equals(topic)) {
            return "JWT";
        }
        if ("yara".equals(topic)) {
            return "YARA";
        }
        if ("spacy".equals(topic)) {
            return "spaCy";
        }
        if ("postgresql".equals(topic)) {
            return "PostgreSQL";
        }
        if ("rabbitmq".equals(topic)) {
            return "RabbitMQ";
        }
        return toTitle(topic);
    }
}
