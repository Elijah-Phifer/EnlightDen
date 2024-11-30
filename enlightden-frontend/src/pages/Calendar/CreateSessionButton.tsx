import React, { useState } from 'react';
import { Button, Form, Input, TextArea, Modal } from 'semantic-ui-react';
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
    <>
      <Button color="green" onClick={() => setModalOpen(true)}>
        Create New Session
      </Button>

      {/* Modal for creating new session */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="small">
        <Modal.Header>Create New Study Session</Modal.Header>
        <Modal.Content>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Form>
            <Form.Field>
              <label>Session Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Session Name"
                required
              />
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Session Description"
                required
              />
            </Form.Field>
            <Form.Field>
              <label>Class Name</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class Name"
                required
              />
            </Form.Field>
            <Form.Field>
              <label>Start Time</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Form.Field>
            <Form.Field>
              <label>End Time</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Form.Field>
            <Button color="blue" onClick={handleCreateSession}>
              Create Session
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default CreateSessionButton;
