import React, {Component} from 'react';
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from 'semantic-ui-react';
import {Link} from 'react-router-dom';

import firebase from '../../firebase';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
  };

  displayErrors = errors =>
    errors.map ((error, i) => <p key={i}>{error.message}</p>);

  handleChange = event => {
    this.setState ({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = event => {
    if (!this.isFormValid (this.state)) {
      return;
    }
    event.preventDefault ();
    this.setState ({errors: [], loading: true});
    firebase
      .auth ()
      .signInWithEmailAndPassword (this.state.email, this.state.password)
      .then (signInUser => {
        // console.log (signInUser);
        this.setState ({loading: false});
      })
      .catch (err => {
        console.error (err);
        this.setState ({
          errors: this.state.errors.concat (err),
          loading: false,
        });
      });
  };

  isFormValid = ({email, passowrd}) => email.length > 0 || passowrd.length > 0;

  handleInputError = (errors, inputName) => {
    return errors.some (error =>
      error.message.toLowerCase ().includes (inputName)
    )
      ? 'error'
      : '';
  };

  render () {
    const {email, password, errors, loading} = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to Dev's Network
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>

              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                className={this.handleInputError (errors, 'email')}
                type="email"
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                className={this.handleInputError (errors, 'password')}
                type="password"
              />

              <Button
                className={loading ? 'loading' : ''}
                disabled={loading}
                color="violet"
                fluid
                size="large"
              >
                {`{ Let me in }`}
              </Button>
              <Message>
                Don't have an account? <Link to="/register">Register</Link>{' '}
              </Message>
            </Segment>
          </Form>
          {errors.length > 0 &&
            <Message error>
              <h3>Error</h3>
              {this.displayErrors (errors)}
            </Message>}
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
