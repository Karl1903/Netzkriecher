import { Color } from "echarts";

//Wrapper for Graphdata
export class GraphData
{
  nodeData : GraphNodeItemOption[];
  linkData : GraphEdgeOptions[];

  constructor(t_nodeData : GraphNodeItemOption[], t_linkData : GraphEdgeOptions[]) 
  {
    this.nodeData = t_nodeData;
    this.linkData = t_linkData;
  }
}

//Helper for Vector2 operations
export class V2
{
  x: number;
  y: number;

  constructor(t_x : number, t_y: number)
  {
    this.x = t_x;
    this.y = t_y;
  }
}

//information about Node Positioning
export class NodePositionalInformation
{
  position : V2;
  symbolSize : number;
  rangeFrom : number = 0;
  rangeTo : number = Math.PI * 2;
}

//information about a Node in a Website
export class NodeFromJson
{
  nodePositionalInformation : NodePositionalInformation = {position : {x:0,y:1}, symbolSize: 1, rangeFrom :0,rangeTo:Math.PI * 2};
  url: string;
  depth: number;
  docId: string;
  parentDocId: string;
  domParent: string = "";
  intLinks: string[];
  intMedia: string[];
  extLinks: string[];
  extMedia: string[];
  domChilds: string[] = [];

  //rangeFrom : number = 0;
  //rangeTo : number = Math.PI * 2;

  getDOMStripedName(): string | undefined
  {
    if(this.depth <= 0 ||this.url.length <= 0)
      return this.url;


    for (let index = this.url.length - 1; index >= 0; index--) {
      const element = this.url[index];
      if(element == '/')
      {
        return this.url.slice(index);
      }
    }

    return "";
  }

  getDOMParent(): void
  {
    if(this.depth <= 0)
      return

    let slashCount = this.depth + 2
    if("this.url.includes('.html')")
    {
      slashCount--;
    }

    for (let index = 0; index < this.url.length; index++) {
      const element = this.url[index];
      if(element == '/')
      {
        slashCount--;
      }
      if(slashCount == 0)
      {
        this.domParent =  this.url.substring(0, index + 2);
      }
    }
  }

  getDepth() : void
  {
    let count : number = -3;
    for (let index = 0; index < this.url.length; index++) {
      const element = this.url[index];
      if(element == '/')
      {
        count++;
      }
    }
    if(this.url.includes('.html') || this.url.includes('.shtml'))
    {
      count++;
    }

    this.depth = count;
  }
}

//a collection of different WebsiteMaps
export class WebsiteRegister
{
  name: string;
  map : Map<string, WebsiteMap>;

  constructor()
  {
    this.map = new Map<string, WebsiteMap>();
  }

  getNode(nodeKey : string) : NodeFromJson | undefined
  {
    let node : NodeFromJson | undefined; 
    this.map.forEach((value: WebsiteMap, key: string) => 
    {
      let n = value.map.get(nodeKey);
      if (n != undefined)
      {
        node = n
      }
    });
    return node;
  }
}

//a website
export class WebsiteMap
{
  name : string;
  rootName : string;
  map : Map<string, NodeFromJson>;
  internalMedia : string[];
  offset : V2;

  constructor(t_name : string, t_map : Map<string, NodeFromJson>,  t_internalMedia :string[]) 
  {
    this.name = t_name;
    this.map = t_map;
    this.internalMedia = t_internalMedia;
  }
}

/*
-----------------------------------------------------------------------
------------------------SHADOW API FROM ECHARTS------------------------
-----------------------------------------------------------------------
*/

declare type ColorString = string;
declare type ZRLineType = 'solid' | 'dotted' | 'dashed' | number | number[];

export class ShadowOptionMixin 
{
  shadowBlur?: number;
  shadowColor?: ColorString;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class LineStyleOption<Clr = Color> extends ShadowOptionMixin 
{
  width?: number;
  color?: Clr;
  opacity?: number;
  type?: ZRLineType;
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
  dashOffset?: number;
  miterLimit?: number;
}

export class GraphEdgeLineStyleOption extends LineStyleOption 
{
  curveness?: number;
}

export class LineLabelOption
{
  position?: 'start' | 'middle' | 'end' | 'insideStart' | 'insideStartTop' | 'insideStartBottom' | 'insideMiddle' | 'insideMiddleTop' | 'insideMiddleBottom' | 'insideEnd' | 'insideEndTop' | 'insideEndBottom' | 'insideMiddleBottom';
  distance?: number | number[];
}

export class SeriesLineLabelOption extends LineLabelOption 
{
  formatter?: string;
}

export class GraphEdgeOptions
{
  lineStyle?: GraphEdgeLineStyleOption;
  label?: SeriesLineLabelOption;
  value? : number
  source? : number | string;
  target? : number | string;
  symbol?: string | string[];
  symbolSize?: number | number[];
}

export declare type SymbolCallback<T> = (rawValue: any, params: T) => string;

interface StatesOptionMixin<StateOption, StatesMixin extends StatesMixinBase> {
    /**
     * Emphasis states
     */
    emphasis?: StateOption & StatesMixin['emphasis'] & {
        /**
         * Scope of blurred element when focus.
         *
         * coordinateSystem: blur others in the same coordinateSystem
         * series: blur others in the same series
         * global: blur all others
         *
         * Default to be coordinate system.
         */
        blurScope?: BlurScope;
    };
    /**
     * Select states
     */
    select?: StateOption & StatesMixin['select'];
    /**
     * Blur states.
     */
    blur?: StateOption & StatesMixin['blur'];
}


interface SeriesLabelOption  {
    formatter?: string;
}

interface GraphNodeStateOption<TCbParams = never> {
    itemStyle?: ItemStyleOption<TCbParams>;
    label?: SeriesLabelOption;
}

declare type DefaultEmphasisFocus = 'none' | 'self' | 'series';
interface DefaultStatesMixinEmpasis {
    /**
     * self: Focus self and blur all others.
     * series: Focus series and blur all other series.
     */
    focus?: DefaultEmphasisFocus;
}

interface ExtraEmphasisState {
    focus?: DefaultEmphasisFocus | 'adjacency';
}

interface GraphNodeStatesMixin {
    emphasis?: ExtraEmphasisState;
}

export interface GraphNodeItemOption<T = never> extends StatesOptionMixin<GraphNodeStateOption, GraphNodeStatesMixin>
{
  id?: string;
  name?: string;
  category?: number | string;
  draggable?: boolean;
  x?: number; //fixed x Position 
  y?: number; //fixed y Position

  //from SymbolOptionMixin
  symbol?: string | (T extends never ? never :SymbolCallback<T>); //accept 'circle', 'rect' or custom path and image
  symbolSize?: number;
  symbolRotate?: number;
  symbolKeepAspect?: boolean;
  symbolOffset?: string | number;

  //from GraphNodeStateOption

  //label?: SeriesLineLabelOption; 
  itemStyle?: ItemStyleOption;
  //label?: SeriesLabelOption;
}

interface StatesMixinBase {
    emphasis?: unknown;
    select?: unknown;
    blur?: unknown;
}

interface StatesOptionMixin<StateOption, StatesMixin extends StatesMixinBase> {
    /**
     * Emphasis states
     */
    emphasis?: StateOption & StatesMixin['emphasis'] & {
        /**
         * Scope of blurred element when focus.
         *
         * coordinateSystem: blur others in the same coordinateSystem
         * series: blur others in the same series
         * global: blur all others
         *
         * Default to be coordinate system.
         */
        blurScope?: BlurScope;
    };
    /**
     * Select states
     */
    select?: StateOption & StatesMixin['select'];
    /**
     * Blur states.
     */
    blur?: StateOption & StatesMixin['blur'];
}

declare type BlurScope = 'coordinateSystem' | 'series' | 'global';

interface ItemStyleOption<TCbParams = never> extends ShadowOptionMixin 
{
    color?: Color | (TCbParams extends never ? never : ((params: TCbParams) => Color));
    opacity?: number;
    decal?: /*DecalObject | */'none';
}