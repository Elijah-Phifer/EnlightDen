import React, { useState } from 'react';
import { Button, Form, Input, TextArea, Modal, Container } from 'semantic-ui-react';
import apiClient from '../../apiClient'; // Assuming you have a configured API client

const CreateSessionButton: React.FC<{ addSession: (session: any) => void }> = ({ addSession }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateSession = async () => {
    // Prevent submitting if inputs are invalid or empty
    if (!name || !description || !startTime || !endTime || !className) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    // Convert start and end times to Unix timestamps (in seconds)
    const startUnixTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
    const endUnixTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    const newSession = {
      name,
      description,
      startTime: startUnixTimestamp,
      endTime: endUnixTimestamp,
      className,
      
    };

    try {
      const response = await apiClient.post('/api/StudySession/create', newSession);
      if (response.status === 201) {
        addSession(response.data); // Add the newly created session to the state
        setModalOpen(false); // Close the modal
        setErrorMessage(null); // Clear any previous error messages
      } else {
        setErrorMessage('Failed to create session.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the session.');
    }
  };

  return (
    <Container>
      <Button color="green" onClick={() => setModalOpen(true)} style={{marginLeft: -135}}>
        Create New Session
      </Button>

      {/* Modal for creating new session */}
      <Modal open={modalOpen} 
      onClose={() => setModalOpen(false)}   
      style={{ backgroundColor: '#504136', color: '#FFFFFF' }}
      >
        <Modal.Header style={{ backgroundColor: '#504136', color: '#FFFFFF' }}>Create New Study Session</Modal.Header>
        <Modal.Content style={{ backgroundColor: '#504136', color: '#FFFFFF' }}>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Form>
            <Form.Field style={{ color: '#FFFFFF' }}>
              <label style={{ color: '#FFFFFF' }}>Session Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Session Name"
                required
                style={{ backgroundColor: '#504136', color: '#FFFFFF' }}
              />
            </Form.Field>
            <Form.Field style={{ color: '#FFFFFF' }}>
              <label style={{ color: '#FFFFFF' }}>Description</label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Session Description"
                required
                style={{ backgroundColor: '#DDBEA8', color: '#5d5d5d' }}
              />
            </Form.Field>
            <Form.Field style={{ color: '#FFFFFF' }}>
              <label style={{ color: '#FFFFFF' }}>Class Name</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class Name"
                required
                style={{ backgroundColor: '#DDBEA8', color: '#5d5d5d' }}
              />
            </Form.Field>
            <Form.Field style={{ color: '#FFFFFF' }}>
              <label style={{ color: '#FFFFFF' }}>Start Time</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{ backgroundColor: '#504136', color: '#FFFFFF' }}
              />
            </Form.Field>
            <Form.Field style={{ color: '#FFFFFF' }}>
              <label style={{ color: '#FFFFFF' }}>End Time</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{ backgroundColor: '#504136', color: '#FFFFFF' }}
              />
            </Form.Field>
            <Button color="green" onClick={handleCreateSession} >
              Create Session
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    </Container>
  );
};

export default CreateSessionButton;
