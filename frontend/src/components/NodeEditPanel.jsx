// frontend/src/components/NodeEditPanel.jsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setIcon(selectedNode.data.icon || '');
      setShape(selectedNode.data.shape || 'rectangle');
      setBackgroundColor(selectedNode.data.backgroundColor || '#ffffff');
      setTextColor(selectedNode.data.textColor || '#000000');
      setIconColor(selectedNode.data.iconColor || '#6B7280');
      setBorderColor(selectedNode.data.borderColor || '#000000');
      setFontSize(selectedNode.data.fontSize || 14);
      setFontFamily(selectedNode.data.fontFamily || 'Arial');
      setFontWeight(selectedNode.data.fontWeight || 'normal');
    }
  }, [selectedNode]);

  const handleUpdate = () => {
    if (selectedNode) {
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
  };

  const handleDelete = () => {
    if (selectedNode && confirm('Are you sure you want to delete this node?')) {
      onDeleteNode(selectedNode.id);
    }
  };

  const applyTheme = (theme) => {
    setBackgroundColor(theme.bg);
    setTextColor(theme.text);
    setIconColor(theme.icon);
    setBorderColor(theme.border);
  };

  // Auto-update when values change
  useEffect(() => {
    if (selectedNode) {
      handleUpdate();
    }
  }, [label, icon, shape, backgroundColor, textColor, iconColor, borderColor, fontSize, fontFamily, fontWeight]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500 p-6">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-medium mb-2">No Node Selected</h3>
          <p className="text-sm">Click on a node to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Edit Node</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Node Preview */}
        <div className="text-center">
          <div className="inline-block">
            <div 
              style={{
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
                borderRadius: shape === 'rectangle' ? '4px' : 
                            shape === 'rounded' ? '12px' :
                            shape === 'circle' ? '50%' : '4px',
                transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
                clipPath: shape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                          shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
              }}
            >
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
                {label || 'Node Label'}
              </div>
            </div>
          </div>
        </div>

        {/* Label Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Type size={16} className="inline mr-1" />
            Text
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Enter emoji or symbol"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <div className="grid grid-cols-6 gap-2">
            {commonIcons.map((iconOption, index) => (
              <button
                key={index}
                onClick={() => setIcon(iconOption)}
                className={`p-2 rounded border hover:bg-gray-50 text-lg ${
                  icon === iconOption ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {iconOption}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape
          </label>
          <div className="grid grid-cols-2 gap-2">
            {shapeOptions.map(({ value, label: shapeLabel, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setShape(value)}
                className={`flex items-center gap-2 p-2 border rounded hover:bg-gray-50 ${
                  shape === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{shapeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Themes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette size={16} className="inline mr-1" />
            Quick Themes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => applyTheme(theme)}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.bg, border: `2px solid ${theme.icon}` }}
                />
                <span className="text-sm">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Font Settings</h3>
          
          {/* Font Family */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="10"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
            <select
              value={fontWeight}
              onChange={(e) => setFontWeight(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              {fontWeights.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Custom Colors</h3>
          
          {/* Background Color */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Icon Color */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Icon</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Border Color */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Border</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
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
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default NodeEditPanel;