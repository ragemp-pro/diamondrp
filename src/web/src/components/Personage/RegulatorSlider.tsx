import React, { Component } from 'react';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

interface RegulatorSlider {
  el: HTMLElement;
  $el: JQuery;
}
interface RegulatorSliderProps {
  title: string;
  random?: boolean;
  range: [number, number];
  in?: boolean;
  features?: boolean;
  handler(value: number): void;
}

class RegulatorSlider extends Component<RegulatorSliderProps, any> {
  componentDidMount = () => {
    this.$el = $(this.el);
    // @ts-ignore
    this.$el.slider({
      value: (this.props.range[0] + this.props.range[1]) / 2,
      orientation: 'horizontal',
      range: 'min',
      step: 0.01,
      min: this.props.range[0],
      max: this.props.range[1],
      animate: true,
      slide: (_: any, { value }: { value: number }) => {
        if (!this.props.random) {
          this.props.handler(value);
        }
      },
    });
  };

  componentDidUpdate() {
    if (this.props.random) {
      let value = this.props.range[0] + Math.random() * (this.props.range[1] - this.props.range[0]);
      this.props.handler(value);
      // @ts-ignore
      this.$el.slider('value', value);
    }
  }

  render() {
    return (
      <div className={'regulator-wrap' + (this.props.in ? '-in' : '')} style={{ marginBottom: this.props.features ? 20 : 0 }}>
        <p>{this.props.title}</p>
        <div
          className={'regulator' + (!this.props.in ? '-in' : '')}
          ref={(el) => (this.el = el)}
        ></div>
      </div>
    );
  }
}

export default RegulatorSlider;
