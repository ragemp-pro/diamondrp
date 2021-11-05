import React, { useEffect } from 'react';
import { CEF } from 'api';

import radioPeer from './snd/radio_peer.wav';
import radioOff from './snd/radio_off.wav';
import radioOn from './snd/radio_on.wav';
import radioSh from './snd/radio_sh3.wav';
import hit from './snd/hit.mp3';
import play2 from './snd/play2.mp3';
import buckle from './snd/buckle.ogg';
import unbuckle from './snd/unbuckle.ogg';

const Radio = () => {
  useEffect(() => {
    // @ts-ignore
    const sh3: HTMLAudioElement = document.getElementById('radioSh');
    sh3.volume = 0.0;

    CEF.radio.radioManager = (data: { type: string; shVol: number }) => {
      if (data.type == 'buckle') {
        const obj = new Audio(buckle);
        obj.volume = 0.3;
        obj.play();
      }
      if (data.type == 'unbuckle') {
        const obj = new Audio(unbuckle);
        obj.volume = 0.3;
        obj.play();
      }
      if (data.type == 'play2') {
        const obj = new Audio(play2);
        obj.volume = 0.1;
        obj.play();
      }
      if (data.type == 'hit') {
        const obj = new Audio(hit);
        obj.volume = 0.1;
        obj.play();
      }
      if (data.type == 'radioPeer') {
        const obj = new Audio(radioPeer);
        obj.volume = 0.1;
        obj.play();
      }
      if (data.type == 'radioOff') {
        const obj = new Audio(radioOff);
        obj.volume = 0.1;
        obj.play();
      }
      if (data.type == 'radioOn') {
        const obj = new Audio(radioOn);
        obj.volume = 0.1;
        obj.play();
      }
      if (data.type == 'radioShStart') {
        // @ts-ignore
        const sh1: HTMLAudioElement = document.getElementById('radioSh');
        sh1.volume = 0.01 + data.shVol;
        sh1.play();
      }
      if (data.type == 'radioShStop') {
        // @ts-ignore
        const sh2: HTMLAudioElement = document.getElementById('radioSh');
        sh2.volume = 0.0;
        sh2.pause();
      }
    };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <audio loop autoPlay id="radioSh">
        <source src={radioSh} />
      </audio>
    </div>
  );
};

export default Radio;
