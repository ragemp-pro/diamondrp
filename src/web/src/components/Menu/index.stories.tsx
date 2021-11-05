import React from 'react';
import { storiesOf } from '@storybook/react';
import Menu from './index';

storiesOf('Menu', module).add('default', () => <Menu test={true} />);
