import React, { useState } from 'react';

// Sample seeded data
const mockData = `
Question: What is Biology?
Answer: The study of living organisms.

Question: What is the powerhouse of the cell?
Answer: Mitochondria.

Question: What does DNA stand for?
Answer: Deoxyribonucleic Acid.
`;

interface Flashcard {
  question: string;
  answer: string;
}

const generateFlashcardsFromSeededData = (data: string): Flashcard[] => {
  const flashcards: Flashcard[] = [];
  const lines = data.trim().split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Question:')) {
      const question = lines[i].replace('Question: ', '').trim();
      const answer = lines[i + 1]?.replace('Answer: ', '').trim() || '';
      flashcards.push({ question, answer });
    }
  }

  return flashcards;
};

const FlashcardViewer: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);
  const handleNextCard = () => setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  const handlePrevCard = () => setCurrentCardIndex((prev) => prev === 0 ? flashcards.length - 1 : prev - 1);

  const currentCard = flashcards[currentCardIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        onClick={handleFlip}
        style={{
          perspective: '1000px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '550px',
            height: '300px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* Front of the Card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '25px',
              fontFamily: 'Arial, sans-serif',
              color: 'black',
            }}
          >
            <p>{currentCard.question}</p>
          </div>

          {/* Back of the Card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '25px',
              fontFamily: 'Arial, sans-serif',
              color: 'black',
              transform: 'rotateY(180deg)',
            }}
          >
            <p>{currentCard.answer}</p>
          </div>
        </div>
      </div>
    
      {/* Buttons for Navigation */}
      <div style= {{ display: 'flex', gap: '10px', marginTop: '20px'}}>
        {/* Previous Button */}
        <button
          onClick={handlePrevCard}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#FF6347',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}

          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FF4500')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6347')}
          >
            Previous Card
          </button>

        { /* Next Card */}
        <button
          onClick={handleNextCard}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007BFF')}
        >
          Next Card
        </button>
      </div>
    </div>
  );
};

const FlashcardTester: React.FC = () => {
  const flashcards = generateFlashcardsFromSeededData(mockData); // Use the seeded data

  return (
    <div style={{ paddingTop: '80px', textAlign: 'center' }}>
      <h1>Biology Flashcards</h1>
      <FlashcardViewer flashcards={flashcards} />
    </div>
  );
};

export default FlashcardTester;



