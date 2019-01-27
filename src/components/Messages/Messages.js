import React, {Component} from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import firebase from './../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database ().ref ('privateMessages'),
    messagesRef: firebase.database ().ref ('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: [],
    ProgressBar: false,
    numUniqueUsers: 0,
    searchTerm: '',
    searchLoading: false,
    searchResult: [],
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
    const ref = this.getMessagesRef ();
    ref.child (channelId).on ('child_added', snap => {
      loadedMessages.push (snap.val ());
      this.setState ({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers (loadedMessages);
    });
  };

  getMessagesRef = () => {
    const {messagesRef, privateMessagesRef, privateChannel} = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce ((acc, message) => {
      if (!acc.includes (message.user.name)) {
        acc.push (message.user.name);
      }
      return acc;
    }, []);
    const pulural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${pulural ? 's' : ''}`;
    this.setState ({numUniqueUsers});
  };

  handleSearchChange = event => {
    this.setState (
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages ()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp (this.state.searchTerm, 'gi');
    const searchResult = channelMessages.reduce ((acc, message) => {
      if (
        (message.content && message.content.match (regex)) ||
        message.user.name.match (regex)
      ) {
        acc.push (message);
      }
      return acc;
    }, []);
    this.setState ({searchResult});
    setTimeout (() => this.setState ({searchLoading: false}), 1000);
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

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? '@' : '#'}${channel.name}`
      : '';
  };

  render () {
    // prettier-ignore
    const {
      messagesRef,
      messages,
      channel,
      user,
      ProgressBar,
      numUniqueUsers,
      searchTerm,
      searchResult,
      searchLoading,
      privateChannel
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName (channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
        />

        <Segment>
          <Comment.Group
            className={ProgressBar ? 'messages__progress' : 'messages'}
          >
            {searchTerm
              ? this.displayMessages (searchResult)
              : this.displayMessages (messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
