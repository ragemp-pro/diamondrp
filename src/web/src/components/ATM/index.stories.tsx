import React from 'react';
import { storiesOf } from '@storybook/react';
import Autosalon from './index';

storiesOf('ATM', module).add('default', () => <Autosalon test={true} />);
