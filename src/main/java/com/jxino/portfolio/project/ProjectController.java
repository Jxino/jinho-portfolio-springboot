package com.jxino.portfolio.project;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/projects")
public class ProjectController {
    private final GitHubProjectService projectService;

    public ProjectController(GitHubProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDto> projects() {
        return projectService.findPortfolioProjects();
    }
}
