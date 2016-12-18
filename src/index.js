import $ from 'jquery';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Icon extends PureComponent<void, void, {icon: ?string, location: ?string}> {
  state = {
    icon: null,
    location: null,
  };

  fetchIP() {
    $.getJSON('//freegeoip.net/json/?callback=?', data => {
      this.lookupLocation(data.ip);
    });
  }

  lookupLocation(ip: string) {
    $.getJSON('https://freegeoip.net/json/' + ip, data => {
      this.getWeather(data.city);
    });
  }

  getWeather(location: string) {
    $.getJSON(
      'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&APPID=981afc59252477c7b4d299b85525e612',
      data => {
        this.setState({
          icon: 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png',
          location: data.name,
        });
      }
    );
  }

  componentDidMount() {
    this.fetchIP();
  }

  render() {
    return (
      <div className="Icon" data-hour={(new Date()).getHours()}>
        <Sky />
        {this.state.icon && this.state.location &&
          <Information location={this.state.location} src={this.state.icon} />
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

ReactDOM.render(
  <Icon />,
  document.getElementById('root')
);
