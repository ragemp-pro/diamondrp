import React, { Component } from 'react';

export default class Loading extends Component<any,{loading?:string}> {
  render() {
    return <>
    {this.props.loading ? <div className="lds-dual-ring-block"/> : "" }
    <div className="lds-dual-ring"></div>
    {this.props.loading ? <div className="lds-dual-ring-text">{this.props.loading}</div> : "" }
    </>;
  }
}
