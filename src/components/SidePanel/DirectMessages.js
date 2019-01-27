import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import firebase from './../../firebase';

class DirectMessages extends Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database ().ref ('users'),
    connectedRef: firebase.database ().ref ('.info/connected'),
    presenceRef: firebase.database ().ref ('presence'),
  };

  componentDidMount () {
    if (this.state.user) {
      this.addListeners (this.state.user.uid);
    }
  }

  addListeners = UserUId => {
    let loadedUsers = [];
    this.state.usersRef.on ('child_added', snap => {
      if (UserUId !== snap.key) {
        let user = snap.val ();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push (user);
        this.setState ({users: loadedUsers});
      }
    });

    this.state.connectedRef.on ('value', snap => {
      if (snap.val () === true) {
        const ref = this.state.presenceRef.child (UserUId);
        ref.set (true);
        ref.onDisconnect ().remove (err => {
          if (err !== null) {
            console.error (err);
          }
        });
      }
    });

    this.state.presenceRef.on ('child_added', snap => {
      if (UserUId !== snap.key) {
        // add status to user
        this.addStatusToUSer (snap.key);
      }
    });

    this.state.presenceRef.on ('child_removed', snap => {
      if (UserUId !== snap.key) {
        // remove status to user
        this.addStatusToUSer (snap.key, false);
      }
    });
  };

  addStatusToUSer = (user_id, connected = true) => {
    const updatedUsers = this.state.users.reduce ((acc, user) => {
      if (user.uid === user_id) {
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }
      return acc.concat (user);
    }, []);
    this.setState ({users: updatedUsers});
  };

  isUserOnline = user => user.status === 'online';

  render () {
    const {users} = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {/* users to Send Direct Messages */}
        {users.map (user => (
          <Menu.Item
            key={user.uid}
            onClick={() => console.log}
            style={{opacity: 0.7, fontStyle: 'italic'}}
          >
            <Icon
              name="circle"
              color={this.isUserOnline (user) ? 'green' : 'red'}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default DirectMessages;
