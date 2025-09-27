// frontend/src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import CustomNode from './components/CustomNode';
import Sidebar from './components/Sidebar';
import ExportMenu from './components/ExportMenu';
import LoadingSpinner from './components/LoadingSpinner';
import NodeToolbar from './components/NodeToolBar';
import NodeEditPanel from './components/NodeEditPanel';
import EdgeEditPanel from './components/EdgeEditPanel';

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diagramTitle, setDiagramTitle] = useState('');

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [currentFlowLangCode, setCurrentFlowLangCode] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const reactFlowWrapper = useRef(null);

  // Auto-sync when nodes or edges change
  useEffect(() => {
    if (autoSync && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSyncDiagram();
      }, 1000); // Debounce sync calls

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, diagramTitle, autoSync]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6B7280', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#6B7280',
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const updateNode = (nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  const updateEdge = (edgeId, updates) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, ...updates }
          : edge
      )
    );
  };

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  const deleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  };

  const addNode = (type) => {
    const position = reactFlowInstance 
      ? reactFlowInstance.project({ x: 250, y: 250 })
      : { x: 250, y: 250 };

    const newNode = {
      id: `node-${type}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: `New ${type}`,
        type,
        icon: getDefaultIcon(type),
        backgroundColor: getDefaultBackgroundColor(type),
        textColor: getDefaultTextColor(type),
        iconColor: getDefaultIconColor(type),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultIcon = (type) => {
    switch (type) {
      case 'event': return '🚩';
      case 'activity': return '⚙️';
      case 'note': return '📝';
      case 'decision': return '💎';
      default: return '⚪';
    }
  };

  const getDefaultBackgroundColor = (type) => {
    switch (type) {
      case 'event': return '#F0FDF4';
      case 'activity': return '#FFF7ED';
      case 'note': return '#FAF5FF';
      case 'decision': return '#EFF6FF';
      default: return '#F9FAFB';
    }
  };

  const getDefaultTextColor = (type) => {
    switch (type) {
      case 'event': return '#166534';
      case 'activity': return '#EA580C';
      case 'note': return '#7C3AED';
      case 'decision': return '#2563EB';
      default: return '#374151';
    }
  };

  const getDefaultIconColor = (type) => {
    switch (type) {
      case 'event': return '#16A34A';
      case 'activity': return '#F97316';
      case 'note': return '#8B5CF6';
      case 'decision': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setCurrentFlowLangCode('');
    setDiagramTitle('');
  };

  const handleSyncDiagram = async () => {
    if (nodes.length === 0) {
      setCurrentFlowLangCode('');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/sync-diagram/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          diagram_title: diagramTitle || 'My Diagram'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentFlowLangCode(data.flowlang_code);
      } else {
        console.error('Sync error:', data.error);
      }

    } catch (error) {
      console.error('Error syncing diagram:', error);
    }
  };

  const handleGenerateDiagram = async (prompt, apiKey, model) => {
    setIsLoading(true);
    try {
      // Generate FlowLang code
      const generateResponse = await fetch('http://localhost:8000/api/generate-flowlang/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          api_key: apiKey,
          model
        })
      });

      const generateData = await generateResponse.json();
      
      if (!generateData.success) {
        throw new Error(generateData.error);
      }

      // Parse FlowLang code to React Flow format
      const parseResponse = await fetch('http://localhost:8000/api/parse-flowlang/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowlang_code: generateData.flowlang_code
        })
      });

      const parseData = await parseResponse.json();
      
      if (!parseData.success) {
        throw new Error(parseData.error);
      }

      // Update the diagram
      setNodes(parseData.nodes);
      setEdges(parseData.edges);
      setDiagramTitle(parseData.diagram_info?.title || 'Generated Diagram');
      setCurrentFlowLangCode(generateData.flowlang_code);

      return generateData.flowlang_code;

    } catch (error) {
      console.error('Error generating diagram:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeUpdate = async (flowlangCode) => {
    try {
      // Temporarily disable auto-sync to avoid feedback loop
      setAutoSync(false);
      
      const parseResponse = await fetch('http://localhost:8000/api/parse-flowlang/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowlang_code: flowlangCode
        })
      });

      const parseData = await parseResponse.json();
      
      if (parseData.success) {
        setNodes(parseData.nodes);
        setEdges(parseData.edges);
        setDiagramTitle(parseData.diagram_info?.title || 'Updated Diagram');
        setCurrentFlowLangCode(flowlangCode);
      } else {
        console.error('Parse error:', parseData.error);
        alert(`Code parsing error: ${parseData.error}`);
      }
      
      // Re-enable auto-sync after a brief delay
      setTimeout(() => setAutoSync(true), 2000);
      
    } catch (error) {
      console.error('Error updating diagram:', error);
      alert(`Error: ${error.message}`);
      // Re-enable auto-sync even on error
      setTimeout(() => setAutoSync(true), 2000);
    }
  };

  const handleTitleChange = (newTitle) => {
    setDiagramTitle(newTitle);
  };

  const handleManualSync = () => {
    handleSyncDiagram();
  };

  const handleToggleAutoSync = () => {
    setAutoSync(!autoSync);
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Sync Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              autoSync ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <span className="text-xs text-gray-600">
            {autoSync ? 'Auto-sync On' : 'Auto-sync Off'}
          </span>
          <button
            onClick={handleManualSync}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
          >
            Sync Now
          </button>
        </div>
      </div>

      {/* Left Panel - Node/Edge Editor */}
      {(selectedNode || selectedEdge) ? (
        <div style={{ width: '384px' }}>
          {selectedNode && (
            <NodeEditPanel
              selectedNode={selectedNode}
              onUpdateNode={updateNode}
              onDeleteNode={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
          {selectedEdge && (
            <EdgeEditPanel
              selectedEdge={selectedEdge}
              onUpdateEdge={updateEdge}
              onDeleteEdge={deleteEdge}
              onClose={() => setSelectedEdge(null)}
            />
          )}
        </div>
      ) : null}

      {/* Main Canvas - Dynamic width based on left panel */}
      <div className="flex-1 relative">
        <div ref={reactFlowWrapper} className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-white"
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            
            {/* Toolbar Panel for adding shapes - positioned on left */}
            <Panel position="top-left">
              <NodeToolbar onAddNode={addNode} onClearCanvas={clearCanvas} />
            </Panel>
            
            {/* Title Panel */}
            {diagramTitle && (
              <Panel position="top-center">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border">
                  <input
                    type="text"
                    value={diagramTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none"
                  />
                </div>
              </Panel>
            )}

            {/* Export Panel */}
            <Panel position="top-right">
              <ExportMenu 
                reactFlowWrapper={reactFlowWrapper}
                nodes={nodes}
                edges={edges}
                diagramTitle={diagramTitle}
                reactFlowInstance={reactFlowInstance}
              />
            </Panel>
          </ReactFlow>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Always visible with fixed width */}
      <div style={{ width: '384px' }}>
        <Sidebar 
          onGenerateDiagram={handleGenerateDiagram} 
          onCodeUpdate={handleCodeUpdate}
          isLoading={isLoading}
          currentCode={currentFlowLangCode}
          onManualSync={handleManualSync}
          autoSync={autoSync}
          onToggleAutoSync={handleToggleAutoSync}
        />
      </div>
    </div>
  );
}

export default App;