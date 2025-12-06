import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfpAPI, vendorAPI } from '../services/api';
import { ArrowLeft, Send, Loader2, Mail, Package } from 'lucide-react';

const RFPDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [rfpRes, vendorsRes, proposalsRes] = await Promise.all([
        rfpAPI.getById(id),
        vendorAPI.getAll(),
        rfpAPI.getProposals(id)
      ]);
      
      const rfpData = rfpRes.data.data || rfpRes.data;
      const vendorsData = vendorsRes.data.data || vendorsRes.data;
      const proposalsData = proposalsRes.data.data || proposalsRes.data;
      
      setRfp(rfpData);
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      
      if (rfpData.sentTo && Array.isArray(rfpData.sentTo)) {
        setSelectedVendors(rfpData.sentTo.map(v => typeof v === 'string' ? v : v._id));
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to load RFP details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      setError('Please select at least one vendor');
      return;
    }

    setSending(true);
    setError('');

    try {
      await rfpAPI.send(id, selectedVendors);
      await fetchData();
      alert('RFP sent successfully to selected vendors!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send RFP');
    } finally {
      setSending(false);
    }
  };

  const toggleVendor = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!rfp) {
    return <div className="text-center py-12 text-gray-600">RFP not found</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{rfp.title}</h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
            <p className="text-lg font-semibold text-gray-900">${rfp.budget.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Timeline</label>
            <p className="text-lg font-semibold text-gray-900">{rfp.deliveryTimeline}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <p className="text-gray-700">{rfp.description}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rfp.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.specifications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {rfp.paymentTerms && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
            <p className="text-gray-700">{rfp.paymentTerms}</p>
          </div>
        )}

        {rfp.warrantyRequirements && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Requirements</label>
            <p className="text-gray-700">{rfp.warrantyRequirements}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Send className="h-6 w-6 mr-2" />
          Send to Vendors
        </h3>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              onClick={() => toggleVendor(vendor._id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedVendors.includes(vendor._id)
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                  <p className="text-sm text-gray-600">{vendor.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{vendor.category}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor._id)}
                  onChange={() => {}}
                  className="h-5 w-5 text-indigo-600 rounded"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSendRFP}
          disabled={sending || selectedVendors.length === 0}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Send RFP to {selectedVendors.length} Vendor{selectedVendors.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {proposals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="h-6 w-6 mr-2" />
            Received Proposals ({proposals.length})
          </h3>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {proposal.vendor?.name || 'Unknown Vendor'}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'analyzed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                {proposal.parsedData?.totalPrice && (
                  <p className="text-lg font-semibold text-indigo-600">
                    ${proposal.parsedData.totalPrice.toLocaleString()}
                  </p>
                )}
                {proposal.aiAnalysis?.score && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">AI Score:</span>
                      <span className="font-semibold">{proposal.aiAnalysis.score}/100</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RFPDetails;