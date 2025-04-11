'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '@/context/ApiContext';

export default function CreateAutomationForm() {
  const { createAutomation, targets, isLoading, error } = useApi();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState('');
  const [then, setThen] = useState('');
  const [target, setTarget] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!name || !when || !then || !target) {
      setFormError('All fields except description are required');
      return;
    }
    
    try {
      await createAutomation(name, when, then, target, description);
      // Reset form
      setName('');
      setDescription('');
      setWhen('');
      setThen('');
      setTarget('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create automation:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create automation');
    }
  };

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
          Create New Automation
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 border border-gray-700 bg-gray-800/50 rounded"
        >
          <h3 className="text-green-400 mb-2">Create New Automation</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-green-300 text-xs mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="Automation Name"
                required
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-green-300 text-xs mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="Brief description"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-green-300 text-xs mb-1">When (Trigger)</label>
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="e.g., File Uploaded"
                required
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-green-300 text-xs mb-1">Then (Action)</label>
              <input
                type="text"
                value={then}
                onChange={(e) => setThen(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                placeholder="e.g., Send Email"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-green-300 text-xs mb-1">Target</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Select a target</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.id}
                  </option>
                ))}
              </select>
            </div>
            
            {(formError || error) && (
              <div className="text-red-400 text-xs mb-2">{formError || error}</div>
            )}
            
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
                {isLoading ? 'Creating...' : 'Create Automation'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
