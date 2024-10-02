import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Button, Container, Header, Message } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

// Custom Input Wrapper
const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => <input ref={ref} {...props} />
  );
  
const StudySessionPage: React.FC = () => {
  const [timeInput, setTimeInput] = useState<string>('00:00:00');
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input element

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev === 1) {
            setMessage('Well done, time for a study break!');
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
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTotalSeconds(0);
    setTimeInput('00:00:00');
    setMessage(null);
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  const displayHours = Math.floor(totalSeconds / 3600);
  const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
  const displaySeconds = totalSeconds % 60;

  const validateInput = (value: string) => {
    const parts = value.split(':');
    if (parts.length > 3) return false;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 2) return false; // Max 2 digits
      if (!/^\d*$/.test(parts[i])) return false; // Only digits allowed
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      const newValue = e.target.value.replace(/[^0-9:]/g, ''); // Allow only numbers and colons
      const parts = newValue.split(':');
      const formattedParts = parts.map(part => part.slice(0, 2)); // Limit to 2 digits

      if (formattedParts.length <= 3 && validateInput(formattedParts.join(':'))) {
        setTimeInput(formattedParts.join(':'));

        // Move cursor to the right of the current input position
        const cursorPosition = e.target.selectionStart || 0;
        const nextPosition = cursorPosition ; // Move cursor one position to the right

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(nextPosition, nextPosition);
          }
        }, 0);
      }
    }
  };

  return (
    <Container textAlign="center" style={{ marginTop: '50px', paddingTop: '100px'}}>
      <Header as="h1" style={{ fontSize: '50px' }}>Pomodoro Timer</Header>
      <Header as="h2" style={{ fontSize: '16px',color: '#B0B0B0' }}>Set the timer for however long you want to study, then click start!</Header>

      <CustomInput
        ref={inputRef} // Attach the ref to the custom input
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

      <div>
        <Button primary onClick={handleStart} style={{ margin: '10px', padding: '10px', fontSize: '16px' }}>
          Start
        </Button>
        <Button secondary onClick={handleReset} style={{ margin: '10px', padding: '10px', fontSize: '16px', backgroundColor: 'red' }}>
          Reset
        </Button>
      </div>

      {message && (
        <Message success style={{ fontSize: '60px', marginTop: '20px' }}>
          {message}
        </Message>
      )}
    </Container>
  );
};

export default StudySessionPage;
