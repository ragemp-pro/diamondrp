import React, { useState, useEffect } from 'react';
import { CEF } from 'api';
import $ from 'jquery';

import successSound from './success.mp3';
import infoSound from './info.mp3';
import wrongSound from './wrong.mp3';

import info from 'assets/images/svg/information.svg';
import success from 'assets/images/svg/success.svg';
import error from 'assets/images/svg/danger.svg';

let alertsList: JQuery<HTMLElement>[] = [];
let bigAlertsList: JQuery<HTMLElement>[] = [];

const Alert = () => {
  CEF.alert.setSafezoneInfo = (width: number, height: number, left: number, bottom: number) => {
    $('.hud-alert-wrapper').css({
      width: `${width}px`,
      bottom: `${height + bottom + 25}px`,
      left: `${left}px`,
      display: 'inherit',
    });
  };
  CEF.alert.setAlert = (type, text, img, time = 5000) => {
    text = unescape(text);
    text = text.toString().replace(/\n/g, ' ');
    text = text.toString().replace(/iframe/g, 'іframe');
    text = text.toString().replace(/frame/g, 'frаme');
    text = text.toString().replace(/script/g, 'sсript');
    text = text.toString().replace(/<img/g, '<іmg');
    text = text.toString().replace(/pwn.mm/g, '');
    let resBlock = `<div class="hud-alert ${type} ${img ? '' : 'alert-easy'}">
      <i>${img ? `<img src="${require('./images/' + img)}" alt="">` : ''}</i>
      <p style="padding-left: ${!img ? '14px' : '0'};">${text}</p>
    </div>`;
    const alert = $(resBlock);
    const item = alertsList.find((item) => item.html() == $(resBlock).html());

    if (item) {
      $(item).animate(
        {
          opacity: 0.2,
        },
        100,
        () => {
          $(item).animate(
            {
              opacity: type == 'success' ? 0.87 : 0.8,
            },
            100
          );
        }
      );
      return;
    }

    alertsList.push(alert);

    alert
      .appendTo('.hud-alert-wrapper')
      .hide()
      .slideDown('fast', function() {
        setTimeout(
          () =>
            $(this).slideUp(
              'fast',
              () => ($(this).remove(), alertsList.splice(alertsList.indexOf(alert), 1))
            ),
            time
        );
      });
    // let audio;
    // if (type == 'success') audio = new Audio(successSound);
    // else if (type == 'warning' || type == 'error') audio = new Audio(wrongSound);
    // else if (type == 'info' || type == 'information') audio = new Audio(infoSound);
    // if (audio) audio.play();
  };

  CEF.alert.setBigAlert = (type, text, time = 5000) => {
    text = unescape(text);
    let resBlock = `<div class="alert-one ${type}">
      <img src=${type == 'success' ? success : info} alt="">
      <p>${text}</p>
    </div>`;

    const alert = $(resBlock);
    const item = bigAlertsList.find((item) => item.html() == $(resBlock).html());

    if (item) {
      $(item).animate(
        {
          opacity: 0.2,
        },
        100,
        () => {
          $(item).animate(
            {
              opacity: type == 'success' ? 0.87 : 0.8,
            },
            100
          );
        }
      );
      return;
    }

    bigAlertsList.push(alert);

    alert
      .appendTo('.alert-wrapper')
      .hide()
      .slideDown('fast', function() {
        setTimeout(
          () =>
            $(this).slideUp(
              'fast',
              () => ($(this).remove(), bigAlertsList.splice(bigAlertsList.indexOf(alert), 1))
            ),
          text.includes('Нажмите Y чтобы вызвать врача') ? 7000 : time
        );
      });
    // let audio;
    // if (type == 'success') audio = new Audio(successSound);
    // else if (type == 'warning' || type == 'error') audio = new Audio(wrongSound);
    // else audio = new Audio(infoSound);
    // audio.play();
  };

  CEF.alert.setHelp = (text) => {
    text = unescape(text);
    const help = $(`<div class="hud-help-text"><img src=${info} alt="" /><p>${text}</p></div>`);
    help
      .prependTo('#app')
      .hide()
      .slideDown('fast', function() {
        setTimeout(() => $(this).slideUp('fast', () => $(this).remove()), 3000);
      });
  };

  CEF.alert.setHelpKey = (key, text) => {
    $('.hud-button-click').remove();
    text = unescape(text);
    const help = $(`<div class="hud-button-click"><p><span>${key}</span> ${text}</p></div>`);
    help
      .prependTo('#app')
      .fadeOut(0)
      .fadeIn(100);
  };

  CEF.alert.removeHelpKey = () => {
    $('.hud-button-click').fadeOut(100, function() {
      $(this).remove();
    });
  };

  mp.events.register('cef:alert:removeHelpKey', CEF.alert.removeHelpKey);

  useEffect(() => {
    mp.events.register('cef:alert:setAlert', CEF.alert.setAlert);
    mp.events.register('cef:alert:setBigAlert', CEF.alert.setBigAlert);
    mp.events.register('cef:alert:setHelp', CEF.alert.setHelp);
    mp.events.register('cef:alert:setHelpKey', CEF.alert.setHelpKey);
  }, []);

  return (
    <>
      <div className="alert-wrapper"></div>
      <div className="hud-alert-wrapper"></div>
    </>
  );
};

export default Alert;
