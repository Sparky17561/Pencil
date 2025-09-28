import React, { useState, useRef, useEffect } from 'react';
import { Plus, Square, Circle, Diamond, Hexagon, Triangle, Trash2 } from 'lucide-react';

const NodeToolbar = ({ onAddNode, onClearCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const shapes = [
    { shape: 'rectangle', icon: Square, label: 'Rectangle' },
    { shape: 'rounded', icon: Square, label: 'Rounded Rectangle' },
    { shape: 'circle', icon: Circle, label: 'Circle' },
    { shape: 'diamond', icon: Diamond, label: 'Diamond' },
    { shape: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { shape: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const handleAddNode = (shape) => {
    // Pass 'custom' as type and the shape as a separate parameter
    onAddNode('custom', shape);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex gap-3 relative z-50">
      {/* Add Node Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white px-5 py-3 rounded-lg shadow-lg border-2 hover:shadow-xl transition-all duration-200 flex items-center gap-3 font-medium ${
            isOpen 
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xl' 
              : 'border-gray-300 text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Plus size={18} className={isOpen ? 'text-blue-600' : 'text-gray-700'} />
          <span className="text-sm">Add Shape</span>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Plus size={16} className="text-white" />
                Choose Shape
              </h3>
            </div>
            
            {/* Shape Options */}
            <div className="py-3 bg-white">
              {shapes.map(({ shape, icon: Icon, label }) => (
                <button
                  key={shape}
                  onClick={() => handleAddNode(shape)}
                  className="w-full px-5 py-4 text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center gap-4 group border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <Icon size={20} className="text-blue-600 group-hover:text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold block text-gray-800 group-hover:text-blue-900">{label}</span>
                    <span className="text-xs text-gray-600 group-hover:text-blue-700 capitalize font-medium">{shape.replace('_', ' ')} shape</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Plus size={16} className="text-blue-500 rotate-45" />
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
              <p className="text-xs text-blue-700 text-center font-medium">Select a shape to add to your canvas</p>
            </div>
          </div>
        )}
      </div>

      {/* Clear Canvas */}
      <button
        onClick={onClearCanvas}
        className="bg-white px-5 py-3 rounded-lg shadow-lg border-2 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-gray-900 font-medium group"
      >
        <Trash2 size={18} className="text-gray-700 group-hover:text-red-600 transition-colors duration-200" />
        <span className="text-sm">Clear</span>
      </button>
    </div>
  );
};

export default NodeToolbar;