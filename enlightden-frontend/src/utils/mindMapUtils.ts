// src/utils/mindMapUtils.ts
import { sampledNotes } from "../data/sampledNotes";

export const getMindMapData = (mapId: string) => {
    const mindMapData = sampledNotes[mapId];
  
    if (mindMapData) {
      return {
        nodes: [
          { id: mapId, label: mindMapData.name, size: 20, color: "lightblue" },
          ...mindMapData.topics.map((topic: { topic: string }, index: number) => ({
            id: `${mapId}-${index}`,
            label: topic.topic,
            size: 15,
            color: "lightgreen",
          })),
        ],
        edges: mindMapData.topics.map((_: unknown, index: number) => ({
          from: mapId,
          to: `${mapId}-${index}`,
          weight: 2,
        })),
      };
    } else {
      return { nodes: [], edges: [] }; // Return empty data if no mind map found
    }
  };
  