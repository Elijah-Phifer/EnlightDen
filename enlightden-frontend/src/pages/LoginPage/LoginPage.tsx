import React, { useState } from 'react';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../src/apiClient';
import './AuthPage.css'; // Import custom CSS for dark mode

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Loading state for login button
  const [isLogin, setIsLogin] = useState<boolean>(true); // Toggle between login and sign-up
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setErrorMessage('');
    setLoading(true); // Set loading to true when login/signup starts

    // Simple validation
    if (!username || !password || (!isLogin && !confirmPassword)) {
      setErrorMessage('Please fill in all fields.');
      setLoading(false); // Stop loading on validation error
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false); // Stop loading on validation error
      return;
    }

    try {
      const url = isLogin ? '/api/UserAuth/Login' : '/api/UserAuth/Register';

      // Construct payload based on login or signup
      const payload = isLogin
        ? { username, password } // Login payload
        : { username, password, email }; // Register payload

      const response = await apiClient.post(url, payload);

      if (response.status === 200) {
        if (isLogin) {
          // Handle successful login
          const token = response.data.token; // Assuming token is in the response
          localStorage.setItem('token', token); // Store token in localStorage

          // Redirect to Dashboard after successful login
          navigate('/dash');
        } else {
          // Handle successful sign-up (don't log in, just redirect to login page)
          setErrorMessage('Registration successful! Please log in.');
          setIsLogin(true); // Switch back to login mode
        }
      } else {
        setErrorMessage(response.data.message || 'An error occurred.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false); // Stop loading after the request completes
    }
  };

  return (
    <Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          {isLogin ? 'Log-in to your account' : 'Sign-up for a new account'}
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {!isLogin && (
              <Form.Input
                fluid
                icon="mail"
                iconPosition="left"
                placeholder="E-mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            <Button color="teal" fluid size="large" type="submit" loading={loading} disabled={loading}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </Segment>
        </Form>

        {errorMessage && <Message negative>{errorMessage}</Message>}

        {/* Register button with margin for spacing */}
        <Button fluid basic color="teal" style={{ marginTop: '1em' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register a new account' : 'Back to Login'}
        </Button>
      </Grid.Column>
    </Grid>
  );
};

export default AuthPage;
