import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
// import Inventory from './index_old';
import GangWar from '.';

storiesOf('GangWar', module).add('index', () => <GangWar test={true} />);
