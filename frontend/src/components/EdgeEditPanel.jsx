// frontend/src/components/EdgeEditPanel.jsx
import React, { useState, useEffect } from 'react';
import { X, Trash2, Zap, Type, Palette } from 'lucide-react';

const EdgeEditPanel = ({ selectedEdge, onUpdateEdge, onDeleteEdge, onClose }) => {
  const [label, setLabel] = useState('');
  const [strokeColor, setStrokeColor] = useState('#6B7280');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [animated, setAnimated] = useState(false);
  const [edgeType, setEdgeType] = useState('smoothstep');
  const [markerEnd, setMarkerEnd] = useState('arrowclosed');

  // Edge type options
  const edgeTypes = [
    { value: 'default', label: 'Straight' },
    { value: 'straight', label: 'Straight Line' },
    { value: 'step', label: 'Step' },
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'bezier', label: 'Bezier' },
  ];

  // Marker options
  const markerTypes = [
    { value: 'arrowclosed', label: 'Arrow (Closed)' },
    { value: 'arrow', label: 'Arrow (Open)' },
    { value: '', label: 'No Arrow' },
  ];

  // Preset color themes
  const colorThemes = [
    { name: 'Gray', color: '#6B7280' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Green', color: '#10B981' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Purple', color: '#8B5CF6' },
    { name: 'Orange', color: '#F97316' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Yellow', color: '#EAB308' },
  ];

  useEffect(() => {
    if (selectedEdge) {
      setLabel(selectedEdge.label || '');
      setStrokeColor(selectedEdge.style?.stroke || '#6B7280');
      setStrokeWidth(selectedEdge.style?.strokeWidth || 2);
      setAnimated(selectedEdge.animated || false);
      setEdgeType(selectedEdge.type || 'smoothstep');
      setMarkerEnd(selectedEdge.markerEnd?.type || 'arrowclosed');
    }
  }, [selectedEdge]);

  const handleUpdate = () => {
    if (selectedEdge) {
      const updates = {
        label,
        type: edgeType,
        animated,
        style: {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        },
        markerEnd: markerEnd ? {
          type: markerEnd,
          width: 20,
          height: 20,
          color: strokeColor,
        } : undefined,
      };
      onUpdateEdge(selectedEdge.id, updates);
    }
  };

  const handleDelete = () => {
    if (selectedEdge && confirm('Are you sure you want to delete this connection?')) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  // Auto-update when values change
  useEffect(() => {
    if (selectedEdge) {
      handleUpdate();
    }
  }, [label, strokeColor, strokeWidth, animated, edgeType, markerEnd]);

  if (!selectedEdge) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Edit Connection</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Connection Preview */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                A
              </div>
              <div className="relative">
                <svg width="80" height="20" className="overflow-visible">
                  <defs>
                    <marker
                      id="preview-arrow"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={strokeColor}
                      />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="10"
                    x2="70"
                    y2="10"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={markerEnd ? "url(#preview-arrow)" : ""}
                    className={animated ? "animate-pulse" : ""}
                  />
                </svg>
                {label && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs">
                    {label}
                  </div>
                )}
              </div>
              <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                B
              </div>
            </div>
          </div>
        </div>

        {/* Label Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Type size={16} className="inline mr-1" />
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional label for connection"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Connection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connection Type
          </label>
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {edgeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrow Style
          </label>
          <select
            value={markerEnd}
            onChange={(e) => setMarkerEnd(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {markerTypes.map((marker) => (
              <option key={marker.value} value={marker.value}>
                {marker.label}
              </option>
            ))}
          </select>
        </div>

        {/* Animation Toggle */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Zap size={16} />
            <span className="text-sm font-medium text-gray-700">Animated</span>
          </label>
        </div>

        {/* Color Themes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette size={16} className="inline mr-1" />
            Color Themes
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setStrokeColor(theme.color)}
                className={`p-2 rounded border-2 transition-all ${
                  strokeColor === theme.color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                title={theme.name}
              >
                <div
                  className="w-full h-4 rounded"
                  style={{ backgroundColor: theme.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Line Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Delete Connection
        </button>
      </div>
    </div>
  );
};

export default EdgeEditPanel;