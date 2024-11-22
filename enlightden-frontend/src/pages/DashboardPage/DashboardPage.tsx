import React, { useEffect, useState } from 'react';
import { Container, Header, Button, Icon, Card, Grid, Message, Modal, Form, Input, Divider, Dropdown } from 'semantic-ui-react';
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null); // Track the hovered card
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
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

  // Handle class creation
  const handleCreateClass = async () => {
    const descriptionToSend = newClassDescription || ''; // If empty, send empty string

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

  // Handle class navigation
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
    <div
      style={{
        backgroundColor: '#F3DFC1',
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '2em',
      }}
    >
      <ToastContainer />
      <Container textAlign="center">
        {/* Hero Section */}
        <div
          style={{
            backgroundColor: '#DDBEA8',
            padding: '3em 1em',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            marginBottom: '2em',
            position: 'relative',
          }}
        >
          <Header as="h1" style={{ color: '#4A5451', marginBottom: '0.5em', fontSize: '3em' }}>
            Welcome to <span style={{ color: '#4A5451' }}>EnlightDen</span>
          </Header>
          <p style={{ color: '#4A5451', fontSize: '1.3em', margin: '1em 0' }}>
            Your Ultimate Study Companion
          </p>

          <Divider inverted />
          <p style={{ color: '#4A5451', fontSize: '1.2em' }}>
            Where learning is made easier, one step at a time.
          </p>

          {/* Subtle icon background for visual enhancement */}
          <Icon
            name="lightbulb"
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-10px',
              fontSize: '6em',
              color: '#4A5451',
              opacity: '0.3',
            }}
          />
        </div>

        {/* Quick Access Section */}
        <Grid centered stackable columns={1}>
          <Grid.Column textAlign="center">

          <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3DFC1', // Optional: page background color
  }}
>
  <Card
    style={{
     width: '550px', // Adjust the width
     padding:'10px',
     backgroundColor: '#504136',
     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Optional: shadow for depth
    color:'#FFFFFF'
    }}
  >
    <div style={{
      color:'#FFFFFF'
    }}>
    <Card.Content onClick={() => setIsFormVisible(!isFormVisible)}>
      <Icon name="add" size="large" />
      <Card.Header>Click to create a new class</Card.Header>
      {!isFormVisible /*&& <Card.Description>Click to create a new class</Card.Description> */}
    </Card.Content>
    </div>
    {isFormVisible && (
      <Card.Content>
        <Form
          onClick={(e: React.MouseEvent<HTMLFormElement>) => e.stopPropagation()}
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleCreateClass();
          }}
        >
          <div style={{color:'#FFFFFF'}}>
          <Form.Field>

            <div >
            <label style={{ color: '#FFFFFF' }}>Class Name</label>
            <Input
              placeholder="Enter class name"
              value={newClassName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewClassName(e.target.value)
              }
              style={{color:'#F3DFC1'
              }}
            />
            </div>
          </Form.Field>
          </div>
          <Form.Field >
            <label style={{ color: '#FFFFFF' }}>Class Description</label>
            <Input
              placeholder="Enter class description"
              value={newClassDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewClassDescription(e.target.value)
              }
              style={{  color: '#FFFFFF' }}
            />
            
          </Form.Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsFormVisible(false);
              }}
              color="red"
              style={{
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) =>
                (e.currentTarget.style.backgroundColor = '#C0392B')
              }
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) =>
                (e.currentTarget.style.backgroundColor = 'red')
              }
            >
              Cancel
            </Button>
            <Button
              primary
              type="submit"
              disabled={!newClassName.trim()}
              style={{
                backgroundColor: newClassName.trim() ? '#618264' : '#618264',
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName.trim()) {
                  e.currentTarget.style.backgroundColor = '#8AA88C';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName.trim()) {
                  e.currentTarget.style.backgroundColor = '#618264';
                }
              }}
            >
              Create Class
            </Button>
          </div>
        </Form>
      </Card.Content>
    )}
  </Card>
</div>


         {/* <Button
            color="green"
            size="large"
            onClick={openCreateClassModal}
            style={{
              width: '50%',
              transition: 'background-color 0.3s ease',
              backgroundColor: '#504136', // Note: Correct spelling of "backgroundColor"
              color: '#fff', // Ensure text is readable
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#4A5451';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#504136';
            }}
          >
            <Icon name="add" /> Create a New Class
          </Button> */}

          </Grid.Column>
        </Grid>

        {/* Display Classes on Dashboard */}
        <Container style={{ marginTop: '3em' }}>
          <Header as="h2" style={{ color: '#4A5451' }}>Your Classes</Header>
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
                    <Icon name="book" style={{ color: '#FFFFFF' }} />
                    {classItem.name}
                  </Header>
                }
                description={
                  <p style={{ color: '#FFFFFF' }}>{classItem.description || ''}</p>
                }
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
                  backgroundColor: '#504136',
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
          style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}
        >
          <Modal.Header style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}>
            Create a New Class
          </Modal.Header>
          <Modal.Content style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}>
            <Form>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Name</label>
                <Input
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}
                />
              </Form.Field>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Class Description</label>
                <Input
                  placeholder="Enter class description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}>
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
                backgroundColor: newClassName ? '#00B5D8' : '#5A7D5D',
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#5A7D5D';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (newClassName) {
                  e.currentTarget.style.backgroundColor = '#5A6D5D';
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
          style={{ backgroundColor: '#F3DFC1', color: '#FFFFFF' }}
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
          <Modal.Actions style={{ backgroundColor: '#F3DFC1', color: '#F3DFC1' }}>
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
                color: '#F3DFC1',
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