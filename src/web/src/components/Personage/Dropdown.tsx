import React, { Component } from 'react';
import { API, CEF } from 'api';
import $ from 'jquery';

interface Dropdown {
  el: HTMLElement;
  $el: JQuery;
}
interface DropdownProps {
  title: string;
  handler?(): void;
}

class Dropdown extends Component<DropdownProps, any> {
  componentDidMount = () => {
    this.$el = $(this.el);
    this.$el.on('click', function() {
      if (
        $(this)
          .parent()
          .hasClass('open')
      ) {
        $(this)
          .parent()
          .removeClass('open');
        $(this)
          .next()
          .slideUp('fast');
        console.log('close');
      } else {
        $('.drop-box').removeClass('open');
        $('.drop-hidden').slideUp('fast');
        $(this)
          .parent()
          .toggleClass('open');
        $(this)
          .next()
          .slideToggle('fast');
        console.log('open');
      }
    });
  };

  render() {
    return (
      <div className="drop-box">
        <div className="drop-title" ref={(el) => (this.el = el)}>
          <p>{this.props.title}</p>
          <i className="arrow">
            <img src={require('./images/svg/arrow-bottom.svg')} alt="" />
          </i>
        </div>
        <div className="drop-hidden">{this.props.children}</div>
      </div>
    );
  }
}

export default Dropdown;
