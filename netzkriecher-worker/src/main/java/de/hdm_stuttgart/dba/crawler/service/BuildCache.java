package de.hdm_stuttgart.dba.crawler.service;

import com.google.common.collect.ImmutableList;
import com.google.common.io.Files;
import de.hdm_stuttgart.dba.crawler.config.CrawlerConfig;
import edu.uci.ics.crawler4j.crawler.CrawlConfig;
import edu.uci.ics.crawler4j.crawler.CrawlController;
import edu.uci.ics.crawler4j.fetcher.PageFetcher;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtConfig;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtServer;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@Data
public class BuildCache {

    final
    CrawlerConfig cc;

    final RedisToolboxService red;
    // 0: index database
    // 1: cache 1
    // 2: cache 2
    private int cdi = 1;

    public BuildCache(RedisToolboxService red, CrawlerConfig cc) {
        this.red = red;
        this.cc = cc;
    }

    public void buildCache() {
        // switch internally (cdi variable) to "old" cache and clean
        prepareCache();

        getUrls().forEach(link -> {
            try {
                controlSingleCrawler(Collections.singletonList(link), cdi);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        // TODO RACE CONDIGITION beim neuen Controller
        // switch cache for clients to newly built cache
        log.info("❗❗❗❗❗❗❗");
        log.info("ci_cache {}", cdi);
        log.info("❗❗❗❗❗❗❗");
        red.redisValueSet(0, "ci_cache", cdi);

        log.info("===============");
        buildCache();
    }

    private List<String> getUrls() {
        List<String> links = red.redisListGet(0, "links");
        return links.size() >= 1 ? links : List.of("https://www.tagesschau.de/", "https://www.welt.de/");
    }

    private CrawlConfig configCrawler() {
        CrawlConfig config = new CrawlConfig();

        String crawlStorageFolder = Files.createTempDir().getAbsolutePath();

        config.setCrawlStorageFolder(crawlStorageFolder + RandomStringUtils.randomAlphabetic(2));
        config.setPolitenessDelay(cc.getPolitnessDelay());
        config.setMaxPagesToFetch(cc.getMaxPagesToFetch());
        config.setMaxDepthOfCrawling(cc.getMaxDepth());

        return config;
    }

    private void controlSingleCrawler(List<String> url, int cdi) throws Exception {
        CrawlConfig config1 = configCrawler();

        PageFetcher pageFetcher1 = new PageFetcher(configCrawler());

        RobotstxtConfig robotstxtConfig = new RobotstxtConfig();
        RobotstxtServer robotstxtServer = new RobotstxtServer(robotstxtConfig, pageFetcher1);

        CrawlController controller1 = new CrawlController(config1, pageFetcher1, robotstxtServer);

        List<String> crawler1Domains = ImmutableList.of(url.get(0));

        controller1.addSeed(url.get(0));

        CrawlController.WebCrawlerFactory<BasicCrawler> factory1 = () -> new BasicCrawler(crawler1Domains, red, Collections.singletonList(cdi));

        controller1.startNonBlocking(factory1, cc.getNumberOfCrawlers());

        //controller1.waitUntilFinish();
        //log.info("Crawler is finished.");

    }

    private void prepareCache() {
        log.info("Read CDI, old = {}", cdi);
        // read actual cdi
        try {
            cdi = (int) red.redisValueGet(0, "ci_cache");
        } catch (Exception e) {
            e.printStackTrace();
        }

        // change cdi to new cache which is not currently used /mbeing built
        log.info("Change cdi {}", cdi);
        if (cdi == 1) {
            cdi = 2;
        } else {
            cdi = 1;
        }
        // we're now on the cache, which has not been used since a while ...
        log.info("Deleting Cache {}", cdi);
        red.delete(cdi);
    }

}
