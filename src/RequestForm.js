import React, { useState } from 'react';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    bonN: '',
    employeDemandeur: '',
    matriculeDemandeur: '',
    departement: '',
    kst: '',
    quantiteA4: 0, // Set default value to 0
    quantiteA3: 0, // Set default value to 0
    quantiteA5: 0, // Set default value to 0
    copycenter: '',
    dateReception: '',
    dateProchaine: ''
  });
  const fetchEmployeeData = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:3001/get-data?${field}=${value}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const {
            employe_demandeur,
            matriculedemandeur,
            departement,
            kst,
            copycenter
          } = data[0]; // Assuming only one record is returned
          setFormData({
            ...formData,
            employeDemandeur: employe_demandeur,
            matriculeDemandeur: matriculedemandeur,
            departement: departement,
            
            copycenter: copycenter
          });
        }
      } else {
        console.error('Error fetching employee data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
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
    <div className="form-container">
      <h1>Requesting Form</h1>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
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
                          onBlur={(e) => fetchEmployeeData('employe_demandeur', e.target.value)}
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
                          onBlur={(e) => fetchEmployeeData('matriculedemandeur', e.target.value)}
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
  style={{
    border: '1px solid black',
    height: '30px', // Adjust the height to match other input fields
    padding: '5px', // Add padding for better appearance
    borderRadius: '5px', // Add rounded corners for consistency
    boxSizing: 'border-box', // Ensure the border-box model is used
    width: '100%' // Ensure the select takes up full width
  }}
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
                          value={formData.quantiteA4 || 0}
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
                          value={formData.quantiteA3 || 0}
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
                          value={formData.quantiteA5 || 0}
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
  );
};

export default RequestForm;
