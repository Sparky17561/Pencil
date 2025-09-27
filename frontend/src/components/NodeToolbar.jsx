// frontend/src/components/NodeToolbar.jsx
import React, { useState } from 'react';
import { Plus, Square, Circle, Diamond, Hexagon, Triangle, Trash2 } from 'lucide-react';

const NodeToolbar = ({ onAddNode, onClearCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shapes = [
    { shape: 'rectangle', icon: Square, label: 'Rectangle' },
    { shape: 'rounded', icon: Square, label: 'Rounded Rectangle' },
    { shape: 'circle', icon: Circle, label: 'Circle' },
    { shape: 'diamond', icon: Diamond, label: 'Diamond' },
    { shape: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { shape: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const handleAddNode = (shape) => {
    onAddNode(shape);
    setIsOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* Add Node Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Shape
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            ></div>
            
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="py-2">
                {shapes.map(({ shape, icon: Icon, label }) => (
                  <button
                    key={shape}
                    onClick={() => handleAddNode(shape)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="p-1 rounded bg-gray-100">
                      <Icon size={16} />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Clear Canvas */}
      <button
        onClick={onClearCanvas}
        className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 text-gray-600"
      >
        <Trash2 size={16} />
        Clear
      </button>
    </div>
  );
};

export default NodeToolbar;