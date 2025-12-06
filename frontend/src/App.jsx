import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPDetails from './pages/RFPDetails';
import Vendors from './pages/Vendors';
import CompareProposals from './pages/CompareProposals';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-rfp" element={<CreateRFP />} />
        <Route path="/rfp/:id" element={<RFPDetails />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/rfp/:id/compare" element={<CompareProposals />} />
      </Routes>
    </Layout>
  );
}

export default App;