// frontend/src/components/ExportMenu.jsx
import React, { useState } from 'react';
import { Download, FileDown, Copy, Image } from 'lucide-react';
import { getNodesBounds, getViewportForBounds } from 'reactflow';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExportMenu = ({ reactFlowWrapper, nodes, edges, diagramTitle, reactFlowInstance }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsPNG = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      // Get the React Flow viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewport) return;

      // Hide UI elements but keep the background
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      const hiddenElements = [];
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          hiddenElements.push({ element: el, display: el.style.display });
          el.style.display = 'none';
        });
      });

      // Temporarily change background to white
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      reactFlowElement.style.background = 'white';

      // Remove the dotted background pattern
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';
      if (background) {
        background.style.display = 'none';
      }

      // Get bounds and fit view to show all nodes
      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const { x, y, zoom } = getViewportForBounds(
          nodesBounds,
          reactFlowInstance.getViewport().zoom,
          reactFlowInstance.getViewport().x,
          reactFlowInstance.getViewport().y,
          100 // padding
        );
        reactFlowInstance.setViewport({ x, y, zoom });
        
        // Wait for viewport to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure white background in cloned document
          const clonedReactFlow = clonedDoc.querySelector('.react-flow');
          if (clonedReactFlow) {
            clonedReactFlow.style.background = 'white';
          }
          
          // Remove background pattern in clone
          const clonedBackground = clonedDoc.querySelector('.react-flow__background');
          if (clonedBackground) {
            clonedBackground.style.display = 'none';
          }
        }
      });
      
      const link = document.createElement('a');
      link.download = `${diagramTitle || 'diagram'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    } finally {
      // Restore all hidden elements
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display;
      });

      // Restore original background
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = originalBg;
      }

      // Restore background pattern
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = originalBackgroundDisplay;
      }
    }
    setIsOpen(false);
  };

  const exportAsPDF = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      // Hide UI elements
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      const hiddenElements = [];
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          hiddenElements.push({ element: el, display: el.style.display });
          el.style.display = 'none';
        });
      });

      // Set white background and remove pattern
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      reactFlowElement.style.background = 'white';

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';
      if (background) {
        background.style.display = 'none';
      }

      // Fit view to show all nodes
      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const { x, y, zoom } = getViewportForBounds(
          nodesBounds,
          reactFlowInstance.getViewport().zoom,
          reactFlowInstance.getViewport().x,
          reactFlowInstance.getViewport().y,
          100
        );
        reactFlowInstance.setViewport({ x, y, zoom });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedReactFlow = clonedDoc.querySelector('.react-flow');
          if (clonedReactFlow) {
            clonedReactFlow.style.background = 'white';
          }
          const clonedBackground = clonedDoc.querySelector('.react-flow__background');
          if (clonedBackground) {
            clonedBackground.style.display = 'none';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${diagramTitle || 'diagram'}.pdf`);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      // Restore elements
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display;
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = originalBg;
      }

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = originalBackgroundDisplay;
      }
    }
    setIsOpen(false);
  };

  const exportAsSVG = () => {
    if (!nodes.length) {
      alert('No nodes to export');
      return;
    }

    const svg = createSVGFromNodes(nodes, edges);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${diagramTitle || 'diagram'}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      // Hide UI elements
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      const hiddenElements = [];
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          hiddenElements.push({ element: el, display: el.style.display });
          el.style.display = 'none';
        });
      });

      // Set white background
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      reactFlowElement.style.background = 'white';

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';
      if (background) {
        background.style.display = 'none';
      }

      // Fit view
      if (nodes.length > 0) {
        const nodesBounds = getNodesBounds(nodes);
        const { x, y, zoom } = getViewportForBounds(
          nodesBounds,
          reactFlowInstance.getViewport().zoom,
          reactFlowInstance.getViewport().x,
          reactFlowInstance.getViewport().y,
          100
        );
        reactFlowInstance.setViewport({ x, y, zoom });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedReactFlow = clonedDoc.querySelector('.react-flow');
          if (clonedReactFlow) {
            clonedReactFlow.style.background = 'white';
          }
          const clonedBackground = clonedDoc.querySelector('.react-flow__background');
          if (clonedBackground) {
            clonedBackground.style.display = 'none';
          }
        }
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
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard. Please try again.');
    } finally {
      // Restore elements
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display;
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = originalBg;
      }

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = originalBackgroundDisplay;
      }
    }
    setIsOpen(false);
  };

  const createSVGFromNodes = (nodes, edges) => {
    if (!nodes.length) return '<svg></svg>';
    
    // Calculate bounds with proper padding
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const nodeWidth = 200; // Default node width
      const nodeHeight = 80; // Default node height
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });
    
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`;
    
    // Add white background
    svg += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="white"/>`;
    
    // Define arrow marker
    svg += `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
        </marker>
      </defs>
    `;
    
    // Add edges first (behind nodes)
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const x1 = sourceNode.position.x + 100; // Center of source node
        const y1 = sourceNode.position.y + 80;  // Bottom of source node
        const x2 = targetNode.position.x + 100; // Center of target node
        const y2 = targetNode.position.y;       // Top of target node
        
        const strokeColor = edge.style?.stroke || '#6B7280';
        const strokeWidth = edge.style?.strokeWidth || 2;
        
        svg += `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                stroke="${strokeColor}" stroke-width="${strokeWidth}" 
                marker-end="url(#arrowhead)"/>
        `;
        
        if (edge.label) {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          svg += `
            <text x="${midX}" y="${midY}" text-anchor="middle" 
                  font-family="Arial" font-size="12" fill="#374151"
                  dominant-baseline="middle">${edge.label}</text>
          `;
        }
      }
    });
    
    // Add nodes
    nodes.forEach(node => {
      const x = node.position.x;
      const y = node.position.y;
      const width = 200;
      const height = 80;
      
      const backgroundColor = node.data.backgroundColor || '#F3F4F6';
      const borderColor = node.data.borderColor || node.data.iconColor || '#D1D5DB';
      const textColor = node.data.textColor || '#374151';
      const iconColor = node.data.iconColor || '#6B7280';
      const fontSize = node.data.fontSize || 14;
      const fontFamily = node.data.fontFamily || 'Arial';
      const shape = node.data.shape || 'rectangle';
      
      // Draw node based on shape
      if (shape === 'circle') {
        const centerX = x + width/2;
        const centerY = y + height/2;
        const radius = Math.min(width, height) / 2;
        svg += `
          <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
                  fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"/>
        `;
      } else if (shape === 'diamond') {
        const centerX = x + width/2;
        const centerY = y + height/2;
        const halfWidth = width/2;
        const halfHeight = height/2;
        svg += `
          <polygon points="${centerX},${y} ${x+width},${centerY} ${centerX},${y+height} ${x},${centerY}" 
                   fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"/>
        `;
      } else {
        // Rectangle or rounded rectangle
        const rx = shape === 'rounded' ? 12 : shape === 'rectangle' ? 6 : 0;
        svg += `
          <rect x="${x}" y="${y}" width="${width}" height="${height}" 
                fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" rx="${rx}"/>
        `;
      }
      
      // Add icon if present
      if (node.data.icon) {
        svg += `
          <text x="${x + width/2}" y="${y + height/2 - 8}" text-anchor="middle" 
                font-family="Arial" font-size="${Math.max(16, fontSize * 1.2)}" 
                fill="${iconColor}" dominant-baseline="middle">${node.data.icon}</text>
        `;
      }
      
      // Add label
      const labelY = node.data.icon ? y + height/2 + 12 : y + height/2;
      svg += `
        <text x="${x + width/2}" y="${labelY}" text-anchor="middle" 
              font-family="${fontFamily}" font-size="${fontSize}" 
              fill="${textColor}" dominant-baseline="middle">${node.data.label || node.id}</text>
      `;
    });
    
    svg += `</svg>`;
    return svg;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
      >
        <Download size={16} />
        Export
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <button
                onClick={exportAsPNG}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <Image size={16} />
                Export as PNG
              </button>
              
              <button
                onClick={exportAsSVG}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <FileDown size={16} />
                Export as SVG
              </button>
              
              <button
                onClick={exportAsPDF}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <FileDown size={16} />
                Export as PDF
              </button>
              
              <hr className="my-2" />
              
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <Copy size={16} />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;