import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../../src/apiClient';
import './FlashcardPage.css'; // Custom CSS for styling

interface Flashcard {
  id: string;
  request: string;
  answer: string;
}

interface FlashcardSet {
  id: string;
  name: string;
  questions: Flashcard[];
}

const FlashcardPage: React.FC = () => {
  const { flashcardId } = useParams<{ flashcardId: string }>();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch flashcard set data from the API
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const response = await apiClient.get(`/api/StudyTool/GetStudyTool/${flashcardId}`);
        if (response.status === 200) {
          setFlashcardSet(response.data); // Store the flashcard set data
        }
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSet();
  }, [flashcardId]);

  const handleFlip = () => setFlipped(!flipped);
  const handleNextCard = () => setCurrentIndex((prev) => (prev + 1) % flashcardSet!.questions.length);
  const handlePrevCard = () => setCurrentIndex((prev) => (prev - 1 + flashcardSet!.questions.length) % flashcardSet!.questions.length);

  if (loading) return <div className="loader">Loading Flashcards...</div>;
  if (!flashcardSet || flashcardSet.questions.length === 0) return <div className="no-flashcards">No flashcards available.</div>;

  const currentFlashcard = flashcardSet.questions[currentIndex];

  return (
    <div className="flashcard-page">
      {/* Display the flashcard set name at the top */}
      <h1 className="flashcard-set-title">{flashcardSet.name}</h1>

      <div className="progress-indicator">
        {currentIndex + 1} / {flashcardSet.questions.length}
      </div>

      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          <div className="front">
            <p>{currentFlashcard.request}</p>
          </div>
          <div className="back">
            <p>{currentFlashcard.answer}</p>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button onClick={handlePrevCard}>&lt;</button> {/* Left Arrow */}
        <button onClick={handleNextCard}>&gt;</button> {/* Right Arrow */}
      </div>
    </div>
  );
};

export default FlashcardPage;
