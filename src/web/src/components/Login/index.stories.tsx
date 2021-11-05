import React from 'react';
import { API, CEF } from 'api';
import { storiesOf } from '@storybook/react';
import Login from './index';

storiesOf('Login', module).add('default', () => <Login />);
