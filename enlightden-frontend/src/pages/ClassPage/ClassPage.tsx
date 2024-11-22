import React, { useEffect, useState } from 'react';
import { Card, Container, Loader, Message, Button, Header, Modal, Form, Input } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../src/apiClient';

interface Class {
  id: string;
  name: string;
  description: string;
  userId: string;
}

const UserClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // For modal visibility
  const [newClassName, setNewClassName] = useState<string>(''); // New class name
  const [newClassDescription, setNewClassDescription] = useState<string>(''); // New class description
  const navigate = useNavigate(); // For navigating to the notes page

  // Fetch the user classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get('/api/Class/GetByUserId');
        if (response.status === 200) {
          setClasses(response.data);
        } else {
          setErrorMessage('Failed to load classes.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching classes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Handle the creation of a new class
  const handleCreateClass = async () => {
    if (!newClassName || !newClassDescription) {
      setErrorMessage('Please fill in all the fields.');
      return;
    }

    try {
      const response = await apiClient.post('/api/Class/Create', {
        name: newClassName,
        description: newClassDescription,
      });

      if (response.status === 200) {
        const newClass: Class = response.data;
        setClasses([...classes, newClass]); // Add new class to the list
        setIsModalOpen(false); // Close modal
        setNewClassName(''); // Reset fields
        setNewClassDescription('');
      } else {
        setErrorMessage('Failed to create class.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the class.');
    }
  };

  const handleClassClick = (classId: string) => {
    // Navigate to the notes page for this class
    navigate(`/class/${classId}/notes`); // Pass classId as part of the URL
  };

  const openCreateClassModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateClassModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
    setNewClassName('');
    setNewClassDescription('');
  };



  return (
    <div style={{ paddingTop: '70px', color:'#DDBEA8', backgroundColor: '#DDBEA8', minHeight: '100vh', padding: '2em 0' }}>
      <Container>
        <Header as="h1" style={{ color: '#FFFFFF', marginBottom: '1.5em' }} textAlign="center">
          Your Classes
        </Header>

        {errorMessage && <Message negative>{errorMessage}</Message>}

        {classes.length === 0 && !loading && (
          <Message info>
            <Message.Header>No classes found</Message.Header>
            <p>You are not enrolled in any classes yet.</p>
          </Message>
        )}

        <Card.Group centered>
          {classes.map((classItem) => (
            <Card
              key={classItem.id}
              header={
                <Header as="h3" style={{ color: '#FFFFFF' }}>
                  {classItem.name}
                </Header>
              }
              description={
                <p style={{ color: '#B0B0B0' }}>{classItem.description}</p> // Light gray for description
              }
              onClick={() => handleClassClick(classItem.id)} // Navigate to the notes page on click
              style={{
                backgroundColor: '#DDBEA8', // Darker background for the card
                color: '#FFFFFF', // White text for the header
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                padding: '1em',
              }}
            />
          ))}
        </Card.Group>

        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <Button
            primary
            size="large"
            onClick={openCreateClassModal} // Open modal when button is clicked
            style={{ backgroundColor: '#00B5D8', color: '#FFFFFF' }} // Cyan button
          >
            Create New Class
          </Button>
        </div>

        {/* Modal for creating a new class */}
        <Modal
          open={isModalOpen}
          onClose={closeCreateClassModal}
          style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }} // Dark modal theme
        >
          <Modal.Header style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            Create a New Class
          </Modal.Header>
          <Modal.Content style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            <Form>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Name</label>
                <Input
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF' }} // Dark input fields
                />
              </Form.Field>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Description</label>
                <Input
                  placeholder="Enter class description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF' }} // Dark input fields
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            <Button onClick={closeCreateClassModal} color="red">
              Cancel
            </Button>
            <Button
              primary
              onClick={handleCreateClass}
              style={{ backgroundColor: '#00B5D8', color: '#FFFFFF' }}
            >
              Create Class
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    </div>
  );
};

export default UserClassesPage;
