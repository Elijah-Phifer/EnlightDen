import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Loader, Message, Container, Segment, List, Button, Input, Form, Divider, Icon } from 'semantic-ui-react';
import apiClient from '../../../src/apiClient'; // Axios instance for API calls

interface Question {
  id: string;
  request: string;
  answer: string;
  questionType: string; // Depending on what you return for the question type
}

interface TestData {
  id: string;
  name: string;
  questions: Question[];
}

interface UserAnswer {
  questionId: string;
  userResponse: string;
}

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>(); // Get testId from URL params
  const [testData, setTestData] = useState<TestData | null>(null); // State for test data
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]); // State for user responses
  const [submitted, setSubmitted] = useState(false); // State to check if the test has been submitted
  const [score, setScore] = useState<number>(0); // State for score

  // Fetch test data by testId
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await apiClient.get(`/api/StudyTool/GetStudyTool/${testId}`); // Assuming the endpoint is GetStudyTool
        if (response.status === 200) {
          setTestData(response.data); // Set test data
          // Initialize empty user answers
          const initialUserAnswers = response.data.questions.map((question: Question) => ({
            questionId: question.id,
            userResponse: "",
          }));
          setUserAnswers(initialUserAnswers);
        } else {
          setErrorMessage('Failed to load test data.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching test data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  // Handle input change for user responses
  const handleInputChange = (questionId: string, value: string) => {
    setUserAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.questionId === questionId ? { ...answer, userResponse: value } : answer
      )
    );
  };

  // Grade the test
  const gradeTest = () => {
    let correctCount = 0;
    userAnswers.forEach((userAnswer) => {
      const correctAnswer = testData?.questions.find((q) => q.id === userAnswer.questionId)?.answer.trim().toLowerCase();
      if (userAnswer.userResponse.trim().toLowerCase() === correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true); // Mark test as submitted to show the results
  };

  // Reset test to allow retake
  const resetTest = () => {
    setUserAnswers(userAnswers.map((answer) => ({ ...answer, userResponse: "" }))); // Clear user answers
    setSubmitted(false); // Reset submission state
    setScore(0); // Reset score
  };

  if (loading) {
    return <Loader active inline="centered" content="Loading test..." />;
  }

  if (errorMessage) {
    return <Message negative>{errorMessage}</Message>;
  }

  return (
    <div style={{ backgroundColor: '#DDBEA8', minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Header Section */}
      <Container textAlign="center" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
        <Header as="h1" style={{ color: '#FFFFFF' }}>
          Test: {testData?.name}
        </Header>
      </Container>

      {/* Display questions */}
      <Container>
        <Segment raised style={{ backgroundColor: '#504136', color: '#FFFFFF' }}>
          <Header as="h3" style={{ color: '#FFFFFF' }}>Answer the following questions</Header>
          <List divided relaxed>
            {testData?.questions.map((question, index) => (
              <List.Item key={question.id}>
                <List.Content>
                  <List.Header style={{ color: '#FFFFFF', marginBottom: '10px' }}>
                    Question {index + 1}: {question.request}
                  </List.Header>
                  {!submitted ? (
                    <Form>
                      <Input
                        placeholder="Type your answer here..."
                        value={userAnswers.find((answer) => answer.questionId === question.id)?.userResponse || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        style={{ marginBottom: '1em', width: '100%' }}
                      />
                    </Form>
                  ) : (
                    <div>
                      <p style={{ color: userAnswers.find((answer) => answer.questionId === question.id)?.userResponse.trim().toLowerCase() === question.answer.trim().toLowerCase() ? 'lightgreen' : 'lightcoral' }}>
                        <Icon name={userAnswers.find((answer) => answer.questionId === question.id)?.userResponse.trim().toLowerCase() === question.answer.trim().toLowerCase() ? 'check' : 'close'} />
                        <strong>Your Answer:</strong> {userAnswers.find((answer) => answer.questionId === question.id)?.userResponse || 'No answer given'}
                      </p>
                      <p style={{ color: '#F3DFC1' }}>
                        <strong>Correct Answer:</strong> {question.answer}
                      </p>
                    </div>
                  )}
                </List.Content>
              </List.Item>
            ))}
          </List>

          {!submitted && (
            <Button
              primary
              onClick={gradeTest}
              style={{ backgroundColor: '#F3DFC1', color: '#5d5d5d', marginTop: '20px' }}
            >
              Submit Test
            </Button>
          )}

          {submitted && (
            <>
              <Divider />
              <Header as="h3" style={{ color: '#F3DFC1' }}>
                You scored {score}/{testData?.questions.length}
              </Header>
              <Message
                positive={score >= (testData?.questions.length || 1) / 2}
                negative={score < (testData?.questions.length || 1) / 2}
              >
                {score >= (testData?.questions.length || 1) / 2
                  ? 'Great job! You passed the test.'
                  : 'Keep trying! You can improve your score.'}
              </Message>

              {/* Retake Test Button */}
              <Button
                secondary
                onClick={resetTest}
                style={{ backgroundColor: '#F3DFC1', color: '#5d5d5d', marginTop: '20px' }}
              >
                Retake Test
              </Button>
            </>
          )}
        </Segment>
      </Container>
    </div>
  );
};

export default TestPage;
