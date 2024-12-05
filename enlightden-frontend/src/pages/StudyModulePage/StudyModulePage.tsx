import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Accordion,
  Icon,
  Container,
  Header,
  Button,
  Loader,
  Message,
  SemanticCOLORS,
} from "semantic-ui-react";
import apiClient from "../../apiClient";
import "./StudyModulePage.css";

interface StudyModuleSubTopic {
  id: string;
  title: string;
  content: string;
}

interface StudyModuleData {
  id: string;
  name: string;
  mindMapId: string;
  mindMapTopicId: string;
  noteId: string;
  subTopics: StudyModuleSubTopic[];
}

const StudyModulePage: React.FC = () => {
  const { studyModuleId } = useParams<{ studyModuleId: string }>();
  const [studyModuleData, setStudyModuleData] =
    useState<StudyModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndexes, setActiveIndexes] = useState<string[]>([]);

  useEffect(() => {
    const fetchStudyModuleData = async () => {
      if (!studyModuleId) {
        setErrorMessage("Study Module ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(
          `/api/StudyTool/GetStudyModule/${studyModuleId}`
        );
        if (response.status === 200) {
          console.log("Study Module Data:", response.data); // Debug Log
          setStudyModuleData(response.data);
        } else {
          setErrorMessage("Failed to load study module.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching study module data.");
        console.error("Error fetching study module:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyModuleData();
  }, [studyModuleId]);

  const handleClick = (subtopicId: string) => {
    setActiveIndexes((prev) =>
      prev.includes(subtopicId)
        ? prev.filter((id) => id !== subtopicId)
        : [...prev, subtopicId]
    );
  };

  const handleExpandAll = () => {
    if (studyModuleData?.subTopics) {
      setActiveIndexes(
        studyModuleData.subTopics.map((subtopic) => subtopic.id)
      );
    }
  };

  const handleCollapseAll = () => {
    setActiveIndexes([]);
  };

  if (loading) {
    return (
      <Container style={{ paddingTop: "100px" }}>
        <Loader active>Loading study module...</Loader>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container style={{ paddingTop: "100px" }}>
        <Message negative>{errorMessage}</Message>
      </Container>
    );
  }

  if (!studyModuleData) {
    return (
      <Container style={{ paddingTop: "100px" }}>
        <Message warning>No study module data available.</Message>
      </Container>
    );
  }

  const contentStyle = {
    backgroundColor: "#6D9C7F",
    color: "rgba(255,255,255,.9)",
    padding: "1rem",
    borderRadius: "15px",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
  };

  const accordionTitleStyle = {
    backgroundColor: "#504136",
    color: "white",
    borderBottom: "1px solid rgba(137, 207, 240, 0.1)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#DDBEA8",
        color: "white",
        paddingTop: "8rem",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <Container
        text
        style={{
          paddingBottom: "2rem",
          maxWidth: "800px !important",
        }}
      >
        <Header as="h1" textAlign="center" className="study-module-title">
          {studyModuleData.name}
        </Header>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Button
            compact
            inverted
            onClick={handleExpandAll}
            disabled={activeIndexes.length === studyModuleData.subTopics.length}
          >
            <Icon name="expand" />
            Expand All
          </Button>
          <Button
            compact
            inverted
            onClick={handleCollapseAll}
            disabled={activeIndexes.length === 0}
          >
            <Icon name="compress" />
            Collapse All
          </Button>
        </div>

        <Accordion fluid styled className="dark-theme-accordion">
          {studyModuleData.subTopics.map((subtopic) => (
            <React.Fragment key={subtopic.id}>
              <Accordion.Title
                active={activeIndexes.includes(subtopic.id)}
                onClick={() => handleClick(subtopic.id)}
                className="subtopic-title"
                style={accordionTitleStyle}
              >
                <Icon name="dropdown" />
                {subtopic.title}
              </Accordion.Title>

              <Accordion.Content
                active={activeIndexes.includes(subtopic.id)}
                className="subtopic-content"
                style={contentStyle}
              >
                <div className="content-container">{subtopic.content}</div>
              </Accordion.Content>
            </React.Fragment>
          ))}
        </Accordion>
      </Container>
    </div>
  );
};

export default StudyModulePage;
