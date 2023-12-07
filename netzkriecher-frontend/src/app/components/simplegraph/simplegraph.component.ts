import {Component, ViewChild} from '@angular/core'
import { GraphSeriesOption, List } from 'echarts';
import { graphic } from 'echarts';
import * as data from '../../../assets/tagesschauNew.json'
import { NodeInfoComponent } from 'src/app/node-info/node-info.component';
import { WebsiteService } from 'src/app/website.service';
import { NumberSymbol } from '@angular/common';
import { Position } from '@angular/compiler';
import { WebsiteRegister, GraphData, V2, GraphEdgeLineStyleOption, SeriesLineLabelOption, GraphEdgeOptions, GraphNodeItemOption,
  NodeFromJson, WebsiteMap} from 'src/app/graphData'
import { Website } from 'src/app/website';
import { stringify } from '@angular/compiler/src/util';
import '@angular/material';
import { MatIcon} from "@angular/material/icon";

const spacingThreshhold = 0.007
const outerColor = 'purple'
const innerColor = 'red'
const innerColorHover = 'orange'
const selectedColorInner = '#fff';
const websiteSpacing = 1000
const TAU = 6.283185307179586
@Component({
  selector: 'app-simplegraph',
  templateUrl: './simplegraph.component.html',
  styleUrls: ['./simplegraph.component.css']
})

/*
considerations for node placement:
- for first layer: for all childs of root, sum up all their children. Then try to find a configuration,
where the 'center of mass' is at the root node. (adding up vectors * weight should equal 0 at the end)
- might not work, because a valid strategy for that would also be to just dump all of the nodes at opposite ends

- after finishing a whole depth layer, there might be a lot of space left unoccupied in that layer
- the childnoderanges for the layer before could be accordingly ajusted to use up the whole 360°
- (or atleast space them out more)

*/


export class SimplegraphComponent
{
  totalWidth = 1000;
  halfWidth = 500;
  totalHeight = 1000;
  halfHeight = 500;
  nodeSizeFalloff = 200;
  radiusPerIteration = 100;
  options: any;
  img : HTMLImageElement | null;
  websiteRegister: WebsiteRegister;
  websiteNameForGraph: string = "";
  websiteNameForCrawler: string = "";
  nodeMap: Map<string, NodeFromJson>;
  crawlerList: [];
  loading: boolean = false;
  crawledWebsiteID: number = 2;
  postId: number;
  errorMessage;
  graphData : GraphData;
  @ViewChild(NodeInfoComponent) nodeInfoComponent: NodeInfoComponent;

  nodeConnectionStyle : GraphEdgeLineStyleOption =
  {
    curveness : 0,
    width: 1,
    color: 'grey',
    opacity: 0.8,
    type: 'dashed',
    cap: 'square',
    join: 'bevel',
    dashOffset: 10,
    miterLimit: 10,
  };

  domChildConnectionStyle : GraphEdgeLineStyleOption =
          {
            curveness : 0,
            width: 2,
            color: 'blue',
            opacity: 0.8,
            type: 'solid',
            cap: 'square',
            join: 'bevel',
            dashOffset: 10,
            miterLimit: 10,
          };


  constructor(private websiteService: WebsiteService)
  {
  }

  remap(n : number, oldFrom : number, oldTo : number, newFrom : number, newTo: number) : number
  {
    let oldRange = oldTo - oldFrom;
    let proportion = (n - oldFrom) / oldRange;
    let newRange = newTo - newFrom;
    return newFrom + newRange * proportion;
  }

  calculatePosition(depth : number, index : number, total : number, rangeFrom : number, rangeTo: number, graphOffset : V2) : V2
  {
    let radians = (total == 1) ? 0.5 * TAU : (index/total) * TAU;

    let radiansRemapped = this.remap(radians, 0, TAU, rangeFrom, rangeTo);

    let x = Math.cos(radiansRemapped) * depth * this.radiusPerIteration + graphOffset.x;
    let y = Math.sin(radiansRemapped) * depth * this.radiusPerIteration + graphOffset.y;

    let pos = new V2(x,y);
    return this.calculateOffset(pos);
  }

  calculateOffset(pos : V2): V2
  {
    return new V2(pos.x + this.halfWidth, pos.y + this.halfHeight);
  }

  getSymbolSize(currentDepth : number, radiansAvailable : number) : number
  {
    let frac =  radiansAvailable / TAU;

    let multiplier = 1
    if(frac < spacingThreshhold)
    {
      multiplier = frac/spacingThreshhold
    }
    let size = 20 * (1/(currentDepth+1)) * multiplier

    return size
  }

  getGraphData(websiteReg : WebsiteRegister) : GraphData
  {
    let data : GraphNodeItemOption[] = [];
    let linkData : GraphEdgeOptions[] = [];

    websiteReg.map.forEach((value: WebsiteMap, key: string) =>
    {
      let root = value.map.get(value.rootName) as NodeFromJson;
      let rPos = root.nodePositionalInformation;
      let rootNodeOptions : GraphNodeItemOption = {
        name : root.url,
        x : rPos.position.x,
        y : rPos.position.y,
        category : 'root',
        symbol : 'circle',
        symbolSize : rPos.symbolSize
      };

      data.push(rootNodeOptions);

      let visited : NodeFromJson[] = []
      let queue : NodeFromJson[] = []

      queue.push(root)

      while(queue.length > 0)
      {
        let currentNode = queue.shift() as NodeFromJson;
        visited.push(currentNode);

        let domChilds = currentNode.domChilds;

        if(this.allConnectionsActive)
        {
          let intLinks = currentNode.intLinks;
          console.log(currentNode.intLinks);

          for (let i = 0; i < intLinks.length; i++)
          {

            let n = value.map.get(intLinks[i]);

            if(n == undefined)
              continue;

            let label : SeriesLineLabelOption =
            {
              position : 'start',
              distance : 10
            }

            let graphEdgeOption : GraphEdgeOptions =
            {
              lineStyle : this.nodeConnectionStyle,
              label : label,
              source : currentNode.url,
              target : n.url,
              symbol :  ['none', 'arrow'],
              symbolSize : [0,5],
              value : 3
            };
            linkData.push(graphEdgeOption);
          }
        }

        for (let i = 0; i < domChilds.length; i++) {
          let n = value.map.get(domChilds[i]) as NodeFromJson;
          let posInfo = n.nodePositionalInformation;
          let arrowSize = n.nodePositionalInformation.symbolSize * 0.7
          //show links to domChilds

          if(this.domConnectionsActive)
          {
            let label : SeriesLineLabelOption =
            {
              position : 'start',
              distance : 10
            }

            let graphEdgeOption : GraphEdgeOptions =
            {
              lineStyle : this.domChildConnectionStyle,
              label : label,
              source : currentNode.url,
              target : n.url,
              symbol :  ['none', 'arrow'],
              symbolSize : [0,arrowSize],
              value : 3
            };
            linkData.push(graphEdgeOption);
          }

          //add node if it doesnt already exist
          if(!visited.includes(n))
          {
            let color = innerColor;
            if(this.selectedNodeName == n.url)
            {
              color = selectedColorInner;
            }
            //let domName = n.getDOMStripedName();
            let nodeItemOptions : GraphNodeItemOption<string> = {
              name : n.url,
              x : posInfo.position.x,
              y : posInfo.position.y,
              category : 'not root',
              draggable : false,
              symbol : 'circle',
              symbolSize : posInfo.symbolSize,
              symbolOffset : 0,
              symbolRotate : 0,
              itemStyle :
              {
                color: {
                  type : 'radial',
                  x : 0.5,
                  y : 0.5,
                  r : 0.5,
                  colorStops : [{
                    offset : 0.0,
                    color : color
                  },
                  {
                    offset: 1.0,
                    color: outerColor
                  }
                ]
                , global : false
                },
                opacity : 1
              },
              emphasis :
              {
                itemStyle : {
                  color : {
                    type : 'radial',
                    x : 0.5,
                    y : 0.5,
                    r : 0.5,
                    colorStops : [{
                      offset : 0.0,
                      color : innerColorHover
                    },
                    {
                      offset: 1.0,
                      color: outerColor
                    }
                  ]
                  , global : false
                  },
                  opacity : 1,
                },
              },
            };
            data.push(nodeItemOptions);
             queue.push(n);
          }
        }
      }

      if(this.selectedNodeName != "" && !this.allConnectionsActive)
      {
        let node = value.map.get(this.selectedNodeName) as NodeFromJson;
        for (let i = 0; i < node.intLinks.length; i++)
        {
          let n = value.map.get(node.intLinks[i]) as NodeFromJson;

          let label : SeriesLineLabelOption =
          {
            position : 'start',
            distance : 10
          }

          let doubleSided = false;

          if(n != undefined)
          {
            n.intLinks.forEach(element => {
              if(element == node.url)
              {
                doubleSided = true;
              }
            });
          }

          let symbol : string | string[] = [];
          let symbolSize : number | number[] = [];
          if(doubleSided)
          {
            symbol = ['arrow', 'arrow'];
            symbolSize = [5,5];
          }

          else {
            symbol = ['none', 'arrow'];
            symbolSize = [0,5];
          }

          let graphEdgeOption : GraphEdgeOptions =
          {
            lineStyle : this.nodeConnectionStyle,
            label : label,
            source : node.url,
            target : node.intLinks[i],
            symbol : symbol,
            symbolSize : symbolSize,
            value : 3
          };
          linkData.push(graphEdgeOption);
        }
      }
    });

    let graphData = new GraphData(data, linkData);
    return graphData;
  }

  calculatePositions(websiteReg : WebsiteRegister): void
  {
    websiteReg.map.forEach((value: WebsiteMap, key: string) =>
    {
    let root = value.map.get(value.rootName) as NodeFromJson
    let rootPosition = this.calculatePosition(0, 1, 1, 0, TAU, value.offset);
    let rootSize = this.getSymbolSize(root.depth, TAU)
    root.nodePositionalInformation =  { position : rootPosition, symbolSize : rootSize, rangeFrom : 0, rangeTo :  TAU }

    let visited : NodeFromJson[] = []
    let queue : NodeFromJson[] = []
    queue.push(root)

    while(queue.length > 0)
    {
      let currentNode = queue.shift() as NodeFromJson;
      visited.push(currentNode);

      let domChilds = currentNode.domChilds;
      let radiansPerChild = (currentNode.nodePositionalInformation.rangeTo - currentNode.nodePositionalInformation.rangeFrom) / domChilds.length;
      let currentRadians = 0;

      for (let i = 0; i < domChilds.length; i++) {
        let n = value.map.get(domChilds[i]) as NodeFromJson;
        if(!visited.includes(n))
        {
          let symbolSize = this.getSymbolSize(n.depth, radiansPerChild)
          let nodePosition = this.calculatePosition(n.depth, i, domChilds.length,  currentNode.nodePositionalInformation.rangeFrom, currentNode.nodePositionalInformation.rangeTo, value.offset);
          let rangeFrom = currentNode.nodePositionalInformation.rangeFrom + currentRadians - (radiansPerChild * 0.5);
          currentRadians += radiansPerChild;
          let rangeTo = currentNode.nodePositionalInformation.rangeFrom + currentRadians - (radiansPerChild * 0.5);
          n.nodePositionalInformation =
          {
            position : nodePosition,
            symbolSize : symbolSize,
            rangeFrom : rangeFrom,
            rangeTo : rangeTo
          };

          queue.push(n);
        }
      }
    }
    });
  }

  onChartMouseOver(ec){}

  onChartClick(ec)
  {
    let n : NodeFromJson | undefined = this.websiteRegister.getNode(ec.name);
    if(n != undefined)
    {
      this.selectedNodeName = n.url;
      this.showGraph();
      this.nodeInfoComponent.node = n
      this.nodeInfoComponent.initializeTable();
      return;
    }

  }
  selectedNodeName = "";
  domConnectionsActive = true;
  allConnectionsActive = false;
  labelsActive = false;

  showAllConnections()
  {
    this.allConnectionsActive = !this.allConnectionsActive;
    this.showGraph();
  }

  showConnections()
  {
    this.domConnectionsActive = !this.domConnectionsActive;
    this.showGraph();
  }

  showLabels()
  {
    this.labelsActive = !this.labelsActive;
    this.showGraph();
  }

  deselectAll()
  {
    //this.showIntMedia(this.website.internalMedia);
  }

  getOffset(websiteIndex: number, total: number) : V2
  {
    let frac = (websiteIndex/total) * TAU;
    let x = Math.cos(frac) * websiteSpacing
    let y = Math.sin(frac) * websiteSpacing
    return new V2(x,y)
  }

  prepareWebsite(name : string, data : string, websiteIndex : number, total : number)// : WebsiteMap
  {
    let dictElements : {[index:string] : string}[] = JSON.parse(data)
    let nodeMap : Map<string, NodeFromJson> = new Map<string, NodeFromJson>();
    let rootName : string = "";
    let mediaIntGlobal : string[] = [];

    for (let index = 0; index < dictElements.length; index++)
    {
      const element = dictElements[index];

      //root
      if (index == 0)
      {
        rootName = element.url
      }

      let n : NodeFromJson = new NodeFromJson();
      if(element.url == undefined)
      {
        continue
      }
      n.url = element.url;
      n.parentDocId = element.parentDocId;
      n.docId = element.docId;
      n.extMedia = element['link:ext:media'] as unknown as string[];
      n.intMedia = element['link:int:media'] as unknown as string[];
      n.extLinks = element['link:ext'] as unknown as string[];
      n.intLinks = element['link:int'] as unknown as string[];

      n.getDepth();
      n.getDOMParent();
      if(n.depth >= 0)
      {
        nodeMap.set(n.url, n);
      }
    }

    nodeMap.forEach((node: NodeFromJson, key: string) =>
    {
      if(node.domParent != "")
      {
        let parent = nodeMap.get(node.domParent);
        if(parent != undefined)
        {
          parent.domChilds.push(key);
        }
      }
    });
    let website = new WebsiteMap(name, nodeMap, mediaIntGlobal);
    website.rootName = rootName;
    website.offset = this.getOffset(websiteIndex, total);
    this.websiteRegister.map.set(name, website)
    //return website;
  }

  /**Restart Crawler in the Backend */
  crawlNewWebsites(){
    this.websiteService.startNewCrawlers().subscribe({
      next: data => {
        this.postId = data.id;
        console.log(data);
      },
      error: error => {
        this.errorMessage = error.error;
        console.error('There was an error!', error);
        alert(this.errorMessage);
      }
    });
  }


  /**
   * Get the List of 'Root-Websites', that the Crawler has in his Cache (e.g. Wdr.de, faz.de)
   */
  getCrawlerList(){
    this.loading = true;
    this.errorMessage = "";
    this.websiteService.getCrawlerList()
      .subscribe(
        (data) => {                           //next() callback
          console.log('response received')
          this.crawlerList = data;
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


  websitesToDisplay : Map<string, string>;

  ngOnInit(): void
  {
    this.websitesToDisplay = new Map<string, string>()
    this.websitesToDisplay.set('Tagesschau,de', JSON.stringify(data))

    this.websiteRegister = new WebsiteRegister();
    this.getCrawlerList();
    this.prepareGraph()
    this.showGraph()
  }


  /**
   * The method fetches, saves and prepares the data for the Creation of the Website Graph. Approximately 200 Nodes,
   * that were crawled by the Worker and saved into Redis, get fetched. The data is saved into dictionaries, adapting to
   * the Data structure that was created in the Backend. Then the Nodes for the Graph are created, the Echarts-Settings
   * for the Visualisation of the data get configured and the Graph gets initialized.
   */
  getWebsiteGraph(website: string){
    this.websitesToDisplay = new Map<string, string>();
    let websiteNameForGraph = website.replace('https://www.', '').replace('/', '');
    this.websiteService.getWebsiteNodes(websiteNameForGraph).subscribe(
      data => {
        console.log(data);
        this.websitesToDisplay.set(websiteNameForGraph, JSON.stringify(data));

        this.websiteRegister = new WebsiteRegister();
        this.prepareGraph();
        this.showGraph();

      });
    }


  prepareGraph()
  {
    this.websiteRegister.map.clear()
    let websiteIndex = 0
    let total = this.websitesToDisplay.size
    this.websitesToDisplay.forEach((value : string, key : string) =>
    {
      this.prepareWebsite(key, value, websiteIndex, total);
    })

    this.calculatePositions(this.websiteRegister);

    //let img = document.getElementById("img") as HTMLImageElement;
    //img?.setAttribute("src", '../../assets/Images/NodeTest.png');
    //let text : graphic.Text = new graphic.Text();
    //text.style.text = "Hello";
  }

  getGraphSeriesOptions() : GraphSeriesOption
  {
    this.graphData = this.getGraphData(this.websiteRegister);

    let edges = this.domConnectionsActive ? this.graphData.linkData : undefined;
    let graphSeriesOptions : GraphSeriesOption =
    {
      cursor : 'hand', //'arrow'?
      colorBy : 'data',
      hoverLayerThreshold : 1,
      selectedMode : 'single', //used for selecting?
      name : 'Sitemap',
      type : 'graph',
      //coordinateSystem: 'none',
      legendHoverLink : false,
      layout : 'none',
      nodes : this.graphData.nodeData,
      edges : edges,
      draggable : false,
      roam : true,
      color : '#DF4477',
      nodeScaleRatio : 0.6,
      label : {
        fontStyle : 'normal',
        show : this.labelsActive,
        color : 'black',
        overflow : 'truncate',
        tag : '!!!!!!'
      },
        //color :  'red'
        /*
        color :
        {
          svgElement : svgElement,
          svgWidth : 10,
          svgHeight : 10,
          type : 'pattern',
          x : 1,
          y : 1,
          rotation : 0,
          scaleX : 1,
          scaleY : 1
        }
        */
    }
    return graphSeriesOptions;
  }

  showGraph()
  {
    let g1 = this.getGraphSeriesOptions();
    //let g2 = this.getGraphSeriesOptions();

    this.options =
    {
      title:
      {
        text: 'Crawled Sites'//this.website.name,

      },
      tooltip: {},
      animation:false,
      animationDurationUpdate: 1000,
      animationEasingUpdate: 'quinticInOut',
      series: [g1]//,g2]
    };

    //let map = graphSeriesOptions.selectedMap;
  }

  /**
   * The User tells the Server which Website it should crawl next and adds the Website to the List of crawled
   * Websites, so a Graph can be created later on for this Website. The POST-Request to the Server is
   * initialized and the Answer of the Server is read and told to the User.
   */
  addWebsiteToCrawlerList() {
    this.websiteService.addWebsiteToCrawlerList(this.websiteNameForCrawler).subscribe({
      next: data => {
        this.postId = data.id;
        console.log(data);
        this.getCrawlerList();
      },
      error: error => {
        this.errorMessage = error.error;
        console.error('There was an error!', error);
        alert(this.errorMessage);
      }

    });
  }

  /**
   * Deletes a Root-Website from Cache in the Backend, so the Worker doesn't crawl this Website anymore
   *
   * @param websiteName The Name of the Root-Website that the User doesn't want in his Crawler-List anymore
   */
  deleteWebsiteFromCrawlerList(websiteName: string){

    this.websiteService.deleteWebsiteFromCrawlerList(websiteName).subscribe(
      data => {                           //next() callback
        console.log('response received')
        this.crawlerList = data;
      },
      (error) => {                              //error() callback
        this.errorMessage = error.error;
        alert(this.errorMessage);
        this.loading = false;
      },
      () => {                                   //complete() callback
        this.loading = false;
      }

    )

  }


  ngAfterViewInit()
  {
    console.log("NODEINFO?", this.nodeInfoComponent);
  }
}
