import { Component, OnInit } from '@angular/core';
import { WebsiteService } from 'src/app/website.service';
import { Website } from 'src/app/website'; //Modell

@Component({
  selector: 'app-website-list',
  templateUrl: './website-list.component.html',
  styleUrls: ['./website-list.component.css']
})
export class WebsiteListComponent implements OnInit {
  rootWebsiteName: string = ""
  websites: Website[];
 
  loading: boolean = false;
  errorMessage;

  constructor(private websiteService: WebsiteService) { }

  public getWebsiteNodes() {
    this.loading = true;
    this.errorMessage = "";
    this.websiteService.getWebsiteNodes(this.rootWebsiteName)
      .subscribe(
        (response) => {                           //next() callback
          console.log('response received')
          this.websites = response; 
        },
        (error) => {                              //error() callback
          console.error('Request failed with error')
          this.errorMessage = error;
          this.loading = false;
        },
        () => {                                   //complete() callback
          console.error('Request completed')      //This is actually not needed 
          this.loading = false; 
        })
}
  ngOnInit(): void {
    
}
}