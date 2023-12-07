package de.hdm_stuttgart.dba.app.controller;

import de.hdm_stuttgart.dba.app.model.Website;
import de.hdm_stuttgart.dba.app.service.CacheService;
import de.hdm_stuttgart.dba.app.service.RedisToolboxService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;

@RestController
@Slf4j
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class CacheController {

    final CacheService cacheService;
    final RedisToolboxService red;

    public CacheController(CacheService cacheService, RedisToolboxService red) {
        this.cacheService = cacheService;
        this.red = red;
    }

    @GetMapping("/cache/links/get")
    public ResponseEntity<?> getLinksInCache(HttpServletRequest httpServletRequest) {
        return cacheService.getLinksInCache(0, httpServletRequest);
    }


    @GetMapping("/cache/node/{website}/all")
    public ResponseEntity<?> getNodeAll(
            HttpServletRequest httpServletRequest,
            @PathVariable("website") final String website) {
        return cacheService.getNodeAll(red.getCDI(), httpServletRequest, website);
    }


    @GetMapping("/cache/node/{website}/{node}")
    public ResponseEntity<?> getNode(
            HttpServletRequest httpServletRequest,
            @PathVariable("website") final String website,
            @PathVariable("node") final String node) {
        return cacheService.getNode(red.getCDI(), httpServletRequest, website, node);
    }

}
