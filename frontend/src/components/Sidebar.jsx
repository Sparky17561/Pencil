// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Play, Code, MessageSquare, RefreshCw, Eye, EyeOff } from 'lucide-react';

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
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">AI Designer</h1>
        </div>
        <p className="text-sm text-gray-600">Create diagrams with AI assistance</p>
        
        {/* Auto-sync Controls */}
        <div className="mt-4 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              {autoSync ? (
                <div className="flex items-center text-indigo-700">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">Auto-sync active</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span className="font-medium">Manual sync mode</span>
                </div>
              )}
            </div>
            <button
              onClick={onToggleAutoSync}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                autoSync 
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={autoSync ? 'Disable auto-sync' : 'Enable auto-sync'}
            >
              <RefreshCw size={14} className={autoSync ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 border-b border-gray-200 p-1 mx-4 rounded-lg">
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex-1 px-8 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 rounded-md mx-1 ${
            activeTab === 'AI' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <MessageSquare size={16} />
          AI Generator
        </button>
        <button
          onClick={() => setActiveTab('Code')}
          className={`flex-1 px-8 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 rounded-md mx-1 ${
            activeTab === 'Code' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <Code size={16} />
          Code Editor
          {currentCode && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        {activeTab === 'AI' && (
          <div className="p-5 space-y-6">
            {/* API Key Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Groq API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-600">
                Secure API authentication required for AI generation. Visit <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Groq</a> to get your API key.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value} className="text-gray-900 bg-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Prompt */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Diagram Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the process, workflow, or system you want to visualize..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 h-32 resize-none"
              />
              <p className="text-xs text-gray-600">
                Be specific about the steps, decisions, and connections you want to include
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim() || !apiKey.trim()}
              className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isLoading || !prompt.trim() || !apiKey.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-white">Generating Diagram...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Generate Diagram</span>
                </>
              )}
            </button>

            {/* Current Code Preview */}
            {currentCode && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Current Code</h3>
                  <button
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors font-medium bg-white border border-blue-200"
                  >
                    {showCodePreview ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showCodePreview ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                
                {showCodePreview && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap overflow-x-auto max-h-32 leading-relaxed">
                      {currentCode}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Example Prompts */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Quick Examples</h3>
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
                    className="w-full text-left px-4 py-3 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 text-gray-800"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Code' && (
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-900">
                Code Editor
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 border border-gray-300 transition-colors font-medium"
                  disabled={!editableCode}
                >
                  Copy
                </button>
                <button
                  onClick={resetCode}
                  disabled={editableCode === currentCode}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <textarea
              value={editableCode}
              onChange={handleCodeChange}
              placeholder="FlowLang code will appear here after generation..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
            
            <div className="mt-4 space-y-3">
              <button
                onClick={handleCodeSubmit}
                disabled={!editableCode.trim() || editableCode === currentCode}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Update Diagram
              </button>
              
              <div className="text-xs text-gray-600 text-center bg-gray-50 py-2 px-3 rounded-lg border border-gray-200">
                {autoSync ? 'Changes sync automatically when auto-sync is enabled' : 'Click "Update Diagram" to apply your changes'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;