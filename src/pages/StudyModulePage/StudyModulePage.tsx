import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader, Message, Container, Header } from "semantic-ui-react";
import apiClient from "../../../src/apiClient";

interface StudyModuleSubTopic {
  id: string; // Unique identifier for the subtopic
  title: string; // Title of the subtopic
  content: string; // Content of the subtopic
}

interface StudyModuleData {
  id: string; // Unique identifier for the study module
  name: string; // Main Topic of the Study Module (from MindMap)
  mindMapId: string; // ID of the MindMap associated with the Study Module
  mindMapTopicId: string; // ID of the MindMap Topic associated with the Study Module
  subTopics: StudyModuleSubTopic[]; // Array of subtopics for the Study Module
}

const StudyModulePage: React.FC = () => {
  const { studyModuleId } = useParams<{ studyModuleId: string }>();
  console.log("Study Module ID from URL:", studyModuleId); // For debugging

  const [studyModuleData, setStudyModuleData] =
    useState<StudyModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching study module for ID:", studyModuleId);
    if (!studyModuleId) {
      setErrorMessage("Study Module ID is missing.");
      setLoading(false);
      return;
    }

    const fetchStudyModuleData = async () => {
      try {
        const response = await apiClient.get(
          `/api/StudyTool/GetStudyModule/${studyModuleId}`
        );
        if (response.status === 200) {
          console.log("Response Data:", response.data); // Verify API response here
          setStudyModuleData(response.data);
          console.log("State After Set:", response.data); // Verify state update
        } else {
          setErrorMessage("Failed to load study module.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching study module data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudyModuleData();
  }, [studyModuleId]);

  if (loading) {
    return <Loader active>Loading study module...</Loader>;
  }

  if (errorMessage) {
    return <Message negative>{errorMessage}</Message>;
  }

  return (
    <Container style={{ paddingTop: "100px" }}>
      <Header as="h1" textAlign="center" style={{ marginTop: "20px" }}>
        {studyModuleData?.name || "Debug: No Study Module Name"}
      </Header>

      {/* List the subtopics */}
      {studyModuleData?.subTopics.map((subTopic) => (
        <div key={subTopic.id} style={{ marginTop: "20px" }}>
          <Header as="h3">{subTopic.title}</Header>
          <p>{subTopic.content}</p>
        </div>
      ))}
    </Container>
  );
};

export default StudyModulePage;
