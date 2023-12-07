package de.hdm_stuttgart.dba.app.service;

import de.hdm_stuttgart.dba.app.model.Website;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import net.minidev.json.JSONArray;
import java.util.List;

@Service
@Slf4j
public class CacheService {

    final RedisToolboxService redisToolboxService;

    public CacheService(RedisToolboxService redisToolboxService) {
        this.redisToolboxService = redisToolboxService;
    }

    public ResponseEntity<?> getLinksInCache(int index,
                                             HttpServletRequest httpServletRequest) {
        List<String> links = redisToolboxService.redisListGet(index, "links".toLowerCase());
        return ResponseEntity.ok().body(links);
    }

    

    public ResponseEntity<?> getNodeAll(int index, HttpServletRequest httpServletRequest, String website) {

        // use increment feature from redis

        JSONArray jsonArray = new JSONArray();

        for (int i = 1; i < 3300; i++) {
            String key = website + ":" + i;
            jsonArray.add(redisToolboxService.redisHashGetAll(index, key));
        }

        return ResponseEntity.ok().body(jsonArray);
    }


    public ResponseEntity<?> getNode(int index,
                                     HttpServletRequest httpServletRequest,
                                     String website, String node) {

        String key = website + ":" + node;

        return ResponseEntity.ok().body(redisToolboxService.redisHashGetAll(index, key));
    }
}
