package com.jxino.portfolio;

import com.jxino.portfolio.profile.PortfolioProfileService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PortfolioPageController {
    private final PortfolioProfileService portfolioProfileService;

    public PortfolioPageController(PortfolioProfileService portfolioProfileService) {
        this.portfolioProfileService = portfolioProfileService;
    }

    @GetMapping({"/", "/index.html"})
    public String index(Model model) {
        model.addAttribute("profile", portfolioProfileService.getProfile());
        return "index";
    }
}
