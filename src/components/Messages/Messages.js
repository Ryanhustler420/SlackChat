import React, {Component} from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import firebase from './../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
  state = {
    messagesRef: firebase.database ().ref ('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: [],
    ProgressBar: false,
  };

  componentDidMount () {
    const {channel, user} = this.state;

    if (channel && user) {
      this.addListeners (channel.id);
    }
  }

  addListeners = channelID => {
    this.addMessageListener (channelID);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    this.state.messagesRef.child (channelId).on ('child_added', snap => {
      loadedMessages.push (snap.val ());
      this.setState ({
        messages: loadedMessages,
        messagesLoading: false,
      });
    });
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map (message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState ({ProgressBar: true});
    }
  };

  render () {
    const {messagesRef, messages, channel, user, ProgressBar} = this.state;

    return (
      <React.Fragment>
        <MessagesHeader />

        <Segment>
          <Comment.Group
            className={ProgressBar ? 'messages__progress' : 'messages'}
          >
            {this.displayMessages (messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
