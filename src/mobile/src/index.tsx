import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import { App } from './components/App';



render(
    <App />,
    document.getElementById('root')
);