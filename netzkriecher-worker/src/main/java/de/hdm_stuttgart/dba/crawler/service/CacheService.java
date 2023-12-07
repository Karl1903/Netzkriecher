package de.hdm_stuttgart.dba.crawler.service;

import de.hdm_stuttgart.dba.crawler.model.Website;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Service
@Slf4j
public class CacheService {

    final RedisToolboxService redisToolboxService;
    final BuildCache buildCache;

    public CacheService(RedisToolboxService redisToolboxService, BuildCache buildCache) {
        this.redisToolboxService = redisToolboxService;
        this.buildCache = buildCache;
    }

    public ResponseEntity<?> getLinksInCache(int index,
                                             HttpServletRequest httpServletRequest) {
        List<String> links = redisToolboxService.redisListGet(index, "links".toLowerCase());
        return ResponseEntity.ok().body(links);
    }

    public ResponseEntity<?> addLinkToCache(int index,
                                            HttpServletRequest httpServletRequest,
                                            Website website) {

        if (website.getHtmlLink().contains("/") || website.getHtmlLink().contains("www") || website.getHtmlLink().contains("http")) {
            return ResponseEntity.badRequest().body("Insert links without prefix (https://www.) and without tailing " +
                    "slash ('https://www.' FOO.TLD '/'." +
                    "" +
                    "Just add foo.tld");
        } else {

            List<String> links = redisToolboxService.redisListGet(index, "links".toLowerCase());

            for (String link : links) {
                if (link.contains(website.getHtmlLink().toLowerCase())) {
                    return ResponseEntity.badRequest().body("link existiert bereits");
                }
            }

            redisToolboxService.redisListLeftPush(index, "links".toLowerCase(),
                    "https://www." + website.getHtmlLink().toLowerCase() + "/");
            return this.getLinksInCache(index, httpServletRequest);
        }
    }


    public ResponseEntity<?> deleteLinkFromCache(int index, HttpServletRequest httpServletRequest, Website website) {
        List<String> links = redisToolboxService.redisListGet(index, "links".toLowerCase());

        for (String link : links) {
            if (link.contains(website.getHtmlLink().toLowerCase())) {
                redisToolboxService.redisListDeleteOneByKey(index, "links".toLowerCase(),
                        website.getHtmlLink().toLowerCase());
                return this.getLinksInCache(index, httpServletRequest);
            }
        }
        return ResponseEntity.badRequest().body("Dieser Link existiert nicht in der Liste!");
    }


    public ResponseEntity<?> getNode(int index,
                                     HttpServletRequest httpServletRequest,
                                     String website, String node) {

        String key = website + ":" + node;

        return ResponseEntity.ok().body(redisToolboxService.redisHashGetAll(index, key));
    }

    public ResponseEntity<?> getNodeAll(int index, HttpServletRequest httpServletRequest, String website) {

        // use increment feature from redis

        JSONArray jsonArray = new JSONArray();

        for (int i = 1; i < 200; i++) {
            String key = website + ":" + i;
            jsonArray.add(redisToolboxService.redisHashGetAll(index, key));
        }

        return ResponseEntity.ok().body(jsonArray);
    }

    public ResponseEntity<?> controllerStart(HttpServletRequest httpServletRequest) {
        buildCache.buildCache();
        return ResponseEntity.ok().body("Finished");
    }
}
