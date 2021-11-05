/// <reference path="../../declaration/web.ts" />
import { RAGE_BETA, SET_RAGE_BETA } from '../../util/newrage';
if (window && window.location && window.location.search && window.location.search.includes('ragebeta')) {
  SET_RAGE_BETA()
}
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
//@ts-ignore
import { syncHistoryWithStore } from 'react-router-redux';

import './dummies';

import '../assets/fonts/glyph/glyphicons.min.css';
import '../assets/fonts/montserrat/montserrat.css';
import '../assets/fonts/codenamecoder/codenamecoder.css';

import '../assets/css/animate.css';
import '../assets/css/reset.css';
import '../assets/css/main.less';
import '../assets/css/autosalon.less';
import '../assets/css/quests.less';
import '../assets/css/interfaces.less';
import '../assets/css/main-style.less';
import { API, CEF } from './api';
import { CefEvent } from './api/customEvent';


if (RAGE_BETA){
  Object.defineProperty(mp, "events", {
    writable: true
  })
} else {
  (mp.events as any) = {};
}
// console.log(CefEvent.registerLocal);
// @ts-ignore
mp.events.container = CefEvent.container;
// @ts-ignore
mp.events.eventRemoteRequestId = CefEvent.eventRemoteRequestId;
// @ts-ignore
mp.events.eventRemoteRequestData = CefEvent.eventRemoteRequestData;
// @ts-ignore
mp.events.eventID = CefEvent.eventID;
// @ts-ignore
mp.events.containerLocal = CefEvent.eventID;
mp.events.register = CefEvent.register.bind(mp.events);
mp.events.registerLocal = CefEvent.registerLocal.bind(mp.events);
mp.events.triggerLocal = CefEvent.triggerLocal.bind(mp.events);
mp.events.triggerServer = CefEvent.triggerServer.bind(mp.events);
mp.events.triggerClient = CefEvent.triggerClient.bind(mp.events);
mp.events.callLocal = CefEvent.callLocal.bind(mp.events);
mp.events.callServer = CefEvent.callServer.bind(mp.events);
mp.events.callClient = CefEvent.callClient.bind(mp.events);

// @ts-ignore
window.chatAPI = {
  push: () => {},
  show: () => {},
  activate: () => {},
};

window.CEF = CEF;
window.API = API;

import App from './components/App';
import './components/style';


const history = syncHistoryWithStore(API.history, API.store);

render(
  <Provider store={API.store}>
    <Router history={history}>
      <Route path="/" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root'),
  () => {
    mp.enableDebuggingAlerts(true);
    mp.trigger('guiStarted');
  }
);
