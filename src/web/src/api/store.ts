import { createStore, applyMiddleware, combineReducers } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { createMemoryHistory } from 'history';
import thunk from 'redux-thunk';
import reducers from '../reducers';

let history = createMemoryHistory();

let router = routerMiddleware(history);
let store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer,
  }),
  applyMiddleware(thunk, router)
);

export { store, history };
