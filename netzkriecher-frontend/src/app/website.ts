import { NodeFromJson } from "./graphData"

export class Website
 {
   name : string;
   map : Map<string, NodeFromJson>;
 
   constructor(t_name : string, t_map : Map<string, NodeFromJson>) 
   {
     this.name = t_name;
     this.map = t_map;
   }
 }
