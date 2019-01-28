import React, {Component} from 'react';
import {Grid, Header, Icon, Label, Dropdown, Image} from 'semantic-ui-react';
import firebase from './../../firebase';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
  };

  // componentWillReceiveProps (nexProps) {
  //   this.setState ({user: nexProps.currentUser});
  // }

  // componentDidMount () {
  //   this.setState ({user: this.props.currentUser});
  // }

  dropDownOptions = () => [
    {
      key: 'user',
      text: (
        <span>Signed in as <strong>{this.state.user.displayName}</strong></span>
      ),
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
    firebase.auth ().signOut ().then (() => {
      console.log ('Signout');
    });
  };

  render () {
    const {user} = this.state;
    const {primaryColor} = this.props;
    return (
      <Grid style={{background: primaryColor}}>
        <Grid.Column>
          <Grid.Row style={{padding: '1.2em', margin: 0}}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>
                Dev's Network
              </Header.Content>
              {user.uid === 'MLlT7BWq7iSi7piDNT68JXB8yhC2' &&
                <React.Fragment>
                  <Label as="a" image>
                    <img
                      src="https://avatars2.githubusercontent.com/u/25275856?s=460&v=4"
                      alt="avatar"
                    />
                    <Icon name="superpowers" />Gaurav Gupta
                  </Label>
                  <Label>
                    Creator
                  </Label>
                </React.Fragment>}
            </Header>

            {/* User Dropdown */}
            <Header style={{padding: '0.25em'}} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropDownOptions ()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
