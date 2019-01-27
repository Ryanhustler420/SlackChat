import React, {Component} from 'react';
import {Header, Segment, Input, Icon, Loader} from 'semantic-ui-react';

class MessagesHeader extends Component {
  render () {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
    } = this.props;

    return (
      <Segment clearing>
        {/* Channel Title */}
        <Header fluid="true" as="h2" floated="left" style={{matginBottom: 0}}>
          <span>
            {channelName}
            {channelName && <Icon name="star outline" color="black" />}
          </span>
          <Header.Subheader>
            {numUniqueUsers
              ? numUniqueUsers
              : <Loader active inline="centered" />}
          </Header.Subheader>
        </Header>
        {/* Channel Search Input */}
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
