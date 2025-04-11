'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '@/context/ApiContext';

export default function ConnectionForm() {
  const { connect, isConnected, processId, emailBotId, isLoading, error } = useApi();
  const [processIdInput, setProcessIdInput] = useState('');
  const [emailBotIdInput, setEmailBotIdInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processIdInput && emailBotIdInput) {
      try {
        await connect(processIdInput, emailBotIdInput);
        setShowForm(false);
      } catch (err) {
        console.error('Connection failed:', err);
      }
    }
  };

  if (isConnected) {
    return (
      <div className="mb-4 p-2 border border-green-500 bg-green-900/20 rounded">
        <div className="text-green-400 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span>Connected to AO Platform</span>
          </div>
          <div className="text-xs mt-1 text-green-300">
            <div>Process Builder ID: {processId}</div>
            <div>Email Bot ID: {emailBotId}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {!showForm ? (
        <motion.button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-gray-800 text-green-400 border border-green-500 rounded hover:bg-gray-700 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect to AO Platform
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 border border-gray-700 bg-gray-800/50 rounded"
        >
          <h3 className="text-green-400 mb-2">Connect to AO Platform</h3>
          <form onSubmit={handleConnect}>
            <div className="mb-2">
              <label className="block text-green-300 text-xs mb-1">Process Builder ID</label>
              <input
                type="text"
                value={processIdInput}
                onChange={(e) => setProcessIdInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter Process Builder ID"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-green-300 text-xs mb-1">Email Bot ID</label>
              <input
                type="text"
                value={emailBotIdInput}
                onChange={(e) => setEmailBotIdInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter Email Bot ID"
                required
              />
            </div>
            {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
