import React, { useEffect, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Header, Icon, Container } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { getMindMapData } from '../../utils/mindMapUtils'; // Make sure this points to your utility

//interface MindMapPageProps {
//  getMindMapData: (mapId: string) => { nodes: { id: string | number; label: string }[]; edges: { from: string | number; to: string | number }[] };
//}

const MindMapPage: React.FC = () => {
  const { mapId } = useParams<{ mapId: string }>(); // Capture mapId from the URL
  const [mindMapData, setMindMapData] = useState<{ nodes: { id: string | number; label: string }[]; edges: { from: string | number; to: string | number }[] } | null>(null);

  useEffect(() => {
    if (mapId) {
      const data = getMindMapData(mapId); // Fetch mind map data based on mapId
      setMindMapData(data);
    }
  }, [mapId]);

  useEffect(() => {
    if (mindMapData && mindMapData.nodes.length > 0) {
      const container = document.getElementById('mindmap')!;
      const { nodes, edges } = mindMapData;

      const options = {
        nodes: {
          shape: 'dot',
          size: 16,
        },
        edges: {
          width: 2,
        },
      };

      new Network(container, { nodes, edges }, options);
    }
  }, [mindMapData]);

  return (
    <Container>
      <Header as="h1" icon textAlign="center" style={{ marginTop: '20px' }}>
        <Icon name="sitemap" circular />
        <Header.Content>Mind Map</Header.Content>
      </Header>

      <div id="mindmap" style={{ height: '500px', marginTop: '20px' }}></div>
    </Container>
  );
};

export default MindMapPage;
