package de.hdm_stuttgart.dba.crawler.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "crawler")
public class CrawlerConfig {
    private Integer politnessDelay;
    private Integer maxPagesToFetch;
    private Integer numberOfCrawlers;
    private Integer maxDepth;
}
