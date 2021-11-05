import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
//@ts-ignore
import { syncHistoryWithStore } from 'react-router-redux';
import { API } from '../src/web/src/api';

const history = syncHistoryWithStore(API.history, API.store);

const req = require.context('../src/web/src/components', true, /\.stories\.tsx$/);

function loadStories() {
  require('!style-loader!css-loader!assets/fonts/glyph/glyphicons.min.css');
  require('!style-loader!css-loader!assets/fonts/montserrat/montserrat.css');
  require('!style-loader!css-loader!assets/fonts/codenamecoder/codenamecoder.css');

  require('!style-loader!css-loader!assets/css/animate.css');
  require('!style-loader!css-loader!assets/css/reset.css');
  require('assets/css/main.less');
  require('assets/css/autosalon.less');
  require('assets/css/quests.less');
  require('assets/css/interfaces.less');
  require('assets/css/main-style.less');

  require('components/style');
  req.keys().forEach(req);
}

addDecorator((story) => (
  <Provider store={API.store}>
    {story()}
  </Provider>
));

configure(loadStories, module);
