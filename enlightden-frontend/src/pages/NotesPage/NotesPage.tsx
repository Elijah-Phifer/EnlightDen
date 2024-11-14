import React, { useEffect, useState } from 'react';
import { Button, Icon, Container, Grid, Segment, Modal, Form, Input, Loader, Message, Dimmer, Header, Dropdown } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../src/apiClient'; // Axios instance for API calls
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Note {
  id: string;
  classId: string;
  title: string;
  content: string;
  filePath: string;
  hasMindMap: boolean; // Boolean to check mind map existence
}

const NotesPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>(); // Get classId from the URL params
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMindMap, setLoadingMindMap] = useState<boolean>(false); // Full-screen loader for mind map generation
  const [loadingNoteCreation, setLoadingNoteCreation] = useState<boolean>(false); // Loader for note creation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null); // Track selected note for modal content
  const [className, setClassName] = useState<string>(''); // Store the class name
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);

  // Consolidated function to fetch class data and notes
  const fetchClassData = async () => {
    try {
      // Fetch the class name by classId
      const classResponse = await apiClient.get(`/api/Class/${classId}`);
      if (classResponse.status === 200) {
        setClassName(classResponse.data.name); // Set the class name
      }

      // Fetch the notes for the class
      const notesResponse = await apiClient.get(`/api/Notes/GetByClassId/${classId}`);
      if (notesResponse.status === 200) {
        setNotes(Array.isArray(notesResponse.data) ? notesResponse.data : []);
      } else {
        setErrorMessage('Failed to load notes.');
        toast.error('Failed to load notes.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while fetching data.');
      toast.error('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch class data when classId changes
  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  // Open modal to create a new note
  const openNoteModal = () => {
    setIsNoteModalOpen(true);
    setIsUpdateMode(false);
  };

  // Close modal after note creation or update
  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setNewNoteTitle('');
    setSelectedFile(null);
    setErrorMessage(null);
    setIsUpdateMode(false);
  };

  // Handle file selection for note creation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle note creation by uploading a file
  const handleUpload = async () => {
    if (!selectedFile || !newNoteTitle) {
      setErrorMessage('Please provide a valid file and title for the note.');
      toast.error('Please provide a valid file and title for the note.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('classId', classId!); // Append classId from URL params
    formData.append('title', newNoteTitle);

    setLoadingNoteCreation(true);

    try {
      const response = await apiClient.post('/api/Notes/Create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        const newNote: Note = response.data;
        setNotes([...notes, newNote]);
        closeNoteModal(); // Close the modal after upload
        toast.success('Note uploaded successfully!');
      } else {
        setErrorMessage('Failed to upload the note.');
        toast.error('Failed to upload the note.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while uploading the note.');
      toast.error('An error occurred while uploading the note.');
    } finally {
      setLoadingNoteCreation(false);
    }
  };

  // Handle mind map generation
  const handleGenerateMindMap = async (noteId: string) => {
    try {
      setLoadingMindMap(true);
      const response = await apiClient.post(`/api/MindMap/CreateMindMapFromNote/${noteId}`);
      if (response.status === 200) {
        toast.success('Mind map generated successfully!');
        navigate(`/mindmap/${noteId}`);
      } else {
        toast.error('Failed to generate mind map.');
      }
    } catch (error) {
      toast.error('An error occurred while generating the mind map.');
    } finally {
      setLoadingMindMap(false);
    }
  };

  // Handle note update
  const handleUpdateNote = async () => {
    if (!newNoteTitle) {
      toast.error('Please provide a valid title for the note.');
      return;
    }

    if (!selectedNote?.id) {
      toast.error('No note selected to update.');
      return;
    }

    const payload = {
      title: newNoteTitle,
      classId: classId,
    };

    setLoadingNoteCreation(true);

    try {
      const response = await apiClient.put(
        `/api/Notes/${selectedNote.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Note updated successfully!');
        closeNoteModal();
        fetchClassData(); // Fetch notes again after update
      } else {
        toast.error('Failed to update the note.');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('An error occurred while updating the note.');
    } finally {
      setLoadingNoteCreation(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await apiClient.delete(`/api/Notes/${noteId}`);
      if (response.status === 200) {
        setNotes(notes.filter((note) => note.id !== noteId));
        toast.success('Note deleted successfully!');
      } else {
        toast.error('Failed to delete note.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the note.');
    }
  };

  // Open modal to view the selected note content
  const openNoteContentModal = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  // Open modal for updating note
  const openUpdateNoteModal = (note: Note) => {
    setSelectedNote(note);
    setNewNoteTitle(note.title);
    setIsNoteModalOpen(true);
    setIsUpdateMode(true);
  };

  // Close the note content modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  return (
    <Container style={{ paddingTop: '90px' }}>
      <Button
        icon='arrow left'
        onClick={() => navigate('/dash')}
        color='blue'
        style={{
          marginBottom: '20px',
          backgroundColor: '#00B5D8',
          color: '#FFFFFF',
          transition: 'background-color 0.3s ease'
        }}
        size='large'
        className='responsive-button'
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) =>
          (e.currentTarget.style.backgroundColor = '#008BB2')
        }
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) =>
          (e.currentTarget.style.backgroundColor = '#00B5D8')
        }
      /> {/* Fixes navbar overlap */}
      <ToastContainer />
      <h1>Notes for Class: {className}</h1> {/* Display class name instead of ID */}

      {errorMessage && <Message negative>{errorMessage}</Message>}

      {/* Button to upload a note */}
      <Button
        circular
        icon="plus"
        size="massive"
        color="green"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
        onClick={openNoteModal}
      />

      {/* Modal for uploading or updating notes */}
      <Modal
        open={isNoteModalOpen}
        onClose={closeNoteModal}
        closeIcon
        style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}
      >
        <Modal.Header style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          {isUpdateMode ? 'Update Note' : 'Create a New Note'}
        </Modal.Header>
        <Modal.Content style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          <Form>
            <Form.Field>
              <label style={{ color: '#FFFFFF' }}>Note Title</label>
              <Input
                placeholder="Enter note title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}
              />
            </Form.Field>

            {!isUpdateMode && (
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Upload PDF</label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}
                />
              </Form.Field>
            )}
          </Form>
        </Modal.Content>
        <Modal.Actions style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          <Button
            onClick={closeNoteModal}
            color="red"
            style={{ transition: 'background-color 0.3s ease' }}
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
            onClick={isUpdateMode ? handleUpdateNote : handleUpload}
            disabled={!newNoteTitle || (isUpdateMode ? false : !selectedFile) || loadingNoteCreation}
            style={{
              backgroundColor:
                newNoteTitle && !loadingNoteCreation ? '#00B5D8' : '#B0B0B0',
              color: '#FFFFFF',
              transition: 'background-color 0.3s ease',
              cursor: newNoteTitle && !loadingNoteCreation ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (newNoteTitle && !loadingNoteCreation) {
                e.currentTarget.style.backgroundColor = '#008BB2';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (newNoteTitle && !loadingNoteCreation) {
                e.currentTarget.style.backgroundColor = '#00B5D8';
              }
            }}
          >
            {loadingNoteCreation ? (
              <Loader active inline size="small" />
            ) : isUpdateMode ? (
              'Update'
            ) : (
              'Submit'
            )}
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Display notes in list view */}
      {notes.length > 0 ? (
        <Segment.Group>
          {notes.map((note) => (
            <Segment
              key={note.id}
              className="note-segment" // Apply class for hover effect
              style={{
                backgroundColor: '#2E2E3E',
                padding: '1.5em',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                marginBottom: '1em',
                position: 'relative',
              }}
            >
              <Dropdown
                icon="ellipsis horizontal"
                floating
                labeled
                className="icon"
                button
                style={{ color: '#FFFFFF', backgroundColor: 'transparent', position: 'absolute', top: '10px', left: '10px' }}
              >
                <Dropdown.Menu>
                  <Dropdown.Item
                    icon="edit"
                    text="Update"
                    onClick={() => openUpdateNoteModal(note)}
                  />
                  <Dropdown.Item
                    icon="trash"
                    text="Delete"
                    onClick={() => handleDeleteNote(note.id)}
                  />
                </Dropdown.Menu>
              </Dropdown>
              <Grid>
                <Grid.Column width={12} style={{ paddingLeft: '50px' }} onClick={() => openNoteContentModal(note)}>
                  <Header as="h3" style={{ color: '#FFFFFF' }}>{note.title}</Header>
                </Grid.Column>

                <Grid.Column width={4} textAlign="left">
                  {/* Conditional button for generating or viewing mind map */}
                  {note.hasMindMap ? (
                    <Button
                      primary
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when the button is clicked
                        navigate(`/mindmap/${note.id}`);
                      }}
                      className="hover-scale"
                    >
                      View Mind Map
                    </Button>
                  ) : (
                    <Button
                      primary
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when the button is clicked
                        handleGenerateMindMap(note.id);
                      }}
                      className="hover-scale"
                    >
                      Generate Mind Map
                    </Button>
                  )}
                </Grid.Column>
              </Grid>
            </Segment>
          ))}
        </Segment.Group>
      ) : (
        <Message info>
          <Message.Header>No notes found for this class.</Message.Header>
          <p>Create a new note to get started.</p>
        </Message>
      )}

      {/* Full-screen loader for mind map generation */}
      <Dimmer active={loadingMindMap || loadingNoteCreation} page>
        <Loader>{loadingMindMap ? 'Generating Mind Map...' : isUpdateMode ? 'Updating Note...' : 'Creating Note...'}</Loader>
      </Dimmer>

      {/* Modal to display the content of the selected note */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        closeIcon
        style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }} // Dark theme modal for viewing notes
      >
        <Modal.Header style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          {selectedNote?.title}
        </Modal.Header>
        <Modal.Content style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          <p>{selectedNote?.content}</p>
        </Modal.Content>
        <Modal.Actions style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>
          <Button onClick={closeModal} color="red">
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default NotesPage;
