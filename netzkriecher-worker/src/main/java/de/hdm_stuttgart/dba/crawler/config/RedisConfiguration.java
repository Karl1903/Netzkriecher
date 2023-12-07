package de.hdm_stuttgart.dba.crawler.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;

@Configuration
@Slf4j
public class RedisConfiguration {

    final
    RedisConfig az;

    public RedisConfiguration(RedisConfig az) {
        this.az = az;
    }

    @Bean
    public LettuceConnectionFactory[] redisConnectionFactory2() {
        LettuceConnectionFactory[] lc = new LettuceConnectionFactory[3];
        for (int i = 0; i < 3; i++) {
            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(az.getHost());
            //config.setPassword(az.getPass());
            config.setPort(az.getPort());
            config.setDatabase(i);
            LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                    //.useSsl().and()
                    .commandTimeout(Duration.ofSeconds(30))
                    .shutdownTimeout(Duration.ofSeconds(30))
                    .build();
            lc[i] = new LettuceConnectionFactory(config, clientConfig);
            lc[i].afterPropertiesSet();
        }
        return lc;
    }

    @Bean
    public RedisTemplate<String, Object>[] redisTemplates() {
        LettuceConnectionFactory[] rcf = redisConnectionFactory2();
        final RedisTemplate<String, Object>[] redisTemplate = new RedisTemplate[3];
        for (int i = 0; i < 3; i++) {
            RedisTemplate<String, Object> rt = new RedisTemplate<>();
            rt.setConnectionFactory(rcf[i]);
            rt.afterPropertiesSet();

//            rt.getConnectionFactory().getConnection().flushDb();
            redisTemplate[i] = rt;
        }
        return redisTemplate;
    }

}
