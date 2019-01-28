import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setPrivateChannel, setCurrentChannel} from '../../actions';
import firebase from './../../firebase';

class Starred extends Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database ().ref ('users'),
    starredChannels: [],
    activeChannel: '',
  };

  componentDidMount () {
    if (this.state.user) {
      this.addListener (this.state.user.uid);
    }
  }

  addListener = UsersUid => {
    this.state.usersRef
      .child (UsersUid)
      .child ('starred')
      .on ('child_added', snap => {
        const starredChannel = {
          id: snap.key,
          ...snap.val (),
        };
        this.setState ({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });

    this.state.usersRef
      .child (UsersUid)
      .child ('starred')
      .on ('child_removed', snap => {
        const channelToRemove = {id: snap.key, ...snap.val ()};
        const filteredChannels = this.state.starredChannels.filter (channel => {
          return channel.id !== channelToRemove.id;
        });
        this.setState ({starredChannels: filteredChannels});
      });
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
        # {channel.name}
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
