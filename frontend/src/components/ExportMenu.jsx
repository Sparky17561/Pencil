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
      // Store original viewport
      const originalViewport = reactFlowInstance.getViewport();
      
      // Get the React Flow viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewport) return;

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

      // Store original styles
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';

      // Set white background and remove pattern
      reactFlowElement.style.background = 'white';
      if (background) {
        background.style.display = 'none';
      }

      // Fit view to show all nodes with proper bounds
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
          0.5, // min zoom
          2    // max zoom
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        
        // Wait for viewport to update
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Capture with high quality
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
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
      
      const link = document.createElement('a');
      link.download = `${diagramTitle || 'diagram'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Restore original viewport
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    } finally {
      // Restore all elements and styles
      const hiddenElements = [];
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = '';
        });
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = '';
      }

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = '';
      }
    }
    setIsOpen(false);
  };

  const exportAsPDF = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      // Store original viewport
      const originalViewport = reactFlowInstance.getViewport();
      
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

      // Store and set styles
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      const originalBg = reactFlowElement.style.background;
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';

      reactFlowElement.style.background = 'white';
      if (background) {
        background.style.display = 'none';
      }

      // Fit view to show all nodes
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
          0.5,
          2
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
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
        format: [canvas.width / 3, canvas.height / 3] // Scale down for PDF
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`${diagramTitle || 'diagram'}.pdf`);
      
      // Restore original viewport
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      // Restore all elements
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = '';
        });
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = '';
      }

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = '';
      }
    }
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    try {
      // Store original viewport
      const originalViewport = reactFlowInstance.getViewport();
      
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
      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      const originalBackgroundDisplay = background ? background.style.display : '';

      reactFlowElement.style.background = 'white';
      if (background) {
        background.style.display = 'none';
      }

      // Fit view
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
          0.5,
          2
        );
        
        reactFlowInstance.setViewport({ x, y, zoom }, { duration: 0 });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
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
      
      // Restore original viewport
      reactFlowInstance.setViewport(originalViewport, { duration: 0 });
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard. Please try again.');
    } finally {
      // Restore elements
      const elementsToHide = [
        '.react-flow__controls',
        '.react-flow__minimap', 
        '.react-flow__panel'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = reactFlowWrapper.current.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = '';
        });
      });

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (reactFlowElement) {
        reactFlowElement.style.background = '';
      }

      const background = reactFlowWrapper.current.querySelector('.react-flow__background');
      if (background) {
        background.style.display = '';
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-colors"
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
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="py-1">
              <button
                onClick={exportAsPNG}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
              >
                <Image size={16} className="text-gray-500" />
                <span className="font-medium">Export as PNG</span>
              </button>
              
              <button
                onClick={exportAsPDF}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
              >
                <FileDown size={16} className="text-gray-500" />
                <span className="font-medium">Export as PDF</span>
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
              >
                <Copy size={16} className="text-gray-500" />
                <span className="font-medium">Copy to Clipboard</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;