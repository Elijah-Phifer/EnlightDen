import React, { useEffect, useState } from 'react';
import { Container, Header, Button, Icon, Card, Grid, Message, Modal, Form, Input, Divider, Popup, Dropdown } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../src/apiClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Class {
  id: string;
  name: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>(''); 
  const [newClassDescription, setNewClassDescription] = useState<string>('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState<boolean>(true);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

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

  const handleCreateClass = async () => {
    const descriptionToSend = newClassDescription || '';

    try {
      const response = await apiClient.post('/api/Class/Create', {
        name: newClassName,
        description: descriptionToSend,
      });

      if (response.status === 200) {
        const newClass: Class = response.data;
        setClasses([...classes, newClass]);
        setIsModalOpen(false);
        setNewClassName('');
        setNewClassDescription('');
        toast.success('Class created successfully!');
      } else {
        setErrorMessage('Failed to create class.');
        toast.error('Failed to create class.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the class.');
      toast.error('An error occurred while creating the class.');
    }
  };

  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}/notes`);
  };

  // Handle class update
  const handleUpdateClass = async () => {
    if (!selectedClass) return;

    try {
      const response = await apiClient.put(`/api/Class/${selectedClass.id}`, {
        name: newClassName,
        description: newClassDescription,
      });

      if (response.status === 200) {
        setClasses(classes.map(c => c.id === selectedClass.id ? { ...c, name: newClassName, description: newClassDescription } : c));
        setIsEditModalOpen(false);
        setNewClassName('');
        setNewClassDescription('');
        setSelectedClass(null);
        toast.success('Class updated successfully!');
      } else {
        setErrorMessage('Failed to update class.');
        toast.error('Failed to update class.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating the class.');
      toast.error('An error occurred while updating the class.');
    }
  };

  // Handle class delete
  const handleDeleteClass = async (classId: string) => {
    try {
      const response = await apiClient.delete(`/api/Class/${classId}`);
      if (response.status === 200) {
        setClasses(classes.filter(c => c.id !== classId));
        toast.success('Class deleted successfully!');
      } else {
        setErrorMessage('Failed to delete class.');
        toast.error('Failed to delete class.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting the class.');
      toast.error('An error occurred while deleting the class.');
    }
  };

  // Open/close modal functions
  const openCreateClassModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateClassModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
    setNewClassName('');
    setNewClassDescription('');
  };

  const openEditClassModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setNewClassName(classItem.name);
    setNewClassDescription(classItem.description);
    setIsEditModalOpen(true);
  };

  const closeEditClassModal = () => {
    setIsEditModalOpen(false);
    setErrorMessage(null);
    setNewClassName('');
    setNewClassDescription('');
    setSelectedClass(null);
  };

  return (
    <div style={{ backgroundColor: '#F3DFC1', minHeight: '100vh', paddingTop: '120px', paddingBottom: '2em' }}>
      <Container textAlign="center">

        {/* Dismissible Welcome Popup */}
        {showWelcomePopup && (
          <Popup
            content="Welcome to EnlightDen, your ultimate study companion!"
            on="click"
            open={showWelcomePopup}
            onClose={() => setShowWelcomePopup(false)}
            position="top right"
            trigger={<Icon name="close" style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }} />}
          />
        )}

        {/* Dashboard Sections */}
        <Grid columns={3} divided stackable style={{ marginBottom: '2em' }}>
          <Grid.Column>
            <Card style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF', padding: '1em' }}>
              <Header as="h3">Last Taken Exams</Header>
              <Button basic color="brown">Exam 1 - 80%</Button>
              <Button basic color="brown">Exam 2 - 70%</Button>
            </Card>
          </Grid.Column>
          <Grid.Column>
            <Card style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF', padding: '1em' }}>
              <Header as="h3">Average Knowledge Level</Header>
              <p>Course 1: 70%</p>
              <p>Course 2: 85%</p>
              <p>Course 3: 60%</p>
            </Card>
          </Grid.Column>
          <Grid.Column>
            <Card style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF', padding: '1em' }}>
              <Header as="h3">Reminders</Header>
              <Button basic color="brown">Reminder 1 - Study for Exam 1</Button>
              <Button basic color="brown">Reminder 2 - Review Lecture Notes</Button>
            </Card>
          </Grid.Column>
        </Grid>

        {/* Create Class Button */}
        <Grid centered stackable columns={1}>
          <Grid.Column textAlign="center">
            <Button
              color="brown"
              size="large"
              onClick={openCreateClassModal}
              style={{ width: '50%', transition: 'background-color 0.3s ease' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#9D765C')}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#A5673F')}
            >
              <Icon name="add" /> Create a New Class
            </Button>
          </Grid.Column>
        </Grid>

        {/* Classes Section */}
        <Divider style={{ backgroundColor: '#DDBEA8', height: '3px', marginBottom: '2em' }} />
        <Container style={{ marginTop: '3em' }}>
          <Header as="h2" style={{ color: '#72705B' }}>Your Classes</Header>
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
                header={<Header as="h3" style={{ color: '#FFFFFF' }}>{classItem.name}</Header>}
                description={<p style={{ color: '#FFFFFF' }}>{classItem.description || ''}</p>}
                onClick={() => handleClassClick(classItem.id)}
                onMouseEnter={() => setHoveredCard(classItem.id)} 
                onMouseLeave={() => setHoveredCard(null)}
                extra={
                  <Dropdown
                    icon={{ name: 'ellipsis horizontal', color: 'white' }}
                    pointing="top left"
                    className="icon"
                    style={{ position: 'absolute', top: '10px', left: '10px', color: '#FFFFFF' }}
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item
                        icon="edit"
                        text="Update"
                        onClick={() => openEditClassModal(classItem)}
                      />
                      <Dropdown.Item
                        icon="trash"
                        text="Delete"
                        onClick={() => handleDeleteClass(classItem.id)}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                }
                style={{
                  backgroundColor: '#DDBEA8',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  boxShadow: hoveredCard === classItem.id ? '0 6px 12px rgba(0, 0, 0, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  padding: '1em',
                  transform: hoveredCard === classItem.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative',
                }}
              />
            ))}
          </Card.Group>
        </Container>

        {/* Modal for creating a new class */}
        <Modal
          open={isModalOpen}
          onClose={closeCreateClassModal}
          style={{ backgroundColor: '#DDBEA8', color: '#FFFFFF' }}
        >
          <Modal.Header>Create a New Class</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <label>Class Name</label>
                <Input
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ backgroundColor: '#F3DFC1', color: '#72705B' }}
                />
              </Form.Field>
              <Form.Field>
                <label>Class Description</label>
                <Input
                  placeholder="Enter class description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  style={{ backgroundColor: '#F3DFC1', color: '#72705B' }}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            <Button
              onClick={closeCreateClassModal}
              color="red"
              style={{
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#C0392B')}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'red')}
            >
              Cancel
            </Button>
            <Button
              primary
              onClick={handleCreateClass}
              disabled={!newClassName}
              style={{
                backgroundColor: newClassName ? '#00B5D8' : '#B0B0B0',
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#008BB2';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#00B5D8';
                }
              }}
            >
              Create Class
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Modal for editing a class */}
        <Modal
          open={isEditModalOpen}
          onClose={closeEditClassModal}
          style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}
        >
          <Modal.Header style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            Edit Class
          </Modal.Header>
          <Modal.Content style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            <Form>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Name</label>
                <Input
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}
                />
              </Form.Field>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Description</label>
                <Input
                  placeholder="Enter class description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
            <Button
              onClick={closeEditClassModal}
              color="red"
              style={{
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#C0392B')}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'red')}
            >
              Cancel
            </Button>
            <Button
              primary
              onClick={handleUpdateClass}
              disabled={!newClassName}
              style={{
                backgroundColor: newClassName ? '#00B5D8' : '#B0B0B0',
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#008BB2';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#00B5D8';
                }
              }}
            >
              Update Class
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;