import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
// import Inventory from './index_old';
import Tablet from './index';

// storiesOf('Inventory', module).add('index', () => <Inventory />);
storiesOf('Tablet', module).add('index', () => <Tablet test={true} />);
