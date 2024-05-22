import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DataPage from './DataPage/DataPage';
import Navbar from './Navbar';
import Header from './Header';
import Dashboard from './Dashboard';
import ChartsPage from './ChartsPage';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    bonN: '',
    employeDemandeur: '',
    matriculeDemandeur: '',
    departement: '',
    kst: '',
    quantiteA4: '',
    quantiteA3: '',
    quantiteA5: '',
    copycenter: '',
    dateReception: '',
    dateProchaine: ''
  });

  useEffect(() => {
    // Set default value for Date of receipt (today's date)
    setFormData((prevFormData) => ({
      ...prevFormData,
      dateReception: new Date().toISOString().split('T')[0]
    }));

    // Set default value for Next Date (next week from today's date)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormData((prevFormData) => ({
      ...prevFormData,
      dateProchaine: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Form data submitted successfully');
      } else {
        alert('Error submitting form data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form data');
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Header />
        <div className="Content">
          <Routes>
            <Route
              path="/Add"
              element={
                <div className="form-container">
                  <h1>Requesting Form</h1>
                  <form onSubmit={handleSubmit}>
                    <div>
                      <label>
                        Voucher n°:
                        <input
                          type="text"
                          name="bonN"
                          value={formData.bonN}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Requesting Employee:
                        <input
                          type="text"
                          name="employeDemandeur"
                          value={formData.employeDemandeur}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Employee Number:
                        <input
                          type="text"
                          name="matriculeDemandeur"
                          value={formData.matriculeDemandeur}
                          onChange={handleChange}
                          required
                          
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Department:
                        <select
                          name="departement"
                          value={formData.departement}
                          onChange={handleChange}
                          required
                          style={{ border: '1px solid black' }}
                        >
                          <option value="">Select Department</option>
                          <option value="PIT">PIT</option>
                          <option value="PQM">PQM</option>
                          <option value="PGM">PGM</option>
                          <option value="PPE">PPE</option>
                          <option value="PHSE">PHSE</option>
                          <option value="PHR">PHR</option>
                          <option value="PPR">PPR</option>
                          <option value="PCP">PCP</option>
                          <option value="PMC">PMC</option>
                          <option value="PPM">PPM</option>
                          <option value="PLM">PLM</option>
                        </select>
                      </label>
                    </div>
                    <div>
                      <label>
                        KST:
                        <input
                          type="text"
                          name="kst"
                          value={formData.kst}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Copy Center:
                        <input
                          type="text"
                          name="copycenter"
                          value={formData.copycenter}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Quantity (A4):
                        <input
                          type="number"
                          name="quantiteA4"
                          value={formData.quantiteA4}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Quantity (A3):
                        <input
                          type="number"
                          name="quantiteA3"
                          value={formData.quantiteA3}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Quantity (A5):
                        <input
                          type="number"
                          name="quantiteA5"
                          value={formData.quantiteA5}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Date of receipt:
                        <input
                          type="date"
                          name="dateReception"
                          value={formData.dateReception}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Next Date:
                        <input
                          type="date"
                          name="dateProchaine"
                          value={formData.dateProchaine}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <button type="submit">Submit</button>
                  </form>
                </div>
              }
            />
            <Route path="/data" element={<DataPage />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/" element={<ChartsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
