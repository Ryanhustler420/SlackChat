import React, {Component} from 'react';
import {Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react';
import firebase from './../../firebase';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database ().ref ('channels'),
  };

  componentDidMount () {
    this.addListeners ();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on ('child_added', snap => {
      loadedChannels.push (snap.val ());
      //   console.log (loadedChannels);
      this.setState ({channels: loadedChannels});
    });
  };

  dispalyChannels = channels =>
    channels.length > 0 &&
    channels.map (channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => console.log (channel)}
        name={channel.name}
        style={{opacity: 0.7}}
      >
        # {channel.name}
      </Menu.Item>
    ));

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
        <Menu.Menu style={{paddingBottom: '2em'}}>
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
export default Channels;
