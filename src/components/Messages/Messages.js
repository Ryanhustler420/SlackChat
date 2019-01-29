import React, {Component} from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import firebase from './../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import {setUserPost} from './../../actions/index';
import {connect} from 'react-redux';
import Typing from './Typing';
import Skeleton from './Skeleton';

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
    isChannelStarrd: false,
    userRef: firebase.database ().ref ('users'),
    typingRef: firebase.database ().ref ('typing'),
    typingUsers: [],
    connectedRef: firebase.database ().ref ('.info/connected'),
    listeners: [],
  };

  componentDidMount () {
    const {channel, user, listeners} = this.state;

    if (channel && user) {
      this.removeListeners (listeners);
      this.addListeners (channel.id);
      this.addUserStarsListener (channel.id, user.uid);
    }
  }

  componentWillUnmount () {
    this.removeListeners (this.state.listeners);
    this.state.connectedRef.off ();
  }

  removeListeners = listeners => {
    listeners.forEach (listener => {
      listener.ref.child (listener.id).off (listener.event);
    });
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex (listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = {id, ref, event};
      this.starChannel ({listeners: this.state.listeners.concat (newListener)});
    }
  };

  componentDidUpdate () {
    if (this.messagesEnd) {
      this.scrollToBottom ();
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView ({behavior: 'smooth'});
  };

  addUserStarsListener = (channelId, userId) => {
    this.state.userRef
      .child (userId)
      .child ('starred')
      .once ('value')
      .then (data => {
        if (data.val () !== null) {
          // console.log (Object.keys (data.val ()));
          const channelIds = Object.keys (data.val ());
          const prevStarred = channelIds.includes (channelId);
          this.setState ({isChannelStarrd: prevStarred});
        }
      });
  };

  addListeners = channelID => {
    this.addMessageListener (channelID);
    this.addTypingListeners (channelID);
  };

  addTypingListeners = channelID => {
    let typingUsers = [];
    this.state.typingRef.child (channelID).on ('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat ({
          id: snap.key,
          name: snap.val (),
        });
        this.setState ({typingUsers});
      }
    });

    this.addToListeners (channelID, this.state.typingRef, 'child_added');

    this.state.typingRef.child (channelID).on ('child_removed', snap => {
      const index = typingUsers.findIndex (user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter (user => user.id !== snap.key);
        this.setState ({typingUsers});
      }
    });

    this.addToListeners (channelID, this.state.typingRef, 'child_removed');

    this.state.connectedRef.on ('value', snap => {
      if (snap.val () === true) {
        this.state.typingRef
          .child (channelID)
          .child (this.state.user.uid)
          .onDisconnect ()
          .remove (err => {
            if (err !== null) {
              console.log (err);
            }
          });
      }
    });
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
      this.countUserPosts (loadedMessages);
    });
    this.addToListeners (channelId, ref, 'child_added');
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

  countUserPosts = loadedMessages => {
    let userPosts = loadedMessages.reduce ((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPost (userPosts);
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

  handleStar = () => {
    this.setState (
      prevState => ({
        isChannelStarrd: !prevState.isChannelStarrd,
      }),
      () => this.starChannel ()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarrd) {
      // console.log ('star');
      this.state.userRef.child (`${this.state.user.uid}/starred`).update ({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
    } else {
      // console.log ('unstar');
      this.state.userRef
        .child (`${this.state.user.uid}/starred`)
        .child (this.state.channel.id)
        .remove (err => {
          if (err !== null) {
            console.log (err);
          }
        });
    }
  };

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map (user => (
      <div
        key={user.id}
        style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}}
      >
        <span className="user__typing">{user.name} is typing...</span>
        {' '}
        <Typing />
      </div>
    ));

  displayMessagesSkeleton = loading =>
    loading
      ? <React.Fragment>
          {[...Array (10)].map ((_, i) => <Skeleton key={i} />)}
        </React.Fragment>
      : null;

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
      privateChannel,
      isChannelStarrd,
      typingUsers,
      messagesLoading
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName (channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarrd={isChannelStarrd}
        />

        <Segment>
          <Comment.Group
            className={ProgressBar ? 'messages__progress' : 'messages'}
          >
            {this.displayMessagesSkeleton (messagesLoading)}
            {searchTerm
              ? this.displayMessages (searchResult)
              : this.displayMessages (messages)}
            {this.displayTypingUsers (typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
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

export default connect (null, {setUserPost}) (Messages);
