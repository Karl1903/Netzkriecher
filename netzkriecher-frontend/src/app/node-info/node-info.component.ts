import { Component, Directive, Input, ViewContainerRef } from '@angular/core';
import { NodeFromJson } from '../graphData'

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.css']
})
export class NodeInfoComponent 
{

  @Input() node : NodeFromJson = new NodeFromJson;

  intMedia : string[][] = [];
  extMedia : string[][] = [];

  constructor(public viewContainerRef: ViewContainerRef) { }

  arrElements : string[] = ['intLinks','extLinks','intMedia','extMedia','domChilds']

  ngOnInit(): void 
  {
  }

  show(id : string) : void
  {
    let element = document.getElementById(id) as HTMLElement;
    element.style.display = element?.style.display == '' ? 'none': '';
    this.arrElements.forEach(element => 
    {
      if(element != id)
      {
        (document.getElementById(element) as HTMLElement).style.display = 'none'
      }
    });
  }

  initializeTable()
  {
    this.intMedia = this.listToTable(this.node.intMedia);
    this.extMedia = this.listToTable(this.node.extMedia);
  }

  listToTable(media : string[]) : string[][]
  {
    let ret : string[][] = []
    let rowDict : string[] = []
    let column = 0
    media.forEach((url: string) => 
    {
      rowDict.push(url);

      column++;
      if(column > 5)
      {
        column = 0;
        ret.push(rowDict)
        rowDict = []
      }
    });
    //console.log(ret);
    return ret;
  }
}
