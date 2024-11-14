import React, { useState } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Header, Modal, Button } from 'semantic-ui-react'; // Import Modal and Button for event details
import './CalendarPage.css'; // Custom styles for the calendar

// Set up moment.js localizer
const localizer = momentLocalizer(moment);

// Mock StudyPlan Event
const studyPlanEvent = {
  Id: '1', // Mock ID
  Name: 'Study Session for Math',
  Description: 'Study algebra and calculus',
  Day: 10,
  Month: 10,
  StartTime: new Date(2024, 9, 10, 9, 0).getTime(), // October 10, 9:00 AM
  EndTime: new Date(2024, 9, 10, 11, 0).getTime(), // October 10, 11:00 AM
  UserId: '123',
};

// Convert StudyPlan to Event object for React Big Calendar
const events: Event[] = [
  {
    title: studyPlanEvent.Name,
    start: new Date(studyPlanEvent.StartTime),
    end: new Date(studyPlanEvent.EndTime),
    resource: {
      description: studyPlanEvent.Description, // Store the description in resource
    },
  },
];

const CalendarPage: React.FC = () => {
  const [view, setView] = useState<View>('month'); // Use View type for defaultView
  const [modalOpen, setModalOpen] = useState<boolean>(false); // Modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // Selected event

  // Handle event click
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event); // Set the clicked event
    setModalOpen(true); // Open the modal
  };

  // Close modal handler
  const handleClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Container fluid className="calendar-container">
      <Header as="h2" inverted textAlign="center" style={{ marginBottom: '1em', color: "#72705B" }}>
        My Calendar
      </Header>
      <div className="responsive-calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ minHeight: '80vh' }}
          views={['month']} // Only allow the month view
          defaultView={view}
          onSelectEvent={handleSelectEvent} // Handle event clicks
          onView={(newView) => setView(newView)} // Handle the view change
          components={{
            toolbar: CustomToolbar, // Custom toolbar without week/day buttons
          }}
        />
      </div>

      {/* Modal to display event details */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        size="small"
        style={{
          backgroundColor: '#2E2E3E', // Dark mode background for the modal container
          color: 'white', // White text
        }}
      >
        <Modal.Header
          style={{
            backgroundColor: '#1E1E2E', // Darker header
            color: 'white',
          }}
        >
          {selectedEvent?.title}
        </Modal.Header>
        <Modal.Content
          style={{
            backgroundColor: '#2E2E3E', // Ensure the modal content is also dark
            color: '#B0B0B0', // Light gray text for content
          }}
        >
          <p><strong>Description:</strong> {selectedEvent?.resource?.description}</p>
          <p>
            <strong>Start Time:</strong> {selectedEvent?.start.toLocaleString()}
          </p>
          <p>
            <strong>End Time:</strong> {selectedEvent?.end.toLocaleString()}
          </p>
        </Modal.Content>
        <Modal.Actions
          style={{
            backgroundColor: '#1E1E2E', // Dark mode background for actions
          }}
        >
          <Button
            onClick={handleClose}
            style={{
              backgroundColor: '#00B5D8',
              color: 'white',
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

// Custom toolbar to remove the week and day buttons
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
