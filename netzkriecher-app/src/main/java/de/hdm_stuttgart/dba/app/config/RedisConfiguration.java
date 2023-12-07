package de.hdm_stuttgart.dba.app.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

@Configuration
public class RedisConfiguration {
    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.password}")
    private String password;

    @Value("${spring.redis.port}")
    private Integer port;

    @Bean
    public LettuceConnectionFactory[] redisConnectionFactory2() {
        LettuceConnectionFactory[] lc = new LettuceConnectionFactory[3];
        for (int i = 0; i < 3; i++) {
            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(host);
            config.setPort(port);
            config.setDatabase(i);
            LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                    .commandTimeout(Duration.ofSeconds(30))
                    .shutdownTimeout(Duration.ofSeconds(30))
                    .build();
            lc[i] = new LettuceConnectionFactory(config, clientConfig);
            lc[i].afterPropertiesSet();

        }
        return lc;
    }
    @Bean
    public RedisTemplate<String, Object>[] redisTemplate() {
        LettuceConnectionFactory[] rcf = redisConnectionFactory2();
        final RedisTemplate<String, Object>[] redisTemplate = new RedisTemplate[3];
        for (int i = 0; i < 3; i++) {
            RedisTemplate<String, Object> rt = new RedisTemplate<>();
            rt.setConnectionFactory(rcf[i]);
            rt.afterPropertiesSet();
            //rt.getConnectionFactory().getConnection().flushDb();
            redisTemplate[i] = rt;
        }
        return redisTemplate;
    }

}
