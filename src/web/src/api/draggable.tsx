import React, { Component } from "react";

interface DropPositionEl {
  dragid:string;
  dragset?:(id:string)=>void;
  enterDrag?:(id:string)=>void;
  leaveDrag?:()=>void;
  bind?:(id:string)=>any;
  id?:string;
  render?:any
}
interface DragTargetEl {
  drop?:()=>any;
  dragstart?:()=>any;
  dragend?:(inside:boolean, targetid:string)=>any;
  id?:string;
  ignoreids?:string[];
  render?:any
}

let dragenter = false;
let dragenterid = "";


export class DropPosition extends Component<DropPositionEl, {}> {
  constructor(props: any) {
    super(props);
  }
  render() {
    const content = this.props.render ? this.props.render(this.state) : this.props.children;
    return (<div onDragOver={(e) => {
      e.preventDefault();
      dragenter = true;
      dragenterid = this.props.dragid;
    }} onDragEnter={(e) => {   
      dragenter = true;  
      dragenterid = this.props.dragid;
      if(this.props.dragset)this.props.dragset(this.props.dragid)
      if(this.props.enterDrag) this.props.enterDrag(this.props.dragid)
      if(this.props.bind) this.props.bind(this.props.dragid)
    }} onDragLeave={(e) => {      
      dragenter = false;
      dragenterid = null;
      if(this.props.dragset)this.props.dragset(null)
      if(this.props.leaveDrag) this.props.leaveDrag()
      if(this.props.bind) this.props.bind(null)
  }}>{content}</div>)
  }
}
export class DragTarget extends Component<DragTargetEl, {}> {
  constructor(props: any) {
    super(props);
  }
  render() {
    const content = this.props.render ? this.props.render(this.state) : this.props.children;
    const ignoreids = this.props.ignoreids ? this.props.ignoreids : []
    return (<div draggable={true} onDragOver={(e) => {
      e.preventDefault();
    }} onDragStart={(e) => {
      e.dataTransfer.setData('text', 'foo');
      if(this.props.dragstart) this.props.dragstart()
    }} onDragEnd={(e) => {
      if(this.props.dragend) this.props.dragend((dragenter && ignoreids.indexOf(dragenterid) == -1), dragenterid)
      if(!dragenter) return;
      if(e.currentTarget.parentElement.id == dragenterid) return;
    }}>{content}</div>)
  }
}
