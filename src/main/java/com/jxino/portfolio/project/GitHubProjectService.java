package com.jxino.portfolio.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GitHubProjectService {
    private static final String OWNER = "Jxino";
    private static final List<String> REPOSITORIES = List.of(
            "sentinel-ai",
            "phishing-shield",
            "deepfake-forensics",
            "soc-copilot",
            "zero-trust-gateway",
            "malware-sandbox",
            "privacy-guard-ai"
    );
    private static final Map<String, String> PROJECT_IMAGES = Map.of(
            "sentinel-ai", "/assets/projects/campus-linker.png",
            "phishing-shield", "/assets/projects/payflow-api.png",
            "deepfake-forensics", "/assets/projects/study-orbit.png",
            "soc-copilot", "/assets/projects/log-insight.png",
            "zero-trust-gateway", "/assets/projects/booknest.png",
            "malware-sandbox", "/assets/projects/health-mate.png",
            "privacy-guard-ai", "/assets/projects/market-pulse.png"
    );
    private static final Map<String, String> PROJECT_TITLES = Map.of(
            "sentinel-ai", "Sentinel AI",
            "phishing-shield", "Phishing Shield",
            "deepfake-forensics", "Deepfake Forensics",
            "soc-copilot", "SOC Copilot",
            "zero-trust-gateway", "Zero Trust Gateway",
            "malware-sandbox", "Malware Sandbox",
            "privacy-guard-ai", "Privacy Guard AI"
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ProjectDto> findPortfolioProjects() {
        return REPOSITORIES.stream()
                .map(this::fetchRepository)
                .toList();
    }

    private ProjectDto fetchRepository(String repoName) {
        try {
            JsonNode repo = requestJson("https://api.github.com/repos/" + OWNER + "/" + repoName);
            return new ProjectDto(
                    repoName,
                    PROJECT_TITLES.getOrDefault(repoName, toTitle(repo.path("name").asText(repoName))),
                    repo.path("description").asText("AI and cybersecurity portfolio project"),
                    PROJECT_IMAGES.get(repoName),
                    readTopics(repo),
                    repo.path("html_url").asText("https://github.com/" + OWNER + "/" + repoName)
            );
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return fallbackProject(repoName);
        }
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
                "GitHub API 응답을 가져오지 못했을 때 표시되는 AI·보안 포트폴리오 프로젝트입니다.",
                PROJECT_IMAGES.get(repoName),
                List.of("Python", "Docker"),
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
