import React, {Component} from 'react';
import {Menu, Icon, Modal, Form, Input, Button, Label} from 'semantic-ui-react';
import firebase from './../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../actions';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channel: null,
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database ().ref ('channels'),
    firstLoad: true,
    activeChannel: '',
    messagesRef: firebase.database ().ref ('messages'),
    notifications: [],
  };

  componentDidMount () {
    this.addListeners ();
  }

  componentWillUnmount () {
    this.removeListeners ();
  }

  removeListeners = () => {
    this.state.channelsRef.off ();
  };

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on ('child_added', snap => {
      loadedChannels.push (snap.val ());
      //   console.log (loadedChannels);
      this.setState ({channels: loadedChannels}, () => {
        this.setFirstChannel ();
      });
      this.addNotificationListener (snap.key);
    });
  };

  addNotificationListener = channelId => {
    this.state.messagesRef.child (channelId).on ('value', snap => {
      if (this.state.channel) {
        this.handleNotifications (
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChennelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex (
      notification_ => notification_.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChennelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren () - lastTotal > 0) {
          notifications[index].count = snap.numChildren () - lastTotal;
        }
      }

      notifications[index].lastKnowTotal = snap.numChildren ();
    } else {
      notifications.push ({
        id: channelId,
        total: snap.numChildren (),
        lastKnowTotal: snap.numChildren (),
        count: 0,
      });
    }

    this.setState ({notifications});
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.changeChannel (firstChannel);
    }
    this.setState ({firstLoad: false});
  };

  setActiveChannel = channel => {
    this.setState ({activeChannel: channel});
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex (
      notification_ => notification_.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnowTotal;
      updatedNotifications[index].count = 0;
      this.setState ({notifications: updatedNotifications});
    }
  };

  changeChannel = channel => {
    this.setActiveChannel (channel);
    this.props.setCurrentChannel (channel);
    this.props.setPrivateChannel (false);
    this.setState ({channel});
    this.clearNotifications ();
  };

  dispalyChannels = channels =>
    channels.length > 0 &&
    channels.map (channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel (channel)}
        name={channel.name}
        style={{opacity: 0.7}}
        active={channel.id === this.state.activeChannel.id}
      >
        {this.getNotificationCount (channel) &&
          <Label color="red">{this.getNotificationCount (channel)}</Label>}
        # {channel.name}
      </Menu.Item>
    ));

  getNotificationCount = channel => {
    let count = 0;

    this.state.notifications.forEach (notification_ => {
      if (notification_.id === channel.id) {
        count = notification_.count;
      }
    });

    if (count > 0) return count;
  };

  // check out firease for schema design
  addChannel = () => {
    const {channelsRef, channelName, channelDetails, user} = this.state;

    const key = channelsRef.push ().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child (key)
      .update (newChannel)
      .then (() => {
        this.setState ({channelName: '', channelDetails: ''});
        this.closeModal ();
        // console.log ('channel added');
      })
      .catch (err => {
        console.log (err);
      });
  };

  handleSubmit = event => {
    event.preventDefault ();
    if (this.isFormValid (this.state)) {
      //   console.log ('channel added');
      this.addChannel ();
    }
  };

  isFormValid = ({channelName, channelDetails}) =>
    channelName.length > 0 && channelDetails.length > 0;

  handleChange = event => {
    this.setState ({[event.target.name]: event.target.value});
  };

  openModal = () => this.setState ({modal: true});
  closeModal = () => this.setState ({modal: false});

  render () {
    const {channels, modal} = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS {' '}
            </span>
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {/* Channels List */}
          {this.dispalyChannels (channels)}
        </Menu.Menu>

        {/* Add channel Model */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name Of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About The Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect (null, {setCurrentChannel, setPrivateChannel}) (
  Channels
);
