import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setPrivateChannel, setCurrentChannel} from '../../actions';

class Starred extends Component {
  state = {
    starredChannels: [],
    activeChannel: '',
  };

  dispalyChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map (channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel (channel)}
        name={channel.name}
        style={{opacity: 0.7}}
        active={channel.id === this.state.activeChannel.id}
      >
        # {starredChannels.name}
      </Menu.Item>
    ));

  setActiveChannel = channel => {
    this.setState ({activeChannel: channel});
  };

  changeChannel = channel => {
    this.setActiveChannel (channel);
    this.props.setCurrentChannel (channel);
    this.props.setPrivateChannel (false);
  };

  render () {
    const {starredChannels} = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED {' '}
          </span>
          ({starredChannels.length})
        </Menu.Item>
        {/* Channels List */}
        {this.dispalyChannels (starredChannels)}
      </Menu.Menu>
    );
  }
}
export default connect (null, {setPrivateChannel, setCurrentChannel}) (Starred);
