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

const { Hand, MousePointer, HelpCircle, X, AlignLeft, Download, RefreshCw, Image, FileDown, Copy } = LucideIcons;
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [syncTimeout, setSyncTimeout] = useState(null);
  const reactFlowWrapper = useRef(null);

  // Hide React Flow watermark on mount
  useEffect(() => {
    const hideWatermark = () => {
      const attribution = document.querySelector('.react-flow__attribution');
      if (attribution) {
        attribution.style.display = 'none';
      }
    };
    
    // Hide immediately if already rendered
    hideWatermark();
    
    // Also hide after a short delay in case it renders later
    const timeoutId = setTimeout(hideWatermark, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

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

  // ---- Export functions ----
  const exportAsPNG = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      const { getNodesBounds, getViewportForBounds } = await import('reactflow');
      const html2canvas = await import('html2canvas');
      
      const originalViewport = reactFlowInstance.getViewport();
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewport) return;

      const elementsToHide = ['.react-flow__controls', '.react-flow__minimap', '.react-flow__panel'];
      const hiddenElements = [];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          hiddenElements.push({ element: el, display: el.style.display });
          el.style.display = 'none';
        });
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');

      reactFlowElement.style.background = 'white';
      if (background) background.style.display = 'none';

      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        const { x, y, zoom } = getViewportForBounds(
          {
            x: nodesBounds.x - padding,
            y: nodesBounds.y - padding,
            width: nodesBounds.width + padding * 2,
            height: nodesBounds.height + padding * 2
          },
          reactFlowWrapper.current.offsetWidth,
          reactFlowWrapper.current.offsetHeight,
          0.5, 2
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas.default(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `${diagramTitle || 'diagram'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
      // Restore elements
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display;
      });
      reactFlowElement.style.background = originalBg;
      if (background) background.style.display = '';
      
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    }
  };

  const exportAsPDF = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      const { getNodesBounds, getViewportForBounds } = await import('reactflow');
      const html2canvas = await import('html2canvas');
      const jsPDF = await import('jspdf');
      
      const originalViewport = reactFlowInstance.getViewport();
      const elementsToHide = ['.react-flow__controls', '.react-flow__minimap', '.react-flow__panel'];
      const hiddenElements = [];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          hiddenElements.push({ element: el, display: el.style.display });
          el.style.display = 'none';
        });
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');

      reactFlowElement.style.background = 'white';
      if (background) background.style.display = 'none';

      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        const { x, y, zoom } = getViewportForBounds(
          { x: nodesBounds.x - padding, y: nodesBounds.y - padding, width: nodesBounds.width + padding * 2, height: nodesBounds.height + padding * 2 },
          reactFlowWrapper.current.offsetWidth, reactFlowWrapper.current.offsetHeight, 0.5, 2
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas.default(reactFlowWrapper.current, {
        backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${diagramTitle || 'diagram'}.pdf`);
      
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
      // Restore elements
      hiddenElements.forEach(({ element, display }) => element.style.display = display);
      reactFlowElement.style.background = originalBg;
      if (background) background.style.display = '';
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  const copyToClipboard = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      const { getNodesBounds, getViewportForBounds } = await import('reactflow');
      const html2canvas = await import('html2canvas');
      
      const originalViewport = reactFlowInstance.getViewport();
      const elementsToHide = ['.react-flow__controls', '.react-flow__minimap', '.react-flow__panel'];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => el.style.display = 'none');
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBg = reactFlowElement.style.background;

      reactFlowElement.style.background = 'white';
      if (background) background.style.display = 'none';

      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        const { x, y, zoom } = getViewportForBounds(
          { x: nodesBounds.x - padding, y: nodesBounds.y - padding, width: nodesBounds.width + padding * 2, height: nodesBounds.height + padding * 2 },
          reactFlowWrapper.current.offsetWidth, reactFlowWrapper.current.offsetHeight, 0.5, 2
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas.default(reactFlowWrapper.current, {
        backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false
      });
      
      canvas.toBlob(async (blob) => {
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Diagram copied to clipboard!');
        } else {
          alert('Clipboard not supported in this browser');
        }
      });
      
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
      // Restore elements
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => el.style.display = '');
      });
      reactFlowElement.style.background = originalBg;
      if (background) background.style.display = '';
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard. Please try again.');
    }
  };

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

  // ---- Improved Sync with proper debouncing ----
  const handleSyncDiagram = async () => {
    if (nodes.length === 0 && edges.length === 0) {
      setCurrentFlowLangCode('');
      return;
    }

    try {
      setIsLoading(true);
      debugLog('Syncing diagram...');
      const response = await fetch(`${BASE_URL}/api/sync-diagram/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodes, 
          edges, 
          diagram_title: diagramTitle || 'My Diagram',
          user_id: user?.id || 'anonymous'
        }),
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
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced sync effect - 3 second delay
  useEffect(() => {
    if (autoSync && (nodes.length > 0 || edges.length > 0)) {
      // Clear existing timeout
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      
      // Set new timeout with 3 second delay
      const timeoutId = setTimeout(() => {
        handleSyncDiagram();
      }, 3000);
      
      setSyncTimeout(timeoutId);
      
      // Cleanup
      return () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
      };
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowInstructions(false)}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Start Guide</h2>
          <p className="text-gray-600">Get started with FlowLang Designer in minutes</p>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Getting Started</h3>
            <ul className="list-disc ml-4 space-y-1 text-blue-700">
              <li>Click the purple "Add" button to create nodes</li>
              <li>Drag from one node to another to connect them</li>
              <li>Click nodes/edges to edit their properties</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-green-700">
              <div><kbd className="bg-white px-2 py-1 rounded text-xs shadow">S</kbd> Toggle Pan/Select</div>
              <div><kbd className="bg-white px-2 py-1 rounded text-xs shadow">Ctrl+C</kbd> Copy</div>
              <div><kbd className="bg-white px-2 py-1 rounded text-xs shadow">Ctrl+V</kbd> Paste</div>
              <div><kbd className="bg-white px-2 py-1 rounded text-xs shadow">Del</kbd> Delete</div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🤖 AI Features</h3>
            <ul className="list-disc ml-4 space-y-1 text-purple-700">
              <li>Use the right sidebar to generate diagrams with AI</li>
              <li>Auto-sync keeps your diagram and code synchronized</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => setShowInstructions(false)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
        >
          Got it, let's start! 🎉
        </button>
      </div>
    </div>
  );

  // Elegant Export Dropdown Component
  const ExportDropdown = () => (
    <>
      <div 
        className="fixed inset-0 z-10" 
        onClick={() => setShowExportMenu(false)}
      ></div>
      
      <div className="absolute bottom-full mb-2 left-0 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/60 z-20 overflow-hidden transition-all duration-200">
        <div className="py-1.5">
          <button
            onClick={() => {
              exportAsPNG();
              setShowExportMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50/80 flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-all duration-200 text-sm font-medium border-b border-gray-100/60"
          >
            <Image size={16} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="font-medium">Export as PNG</span>
              <span className="text-xs text-gray-400 mt-0.5">High-quality image file</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              exportAsPDF();
              setShowExportMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50/80 flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-all duration-200 text-sm font-medium border-b border-gray-100/60"
          >
            <FileDown size={16} className="text-red-400" />
            <div className="flex flex-col">
              <span className="font-medium">Export as PDF</span>
              <span className="text-xs text-gray-400 mt-0.5">Vector document</span>
            </div>
          </button>
                                                        
          <button
            onClick={() => {
              copyToClipboard();
              setShowExportMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50/80 flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-all duration-200 text-sm font-medium"
          >
            <Copy size={16} className="text-green-500" />
            <div className="flex flex-col">
              <span className="font-medium">Copy to Clipboard</span>
              <span className="text-xs text-gray-400 mt-0.5">Paste anywhere</span>
            </div>
          </button>
        </div>
      </div>
    </>
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
        <div className="flex-1 relative p-4" style={{ paddingBottom: '20px' }}>
          <div 
            ref={reactFlowWrapper} 
            className="h-full w-full bg-white rounded-2xl shadow-xl border border-gray-200/50 transition-all duration-300"
            style={{ 
              cursor: panOnDrag ? 'grab' : 'default',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.03)',
              minHeight: 'calc(100vh - 120px)'
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
              proOptions={{ hideAttribution: true }}
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

              {/* Compact Bottom Control Panel */}
              <Panel position="bottom-center" style={{ bottom: '20px' }}>
                <div className="bg-white/98 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-200/60 transition-all duration-300"
                     style={{
                       boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 4px 15px rgba(0,0,0,0.04)',
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))'
                     }}>
                  <div className="flex items-center gap-2">
                    
                    {/* Add Button */}
                    <button
                      onClick={() => addNode('note', 'rectangle')}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 hover:from-purple-200 hover:to-violet-200 border border-purple-200/70 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      title="Add Note Node"
                    >
                      <span className="text-base font-semibold">+</span>
                      <span>Add</span>
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                    
                    {/* Control Buttons */}
                    <button
                      onClick={clearCanvas}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-100 to-rose-100 text-red-700 hover:from-red-200 hover:to-rose-200 border border-red-200/70 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      title="Clear Canvas"
                    >
                      <X size={14} />
                      <span>Clear</span>
                    </button>
                    
                    <button
                      onClick={toggleInteractionMode}
                      className={`group flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                        panOnDrag 
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200/70' 
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 hover:from-gray-200 hover:to-slate-200 border border-gray-200/70'
                      }`}
                      title={panOnDrag ? 'Pan Mode (Press S to toggle)' : 'Select Mode (Press S to toggle)'}
                    >
                      {panOnDrag ? <Hand size={14} /> : <MousePointer size={14} />}
                      <span>{panOnDrag ? 'Pan' : 'Select'}</span>
                    </button>
                    
                    <button
                      onClick={autoAlignNodes}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 hover:from-purple-200 hover:to-fuchsia-200 border border-purple-200/70 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      title="Auto align nodes (Ctrl/Cmd + A)"
                    >
                      <AlignLeft size={14} />
                      <span>Align</span>
                    </button>
                    
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 hover:from-blue-200 hover:to-sky-200 border border-blue-200/70 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 relative"
                      title="Export diagram"
                    >
                      <Download size={14} />
                      <span>Export</span>
                      
                      {/* Elegant Export Dropdown */}
                      {showExportMenu && <ExportDropdown />}
                    </button>
                    
                    <button
                      onClick={() => setShowInstructions(true)}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-green-100 to-teal-100 text-green-700 hover:from-green-200 hover:to-teal-200 border border-green-200/70 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      title="Show instructions"
                    >
                      <HelpCircle size={14} />
                      <span>Help</span>
                    </button>
                    
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