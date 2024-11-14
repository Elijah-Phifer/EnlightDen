import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Network } from 'vis-network/standalone';
import { Header, Loader, Message, Container, Modal, Button, Input, Dimmer, Form } from 'semantic-ui-react';
import apiClient from '../../../src/apiClient';

interface MindMapTopic {
  id: string;
  topic: string;
}

interface MindMapData {
  id: string;
  name: string;
  noteId: string;
  classId: string;
  topics: MindMapTopic[];
}

const MindMapPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<MindMapTopic | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewTestModalOpen, setViewTestModalOpen] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testExists, setTestExists] = useState<boolean>(false);
  const [flashcardExists, setFlashcardExists] = useState<boolean>(false);
  const [testId, setTestId] = useState<string | null>(null);
  const [flashcardId, setFlashcardId] = useState<string | null>(null);
  const [testName, setTestName] = useState<string>('');

  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        const response = await apiClient.get(`/api/MindMap/GetMindMapByNoteId/${noteId}`);
        if (response.status === 200) {
          setMindMapData(response.data);
        } else {
          setErrorMessage('Failed to load mind map.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching mind map data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMindMapData();
  }, [noteId]);

  useEffect(() => {
    if (mindMapData) {
      const container = document.getElementById('mindmap');

      if (container) {
        const { nodes, edges } = convertJsonToVisNetworkData(mindMapData);

        if (nodes && edges) {
          const options = {
            nodes: {
              shape: 'dot',
              size: 16,
              color: {
                background: '#00B5D8',
                border: '#FFFFFF',
              },
              font: {
                color: '#FFFFFF',
              },
            },
            edges: {
              color: '#00B5D8',
              width: 2,
            },
            physics: {
              enabled: true,
            },
          };
          const network = new Network(container, { nodes, edges }, options);

          network.on('click', function (params) {
            const nodeId = params.nodes[0];
            const topic = nodes.find((node) => node.id === nodeId);

            if (topic && topic.id) {
              setSelectedTopic({ id: topic.id, topic: topic.label });
              checkIfTestOrFlashcardExists(topic.id);
            }
          });
        }
      }
    }
  }, [mindMapData]);

  const convertJsonToVisNetworkData = (data: MindMapData) => {
    const nodes: { id: string; label: string; size: number; color: string }[] = [];
    const edges: { from: string; to: string; weight: number }[] = [];

    const rootNodeId = data.id || 'root';
    const rootNode = { id: rootNodeId, label: data.name, size: 20, color: 'lightblue' };
    nodes.push(rootNode);

    data.topics.forEach((topic) => {
      const topicNode = { id: topic.id, label: topic.topic, size: 15, color: 'lightgreen' };
      nodes.push(topicNode);
      edges.push({ from: rootNodeId, to: topic.id, weight: 2 });
    });

    return { nodes, edges };
  };

  const checkIfTestOrFlashcardExists = async (topicId: string) => {
    try {
      const testResponse = await apiClient.get(`/api/StudyTool/CheckExistingTest/${topicId}`);
      const flashcardResponse = await apiClient.get(`/api/StudyTool/CheckExistingFlashcard/${topicId}`);

      setTestExists(testResponse.data.testExists === true);
      setFlashcardExists(flashcardResponse.data.flashCardExists === true);
      setTestId(testResponse.data.testExists ? testResponse.data.testId : null);
      setFlashcardId(flashcardResponse.data.flashCardExists ? flashcardResponse.data.flashCardId : null);

      if (testExists || flashcardExists) {
        setViewTestModalOpen(true);
      } else {
        setModalOpen(true);
      }
    } catch (error) {
      console.log('Error checking if test or flashcards exist:', error);
    }
  };

  const generateTestOrFlashcard = async (type: 'test' | 'flashcard') => {
    if (!selectedTopic || !testName) {
      setErrorMessage('Please provide the name.');
      return;
    }
  
    setLoadingTest(true);
    try {
      const endpoint =
        type === 'test'
          ? `/api/StudyTool/GenerateTestFromTopic`
          : `/api/StudyTool/GenerateFlashcardsFromTopic`;
  
      const response = await apiClient.post(endpoint, {
        classId: mindMapData?.classId,
        mindMapId: mindMapData?.id,
        topicId: selectedTopic.id,
        name: testName,
        noteId: mindMapData?.noteId,
      });
  
      if (response.status === 200) {
        if (type === 'flashcard') {
          const flashcardId = response.data.flashcardsId; // Extract the flashcard ID from response
          navigate(`/flashcards/${flashcardId}`); // Navigate to the flashcard page
        } else {
          const testId = response.data.testId; // Extract the test ID from response
          navigate(`/test/${testId}`); // Navigate to the test page
        }
      } else {
        setErrorMessage(`Failed to generate ${type}.`);
      }
    } catch (error) {
      setErrorMessage(`An error occurred while generating the ${type}.`);
    } finally {
      setLoadingTest(false);
      setModalOpen(false);
    }
  };
  

  const viewTestOrFlashcard = () => {
    if (testExists && testId) {
      navigate(`/test/${testId}`);
    } else if (flashcardExists && flashcardId) {
      navigate(`/flashcards/${flashcardId}`);
    }
  };

  if (errorMessage) {
    return <Message negative>{errorMessage}</Message>;
  }

  return (
    <div style={{ backgroundColor: '#1E1E2E', minHeight: '100vh' }}>
      <Container textAlign="center" style={{ paddingTop: '110px', paddingBottom: '20px' }}>
        <Header as="h1" style={{ color: '#FFFFFF' }}>
          Mind Map for: {mindMapData?.name}
        </Header>
      </Container>

      <div
        id="mindmap"
        style={{
          height: 'calc(100vh - 120px)',
          backgroundColor: '#2E2E3E',
          padding: '20px',
        }}
      ></div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="small"
        style={{
          backgroundColor: '#2E2E3E',
          color: '#FFFFFF',
          borderRadius: '10px',
        }}
      >
        <Modal.Header
          style={{
            backgroundColor: '#1E1E2E',
            color: '#FFFFFF',
            borderBottom: '1px solid #00B5D8',
            borderRadius: '10px 10px 0 0',
          }}
        >
          {testExists && flashcardExists
            ? 'View Study Tools for: ' + selectedTopic?.topic
            : 'Generate Study Tool for: ' + selectedTopic?.topic}
        </Modal.Header>

        <Modal.Content
          style={{
            backgroundColor: '#2E2E3E',
            color: '#FFFFFF',
            padding: '20px',
          }}
        >
          {!testExists || !flashcardExists ? (
            <Form>
              <Form.Field>
                <label style={{ color: '#FFFFFF' }}>Name</label>
                <Input
                  placeholder="Enter name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{
                    backgroundColor: '#1E1E2E',
                    color: '#FFFFFF',
                    border: '1px solid #00B5D8',
                    borderRadius: '5px',
                    padding: '0px',
                    outline: 'none',
                    boxShadow: 'none',
                    width: '100%',
                  }}
                />
              </Form.Field>
            </Form>
          ) : null}
        </Modal.Content>

        <Modal.Actions
  style={{
    backgroundColor: '#1E1E2E',
    padding: '20px',
    textAlign: 'right',
    borderRadius: '0 0 10px 10px',
  }}
>
  {testExists ? (
    <>
      <Button
        primary
        onClick={() => navigate(`/test/${testId}`)}
        style={{
          backgroundColor: '#00B5D8',
          color: '#FFFFFF',
          borderRadius: '5px',
          padding: '10px 20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s, transform 0.3s',
          marginRight: '10px',
        }}
      >
        View Test
      </Button>
    </>
  ) : (
    <Button
      primary
      onClick={() => generateTestOrFlashcard('test')}
      disabled={!testName}
      style={{
        backgroundColor: testName ? '#00B5D8' : '#555555',
        color: '#FFFFFF',
        borderRadius: '5px',
        padding: '10px 20px',
        fontWeight: 'bold',
        cursor: testName ? 'pointer' : 'not-allowed',
        transition: 'background-color 0.3s, transform 0.3s',
        marginRight: '10px',
      }}
    >
      Generate Test
    </Button>
  )}

  {flashcardExists ? (
    <Button
      primary
      onClick={() => navigate(`/flashcards/${flashcardId}`)}
      style={{
        backgroundColor: '#00B5D8',
        color: '#FFFFFF',
        borderRadius: '5px',
        padding: '10px 20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.3s',
      }}
    >
      View Flashcards
    </Button>
  ) : (
    <Button
      primary
      onClick={() => generateTestOrFlashcard('flashcard')}
      disabled={!testName}
      style={{
        backgroundColor: testName ? '#00B5D8' : '#555555',
        color: '#FFFFFF',
        borderRadius: '5px',
        padding: '10px 20px',
        fontWeight: 'bold',
        cursor: testName ? 'pointer' : 'not-allowed',
        transition: 'background-color 0.3s, transform 0.3s',
      }}
    >
      Generate Flashcard
    </Button>
  )}
</Modal.Actions>

      </Modal>

      <Modal open={viewTestModalOpen} onClose={() => setViewTestModalOpen(false)} size="small" style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}>
        <Modal.Header style={{ backgroundColor: '#1E1E2E', color: '#FFFFFF' }}>View Study Tool for: {selectedTopic?.topic}</Modal.Header>
        <Modal.Content style={{ backgroundColor: '#2E2E3E', color: '#FFFFFF' }}>
          <Button primary onClick={viewTestOrFlashcard} style={{ backgroundColor: '#00B5D8', color: '#FFFFFF', padding: '10px 20px', borderRadius: '5px' }}>
            View Study Tool
          </Button>
        </Modal.Content>
      </Modal>

      <Dimmer active={loadingTest} page>
        <Loader>Generating study tool...</Loader>
      </Dimmer>
    </div>
  );
};

export default MindMapPage;
