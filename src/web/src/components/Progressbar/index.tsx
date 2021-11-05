import React, { Component } from 'react';
import { CEF } from 'api';
import styled from 'styled-components';

interface ProgressbarState {
  show: boolean;
  width: number;
  text: string;
}

class Progressbar extends Component<any, ProgressbarState> {
  constructor(props: any) {
    super(props);

    this.state = {
      show: false,
      width: 0,
      text: '',
    }

    CEF.progressbar.show = (show) => {
      this.setState({ show });
    }

    CEF.progressbar.update = (width) => {
      this.setState({ width });
    }

    CEF.progressbar.setText = (text) => {
      text = unescape(text);
      this.setState({ text });
    }
  }

  componentDidMount() {
    
  }

  render() {
    const { show, width, text } = this.state;
    return (
      <Wrap style={{ display: show ? 'flex' : 'none' }}>
        <span>{text}</span>
        <div className="bar">
          <span style={{ width: width + '%' }}></span>
        </div>
      </Wrap>
    );
  }
}

const Wrap = styled.div`
  position: absolute;
  width: 300px;
  bottom: 50px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  justify-content: center;

  & > div {
    height: 15px;
    width: 100%;
    position: relative;
    background: #555;
    padding: 2px;
    /* box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3); */
    border-radius: 30px;

    & > span {
      display: block;
      height: 100%;
      /* transition: width 0.3s ease; */
      /* background-color: rgb(43, 194, 83); */
      background-color: rgb(100, 200, 85);
      /* background-image: linear-gradient(center bottom, rgb(100, 200, 85) 37%, rgba(0, 0, 0, 0.68) 69%); */
      border-radius: 30px;
      position: relative;
      overflow: hidden;
    }
  }

  & > span {
    text-align: center;
    color: #fff;
    text-shadow: 0 7px 20px rgba(0, 0, 0, 0.59);
    font-size: 20px;
    font-weight: bold;
    display: block;
    font-style: italic;
    margin-bottom: 5px;
  }
`;

export default Progressbar;
