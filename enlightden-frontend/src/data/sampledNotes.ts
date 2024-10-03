interface MindMapData {
    name: string;
    topics: { topic: string }[];
  }
  
  const sampledNotes: { [id: string]: MindMapData } = {
    "75f78843-24e7-4651-84e8-f45c09811aa3": {
      name: "Biology",
      topics: [
        {
            "topic": "- Genetic Variation"
          },
          {
            "topic": "- Overview of Life’s Unity"
          },
          {
            "topic": "- Biogenesis"
          },
          {
            "topic": "- Diversity of Life"
          },
          {
            "topic": "- Growth and Development"
          },
          {
            "topic": "- Evolution"
          },
          {
            "topic": "- Evolutionary View of Diversity"
          },
          {
            "topic": "- Introduction to Biology"
          },
          {
            "topic": "- Scientific Method"
          },
          {
            "topic": "- Taxonomy"
          },
          {
            "topic": "- Artificial Selection"
          },
          {
            "topic": "- Reproduction"
          },
          {
            "topic": "- Natural Selection"
          },
          {
            "topic": "- Cell Theory"
          },
          {
            "topic": "- Response to Stimuli"
          },
          {
            "topic": "- Homeostasis"
          },
          {
            "topic": "- Biodiversity"
          },
          {
            "topic": "- Metabolism"
          },
          {
            "topic": "- Biological Inquiry"
          },
          {
            "topic": "- Adaptation"
          },
      ],
    },
    "85f78843-24e7-4651-84e8-f45c09811aa4": {
      name: "History",
      topics: [
        { topic: "- The Renaissance" },
        { topic: "- The Enlightenment" },
      ],
    },
  };
export {sampledNotes};  