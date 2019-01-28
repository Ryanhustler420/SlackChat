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

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
  };

  openModal = () => this.setState ({modal: true});
  closeModal = () => this.setState ({modal: false});

  handleChangePrimaryColor = color => {
    this.setState ({primary: color.hex});
  };

  handleChangeSecondaryColor = color => {
    this.setState ({secondary: color.hex});
  };

  render () {
    const {modal, primary, secondary} = this.state;
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
            <Button color="green" inverted>
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
