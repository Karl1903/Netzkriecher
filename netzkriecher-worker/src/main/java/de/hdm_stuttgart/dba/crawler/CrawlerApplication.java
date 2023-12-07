package de.hdm_stuttgart.dba.crawler;

import de.hdm_stuttgart.dba.crawler.service.BuildCache;
import de.hdm_stuttgart.dba.crawler.service.RedisToolboxService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CrawlerApplication implements ApplicationRunner {

	final
	RedisToolboxService redisToolboxService;

	final
	BuildCache buildCache;

	public CrawlerApplication(RedisToolboxService redisToolboxService, BuildCache buildCache) {
		this.redisToolboxService = redisToolboxService;
		this.buildCache = buildCache;
	}

	public static void main(String[] args) {
		SpringApplication.run(CrawlerApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments args) {
		redisToolboxService.redisValueSet(0, "ci_cache", 1);
		buildCache.buildCache();
	}
}
