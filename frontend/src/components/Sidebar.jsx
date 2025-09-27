// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Play, Code, MessageSquare, RefreshCw, Eye, EyeOff } from 'lucide-react';

const Sidebar = ({ 
  onGenerateDiagram, 
  onCodeUpdate, 
  isLoading,
  currentCode = '',
  onManualSync,
  autoSync = true,
  onToggleAutoSync
}) => {
  const [activeTab, setActiveTab] = useState('AI');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [prompt, setPrompt] = useState('');
  const [editableCode, setEditableCode] = useState('');
  const [showCodePreview, setShowCodePreview] = useState(false);

  const models = [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  ];

  // Load saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Update editable code when current code changes
  useEffect(() => {
    if (currentCode !== editableCode) {
      setEditableCode(currentCode);
    }
  }, [currentCode]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey.trim()) {
      alert('Please provide both API key and prompt');
      return;
    }

    // Save API key to localStorage
    localStorage.setItem('groq_api_key', apiKey);

    console.log('Generating with:', { model, apiKey: apiKey.substring(0, 10) + '...', prompt });

    const generatedCode = await onGenerateDiagram(prompt, apiKey, model);
    if (generatedCode) {
      setEditableCode(generatedCode);
      setActiveTab('Code');
      setShowCodePreview(true);
    }
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setEditableCode(newCode);
  };

  const handleCodeSubmit = () => {
    if (editableCode.trim()) {
      onCodeUpdate(editableCode);
    }
  };

  const resetCode = () => {
    setEditableCode(currentCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header with Sync Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-800">FlowLang Designer</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleAutoSync}
              className={`p-1.5 rounded-md transition-colors ${
                autoSync 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled'}
            >
              <RefreshCw size={16} className={autoSync ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onManualSync}
              className="p-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              title="Manual sync"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          {autoSync ? (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Auto-sync active
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              Manual sync mode
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mt-1">Create diagrams with AI</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === 'AI' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare size={16} />
          AI
        </button>
        <button
          onClick={() => setActiveTab('Code')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === 'Code' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Code size={16} />
          Code
          {currentCode && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'AI' && (
          <div className="p-4 space-y-4">
            {/* API Key Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GROQ Cloud API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your GROQ API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  console.groq.com
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your diagram
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the process, workflow, or system you want to visualize..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Create a user authentication flow with login, validation, and dashboard access"
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim() || !apiKey.trim()}
              className={`w-full px-4 py-3 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${
                isLoading || !prompt.trim() || !apiKey.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Generate Diagram
                </>
              )}
            </button>

            {/* Current Code Preview (when on AI tab) */}
            {currentCode && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Current FlowLang Code</h3>
                  <button
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {showCodePreview ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                    {showCodePreview ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showCodePreview && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto max-h-32">
                      {currentCode}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Example Prompts */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Example Prompts:</h3>
              <div className="space-y-2">
                {[
                  "Create an e-commerce order processing workflow",
                  "Design a machine learning pipeline for data processing",
                  "Show a software development lifecycle process",
                  "Create a customer support ticket resolution flow"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Code' && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                FlowLang Code Editor
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                  disabled={!editableCode}
                >
                  Copy
                </button>
                <button
                  onClick={resetCode}
                  disabled={editableCode === currentCode}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <textarea
              value={editableCode}
              onChange={handleCodeChange}
              placeholder="FlowLang code will appear here after generation..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
            />
            
            <div className="mt-3 space-y-2">
              <button
                onClick={handleCodeSubmit}
                disabled={!editableCode.trim() || editableCode === currentCode}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Update Diagram
              </button>
              
              <div className="text-xs text-gray-500 text-center">
                {autoSync ? 'Manual changes sync automatically' : 'Click "Update Diagram" to apply changes'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;