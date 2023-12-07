import { Injectable } from '@angular/core';

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebsiteService {

  constructor(private http: HttpClient) {
  }
  /**
   * One Website Node contains a main URL as a fix point, as well as JSON Arrays with all internal and external links and media
   * that can be reached from that URL, and the docID, parentDocID and depth of the given URL/Node.
   * @param websiteNameForGraph Input by the User
   * @returns an Observable with <200 Website Nodes from a given Domain
   */
  getWebsiteNodes(websiteNameForGraph: string): Observable<any> {
    console.log('http://localhost:8081/api/v1/cache/node/' + websiteNameForGraph + "/all");
    return this.http.get('http://localhost:8081/api/v1/cache/node/' + websiteNameForGraph + "/all") // The User has to type welt.de or focus.de etc.
  }
  /**
   * The User tells the Server what Website to crawl next.
   * @param websiteNameForCrawler Input by the User
   * @param crawledWebsiteID
   * @returns a Post-Request-Observable, which can be subscribed upon to view the answer of the Server and Error messages
   */
  addWebsiteToCrawlerList(websiteNameForCrawler: string): Observable<any>{
    return this.http.post<any>('http://localhost:8080/api/v1/cache/links/add', { Id: 1, htmlLink: websiteNameForCrawler});
  }

  /**
   * Rest Call to tell the Server to crawl the newly added Websites by the User.
   * @returns an Observable with the Server response
   */
  startNewCrawlers(): Observable<any> {
    return this.http.get('http://localhost:8080/api/v1/cache/controller/start');
  }

  /**
   * Gets the List of Root-Websites, that the Crawler is working on right now (e.g. faz.de, Welt.de, Ndr.de)
   */
  getCrawlerList(): Observable<any> {
    return this.http.get('http://localhost:8081/api/v1/cache/links/get');
  }

  /**
   * Delete a Website in the Crawler-List/ Tell the Crawler not to crawl this Website anymore.
   */
  deleteWebsiteFromCrawlerList(websiteNameForCrawler: string): Observable<any>{
    return this.http.post<any>('http://localhost:8080/api/v1/cache/links/delete', { Id: 1, htmlLink: websiteNameForCrawler});
  }

}




