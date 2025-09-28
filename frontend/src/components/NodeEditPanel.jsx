import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Palette, Type, Square, Circle, Diamond } from 'lucide-react';

const NodeEditPanel = ({ selectedNode, onUpdateNode, onDeleteNode, onClose }) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');
  const [shape, setShape] = useState('rectangle');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [iconColor, setIconColor] = useState('#6B7280');
  const [borderColor, setBorderColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');

  // Common icons
  const commonIcons = [
    '⚪', '🚩', '⚙️', '📝', '💎', '▶️', '⏸️', '⏹️', '✅', '❌',
    '📊', '📈', '📉', '💻', '🗄️', '🔍', '💡', '⚠️', '🔔', '📧',
    '👥', '🏠', '⭐', '❤️', '🔒', '🔓', '📱', '💰', '🛒', '🎯'
  ];

  // Shape options
  const shapeOptions = [
    { value: 'rectangle', label: 'Rectangle', icon: Square },
    { value: 'rounded', label: 'Rounded', icon: Square },
    { value: 'circle', label: 'Circle', icon: Circle },
    { value: 'diamond', label: 'Diamond', icon: Diamond },
    { value: 'hexagon', label: 'Hexagon', icon: Square },
    { value: 'triangle', label: 'Triangle', icon: Square },
  ];

  // Font families
  const fontFamilies = [
    'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma'
  ];

  // Font weights
  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '300', label: 'Light' },
    { value: '600', label: 'Semi Bold' },
  ];

  // Preset color themes
  const colorThemes = [
    { name: 'Green', bg: '#F0FDF4', text: '#166534', icon: '#16A34A', border: '#16A34A' },
    { name: 'Orange', bg: '#FFF7ED', text: '#EA580C', icon: '#F97316', border: '#F97316' },
    { name: 'Purple', bg: '#FAF5FF', text: '#7C3AED', icon: '#8B5CF6', border: '#8B5CF6' },
    { name: 'Blue', bg: '#EFF6FF', text: '#2563EB', icon: '#3B82F6', border: '#3B82F6' },
    { name: 'Red', bg: '#FEF2F2', text: '#DC2626', icon: '#EF4444', border: '#EF4444' },
    { name: 'Yellow', bg: '#FEFCE8', text: '#CA8A04', icon: '#EAB308', border: '#EAB308' },
    { name: 'Gray', bg: '#F9FAFB', text: '#374151', icon: '#6B7280', border: '#6B7280' },
    { name: 'Pink', bg: '#FDF2F8', text: '#BE185D', icon: '#EC4899', border: '#EC4899' },
  ];

  // Initialize form with selected node data
  useEffect(() => {
    if (selectedNode?.data) {
      const data = selectedNode.data;
      setLabel(data.label || '');
      setIcon(data.icon || '');
      setShape(data.shape || 'rectangle');
      setBackgroundColor(data.backgroundColor || '#ffffff');
      setTextColor(data.textColor || '#000000');
      setIconColor(data.iconColor || '#6B7280');
      setBorderColor(data.borderColor || '#000000');
      setFontSize(data.fontSize || 14);
      setFontFamily(data.fontFamily || 'Arial');
      setFontWeight(data.fontWeight || 'normal');
    }
  }, [selectedNode]);

  // Memoized update handler to prevent infinite re-renders
  const handleUpdate = useCallback(() => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, {
        label,
        icon,
        shape,
        backgroundColor,
        textColor,
        iconColor,
        borderColor,
        fontSize,
        fontFamily,
        fontWeight,
      });
    }
  }, [selectedNode, onUpdateNode, label, icon, shape, backgroundColor, textColor, iconColor, borderColor, fontSize, fontFamily, fontWeight]);

  const handleDelete = () => {
    if (selectedNode && onDeleteNode && window.confirm('Are you sure you want to delete this node?')) {
      onDeleteNode(selectedNode.id);
    }
  };

  const applyTheme = (theme) => {
    setBackgroundColor(theme.bg);
    setTextColor(theme.text);
    setIconColor(theme.icon);
    setBorderColor(theme.border);
  };

  // Auto-update when values change with debouncing
  useEffect(() => {
    if (selectedNode) {
      const timeout = setTimeout(handleUpdate, 100);
      return () => clearTimeout(timeout);
    }
  }, [handleUpdate, selectedNode]);

  // Helper function to get shape styles
  const getShapeStyles = () => {
    const baseStyles = {
      minWidth: '120px',
      minHeight: '80px',
      padding: '12px',
      border: `2px solid ${borderColor}`,
      backgroundColor,
      color: textColor,
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      transition: 'all 0.2s ease-in-out',
    };

    switch (shape) {
      case 'rectangle':
        return { ...baseStyles, borderRadius: '4px' };
      case 'rounded':
        return { ...baseStyles, borderRadius: '12px' };
      case 'circle':
        return { ...baseStyles, borderRadius: '50%', width: '100px', height: '100px' };
      case 'diamond':
        return { ...baseStyles, borderRadius: '4px', transform: 'rotate(45deg)' };
      case 'hexagon':
        return { 
          ...baseStyles, 
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          borderRadius: '0px'
        };
      case 'triangle':
        return { 
          ...baseStyles, 
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          borderRadius: '0px'
        };
      default:
        return { ...baseStyles, borderRadius: '4px' };
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-600 p-6">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">No Node Selected</h3>
          <p className="text-sm text-gray-600">Click on a node to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Edit Node</h2>
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
      <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{paddingBottom: '80px'}}>
        {/* Node Preview */}
        <div className="text-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="inline-block">
            <div style={getShapeStyles()}>
              <div style={shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
                {icon && (
                  <div style={{ 
                    fontSize: Math.max(16, fontSize * 1.2), 
                    color: iconColor,
                    marginBottom: '4px'
                  }}>
                    {icon}
                  </div>
                )}
                <div style={{ wordBreak: 'break-word' }}>
                  {label || 'Node Label'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Label Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Type size={16} className="text-gray-700" />
            Node Text
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
            maxLength={100}
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            Icon
          </label>
          <div className="relative">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Enter emoji or symbol"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 px-1">Quick Select:</div>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-scroll p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200" 
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#60A5FA #DBEAFE'
                 }}>
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
              {commonIcons.map((iconOption, index) => (
                <button
                  key={index}
                  onClick={() => setIcon(iconOption)}
                  className={`aspect-square p-2 rounded-lg border-2 hover:scale-105 hover:shadow-lg text-xl transition-all duration-200 flex items-center justify-center ${
                    icon === iconOption 
                      ? 'border-blue-500 bg-blue-200 shadow-lg scale-105 ring-2 ring-blue-300' 
                      : 'border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50 shadow-sm'
                  }`}
                  title={`Select icon: ${iconOption}`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shape Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            Shape
          </label>
          <div className="grid grid-cols-2 gap-3">
            {shapeOptions.map(({ value, label: shapeLabel, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setShape(value)}
                className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 ${
                  shape === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Icon size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-900">{shapeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Themes */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Palette size={16} className="text-gray-700" />
            Quick Themes
          </label>
          <div className="grid grid-cols-2 gap-3">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => applyTheme(theme)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-white"
              >
                <div
                  className="w-4 h-4 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: theme.bg, borderColor: theme.icon }}
                />
                <span className="text-sm font-medium text-gray-900">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Settings */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Font Settings</h3>
          
          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} className="text-gray-900">{font}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Font Size: {fontSize}px
            </label>
            <div className="relative">
              <input
                type="range"
                min="10"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(fontSize-10)/22*100}%, #E5E7EB ${(fontSize-10)/22*100}%, #E5E7EB 100%)`
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #3B82F6;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #3B82F6;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Font Weight</label>
            <select
              value={fontWeight}
              onChange={(e) => setFontWeight(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {fontWeights.map(({ value, label }) => (
                <option key={value} value={value} className="text-gray-900">{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Custom Colors</h3>
          
          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Background</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Icon Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Icon Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Border Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Border Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
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
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default NodeEditPanel;