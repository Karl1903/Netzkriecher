import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  @Input('toggle') isToggle: boolean | string;
  @Input() toggleColor: string = "#FFF"
  @Input() text: string = "ss";
  @Input() color: string = "#FFF";
  @Input() fontSize: string = "12pt";
  @Output() btnClick = new EventEmitter()

  toggled : boolean = false;
  constructor() { }

  ngOnInit(): void 
  {
    this.isToggle = this.isToggle !== undefined
  }

  onClick() 
  {
    if(this.isToggle)
    {
      this.toggled = !this.toggled;
    }
    this.btnClick.emit();
  }

  styleObject() : Object
  {
    if(this.isToggle)
    {
      if(this.toggled)
      {
        return {'background-color': this.toggleColor, 'font-size': this.fontSize}
      }
    }
    return {'background-color': this.color, 'font-size': this.fontSize}
  }
}
