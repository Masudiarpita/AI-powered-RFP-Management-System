import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfpAPI } from '../services/api';
import { ArrowLeft, Trophy, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const CompareProposals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComparison();
  }, [id]);

  const fetchComparison = async () => {
    try {
      const response = await rfpAPI.compare(id);
      const responseData = response.data.data || response.data || {};

      let normalizedProposals = [];
      const rawProposals = responseData.proposals;
      if (Array.isArray(rawProposals)) {
        normalizedProposals = rawProposals;
      } else if (rawProposals && typeof rawProposals === 'object') {
        normalizedProposals = Object.keys(rawProposals).map((k) => rawProposals[k]);
      } else {
        normalizedProposals = [];
      }

      setData({ ...responseData, proposals: normalizedProposals });
    } catch (err) {
      console.error('Fetch comparison error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data || !data.comparison) {
    return <div className="text-center py-12 text-gray-600">No proposals to compare</div>;
  }

  const { rfp, proposals = [], comparison } = data;

  return (
    <div>
      <button
        onClick={() => navigate(`/rfp/${id}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to RFP Details
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{rfp?.title}</h2>
        <p className="text-gray-600 mb-6">Proposal Comparison & AI Analysis</p>

        {comparison?.overallRecommendation && (
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 mb-6">
            <div className="flex items-start">
              <Trophy className="h-6 w-6 text-indigo-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  AI Recommendation
                </h3>
                <p className="text-indigo-800">{comparison.overallRecommendation}</p>
              </div>
            </div>
          </div>
        )}

        {comparison?.comparisonSummary && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700">{comparison.comparisonSummary}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 mb-6">
        {comparison.vendorAnalyses?.map((analysis, index) => {
          const proposal = proposals.find((p) => {
            const vendorNameCandidates = [
              p?.vendor?.name,
              p?.vendorId?.name,
              typeof p?.vendor === 'string' ? p.vendor : undefined,
              typeof p?.vendorId === 'string' ? p.vendorId : undefined,
              p?.parsedData?.vendorName 
            ].filter(Boolean);
            return vendorNameCandidates.includes(analysis.vendorName);
          });

          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{analysis.vendorName}</h3>
                  {proposal?.parsedData?.totalPrice !== undefined && proposal?.parsedData?.totalPrice !== null && (
                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                      ${Number(proposal.parsedData.totalPrice).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreColor(analysis.score ?? 0)}`}>
                  {analysis.score ?? 0}/100
                </div>
              </div>

              {analysis.summary && (
                <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg">
                  {analysis.summary}
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-green-700 mb-3">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths?.map((strength, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-2">•</span>
                        <span>{strength}</span>
                      </li>
                    )) || <li className="text-sm text-gray-500">No strengths listed</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-semibold text-red-700 mb-3">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses?.map((weakness, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{weakness}</span>
                      </li>
                    )) || <li className="text-sm text-gray-500">No weaknesses listed</li>}
                  </ul>
                </div>
              </div>

              {proposal && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Proposal Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {proposal.parsedData?.deliveryTimeline && (
                      <div>
                        <span className="text-gray-600">Delivery:</span>
                        <span className="ml-2 text-gray-900">{proposal.parsedData.deliveryTimeline}</span>
                      </div>
                    )}
                    {proposal.parsedData?.paymentTerms && (
                      <div>
                        <span className="text-gray-600">Payment:</span>
                        <span className="ml-2 text-gray-900">{proposal.parsedData.paymentTerms}</span>
                      </div>
                    )}
                    {proposal.parsedData?.warranty && (
                      <div>
                        <span className="text-gray-600">Warranty:</span>
                        <span className="ml-2 text-gray-900">{proposal.parsedData.warranty}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {comparison.keyConsiderations && comparison.keyConsiderations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="flex items-center text-xl font-bold text-gray-900 mb-4">
            <TrendingUp className="h-6 w-6 mr-2" />
            Key Considerations
          </h3>
          <ul className="space-y-3">
            {comparison.keyConsiderations.map((consideration, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <span className="text-indigo-600 mr-3 font-bold">{index + 1}.</span>
                <span>{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompareProposals;
