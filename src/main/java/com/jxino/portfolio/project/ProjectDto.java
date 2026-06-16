package com.jxino.portfolio.project;

import java.util.List;

public record ProjectDto(
        String repoName,
        String title,
        String description,
        String imageUrl,
        List<String> techStack,
        String githubUrl
) {
}
