package de.hdm_stuttgart.dba.crawler.service;

import com.google.common.collect.ImmutableList;
import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.parser.HtmlParseData;
import edu.uci.ics.crawler4j.url.WebURL;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@EqualsAndHashCode(callSuper = true)
@Slf4j
@Service
@Data
public class BasicCrawler extends WebCrawler {

    final
    RedisToolboxService red;

    private static final Pattern FILTERS = Pattern.compile(
            ".*(\\.(" +
                    "css|js|bmp|gif|jpe?g" +
                    "|png|tiff?|mid|mp2|mp3|mp4" +
                    "|wav|avi|mov|mpeg|ram|m4v|pdf" +
                    "|rm|smil|wmv|swf|wma|zip|rar|gz))$");

    private static final Pattern FILTER_REMOVE = Pattern.compile(
            ".*(\\.(css|js|rm|smil|wmv|swf|wma|zip|rar|gz))$");

    private static final Pattern FILTER_MEDIA = Pattern.compile(
            ".*(\\.(" +
                    "bmp|gif|jpe?g" +
                    "|png|tiff?|mid|mp2|mp3|mp4" +
                    "|wav|avi|mov|mpeg|ram|m4v|pdf))$");

    private final List<String> myCrawlDomains;

    private final List<Integer> cdi;

    public BasicCrawler(List<String> myCrawlDomains, RedisToolboxService red, List<Integer> cdi) {
        this.myCrawlDomains = ImmutableList.copyOf(myCrawlDomains);
        this.red = red;
        this.cdi = ImmutableList.copyOf(cdi);
    }

    @Override
    public boolean shouldVisit(Page referringPage, WebURL url) {
        String href = url.getURL().toLowerCase();
        if (FILTERS.matcher(href).matches()) {
            return false;
        }

        for (String crawlDomain : myCrawlDomains) {
            if (href.startsWith(crawlDomain)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public void visit(Page page) {

        if (page.getParseData() instanceof HtmlParseData) {
            HtmlParseData htmlParseData = (HtmlParseData) page.getParseData();
            Set<WebURL> links = htmlParseData.getOutgoingUrls();

            if (page.getStatusCode() == 200) {

                String key = page.getWebURL().getDomain() + ":" + page.getWebURL().getDocid();
                Integer docId = page.getWebURL().getDocid();
                Integer parentDocId = page.getWebURL().getParentDocid();
                String parentUrl = page.getWebURL().getParentUrl();
                String url = page.getWebURL().getURL();
                Short depth = page.getWebURL().getDepth();

                log.info("✅ DocId: {}, Depth {}, Url: {}", docId, depth, url);

                red.redisHashSet(cdi.get(0), key, "docId", docId);
                red.redisHashSet(cdi.get(0), key, "parentDocId", parentDocId);
                red.redisHashSet(cdi.get(0), key, "parentUrl", parentUrl);
                red.redisHashSet(cdi.get(0), key, "depth", depth);
                red.redisHashSet(cdi.get(0), key, "url", url);

                int i = -1, e = -1, im = -1, em = -1;

                // TODO Direkt in Listen packen
                JSONArray intern = new JSONArray();
                JSONArray internMedia = new JSONArray();
                JSONArray extern = new JSONArray();
                JSONArray externMedia = new JSONArray();

                for (WebURL link : links) {

                    String href = link.getURL().toLowerCase();

                    if (!FILTER_REMOVE.matcher(href).matches()) {

                        boolean contains = link.getParentUrl().contains(link.getDomain());
                        boolean filter = FILTER_MEDIA.matcher(href).matches();

                        if (contains) {
                            if (filter) internMedia.add(++im, link.getURL());
                            else intern.add(++i, link.getURL());
                        } else {
                            if (filter) externMedia.add(++em, link.getURL());
                            else extern.add(++e, link.getURL());
                        }
                    }
                }

                // TODO JSON Arrays speichern
                red.redisHashSet(cdi.get(0), key, "link:int:media", internMedia);
                red.redisHashSet(cdi.get(0), key, "link:ext:media", externMedia);
                red.redisHashSet(cdi.get(0), key, "link:int", intern);
                red.redisHashSet(cdi.get(0), key, "link:ext", extern);


//                red.redisHashSet(cdi, key, "links", links.size());
//                red.redisHashSet(cdi, key, "links:int", i);
//                red.redisHashSet(cdi, key, "links:ext", e);
//                red.redisHashSet(cdi, key, "links:int:media", im);
//                red.redisHashSet(cdi, key, "links:ext:media", em);

            }
        }
    }
}
