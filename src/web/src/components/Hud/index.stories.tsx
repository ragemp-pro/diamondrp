import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
import Hud from './index';

// window = CEF;

storiesOf('HUD', module).add('Full', () => <Hud />);
