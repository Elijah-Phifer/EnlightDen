import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Button, Container, Header, Message } from 'semantic-ui-react';
import BrownNoise from '/Users/elijahphifer/CMPS411/EnlightDen/enlightden-frontend/src/Assets/BrownNoise.mp3'; // Adjusted import path

// Custom Input Wrapper
const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
);

const StudySessionPage: React.FC = () => {
  const [timeInput, setTimeInput] = useState<string>('00:00:00');
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isBrownNoiseEnabled, setIsBrownNoiseEnabled] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(new Audio(BrownNoise));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true; // Set loop to true
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev === 1) {
            setMessage('Well done, time for a study break!');
            // Stop audio when timer ends
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0; // Reset audio to start
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds]);

  const handleStart = () => {
    const [h, m, s] = timeInput.split(':').map(Number);
    const seconds = h * 3600 + m * 60 + s;
    if (seconds > 0) {
      setTotalSeconds(seconds);
      setIsActive(true);
      setMessage(null);
      
      // Play audio if brown noise is enabled
      if (isBrownNoiseEnabled && audioRef.current) {
        audioRef.current.play();
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTotalSeconds(0);
    setTimeInput('00:00:00');
    setMessage(null);
    
    // Stop audio when timer resets
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio to start
    }
  };

  const toggleBrownNoise = () => {
    setIsBrownNoiseEnabled(prev => !prev);
    
    // If enabling brown noise and timer is active, play audio
    if (!isBrownNoiseEnabled && audioRef.current && isActive) {
      audioRef.current.play();
    } else if (isBrownNoiseEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio to start
    }
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);
  
  const displayHours = Math.floor(totalSeconds / 3600);
  const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
  const displaySeconds = totalSeconds % 60;

  const validateInput = (value: string) => {
    const parts = value.split(':');
    if (parts.length > 3) return false;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 2) return false;
      if (!/^\d*$/.test(parts[i])) return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      const newValue = e.target.value.replace(/[^0-9:]/g, '');
      const parts = newValue.split(':');
      const formattedParts = parts.map(part => part.slice(0, 2));

      if (formattedParts.length <= 3 && validateInput(formattedParts.join(':'))) {
        setTimeInput(formattedParts.join(':'));

        const cursorPosition = e.target.selectionStart || 0;
        const nextPosition = cursorPosition;

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(nextPosition, nextPosition);
          }
        }, 0);
      }
    }
  };

  return (
    <Container style={{ marginTop: '50px', paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Header as="h1" style={{ fontSize: '50px' }}>Pomodoro Timer</Header>
      <Header as="h2" style={{ fontSize: '16px', color: '#B0B0B0' }}>Set the timer for however long you want to study, then click start!</Header>
      
      <CustomInput
        ref={inputRef}
        type="text"
        value={isActive ? `${formatTime(displayHours)}:${formatTime(displayMinutes)}:${formatTime(displaySeconds)}` : timeInput}
        onChange={handleInputChange}
        placeholder="HH:MM:SS"
        style={{
          fontSize: '50px',
          width: '300px',
          textAlign: 'center',
          backgroundColor: '#2E2E3E',
          color: '#FFFFFF',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
        }}
      />
  
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Button primary onClick={handleStart} style={{ margin: '10px', padding: '10px', fontSize: '16px' }}>
          Start
        </Button>
        <Button secondary onClick={handleReset} style={{ margin: '10px', padding: '10px', fontSize: '16px', backgroundColor: 'red' }}>
          Reset
        </Button>
      </div>
  
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', position: 'absolute', top: '100px', right: '20px', zIndex: 1000 }}>
        <div style={{ textAlign: 'center' }}>
          <Message style={{ marginTop: '10px', padding: '10px', fontSize: '1em', width: '250px', backgroundColor: '#00B5D8', color: '#2E2E3E', fontWeight: '800' }}>
            Want background noise to help you focus while studying?
          </Message>
          <Button 
            toggle 
            active={isBrownNoiseEnabled} 
            onClick={toggleBrownNoise} 
            style={{ marginTop: '10px', padding: '10px', fontSize: '16px' }}>
            {isBrownNoiseEnabled ? 'Disable Brown Noise' : 'Enable Brown Noise'}
          </Button>
        </div>
      </div>
  
      {message && (
        <Message success style={{ fontSize: '60px', marginTop: '20px', backgroundColor: '#2E2E3E', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
          {message}
        </Message>
      )}
    </Container>
  );
  

  
  
};

export default StudySessionPage;
