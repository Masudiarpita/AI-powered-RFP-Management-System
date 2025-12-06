import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rfpAPI } from '../services/api';
import { FileText, Send, CheckCircle, Clock, DollarSign, Eye } from 'lucide-react';

const Dashboard = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await rfpAPI.getAll();
      const rfpsData = response.data.data || response.data;
      setRfps(Array.isArray(rfpsData) ? rfpsData : []);
    } catch (err) {
      console.error('Fetch RFPs error:', err);
      setError('Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      closed: 'bg-green-100 text-green-700'
    };

    const icons = {
      draft: Clock,
      sent: Send,
      closed: CheckCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">RFP Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage your requests for proposals</p>
        </div>
        <Link
          to="/create-rfp"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Create New RFP
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {rfps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No RFPs yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first RFP</p>
          <Link
            to="/create-rfp"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Create RFP
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {rfps.map((rfp) => (
            <div key={rfp._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{rfp.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{rfp.description}</p>
                </div>
                <div className="ml-4">
                  {getStatusBadge(rfp.status)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    ${rfp.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">{rfp.deliveryTimeline}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Send className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    {rfp.sentTo?.length || 0} vendors
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  to={`/rfp/${rfp._id}`}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
                {rfp.status === 'sent' && (
                  <Link
                    to={`/rfp/${rfp._id}/compare`}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Compare Proposals
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;