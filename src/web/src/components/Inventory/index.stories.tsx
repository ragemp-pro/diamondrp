import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
// import Inventory from './index_old';
import Inventory from '.';

// storiesOf('Inventory', module).add('index', () => <Inventory />);
storiesOf('Inventory', module).add('index', () => <Inventory test={true} />);
