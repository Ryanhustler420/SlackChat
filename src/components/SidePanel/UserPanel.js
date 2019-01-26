import React, {Component} from 'react';
import {Grid, Header, Icon, Label, Dropdown} from 'semantic-ui-react';
import firebase from './../../firebase';

class UserPanel extends Component {
  dropDownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>User</strong></span>,
      disabled: true,
    },
    {
      key: 'avatar',
      text: <span>Change Avatag</span>,
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  handleSignout = () => {
      firebase
      .auth()
      .signOut()
      .then(() => {
          console.log('Signout');
      })
  }

  render () {
    return (
      <Grid style={{background: '#4c3c5c'}}>
        <Grid.Column>
          <Grid.Row style={{padding: '1.2em', margin: 0}}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>
                Dev's Network
              </Header.Content>
              <Label as="a" image>
                <img src="https://avatars2.githubusercontent.com/u/25275856?s=460&v=4" alt="avatar"/>
                <Icon name="superpowers" />Gaurav Gupta
              </Label>
              {/* <Label>
                Creator
              </Label> */}
            </Header>
          </Grid.Row>
          {/* User Dropdown */}
          <Header style={{padding: '0.25em'}} as="h4" inverted>
            <Dropdown
              trigger={<span>User</span>}
              options={this.dropDownOptions ()}
            />
          </Header>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
