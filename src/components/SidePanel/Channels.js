import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';

class Channels extends Component {
  state = {
    channels: [],
  };

  render () {
    const {channels} = this.state;

    return (
      <div>
        <Menu.Menu style={{paddingBottom: '2em'}}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS &nbsp; 
            </span>
            ({channels.length}) <Icon name="add" />
          </Menu.Item>
          {/* Channels List */}
        </Menu.Menu>
      </div>
    );
  }
}
export default Channels;
