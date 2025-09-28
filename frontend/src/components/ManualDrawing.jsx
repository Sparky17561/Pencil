// frontend/src/components/ManualDrawing.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import NodeToolbar from './NodeToolbar';
import NodeEditPanel from './NodeEditPanel';
import ExportMenu from './ExportMenu';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const ManualDrawing = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [diagramTitle, setDiagramTitle] = useState('My Flowchart');
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const nodeId = useRef(0);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNode = (type) => {
    const position = reactFlowInstance 
      ? reactFlowInstance.project({ x: 250, y: 250 })
      : { x: 250, y: 250 };

    const newNode = {
      id: `node-${nodeId.current++}`,
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

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
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

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    nodeId.current = 0;
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <div ref={reactFlowWrapper} className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
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
            
            {/* Title Panel */}
            <Panel position="top-center">
              <div className="bg-white px-4 py-2 rounded-lg shadow-md border">
                <input
                  type="text"
                  value={diagramTitle}
                  onChange={(e) => setDiagramTitle(e.target.value)}
                  className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none"
                />
              </div>
            </Panel>

            {/* Toolbar Panel */}
            <Panel position="top-left">
              <NodeToolbar onAddNode={addNode} onClearCanvas={clearCanvas} />
            </Panel>

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
        </div>
      </div>

      {/* Right Edit Panel */}
      <NodeEditPanel
        selectedNode={selectedNode}
        onUpdateNode={updateNode}
        onDeleteNode={deleteNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default ManualDrawing;