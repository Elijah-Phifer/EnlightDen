import React, {useEffect, useState } from 'react';
import { Container, Header, Button, Icon, Grid} from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Dashboard: React.FC = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [fadeIn, setFadeIn] = useState(false); // State to trigger the fade-in

  useEffect(() => {// Trigger the fade-in effect after the component mounts
    setFadeIn(true);
  }, []);

  const goToClasses = () => {
    navigate('/classes'); // Navigate to the Classes page
  };

  return (
    <div style={{ backgroundColor: '#1E1E2E', minHeight: '100vh', paddingTop: '70px', opacity: fadeIn ? 1 : 0, transition: 'opacity 1.0s ease-in-out' }}> {/* Add paddingTop */} 
      <Container textAlign="center">
        {/* Page Header */}
        <Header as="h1" style={{ color: '#FFFFFF', marginBottom: '0.5em', paddingTop: '20px' }}><center>
          <Icon name="graduation" circular inverted style={{ backgroundColor: '#00B5D8', color: '#FFFFFF' }} />
          <Header.Content style={{paddingTop: '9px'}}>Welcome to EnlightDen</Header.Content>
          </center></Header>
        <Header.Subheader className="text-secondary" style={{ marginBottom: '3em' }}>
          Your Ultimate Study Companion
          </Header.Subheader>

        {/* Button to View Classes */}
        <Grid centered>
          <Button primary size="huge" style={{ width: '80%' }} onClick={goToClasses}>
            <Icon name="book" />
            Go to Classes
          </Button>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
