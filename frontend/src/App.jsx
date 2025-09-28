// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import * as LucideIcons from 'lucide-react';

const { Hand, MousePointer, HelpCircle, X, AlignLeft, Download, RefreshCw } = LucideIcons;
import CustomNode from './components/CustomNode';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ExportMenu from './components/ExportMenu';
import LoadingSpinner from './components/LoadingSpinner';
import NodeToolbar from './components/NodeToolbar';
import NodeEditPanel from './components/NodeEditPanel';
import EdgeEditPanel from './components/EdgeEditPanel';

import './App.css';
// BASE_URL automatically switches based on environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const nodeTypes = {
  custom: CustomNode,
};

function App() {
  // Clerk user state
  const { user, isLoaded, isSignedIn } = useUser();

  const debugLog = (message, data = null) => {
    console.log(`[FlowLang Debug] ${message}`, data ?? '');
  };

  useEffect(() => {
    debugLog('User state changed', { isLoaded, isSignedIn, user: user?.id });
  }, [user, isLoaded, isSignedIn]);

  // React Flow state/hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // App domain state
  const [isLoading, setIsLoading] = useState(false);
  const [diagramTitle, setDiagramTitle] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [currentFlowLangCode, setCurrentFlowLangCode] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [selectionMode, setSelectionMode] = useState(SelectionMode.Partial);
  const [panOnDrag, setPanOnDrag] = useState(false);
  const [copiedElements, setCopiedElements] = useState({ nodes: [], edges: [] });
  const [showInstructions, setShowInstructions] = useState(false);
  const reactFlowWrapper = useRef(null);

  // ---- Helpers to style default nodes ----
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

  // Toggle between pan and select modes
  const toggleInteractionMode = useCallback(() => {
    const newPanOnDrag = !panOnDrag;
    setPanOnDrag(newPanOnDrag);
    setSelectionMode(newPanOnDrag ? SelectionMode.Full : SelectionMode.Partial);
    debugLog(`Interaction mode changed to: ${newPanOnDrag ? 'Pan' : 'Select'}`);
  }, [panOnDrag]);

  // ---- Auto-align utility ----
  const autoAlignNodes = useCallback(() => {
    setNodes(prevNodes => {
      if (!prevNodes || prevNodes.length === 0) return prevNodes;

      const selected = prevNodes.filter(n => n.selected);
      const toAlign = selected.length > 0 ? selected : prevNodes;
      const others = selected.length > 0 ? prevNodes.filter(n => !n.selected) : [];

      const count = toAlign.length;
      const cols = Math.ceil(Math.sqrt(count));
      const spacingX = 240;
      const spacingY = 140;
      const startX = 80;
      const startY = 80;

      const newAligned = toAlign.map((node, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        return {
          ...node,
          position: {
            x: startX + col * spacingX,
            y: startY + row * spacingY,
          },
        };
      });

      return [...others, ...newAligned];
    });

    setTimeout(() => {
      if (reactFlowInstance) reactFlowInstance.fitView();
    }, 120);
  }, [reactFlowInstance, setNodes]);

  // ---- Copy / Paste / Delete handlers ----
  const handleCopyElements = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);

    const selectedEdges = edges.filter(edge => (
      edge.selected || (selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target))
    ));

    if (selectedNodes.length > 0) {
      const nodesClone = selectedNodes.map(n => ({ ...n, data: { ...n.data } }));
      const edgesClone = selectedEdges.map(e => ({ ...e }));
      setCopiedElements({ nodes: nodesClone, edges: edgesClone });
      debugLog('Copied elements', { nodes: nodesClone.length, edges: edgesClone.length });
    } else {
      debugLog('No nodes selected for copying');
    }
  }, [nodes, edges]);

  const handlePasteElements = useCallback(() => {
    if (!copiedElements.nodes || copiedElements.nodes.length === 0) {
      debugLog('Nothing to paste');
      return;
    }

    const offset = 50;
    const timestamp = Date.now();

    setNodes(prev => prev.map(node => ({ ...node, selected: false })));
    setEdges(prev => prev.map(edge => ({ ...edge, selected: false })));

    const newNodes = copiedElements.nodes.map(node => ({
      ...node,
      id: `${node.id}-copy-${timestamp}`,
      position: {
        x: (node.position?.x ?? 100) + offset,
        y: (node.position?.y ?? 100) + offset,
      },
      selected: true,
    }));

    const nodeIdMap = {};
    copiedElements.nodes.forEach((node, idx) => {
      nodeIdMap[node.id] = newNodes[idx].id;
    });

    const newEdges = copiedElements.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-copy-${timestamp}`,
      source: nodeIdMap[edge.source] || edge.source,
      target: nodeIdMap[edge.target] || edge.target,
      selected: true,
    })).filter(e => nodeIdMap[e.source] && nodeIdMap[e.target]);

    setNodes(prev => [...prev, ...newNodes]);
    if (newEdges.length > 0) setEdges(prev => [...prev, ...newEdges]);

    setTimeout(() => {
      if (reactFlowInstance) reactFlowInstance.fitView();
    }, 120);

    debugLog('Pasted elements', { nodes: newNodes.length, edges: newEdges.length });
  }, [copiedElements, setNodes, setEdges, reactFlowInstance]);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
    const selectedEdgesExplicit = edges.filter(e => e.selected).map(e => e.id);

    if (selectedNodeIds.length === 0 && selectedEdgesExplicit.length === 0) {
      debugLog('No elements selected for deletion');
      return;
    }

    setNodes(prev => prev.filter(n => !n.selected));
    setEdges(prev => prev.filter(e => !e.selected && !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)));

    setSelectedNode(null);
    setSelectedEdge(null);

    debugLog('Deleted elements', { nodes: selectedNodeIds.length, edges: selectedEdgesExplicit.length });
  }, [nodes, edges, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputField) return;

      // Copy
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        handleCopyElements();
        return;
      }

      // Paste
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        handlePasteElements();
        return;
      }

      // Delete / Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Toggle selection mode
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        toggleInteractionMode();
        return;
      }

      // Auto-align (A key)
      if (event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        autoAlignNodes();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleCopyElements, handlePasteElements, handleDeleteSelected, toggleInteractionMode, autoAlignNodes]);

  // ---- Node / Edge helpers ----
  const addNode = useCallback((type, shape = 'rectangle') => {
    const position = reactFlowInstance ? reactFlowInstance.project({ x: 250, y: 250 }) : { x: 250, y: 250 };

    const newNode = {
      id: `node-${type}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: `New ${shape}`,
        type,
        shape,
        icon: getDefaultIcon(type),
        backgroundColor: getDefaultBackgroundColor(type),
        textColor: getDefaultTextColor(type),
        iconColor: getDefaultIconColor(type),
      },
    };

    setNodes(nds => [...nds, newNode]);
    debugLog('Added node', newNode.id);
  }, [reactFlowInstance, setNodes]);

  const onConnect = useCallback((params) => {
    const edge = {
      ...params,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6B7280', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', width: 20, height: 20, color: '#6B7280' },
    };
    setEdges(eds => addEdge(edge, eds));
    debugLog('Connected nodes', params);
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (!panOnDrag) {
      setSelectedNode(node);
      setSelectedEdge(null);
      debugLog('Node clicked', node.id);
    }
  }, [panOnDrag]);

  const onEdgeClick = useCallback((event, edge) => {
    if (!panOnDrag) {
      setSelectedEdge(edge);
      setSelectedNode(null);
      debugLog('Edge clicked', edge.id);
    }
  }, [panOnDrag]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
    debugLog('Node updated', { nodeId, updates });
  }, [setNodes]);

  const updateEdge = useCallback((edgeId, updates) => {
    setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, ...updates } : e));
    debugLog('Edge updated', { edgeId, updates });
  }, [setEdges]);

  const deleteNode = useCallback((nodeId) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    debugLog('Node deleted', nodeId);
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
    setSelectedEdge(null);
    debugLog('Edge deleted', edgeId);
  }, [setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setCurrentFlowLangCode('');
    setDiagramTitle('');
    debugLog('Canvas cleared');
  }, [setNodes, setEdges]);

  // When node selection changes, auto-select edges connecting selected nodes
  useEffect(() => {
    const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
    setEdges(prev => prev.map(edge => ({
      ...edge,
      selected: selectedNodeIds.length > 0
        ? (selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target))
        : edge.selected
    })));

    const singleSelectedNodes = nodes.filter(n => n.selected);
    const singleSelectedEdges = edges.filter(e => e.selected);

    if (singleSelectedNodes.length === 1) {
      setSelectedNode(singleSelectedNodes[0]);
      setSelectedEdge(null);
    } else if (singleSelectedEdges.length === 1 && singleSelectedNodes.length === 0) {
      setSelectedEdge(singleSelectedEdges[0]);
      setSelectedNode(null);
    } else {
      if (singleSelectedNodes.length !== 1) setSelectedNode(null);
      if (singleSelectedEdges.length !== 1) setSelectedEdge(null);
    }
  }, [nodes]);

  // ---- Sync & generation handlers ----
  const handleSyncDiagram = async () => {
    if (nodes.length === 0 && edges.length === 0) {
      setCurrentFlowLangCode('');
      return;
    }

    try {
      debugLog('Syncing diagram...');
      const response = await fetch(`${BASE_URL}/api/sync-diagram/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, diagram_title: diagramTitle || 'My Diagram' }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentFlowLangCode(data.flowlang_code);
        debugLog('Diagram synced successfully');
      } else {
        debugLog('Sync error', data.error);
      }
    } catch (err) {
      debugLog('Error syncing diagram', err);
    }
  };

  useEffect(() => {
    if (autoSync && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(() => handleSyncDiagram(), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, diagramTitle, autoSync]);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      setCurrentFlowLangCode('');
    }
  }, [nodes.length, edges.length]);

  // ---- GENERATE DIAGRAM FUNCTION ----
  const handleGenerateDiagram = async (prompt, apiKey, model) => {
    setIsLoading(true);
    debugLog('Generating diagram...', { prompt, model });
    try {
      const generateResponse = await fetch(`${BASE_URL}/api/generate-flowlang/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, api_key: apiKey, model })
      });
      const generateData = await generateResponse.json();
      if (!generateData.success) throw new Error(generateData.error);

      const parseResponse = await fetch(`${BASE_URL}/api/parse-flowlang/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowlang_code: generateData.flowlang_code })
      });
      const parseData = await parseResponse.json();
      if (!parseData.success) throw new Error(parseData.error);

      setNodes(parseData.nodes);
      setEdges(parseData.edges);
      setDiagramTitle(parseData.diagram_info?.title || 'Generated Diagram');
      setCurrentFlowLangCode(generateData.flowlang_code);
      debugLog('Diagram generated successfully');

      return generateData.flowlang_code;
    } catch (error) {
      debugLog('Error generating diagram:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeUpdate = useCallback(async (flowlangCode) => {
    debugLog('Updating code...');
    try {
      setAutoSync(false);
      const parseResponse = await fetch(`${BASE_URL}/api/parse-flowlang/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowlang_code: flowlangCode })
      });
      const parseData = await parseResponse.json();
      if (parseData.success) {
        setNodes(parseData.nodes);
        setEdges(parseData.edges);
        setDiagramTitle(parseData.diagram_info?.title || 'Updated Diagram');
        setCurrentFlowLangCode(flowlangCode);
        debugLog('Code updated successfully');
      } else {
        debugLog('Parse error', parseData.error);
        alert(`Code parsing error: ${parseData.error}`);
      }
      setTimeout(() => setAutoSync(true), 2000);
    } catch (error) {
      debugLog('Error updating diagram', error);
      alert(`Error: ${error.message}`);
      setTimeout(() => setAutoSync(true), 2000);
    }
  }, [setNodes, setEdges]);

  const handleTitleChange = useCallback(newTitle => setDiagramTitle(newTitle), []);

  const handleManualSync = useCallback(() => handleSyncDiagram(), [nodes, edges, diagramTitle]);

  const handleToggleAutoSync = useCallback(() => setAutoSync(prev => !prev), []);

  // Instructions Modal Component
  const InstructionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">How to Use FlowLang Designer</h2>
          <button
            onClick={() => setShowInstructions(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li>Use the "Add Shape" button to create new nodes</li>
              <li>Click and drag to connect nodes with edges</li>
              <li>Click on nodes or edges to edit their properties</li>
              <li>Use Auto Align to organize nodes systematically</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Keyboard Shortcuts</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">S</kbd> - Toggle between Pan and Select modes</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl/Cmd + C</kbd> - Copy selected elements</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl/Cmd + V</kbd> - Paste copied elements</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Delete</kbd> - Delete selected elements</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl/Cmd + A</kbd> - Auto align nodes</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Modes</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong>Select Mode:</strong> Click to select nodes/edges, drag to move</li>
              <li><strong>Pan Mode:</strong> Click and drag to pan the canvas</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">AI Features</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li>Use the sidebar to generate diagrams with AI</li>
              <li>Edit the generated code in the Code Editor</li>
              <li>Auto-sync keeps your diagram and code synchronized</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => setShowInstructions(false)}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  if (!isLoaded) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="pt-16">
      <Navbar user={user} />

      <div className="h-screen w-screen flex bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        
        {/* Instructions Modal */}
        {showInstructions && <InstructionsModal />}

        {/* Left Editor Panel */}
        {(selectedNode || selectedEdge) ? (
          <div style={{ width: '320px' }}>
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

        {/* Main Canvas Area */}
        <div className="flex-1 relative p-4">
          <div 
            ref={reactFlowWrapper} 
            className="h-full w-full bg-white rounded-2xl shadow-xl border border-gray-200/50 transition-all duration-300"
            style={{ 
              cursor: panOnDrag ? 'grab' : 'default',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
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
              className="rounded-2xl"
              minZoom={0.1}
              maxZoom={2}
              panOnDrag={panOnDrag}
              selectionOnDrag={!panOnDrag}
              selectionMode={selectionMode}
              multiSelectionKeyCode="Shift"
              deleteKeyCode={null}
              selectionKeyCode={null}
              nodesDraggable={!panOnDrag}
              nodesConnectable={!panOnDrag}
              elementsSelectable={!panOnDrag}
              style={{
                cursor: panOnDrag ? 'grab' : 'default'
              }}
            >
              {/* Enhanced Controls */}
              <Controls 
                className="bg-white/95 backdrop-blur-sm border border-gray-200/70 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                showZoom={true}
                showFitView={true}
                showInteractive={true}
                position="top-right"
                style={{ top: '20px', right: '20px' }}
              />
              
              {/* Enhanced MiniMap */}
              <MiniMap 
                className="bg-white/95 backdrop-blur-sm border border-gray-200/70 rounded-xl shadow-lg transition-all duration-300"
                nodeColor="#8B5CF6"
                maskColor="rgba(139, 92, 246, 0.1)"
                position="top-left"
                style={{ top: '20px', left: '20px' }}
              />
              
              {/* Enhanced Background */}
              <Background 
                variant="dots" 
                gap={24} 
                size={2} 
                color="#94A3B8"
                className="opacity-40 transition-opacity duration-300"
              />

              {/* Enhanced Toolbar Panel */}
              <Panel position="top-left" style={{ top: '20px', left: '20px' }}>
                <div className="flex flex-col gap-3">
                  <NodeToolbar onAddNode={addNode} onClearCanvas={clearCanvas} />
                  
                  {/* Enhanced Interaction Controls */}
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200/70 flex flex-col gap-3 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleInteractionMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1 ${
                          panOnDrag 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                        title={panOnDrag ? 'Pan Mode (Press S to toggle)' : 'Select Mode (Press S to toggle)'}
                      >
                        {panOnDrag ? <Hand size={16} /> : <MousePointer size={16} />}
                        <span className="text-sm font-medium">{panOnDrag ? 'Pan' : 'Select'}</span>
                      </button>
                      
                      <button
                        onClick={autoAlignNodes}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 transition-all duration-200"
                        title="Auto align nodes (Ctrl/Cmd + A)"
                      >
                        <AlignLeft size={16} />
                        <span className="text-sm font-medium">Align</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowInstructions(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition-all duration-200 flex-1"
                        title="Show instructions"
                      >
                        <HelpCircle size={16} />
                        <span className="text-sm font-medium">Help</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Enhanced Title Panel */}
              {diagramTitle && (
                <Panel position="top-center">
                  <div className="bg-white/98 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-gray-200/70 transition-all duration-300">
                    <input
                      type="text"
                      value={diagramTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="text-xl font-bold text-gray-800 bg-transparent border-none outline-none text-center min-w-[200px] focus:text-blue-600 transition-colors placeholder-gray-400"
                      placeholder="Diagram Title"
                      style={{ width: `${Math.max(200, diagramTitle.length * 14)}px` }}
                    />
                  </div>
                </Panel>
              )}

              {/* Enhanced Bottom Panel with Export and Sync */}
              <Panel position="bottom-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200/70 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    {/* Export Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => document.querySelector('.export-menu-trigger')?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 transition-all duration-200"
                        title="Export diagram"
                      >
                        <Download size={16} />
                        <span className="text-sm font-medium">Export</span>
                      </button>
                    </div>

                    {/* Sync Status */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleManualSync}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition-all duration-200"
                        title="Manual sync"
                      >
                        <RefreshCw size={16} className={autoSync ? "animate-spin" : ""} />
                        <span className="text-sm font-medium">
                          {autoSync ? "Auto Sync" : "Manual Sync"}
                        </span>
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Nodes:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">{nodes.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Edges:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">{edges.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Export Panel (hidden trigger) */}
              <Panel position="top-right" style={{ top: '120px', right: '20px' }}>
                <div className="export-menu-trigger" style={{ display: 'none' }}>
                  <ExportMenu
                    reactFlowWrapper={reactFlowWrapper}
                    nodes={nodes}
                    edges={edges}
                    diagramTitle={diagramTitle}
                    reactFlowInstance={reactFlowInstance}
                  />
                </div>
              </Panel>
            </ReactFlow>

            {/* Enhanced Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl transition-all duration-300">
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600 font-medium">Generating your diagram...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
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
    </div>
  );
}

export default App;