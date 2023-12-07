package de.hdm_stuttgart.dba.crawler.controller;

import de.hdm_stuttgart.dba.crawler.model.Website;
import de.hdm_stuttgart.dba.crawler.service.BuildCache;
import de.hdm_stuttgart.dba.crawler.service.CacheService;
import de.hdm_stuttgart.dba.crawler.service.RedisToolboxService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/cache/links/add")
    public ResponseEntity<?> addLinkToCache(HttpServletRequest httpServletRequest, @RequestBody Website website) {
        return cacheService.addLinkToCache(0, httpServletRequest, website);
    }

    @PostMapping("/cache/links/delete")
    public ResponseEntity<?> deleteLinkFromCache(HttpServletRequest httpServletRequest, @RequestBody Website website) {
        return cacheService.deleteLinkFromCache(0, httpServletRequest, website);
    }

    @GetMapping("/cache/node/{website}/{node}")
    public ResponseEntity<?> getNode(
            HttpServletRequest httpServletRequest,
            @PathVariable("website") final String website,
            @PathVariable("node") final String node) {
        return cacheService.getNode(red.getCDI(), httpServletRequest, website, node);
    }


    @GetMapping("/cache/node/{website}/all")
    public ResponseEntity<?> getNodeAll(
            HttpServletRequest httpServletRequest,
            @PathVariable("website") final String website) {
        return cacheService.getNodeAll(red.getCDI(), httpServletRequest, website);
    }

    // TODO machen
    @PostMapping("/cache/controller/start")
    public ResponseEntity<?> controllerStart(
            HttpServletRequest httpServletRequest) {
        return cacheService.controllerStart(httpServletRequest);
    }

}
