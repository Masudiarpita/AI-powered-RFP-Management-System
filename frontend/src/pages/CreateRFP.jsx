import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfpAPI } from '../services/api';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const CreateRFP = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examplePrompts = [
    "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.",
    "Looking to buy office furniture for 50 employees. Need desks, chairs, and filing cabinets. Budget: $75,000. Delivery in 45 days. Ergonomic chairs required, height-adjustable desks preferred.",
    "Need cloud hosting services for our web application. Expected traffic: 100K users/month. Budget: $5,000/month. Need 99.9% uptime SLA, 24/7 support, and auto-scaling capabilities."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please describe what you need to procure');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await rfpAPI.create({ naturalLanguageInput: input });
      navigate(`/rfp/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create RFP');
    } finally {
      setLoading(false);
    }
  };

  const useExample = (example) => {
    setInput(example);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <Sparkles className="h-8 w-8 text-indigo-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">Create New RFP</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Describe what you need to procure in natural language. Our AI will convert it into a structured RFP.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procurement Description
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I need to procure 20 laptops with 16GB RAM, 15 monitors 27-inch for our office. Budget is $50,000, delivery within 30 days..."
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating RFP...
              </>
            ) : (
              <>
                Create RFP
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Try these examples:
          </h3>
          <div className="space-y-3">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => useExample(prompt)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 border border-gray-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRFP;