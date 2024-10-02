// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import NotesPage from './pages/NotesPage/NotesPage';
import MindMapPage from './pages/MindMapPage/MindMapPage';
import LoginPage from './pages/LoginPage/LoginPage';
import Navbar from './components/Navbar'; // Import the Navbar component
import UserClassesPage from './pages/ClassPage/ClassPage';
import StudySessionPage from './pages/StudySessionPage/StudySessionPage';

const App: React.FC = () => {
  const getMindMapData = (noteId: string) => {
    return {
      nodes: [
        { id: 1, label: 'Main Topic' },
        { id: 2, label: 'Subtopic 1' },
        { id: 3, label: 'Subtopic 2' },
      ],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
      ],
    };
  };

  // Custom component to manage conditional navbar rendering
  const Main = () => {
    const location = useLocation();
    
    // Define paths where the Navbar should not appear (e.g., Login/Signup)
    const hideNavbarPaths = ['/'];

    // Check if the current path is in the list of paths where the navbar should be hidden
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    return (
      <>
        {shouldShowNavbar && <Navbar />}
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path="/dash" element={<DashboardPage />} />
          <Route path="/class/:classId/notes" element={<NotesPage />} /> {/* Notes page route */}
          <Route path="/mindmap/:noteId" element={<MindMapPage />} />
          <Route path="/classes" element={<UserClassesPage />} />
          <Route path="/studysession" element={<StudySessionPage />} />
        </Routes>
      </>
    );
  };

  return (
    <Router>
      <Main />
    </Router>
  );
};

export default App;

