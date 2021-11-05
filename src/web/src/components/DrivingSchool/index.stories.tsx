import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
import DrivingSchool from './index';
import Outro from './Outro';

storiesOf('Driving School', module).add('Full', () => <DrivingSchool />);
storiesOf('Driving School', module).add('Outro', () => <Outro miss={0} />);
