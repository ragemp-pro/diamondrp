import React from 'react';
import { storiesOf } from '@storybook/react';
import Cloth from './index';

storiesOf('Cloth Shop', module).add('default', () => <Cloth test={true} />);
