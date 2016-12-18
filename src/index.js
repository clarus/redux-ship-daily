// @flow
import 'babel-polyfill';
import $ from 'jquery';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import * as Ship from 'redux-ship';
import * as ShipDevTools from 'redux-ship-devtools';
import './index.css';

type State = {
  icon: ?string,
  location: ?string
};

const initialState: State = {
  icon: null,
  location: null
};

type Commit = {
  type: 'InitSuccess',
  icon: string,
  location: string
};

function reduce(state: State, commit: Commit): State {
  switch (commit.type) {
    case 'InitSuccess':
      return {
        ...state,
        icon: commit.icon,
        location: commit.location
      };
    default:
      return state;
  }
}

type Effect = {
  type: 'GetJSON',
  url: string
};

function runEffect(effect: Effect): Promise<any> | any {
  switch (effect.type) {
    case 'GetJSON':
      return new Promise(resolve => $.getJSON(effect.url, resolve));
    default:
      return undefined;
  }
}

type Control<A> = Ship.Ship<Effect, Commit, State, A>;

type Action = {
  type: 'Init'
};

function* getJSON(url: string): Control<any> {
  return yield* Ship.call({type: 'GetJSON', url});
}

function* control(action: Action): Control<void> {
  switch (action.type) {
    case 'Init': {
      const {city} = yield* getJSON('//freegeoip.net/json/');
      const weatherKey = '981afc59252477c7b4d299b85525e612';
      const {weather} = yield* getJSON(
        'http://api.openweathermap.org/data/2.5/weather?' +
        'q=' + city + '&' +
        'APPID=' + weatherKey
      );
      yield* Ship.commit({
        type: 'InitSuccess',
        icon: 'http://openweathermap.org/img/w/' + weather[0].icon + '.png',
        location: city
      });
      return;
    }
    default:
      return;
  }
}

const middlewares = [
  Ship.middleware(runEffect, ShipDevTools.inspect(control)),
  createLogger()
];

const store = createStore(reduce, initialState, applyMiddleware(...middlewares));

class Icon extends PureComponent<void, {state: State}, void> {
  render() {
    return (
      <div className="Icon" data-hour={(new Date()).getHours()}>
        <Sky />
        {this.props.state.icon && this.props.state.location &&
          <Information location={this.props.state.location} src={this.props.state.icon} />
        }
      </div>
    );
  }
}

class Sky extends PureComponent<void, {}, void> {
  render() {
    return <div className="Sky" />;
  }
}

class Information extends PureComponent<void, {location: string, src: string}, void> {
  render() {
    return (
      <div className="Information">
        <Location location={this.props.location} />
        <WeatherIcon src={this.props.src} />
      </div>
    );
  }
}

class Location extends PureComponent<void, {location: string}, void> {
  render() {
    return <div className="Location">{this.props.location}</div>
  }
}

class WeatherIcon extends PureComponent<void, {src: string}, void> {
  render() {
    return <img alt="weather" className="WeatherIcon" src={this.props.src} />;
  }
}

function render() {
  ReactDOM.render(
    <Icon state={store.getState()} />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);
store.dispatch({type: 'Init'});
