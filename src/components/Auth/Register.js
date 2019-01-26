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
import md5 from 'md5';
import {setUser} from '../../actions';
import {connect} from 'react-redux';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    userRef: firebase.database ().ref ('users'),
  };

  displayErrors = errors =>
    errors.map ((error, i) => <p key={i}>{error.message}</p>);

  handleChange = event => {
    this.setState ({
      [event.target.name]: event.target.value,
    });
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty (this.state)) {
      // throw error
      error = {message: 'Fill in all fields'};
      this.setState ({errors: errors.concat (error)});
      return false;
    } else if (!this.isPasswordValid (this.state)) {
      // throw error
      error = {message: 'Password is invalid'};
      this.setState ({errors: errors.concat (error)});
      return false;
    } else {
      // return success
      return true;
    }
  };

  isFormEmpty = ({username, email, password, passwordConfirmation}) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = ({password, passwordConfirmation}) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = event => {
    if (!this.isFormValid ()) {
      return;
    }
    event.preventDefault ();
    this.setState ({errors: [], loading: true});
    firebase
      .auth ()
      .createUserWithEmailAndPassword (this.state.email, this.state.password)
      .then (createdUser => {
        // console.log (createdUser);
        createdUser.user
          .updateProfile ({
            displayName: this.state.username,
            photoURL: `http://gravatar.com/avatar/${md5 (createdUser.user.email)}?d=identicon`,
          })
          .then (() => {
            this.saveUser (createdUser).then (() => {
              // console.log ('User save');
              this.setState ({loading: false});
              // update redux state before redirecting
              this.props.setUser (createdUser);
            });
          })
          .catch (err => {
            console.log (err);
            this.setState ({
              errors: this.state.errors.concat (err),
              loading: false,
            });
          });
      })
      .catch (err => {
        this.setState ({
          errors: this.state.errors.concat (err),
          loading: false,
        });
      });
  };

  saveUser = createUser => {
    // Go to firebase -> database ->  Create database -> Start in test mode -> enable
    return this.state.userRef.child (createUser.user.uid).set ({
      name: createUser.user.displayName,
      avatar: createUser.user.photoURL,
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some (error =>
      error.message.toLowerCase ().includes (inputName)
    )
      ? 'error'
      : '';
  };

  render () {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading,
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h1" icon color="black" textAlign="center">
            <Icon name="connectdevelop" color="black" />
            Register for Dev's Network
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                type="text"
              />
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

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
                className={this.handleInputError (errors, 'password')}
                type="password"
              />

              <Button
                className={loading ? 'loading' : ''}
                disabled={loading}
                color="black"
                fluid
                size="large"
              >
                Submit To God
              </Button>
              <Message>
                Already an user? <Link to="/login">Login</Link>{' '}
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

export default connect (null, {setUser}) (Register);
