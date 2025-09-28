import React, { useState, useEffect, useCallback } from 'react';
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

  const handleUpdate = useCallback(() => {
    if (selectedEdge && onUpdateEdge) {
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
  }, [selectedEdge, onUpdateEdge, label, strokeColor, strokeWidth, animated, edgeType, markerEnd]);

  const handleDelete = () => {
    if (selectedEdge && onDeleteEdge && window.confirm('Are you sure you want to delete this connection?')) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  // Auto-update when values change with debouncing
  useEffect(() => {
    if (selectedEdge) {
      const timeout = setTimeout(handleUpdate, 100);
      return () => clearTimeout(timeout);
    }
  }, [handleUpdate, selectedEdge]);

  if (!selectedEdge) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Edit Connection</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 bg-white border border-gray-200 shadow-sm hover:shadow-md"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-scroll overflow-x-hidden p-5 space-y-6 bg-white min-h-0" style={{paddingBottom: '100px', scrollbarWidth: 'thin', scrollbarColor: '#60A5FA #DBEAFE'}}>
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #DBEAFE;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb {
            background: #60A5FA;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #3B82F6;
          }
        `}</style>
        {/* Connection Preview */}
        <div className="text-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 font-semibold">
                A
              </div>
              <div className="relative">
                <svg width="100" height="24" className="overflow-visible">
                  <defs>
                    <marker
                      id="preview-arrow"
                      markerWidth="12"
                      markerHeight="8"
                      refX="11"
                      refY="4"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 12 4, 0 8"
                        fill={strokeColor}
                      />
                    </marker>
                  </defs>
                  <line
                    x1="5"
                    y1="12"
                    x2="85"
                    y2="12"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={markerEnd ? "url(#preview-arrow)" : ""}
                    className={animated ? "animate-pulse" : ""}
                  />
                </svg>
                {label && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-md shadow-md border border-gray-200 text-xs font-medium text-gray-700">
                    {label}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 border-2 border-green-300 flex items-center justify-center text-green-700 font-semibold">
                B
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Connection Preview</p>
        </div>

        {/* Label Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Type size={16} className="text-gray-700" />
            Connection Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional label for connection"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
            maxLength={50}
          />
        </div>

        {/* Connection Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            Connection Type
          </label>
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
          >
            {edgeTypes.map((type) => (
              <option key={type.value} value={type.value} className="text-gray-900">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            Arrow Style
          </label>
          <select
            value={markerEnd}
            onChange={(e) => setMarkerEnd(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
          >
            {markerTypes.map((marker) => (
              <option key={marker.value} value={marker.value} className="text-gray-900">
                {marker.label}
              </option>
            ))}
          </select>
        </div>

        {/* Animation Toggle */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-white">
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <Zap size={18} className={animated ? "text-blue-600" : "text-gray-600"} />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">Animated Connection</span>
              <p className="text-xs text-gray-600">Add pulsing animation to the connection</p>
            </div>
          </label>
        </div>

        {/* Color Themes */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Palette size={16} className="text-gray-700" />
            Color Themes
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setStrokeColor(theme.color)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 bg-white hover:scale-105 hover:shadow-md ${
                  strokeColor === theme.color
                    ? 'border-blue-500 shadow-md scale-105 ring-2 ring-blue-300'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                title={theme.name}
              >
                <div
                  className="w-full h-4 rounded border border-gray-200"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-xs text-gray-600 mt-1 block font-medium">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="text-sm font-semibold text-gray-900">
            Custom Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="text-sm font-semibold text-gray-900">
            Line Width: {strokeWidth}px
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(strokeWidth-1)/9*100}%, #E5E7EB ${(strokeWidth-1)/9*100}%, #E5E7EB 100%)`
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #3B82F6;
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              }
              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #3B82F6;
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              }
            `}</style>
          </div>
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>1px (Thin)</span>
            <span>10px (Thick)</span>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50" style={{transform: 'translateY(-60px)'}}>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Trash2 size={16} />
          Delete Connection
        </button>
      </div>
    </div>
  );
};

export default EdgeEditPanel;