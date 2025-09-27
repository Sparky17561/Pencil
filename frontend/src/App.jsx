// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import axios from 'axios';

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

import CustomNode from './components/CustomNode';
import Sidebar from './components/Sidebar';
import ExportMenu from './components/ExportMenu';
import LoadingSpinner from './components/LoadingSpinner';
import NodeToolbar from './components/NodeToolBar';
import NodeEditPanel from './components/NodeEditPanel';
import EdgeEditPanel from './components/EdgeEditPanel';


import './App.css';

/* Inline Navbar to keep App self-contained.
   Left: brand (Pencil). Right: Clerk UserButton (sign out) and username.
*/
const Navbar = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.assign('/')}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500"
            >
              Pencil
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:block text-sm text-gray-700 mr-2">
                {user.fullName || user.username}
              </div>
            )}
            <div>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  // Clerk user state
  const { user, isLoaded, isSignedIn } = useUser();

  // ReactFlow state/hooks (unchanged)
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
  const reactFlowWrapper = useRef(null);

  // Post-generation state (your AI post generator UI)
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Casual');
  const [audience, setAudience] = useState('General');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [bookmarkStatus, setBookmarkStatus] = useState('Bookmark');
  const [bookmarks, setBookmarks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toneOptions = ['Casual', 'Professional', 'Humorous', 'Serious'];
  const audienceOptions = ['General', 'Professionals', 'Tech enthusiasts', 'Students'];

  // ---- React Flow helpers ----
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

  const addNode = useCallback((type) => {
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
  }, [reactFlowInstance, setNodes]);

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  const updateEdge = useCallback((edgeId, updates) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, ...updates }
          : edge
      )
    );
  }, [setEdges]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setCurrentFlowLangCode('');
    setDiagramTitle('');
  }, [setNodes, setEdges]);

  // ---- Sync & generation handlers (unchanged) ----
  const handleSyncDiagram = async () => {
    if (nodes.length === 0 && edges.length === 0) {
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

  useEffect(() => {
    if (autoSync && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(() => {
        handleSyncDiagram();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, diagramTitle, autoSync]);

  const handleGenerateDiagram = async (prompt, apiKey, model) => {
    setIsLoading(true);
    try {
      const generateResponse = await fetch('http://localhost:8000/api/generate-flowlang/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, api_key: apiKey, model })
      });
      const generateData = await generateResponse.json();
      if (!generateData.success) throw new Error(generateData.error);

      const parseResponse = await fetch('http://localhost:8000/api/parse-flowlang/', {
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
      setAutoSync(false);
      const parseResponse = await fetch('http://localhost:8000/api/parse-flowlang/', {
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
      } else {
        console.error('Parse error:', parseData.error);
        alert(`Code parsing error: ${parseData.error}`);
      }
      setTimeout(() => setAutoSync(true), 2000);
    } catch (error) {
      console.error('Error updating diagram:', error);
      alert(`Error: ${error.message}`);
      setTimeout(() => setAutoSync(true), 2000);
    }
  };

  const handleTitleChange = useCallback((newTitle) => {
    setDiagramTitle(newTitle);
  }, []);

  const handleManualSync = useCallback(() => {
    handleSyncDiagram();
  }, [nodes, edges, diagramTitle]);

  const handleToggleAutoSync = useCallback(() => {
    setAutoSync(!autoSync);
  }, [autoSync]);

  // ---- Post generator handlers (unchanged) ----
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const registerUser = async () => {
        try {
          await axios.post('http://localhost:5000/api/users/', { clerkId: user.id });
        } catch (error) {
          console.error('Error registering/logging in user:', error);
        }
      };
      registerUser();
      fetchBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  const fetchBookmarks = async () => {
    if (isSignedIn && user) {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/user/${user.id}`);
        const formatted = response.data.map(post => ({
          id: post._id,
          content: post.generatedTweet,
          title: `Post about ${post.topic}`
        }));
        setBookmarks(formatted);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    }
  };

  const handleGeneratePost = async () => {
    if (!topic.trim()) { alert('Please enter a topic'); return; }
    try {
      setIsGenerating(true);
      const response = await axios.post('http://localhost:5000/api/posts/', {
        clerkId: user?.id,
        topic, tone, targetAudience: audience, prompt: customPrompt
      });
      setGeneratedPost(response.data.generatedTweet);
    } catch (error) {
      console.error('Error generating post:', error.response?.data || error.message);
      if (error.response?.data?.message === 'Groq API key not found for this user.') {
        alert('Please enter your Groq API Key in the sidebar first');
      } else {
        alert('Error generating post. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost || '');
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleBookmark = async () => {
    if (!isSignedIn) { alert('Please sign in to bookmark posts'); return; }
    try {
      const response = await axios.post('http://localhost:5000/api/posts/bookmark', {
        clerkId: user.id, topic, tone, targetAudience: audience, prompt: customPrompt, generatedTweet: generatedPost
      });
      const newBookmark = { id: response.data.bookmarkedPost._id, content: generatedPost, title: `Post about ${topic}` };
      setBookmarks(prev => [...prev, newBookmark]);
      setBookmarkStatus('Bookmarked!');
      setTimeout(() => setBookmarkStatus('Bookmark'), 2000);
      fetchBookmarks();
    } catch (error) {
      console.error('Error bookmarking post:', error);
      alert('Error bookmarking post. Please try again.');
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Error deleting bookmark. Please try again.');
    }
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleSidebarCollapse = () => setSidebarCollapsed(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Dropdown locally-scoped component
  const Dropdown = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
      <div className="dropdown" ref={dropdownRef}>
        <button className="dropdown-button" onClick={() => setOpen(!open)}>
          {value} <span className="dropdown-arrow">▼</span>
        </button>
        {open && (
          <div className="dropdown-menu">
            {options.map((option) => (
              <div key={option} className="dropdown-item" onClick={() => { onChange(option); setOpen(false); }}>
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Keep ReactFlow (and other heavy UI) from mounting until Clerk finishes initializing
  if (!isLoaded) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="pt-16"> {/* space for fixed navbar */}
      <Navbar user={user} />

      <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
        {/* Sync Status Indicator */}
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${ autoSync ? 'bg-green-400 animate-pulse' : 'bg-gray-300' }`} />
            <span className="text-xs text-gray-600">{autoSync ? 'Auto-sync On' : 'Auto-sync Off'}</span>
            <button onClick={handleManualSync} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">Sync Now</button>
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

              {/* Toolbar Panel */}
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
            // additional props for AI generator (optional)
            topic={topic}
            setTopic={setTopic}
            tone={tone}
            setTone={setTone}
            audience={audience}
            setAudience={setAudience}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            onGeneratePost={handleGeneratePost}
            generatedPost={generatedPost}
            copyStatus={copyStatus}
            onCopy={handleCopy}
            bookmarkStatus={bookmarkStatus}
            onBookmark={handleBookmark}
            bookmarks={bookmarks}
            onDeleteBookmark={handleDeleteBookmark}
          />
        </div>
      </div>

    
    </div>
  );
}

export default App;
