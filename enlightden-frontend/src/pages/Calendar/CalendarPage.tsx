import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Header, Modal, Button, Dropdown, Icon, Form, Input } from 'semantic-ui-react'; // Import Modal and Button for event details
import './CalendarPage.css'; // Custom styles for the calendar
import apiClient from '../../apiClient';
import CreateSessionButton from './CreateSessionButton'; 

// Set up moment.js localizer
const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
  const [view, setView] = useState<View>('month'); // Use View type for defaultView
  const [modalOpen, setModalOpen] = useState<boolean>(false); // Modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // Selected event
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false); // Flag to track if we're editing
  const [sessionToEdit, setSessionToEdit] = useState<any>(null); // Store session to edit

  interface StudySession {
    id: string;
    name: string;
    description: string;
    day: number;
    month: number;
    startTime: BigInt;
    endTime: BigInt;
    userId: string;
    className: string;
  }

  // Convert StudySession to Event object for React Big Calendar
  const events: Event[] = sessions.map((session) => ({
    title: session.name,
    start: new Date(Number(session.startTime) * 1000), // Convert startTime to Date object
    end: new Date(Number(session.endTime) * 1000),     // Convert EndTime to Date object
    resource: {
      description: session.description,
      className: session.className,
      id: session.id, // Store the description in the 'resource' property
    },
  }));

    // Fetch sessions from API
    const fetchSessions = async () => {
      try {
        const response = await apiClient.get('/api/StudySession/GetByUserId');
        if (response.status === 200) {
          setSessions(response.data); // Set sessions state
        } else {
          setErrorMessage('Failed to load sessions.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching sessions.');
      }
    };

 useEffect(() => {
    fetchSessions();
  }, []); 

  // Handle event click
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event); // Set the clicked event
    setModalOpen(true); // Open the modal
  };

  // Handle event delete
 
  // Handle event delete
  const handleDeleteSession = async () => {
    if (!selectedEvent) return;

    try {
      const response = await apiClient.delete(`/api/StudySession/delete/${selectedEvent.resource?.id}`);
      if (response.status === 200) {
        // Re-fetch sessions after deletion
        await fetchSessions();
        setModalOpen(false); // Close modal
      } else {
        setErrorMessage('Failed to delete session.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting the session.');
    }
  };

  // Handle session update
  const handleUpdateSession = async () => {
    
   

    try {
      const response = await apiClient.put(`/api/StudySession/update/${sessionToEdit}`);
      if (response.status === 200) {
        const updatedSessions = sessions.map((session) =>
          session.id === sessionToEdit.id ? response.data : session
        );
        setSessions(updatedSessions);
        setModalOpen(false);
        setEditMode(false);
      } else {
        setErrorMessage('Failed to update session.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating the session.');
    }
  };

  const handleEdit = (event: any) => {
    setSessionToEdit(event.resource?.id); // Set the session to edit
    setEditMode(true); // Enable editing mode
    setModalOpen(true); // Open the modal
  };

  // Close modal handler
  const handleClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setEditMode(false);
    setSessionToEdit(null);
  };

  return (
    <Container fluid className="calendar-container">
      <Header as="h2" inverted>
        My Calendar
      </Header>
      <div style={{ marginBottom: 10 }}>
        <CreateSessionButton addSession={(newSession) => setSessions((prev) => [...prev, newSession])} />
      </div>

      <div className="responsive-calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ minHeight: '80vh' }}
          views={['month']}
          defaultView={view}
          onSelectEvent={handleSelectEvent}
          onView={(newView) => setView(newView)}
          components={{
            toolbar: CustomToolbar, // Custom toolbar without week/day buttons
          }}
        />
      </div>

      {/* Modal to display event details */}
      <Modal open={modalOpen} onClose={handleClose} size="small" style={{ backgroundColor: '#2E2E3E', color: 'white' }}>
        <Modal.Header style={{ backgroundColor: '#1E1E2E', color: 'white' }}>
          {selectedEvent?.title}
        </Modal.Header>
        <Modal.Content style={{ backgroundColor: '#2E2E3E', color: '#B0B0B0' }}>
          <p><strong>Description:</strong> {selectedEvent?.resource?.description}</p>
          <p><strong>Class Name:</strong> {selectedEvent?.resource?.className}</p>
          <p><strong>Start Time:</strong> {selectedEvent?.start.toLocaleString()}</p>
          <p><strong>End Time:</strong> {selectedEvent?.end.toLocaleString()}</p>
        </Modal.Content>
        <Modal.Actions style={{ backgroundColor: '#1E1E2E' }}>
          <Button onClick={handleClose} style={{ backgroundColor: '#00B5D8', color: 'white' }}>
            Close
          </Button>
          <Button color="orange" onClick={() => handleEdit(selectedEvent)}>
            <Icon name="edit" /> Edit
          </Button>
          <Button color="red" onClick={handleDeleteSession}>
            <Icon name="trash" /> Delete
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}; 
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  return (
    <div className="toolbar-container">
      <button onClick={goToBack}>Back</button>
      <span>{toolbar.label}</span>
      <button onClick={goToNext}>Next</button>
    </div>
  );
};
export default CalendarPage; 