import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network } from "vis-network/standalone";
import {
  Header,
  Loader,
  Message,
  Container,
  Modal,
  Button,
  Input,
  Dimmer,
  Form,
} from "semantic-ui-react";
import apiClient from "../../../src/apiClient";

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
  const [testName, setTestName] = useState<string>("");
  const [studyModuleExists, setStudyModuleExists] = useState<boolean>(false);
  const [studyModuleId, setStudyModuleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        const response = await apiClient.get(
          `/api/MindMap/GetMindMapByNoteId/${noteId}`
        );
        if (response.status === 200) {
          setMindMapData(response.data);
        } else {
          setErrorMessage("Failed to load mind map.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching mind map data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMindMapData();
  }, [noteId]);

  useEffect(() => {
    if (mindMapData) {
      const container = document.getElementById("mindmap");

      if (container) {
        const { nodes, edges } = convertJsonToVisNetworkData(mindMapData);

        if (nodes && edges) {
          const options = {
            nodes: {
              shape: "dot",
              size: 16,
              color: {
                background: "#F3DFC1",
                border: "#FFFFFF",
              },
              font: {
                color: "#FFFFFF",
              },
            },
            edges: {
              color: "#F3DFC1",
              width: 2,
            },
            physics: {
              enabled: true,
            },
          };
          const network = new Network(container, { nodes, edges }, options);

          network.on("click", function (params) {
            const nodeId = params.nodes[0];
            const topic = nodes.find((node) => node.id === nodeId);

            if (topic && topic.id) {
              setSelectedTopic({ id: topic.id, topic: topic.label });
              checkIfTestOrFlashcardExistsOrStudyModule(topic.id);
            }
          });
        }
      }
    }
  }, [mindMapData]);

  const convertJsonToVisNetworkData = (data: MindMapData) => {
    const nodes: { id: string; label: string; size: number; color: string }[] =
      [];
    const edges: { from: string; to: string; weight: number }[] = [];

    const rootNodeId = data.id || "root";
    const rootNode = {
      id: rootNodeId,
      label: data.name,
      size: 20,
      color: "lightblue",
    };
    nodes.push(rootNode);

    data.topics.forEach((topic) => {
      const topicNode = {
        id: topic.id,
        label: topic.topic,
        size: 15,
        color: "lightgreen",
      };
      nodes.push(topicNode);
      edges.push({ from: rootNodeId, to: topic.id, weight: 2 });
    });

    return { nodes, edges };
  };

  const checkIfTestOrFlashcardExistsOrStudyModule = async (topicId: string) => {
    try {
      const testResponse = await apiClient.get(
        `/api/StudyTool/CheckExistingTest/${topicId}`
      );
      const flashcardResponse = await apiClient.get(
        `/api/StudyTool/CheckExistingFlashcard/${topicId}`
      );
      const studyModuleResponse = await apiClient.get(
        `/api/StudyTool/CheckExistingStudyModule/${topicId}`
      );

      setTestExists(testResponse.data.testExists === true);
      setFlashcardExists(flashcardResponse.data.flashCardExists === true);
      setStudyModuleExists(studyModuleResponse.data.studyModuleExists === true);

      setTestId(testResponse.data.testExists ? testResponse.data.testId : null);
      setFlashcardId(
        flashcardResponse.data.flashCardExists
          ? flashcardResponse.data.flashCardId
          : null
      );
      setStudyModuleId(
        studyModuleResponse.data.studyModuleExists
          ? studyModuleResponse.data.studyModuleId
          : null
      );

      if (testExists || flashcardExists || studyModuleExists) {
        setViewTestModalOpen(true);
      } else {
        setModalOpen(true);
      }
    } catch (error) {
      console.log("Error checking if study tools exist:", error);
    }
  };

  // Generate Test, Flashcard set or Study Module
  const generateStudyTool = async (
    type: "test" | "flashcard" | "studyModule"
  ) => {
    if (!selectedTopic || !testName) {
      setErrorMessage("Please provide the name.");
      return;
    }

    setLoadingTest(true);
    try {
      const endpoint =
        type === "studyModule"
          ? `/api/StudyTool/GenerateStudyModuleFromTopic`
          : type === "test"
          ? `/api/StudyTool/GenerateTestFromTopic`
          : `/api/StudyTool/GenerateFlashcardsFromTopic`;

      // Construct the payload dynamically based on the type
      const payload =
        type === "studyModule"
          ? {
              mindMapId: mindMapData?.id,
              mindMapTopicId: selectedTopic.id,
              mindMapTopic: testName,
            }
          : {
              classId: mindMapData?.classId,
              mindMapId: mindMapData?.id,
              topicId: selectedTopic.id,
              name: testName,
            };

      const response = await apiClient.post(endpoint, payload);
      console.log(
        "API Response from the backend right after sending payload:",
        response.data
      ); // Debug Log
      console.log("Generated Test ID:", response.data.testId); // Debug Log
      console.log("Generated Flashcard ID:", response.data.flashcardsId); // Debug Log
      console.log("Generated Study Module ID:", response.data.id); // Debug Log

      if (response.status === 200) {
        let toolId;

        if (type === "test") {
          toolId = response.data.testId;
        } else if (type === "flashcard") {
          toolId = response.data.flashcardsId;
        } else if (type === "studyModule") {
          toolId = response.data.id;
          setStudyModuleExists(true);
          setStudyModuleId(response.data.id);
        } else {
          // Handle unexpected `type` values if needed
          console.log("Unexpected type:", type);
        }

        console.log("Generated ${type} Id:", toolId);

        const route =
          type === "test"
            ? `/test/${toolId}`
            : type === "flashcard"
            ? `/flashcards/${toolId}`
            : `/study-module/${toolId}`;

        console.log("Navigating to route:", route); // Debug log

        navigate(route);
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

  const viewTestOrFlashcardOrStudyModule = () => {
    if (testExists && testId) {
      navigate(`/test/${testId}`);
    } else if (flashcardExists && flashcardId) {
      navigate(`/flashcards/${flashcardId}`);
    } else if (studyModuleExists && studyModuleId) {
      console.log("Navigating to Study Module:", studyModuleId); // Debug Log
      navigate(`/study-module/${studyModuleId}`);
    }
  };

  if (errorMessage) {
    return <Message negative>{errorMessage}</Message>;
  }

  return (
    <div style={{ backgroundColor: "#DDBEA8", minHeight: "100vh" }}>
      <Container
        textAlign="center"
        style={{ paddingTop: "110px", paddingBottom: "20px" }}
      >
        <Header as="h1" style={{ color: "#FFFFFF" }}>
          Mind Map for: {mindMapData?.name}
        </Header>
      </Container>

      <div
        id="mindmap"
        style={{
          height: "calc(100vh - 120px)",
          backgroundColor: "#504136",
          padding: "20px",
        }}
      ></div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="small"
        style={{
          backgroundColor: "#504136",
          color: "#FFFFFF",
          borderRadius: "10px",
        }}
      >
        <Modal.Header
          style={{
            backgroundColor: "#504136",
            color: "#FFFFFF",
            borderBottom: "1px solid #DDBEA8",
            borderRadius: "10px 10px 0 0",
          }}
        >
          {testExists && flashcardExists
            ? "View Study Tools for: " + selectedTopic?.topic
            : "Generate Study Tool for: " + selectedTopic?.topic}
        </Modal.Header>

        <Modal.Content
          style={{
            backgroundColor: "#504136",
            color: "#FFFFFF",
            padding: "20px",
          }}
        >
          {!testExists || !flashcardExists || !studyModuleExists ? (
            <Form>
              <Form.Field>
                <label style={{ color: "#FFFFFF" }}>Name</label>
                <Input
                  placeholder="Enter name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{
                    backgroundColor: "#DDBEA8",
                    color: "#FFFFFF",
                    border: "1px solid #DDBEA8",
                    borderRadius: "5px",
                    padding: "0px",
                    outline: "none",
                    boxShadow: "none",
                    width: "100%",
                  }}
                />
              </Form.Field>
            </Form>
          ) : null}
        </Modal.Content>

        <Modal.Actions
          style={{
            backgroundColor: "#504136",
            padding: "20px",
            textAlign: "right",
            borderRadius: "0 0 10px 10px",
          }}
        >
          {testExists ? (
            <Button
              primary
              onClick={() => navigate(`/test/${testId}`)}
              style={{
                backgroundColor: "#F3DFC1",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.3s",
                marginRight: "10px",
              }}
            >
              View Test
            </Button>
          ) : (
            <Button
              primary
              onClick={() => generateStudyTool("test")}
              disabled={!testName}
              style={{
                backgroundColor: testName ? "#F3DFC1" : "#555555",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: testName ? "pointer" : "not-allowed",
                transition: "background-color 0.3s, transform 0.3s",
                marginRight: "10px",
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
                backgroundColor: "#F3DFC1",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              View Flashcards
            </Button>
          ) : (
            <Button
              primary
              onClick={() => generateStudyTool("flashcard")}
              disabled={!testName}
              style={{
                backgroundColor: testName ? "#F3DFC1" : "#555555",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: testName ? "pointer" : "not-allowed",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              Generate Flashcard
            </Button>
          )}

          {studyModuleExists ? (
            <Button
              primary
              onClick={() => navigate(`/study-module/${studyModuleId}`)}
              style={{
                backgroundColor: "#F3DFC1",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              View Study Module
            </Button>
          ) : (
            <Button
              primary
              onClick={() => generateStudyTool("studyModule")}
              disabled={!testName}
              style={{
                backgroundColor: testName ? "#F3DFC1" : "#555555",
                color: "#5d5d5d",
                borderRadius: "5px",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: testName ? "pointer" : "not-allowed",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              Generate Study Module
            </Button>
          )}
        </Modal.Actions>
      </Modal>

      <Modal
        open={viewTestModalOpen}
        onClose={() => setViewTestModalOpen(false)}
        size="small"
        style={{ backgroundColor: "#504136", color: "#FFFFFF" }}
      >
        <Modal.Header style={{ backgroundColor: "#DDBEA8", color: "#FFFFFF" }}>
          View Study Tool for: {selectedTopic?.topic}
        </Modal.Header>
        <Modal.Content style={{ backgroundColor: "#504136", color: "#FFFFFF" }}>
          <Button
            primary
            onClick={viewTestOrFlashcardOrStudyModule}
            style={{
              backgroundColor: "#F3DFC1",
              color: "#5d5d5d",
              padding: "10px 20px",
              borderRadius: "5px",
            }}
          >
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
