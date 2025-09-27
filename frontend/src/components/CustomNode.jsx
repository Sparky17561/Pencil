// frontend/src/components/CustomNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {
  // Use actual node data properties with fallbacks
  const backgroundColor = data.backgroundColor || '#F9FAFB';
  const textColor = data.textColor || '#374151';
  const iconColor = data.iconColor || data.color || '#6B7280';
  const borderColor = data.borderColor || iconColor;
  const fontSize = data.fontSize || 14;
  const fontFamily = data.fontFamily || 'Arial';
  const fontWeight = data.fontWeight || 'normal';
  const shape = data.shape || 'rectangle';

  const getShapeStyle = () => {
    const baseStyle = {
      backgroundColor,
      color: textColor,
      border: `2px solid ${borderColor}`,
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight,
      padding: '12px 16px',
      minWidth: '120px',
      textAlign: 'center',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };

    // Apply shape-specific styles
    switch (shape) {
      case 'rounded':
        return { ...baseStyle, borderRadius: '12px' };
      case 'circle':
        return { 
          ...baseStyle, 
          borderRadius: '50%', 
          width: '80px', 
          height: '80px',
          minWidth: '80px',
          padding: '8px'
        };
      case 'diamond':
        return { 
          ...baseStyle, 
          transform: 'rotate(45deg)',
          width: '80px',
          height: '80px',
          minWidth: '80px'
        };
      case 'hexagon':
        return {
          ...baseStyle,
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          width: '120px',
          height: '80px',
          minWidth: '120px'
        };
      case 'triangle':
        return {
          ...baseStyle,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          width: '100px',
          height: '80px',
          minWidth: '100px'
        };
      default: // rectangle
        return { ...baseStyle, borderRadius: '6px' };
    }
  };

  const getContentStyle = () => {
    // Counter-rotate content for diamond shape
    if (shape === 'diamond') {
      return { transform: 'rotate(-45deg)' };
    }
    return {};
  };

  return (
    <div className="custom-node-container">
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: borderColor,
          border: '2px solid white',
          width: '12px',
          height: '12px'
        }}
      />
      
      <div style={getShapeStyle()}>
        <div style={getContentStyle()}>
          {/* Icon */}
          {data.icon && (
            <div 
              style={{ 
                fontSize: Math.max(16, fontSize * 1.2), 
                color: iconColor,
                marginBottom: '4px'
              }}
            >
              {data.icon}
            </div>
          )}
          
          {/* Label */}
          <div style={{ 
            fontSize: `${fontSize}px`,
            fontWeight,
            lineHeight: '1.2',
            wordBreak: 'break-word'
          }}>
            {data.label}
          </div>
          
          {/* Type indicator (smaller text) */}
          {data.type && (
            <div style={{
              fontSize: `${Math.max(10, fontSize * 0.8)}px`,
              opacity: 0.7,
              marginTop: '2px',
              textTransform: 'capitalize'
            }}>
           
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: borderColor,
          border: '2px solid white',
          width: '12px',
          height: '12px'
        }}
      />
      
      {/* Add handles for diamond shape on sides */}
      {shape === 'diamond' && (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            style={{ 
              background: borderColor,
              border: '2px solid white',
              width: '10px',
              height: '10px'
            }}
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            style={{ 
              background: borderColor,
              border: '2px solid white',
              width: '10px',
              height: '10px'
            }}
          />
        </>
      )}
    </div>
  );
};

export default CustomNode;