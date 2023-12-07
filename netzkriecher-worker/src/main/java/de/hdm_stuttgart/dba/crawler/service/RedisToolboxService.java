package de.hdm_stuttgart.dba.crawler.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RedisToolboxService {

    public final ValueOperations<String, Object>[] valueOps;
    public final ListOperations<String, Object>[] listOps;
    public final HashOperations<String, String, Object>[] hashOps;
    public final RedisTemplate<String, Object>[] template;

    public RedisToolboxService(RedisTemplate<String, Object>[] redisTemplate) {
        valueOps = new ValueOperations[redisTemplate.length];
        listOps = new ListOperations[redisTemplate.length];
        hashOps = new HashOperations[redisTemplate.length];
        for (int i = 0; i < redisTemplate.length; i++) {
            listOps[i] = redisTemplate[i].opsForList();
            valueOps[i] = redisTemplate[i].opsForValue();
            hashOps[i] = redisTemplate[i].opsForHash();
        }
        this.template = redisTemplate;
    }

    private long lastCDIUpdate = 0;
    private int cdi = 1;

    public synchronized int getCDI() {
        if (System.currentTimeMillis() - lastCDIUpdate > 1000) {
            try {
                int cdiTmp = (int) redisValueGet(0, "ci_cache");
                if (cdiTmp != cdi) {
                    cdi = cdiTmp;
                    log.info("CDI changed to {}", cdi);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            lastCDIUpdate = System.currentTimeMillis();
        }
        return cdi;
    }

    /*
    Delete given Database
     */
    public void delete(int index) {
        template[index].getConnectionFactory().getConnection().flushDb();
    }



    public void redisValueSet(int index, final String key, final Object data) {
        valueOps[index].set(key.toLowerCase(), data);
    }



    public Object redisValueGet(int index, final String key) {
        return valueOps[index].get(key.toLowerCase());
    }


    /*
        HashOps
        Set Hash
     */
    public void redisHashSet(int index, String hash, String hashKey, Object hashValue) {
        hashOps[index].put(hash.toLowerCase(), hashKey, hashValue);
    }

    /*
        HashOps
        Increment given Hash
    */
    public void redisHashIncrement(int index, String hash, String hashKey, double delta) {
        hashOps[index].increment(hash.toLowerCase(), hashKey, delta);
    }

    /*
        HashOps
        Get All Hashes
    */
    public Map<String, Object> redisHashGetAll(int index, String hash) {
        return hashOps[index].entries(hash.toLowerCase());
    }




    /*
        List Ops
        Adds a new Website on the left side of the array
     */
    public void redisListLeftPush(int index, final String key, final String website) {
        //for (Website links : websites) {
            listOps[index].leftPush(key.toLowerCase(), website);
        //}
    }

    /*
        List Ops
        Deletes a Website from the Array (that saves the Root Websites to be crawled, e.g. welt.de)

     */
    public void redisListDeleteOneByKey(int index, final String key, final String website) {
        listOps[index].remove(key.toLowerCase(), 1, website);

    }

    /*
        List Ops
        Gets the List of the given Key
        We know the key, we can specify it as HTMLLINKSTOCRAWL or something like that
     */
    public List<String> redisListGet(int index, final String key) {
        final List<Object> objects = listOps[index].range(key.toLowerCase(), 0, -1);
        if (CollectionUtils.isEmpty(objects)) {
            return Collections.emptyList();
        }

        return objects.stream()
                .map(x -> (String) x)
                .collect(Collectors.toList());
    }



}
