package com.jxino.portfolio.profile;

import org.springframework.stereotype.Service;

@Service
public class PortfolioProfileService {

    public PortfolioProfile getProfile() {
        return new PortfolioProfile(
                "JINHO KIM",
                "https://www.instagram.com/jinoopage/",
                "https://www.threads.net/@jinoopage",
                "jinhoesperas@gmail.com",
                "https://github.com/Jxino"
        );
    }
}
