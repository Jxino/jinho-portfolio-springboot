package com.jxino.portfolio.profile;

public record PortfolioProfile(
        String displayName,
        String instagramUrl,
        String threadsUrl,
        String emailAddress,
        String githubUrl
) {
    public String gmailComposeUrl() {
        return "https://mail.google.com/mail/?view=cm&fs=1&to=" + emailAddress;
    }
}
