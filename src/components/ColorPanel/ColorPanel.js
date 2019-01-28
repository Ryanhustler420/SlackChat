import React, {Component} from 'react';
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Grid,
  Segment,
} from 'semantic-ui-react';

import {SketchPicker} from 'react-color';
import firebase from './../../firebase';

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database ().ref ('users'),
    userColors: [],
  };

  componentDidMount () {
    if (this.state.user) {
      this.addListener (this.state.user.uid);
    }
  }

  addListener = userId => {
    let userColors = [];
    this.state.usersRef.child (`${userId}/colors`).on ('child_added', snap => {
      userColors.unshift (snap.val ());
      // console.log (userColor);
      this.setState ({userColors});
    });
  };

  openModal = () => this.setState ({modal: true});
  closeModal = () => this.setState ({modal: false});

  handleChangePrimaryColor = color => {
    this.setState ({primary: color.hex});
  };

  handleChangeSecondaryColor = color => {
    this.setState ({secondary: color.hex});
  };

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors (this.state.primary, this.state.secondary);
    }
  };

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child (`${this.state.user.uid}/colors`)
      .push ()
      .update ({
        primary,
        secondary,
      })
      .then (() => {
        console.log ('Colors added');
        this.closeModal ();
      })
      .catch (err => {
        console.error (err);
      });
  };

  displayUserColors = userColors =>
    userColors.length > 0 &&
    userColors.map ((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div className="color__container">
          <div className="color__square" style={{background: color.primary}}>
            <div
              className="color__overlay"
              style={{background: color.secondary}}
            />
          </div>
        </div>
      </React.Fragment>
    ));

  render () {
    const {modal, primary, secondary, userColors} = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />

        {this.displayUserColors (userColors)}

        {/* Color picker modal */}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Grid columns={2} divided>
              <Grid.Row>
                <Grid.Column>
                  <Segment inverted>
                    <Label
                      content="Primary Color"
                      style={{marginBottom: '10px'}}
                    />
                    <SketchPicker
                      onChange={this.handleChangePrimaryColor}
                      color={primary}
                    />
                  </Segment>
                </Grid.Column>
                <Grid.Column>
                  <Segment inverted>
                    <Label
                      content="Secondary Color"
                      style={{marginBottom: '10px'}}
                    />
                    <SketchPicker
                      onChange={this.handleChangeSecondaryColor}
                      color={secondary}
                    />
                  </Segment>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default ColorPanel;
