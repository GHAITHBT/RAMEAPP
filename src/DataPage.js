
import React, { useState, useEffect } from 'react';

import axios from 'axios';

import * as XLSX from 'xlsx';

import './DataPage.css';
 
function DataPage() {

  const [data, setData] = useState([]);

  const [filters, setFilters] = useState({

    bon_n: '',

    employe_demandeur: '',

    matriculedemandeur: '',

    departement: '',

    kst: '',

    quantite_a4: '',

    quantite_a3: '',

    quantite_a5: '',

    date_reception: '',

    date_prochaine: ''

  });
 
  const [editing, setEditing] = useState(null); // To track the row being edited
 
  useEffect(() => {

    const fetchData = async () => {

      try {

        console.log('Applying filters:', filters); // Debugging log

        const response = await axios.get('http://localhost:3001/get-data', { params: filters });

        console.log('Data fetched:', response.data); // Debugging log

        setData(response.data);

      } catch (error) {

        console.error('Error fetching data:', error);

      }

    };

    fetchData();

  }, [filters]);
 
  const handleFilterChange = (e, columnName) => {

    const { value } = e.target;

    setFilters(prevFilters => ({

      ...prevFilters,

      [columnName]: value

    }));

    console.log(`Filter changed: ${columnName} = ${value}`); // Debugging log

  };
 
  const clearFilters = () => {

    setFilters({

      bon_n: '',

      employe_demandeur: '',

      matriculedemandeur: '',

      departement: '',

      kst: '',

      quantite_a4: '',

      quantite_a3: '',

      quantite_a5: '',

      date_reception: '',

      date_prochaine: ''

    });

  };
 
  const handleExport = () => {

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    const currentDate = new Date();
    const chartDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/T/g, '_').slice(0, -5); // Format: YYYY-MM-DD_HH-MM


    XLSX.utils.book_append_sheet(wb, ws, 'Data'); 

    XLSX.writeFile(wb, `Report_${chartDateTime}.xlsx`);

  };
 
  const handleDelete = async (id) => {

    try {

      await axios.delete(`http://localhost:3001/delete-data/${id}`);

      setData(data.filter(item => item.id !== id));

    } catch (error) {

      console.error('Error deleting data:', error);

    }

  };
 
  const handleEdit = (id) => {

    setEditing(id);

  };
 
  const handleSave = async (id) => {

    const editedItem = data.find(item => item.id === id);

    try {

      await axios.put(`http://localhost:3001/update-data/${id}`, editedItem);

      setEditing(null);

    } catch (error) {

      console.error('Error updating data:', error);

    }

  };
 
  const handleInputChange = (e, id, columnName) => {

    const { value } = e.target;

    setData(prevData => prevData.map(item => item.id === id ? { ...item, [columnName]: value } : item));

  };
 
  return (

    <div className="DataPage">

      <h1>Data Page</h1>

      <div className="export-buttons">

        <button onClick={handleExport}>Export to Excel</button>

        <button onClick={clearFilters}>Clear Filters</button>

      </div>

      <table className="table-container">

        <thead>

          <tr>

            <th>

              N° Bon

              <input type="text" value={filters.bon_n} onChange={(e) => handleFilterChange(e, 'bon_n')} />

            </th>

            <th>

              Employé Demandeur

              <input type="text" value={filters.employe_demandeur} onChange={(e) => handleFilterChange(e, 'employe_demandeur')} />

            </th>

            <th>

              Matricule Demandeur

              <input type="text" value={filters.matriculedemandeur} onChange={(e) => handleFilterChange(e, 'matriculedemandeur')} />

            </th>

            <th>

              Departement

              <input type="text" value={filters.departement} onChange={(e) => handleFilterChange(e, 'departement')} />

            </th>

            <th>

              KST

              <input type="text" value={filters.kst} onChange={(e) => handleFilterChange(e, 'kst')} />

            </th>

            <th>

              Quantité Prise (Rame A4)

              <input type="text" value={filters.quantite_a4} onChange={(e) => handleFilterChange(e, 'quantite_a4')} />

            </th>

            <th>

              Quantité Prise (Rame A3)

              <input type="text" value={filters.quantite_a3} onChange={(e) => handleFilterChange(e, 'quantite_a3')} />

            </th>

            <th>

              Quantité Prise (Rame A5)

              <input type="text" value={filters.quantite_a5} onChange={(e) => handleFilterChange(e, 'quantite_a5')} />

            </th>

            <th>

              Date de Reception

              <input type="date" value={filters.date_reception} onChange={(e) => handleFilterChange(e, 'date_reception')} />

            </th>

            <th>

              Date Prochaine

              <input type="date" value={filters.date_prochaine} onChange={(e) => handleFilterChange(e, 'date_prochaine')} />

            </th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {data.map((item, index) => (

            <tr key={index}>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.bon_n} onChange={(e) => handleInputChange(e, item.id, 'bon_n')} />

                ) : (

                  item.bon_n

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.employe_demandeur} onChange={(e) => handleInputChange(e, item.id, 'employe_demandeur')} />

                ) : (

                  item.employe_demandeur

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.matriculedemandeur} onChange={(e) => handleInputChange(e, item.id, 'matriculedemandeur')} />

                ) : (

                  item.matriculedemandeur

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <select value={item.departement} onChange={(e) => handleInputChange(e, item.id, 'departement')}>

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

                ) : (

                  item.departement

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.kst} onChange={(e) => handleInputChange(e, item.id, 'kst')} />

                ) : (

                  item.kst

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.quantite_a4} onChange={(e) => handleInputChange(e, item.id, 'quantite_a4')} />

                ) : (

                  item.quantite_a4

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.quantite_a3} onChange={(e) => handleInputChange(e, item.id, 'quantite_a3')} />

                ) : (

                  item.quantite_a3

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="text" value={item.quantite_a5} onChange={(e) => handleInputChange(e, item.id, 'quantite_a5')} />

                ) : (

                  item.quantite_a5

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input type="date" value={item.date_reception} onChange={(e) => handleInputChange(e, item.id, 'date_reception')} />

                ) : (

                  item.date_reception

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <input


                    type="date" value={item.date_prochaine} onChange={(e) => handleInputChange(e, item.id, 'date_prochaine')} />

                ) : (

                  item.date_prochaine

                )}

              </td>

              <td>

                {editing === item.id ? (

                  <button onClick={() => handleSave(item.id)}>Save</button>

                ) : (

                  <button onClick={() => handleEdit(item.id)}>Edit</button>

                )}

                <button onClick={() => handleDelete(item.id)}>Delete</button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
 
export default DataPage;
