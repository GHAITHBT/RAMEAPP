import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const styles = {
  container: {
    padding: '0px',
    margin: '0px 0px 0 0px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowX: 'hidden',
  },
  tableWrapper: {
    maxWidth: 'calc(100% - 20px)',
    overflowX: 'auto',
    marginBottom: '20px',
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '5px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '5px',
    boxSizing: 'border-box',
  },
  button: {
    marginRight: '10px',
  },
};

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
    date_prochaine: '',
    copycenter: '',
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-data', { params: filters });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [filters]); 

  const handleFilterChange = (e, columnName) => {
    const { value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnName]: value,
    }));
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
      date_prochaine: '',
      copycenter: '',
    });
  };

  const handleExport = () => {
    const wsData = data.map(item => ({
      'Voucher N°': item.bon_n,
      'Requesting Employee': item.employe_demandeur,
      'Employee Number': item.matriculedemandeur,
      'Department': item.departement,
      'KST': item.kst,
      'Copy Center': item.copycenter,
      'Quantity (A4)': item.quantite_a4,
      'Quantity (A3)': item.quantite_a3,
      'Quantity (A5)': item.quantite_a5,
      'Date of receipt': item.date_reception,
      'Next Date': item.date_prochaine,
    }));
  
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    const currentDate = new Date();
    const chartDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/T/g, '_').slice(0, -5); // Format: YYYY-MM-DD_HH-MM
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `Report_${chartDateTime}.xlsx`);
  };
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://10.110.22.39:3001/delete-data/${id}`);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = (id) => {
    setEditing(id);
  };

  const handleSave = async (id) => {
    const editedItem = data.find((item) => item.id === id);
    try {
      await axios.put(`http://10.110.22.39:3001/update-data/${id}`, editedItem);
      setEditing(null);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleInputChange = (e, id, columnName) => {
    const { value } = e.target;
    setData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, [columnName]: value } : item))
    );
  };

  return (
    <div style={styles.container}>
      <h1>Data Page</h1>
      <div>
        
       
      </div>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Voucher N°</th>
              <th style={styles.th}>Requesting Employee</th>
              <th style={styles.th}>Employee Number</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>KST</th>
              <th style={styles.th}>Copy Center</th>
              <th style={styles.th}>Quantity (A4)</th>
              <th style={styles.th}>Quantity (A3)</th>
              <th style={styles.th}>Quantity (A5)</th>
              <th style={styles.th}>Date of receipt</th>
              <th style={styles.th}>Next Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
            <tr>
              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Vacher N° Filter"
                  value={filters.bon_n}
                  onChange={(e) => handleFilterChange(e, 'bon_n')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter Requesting Employee"
                  value={filters.employe_demandeur}
                  onChange={(e) => handleFilterChange(e, 'employe_demandeur')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter Employee Number"
                  value={filters.matriculedemandeur}
                  onChange={(e) => handleFilterChange(e, 'matriculedemandeur')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
  <select
    value={filters.departement}
    onChange={(e) => handleFilterChange(e, 'departement')}
    style={styles.select}
  >
    <option value="">Filter Department</option>
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
</th>

              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter KST"
                  value={filters.kst}
                  onChange={(e) => handleFilterChange(e, 'kst')}
                  style={styles.input}
                />
              </th>
               <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter Copy Center"
                  value={filters.copycenter}
                  onChange={(e) => handleFilterChange(e, 'copycenter')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="text"
                 
                  placeholder="Filter Quantity (A4)"
                  value={filters.quantite_a4}
                  onChange={(e) => handleFilterChange(e, 'quantite_a4')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter Quantity (A3)"
                  value={filters.quantite_a3}
                  onChange={(e) => handleFilterChange(e, 'quantite_a3')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="text"
                  placeholder="Filter Quantity (A5)"
                  value={filters.quantite_a5}
                  onChange={(e) => handleFilterChange(e, 'quantite_a5')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="date"
                  placeholder="Filter Date of receipt"
                  value={filters.date_reception}
                  onChange={(e) => handleFilterChange(e, 'date_reception')}
                  style={styles.input}
                />
              </th>
              <th style={styles.th}>
                <input
                  type="date"
                  placeholder="Filter Next Date"
                  value={filters.date_prochaine}
                  onChange={(e) => handleFilterChange(e, 'date_prochaine')}
                  style={styles.input}
                />
              </th>
             
              <th style={styles.th}> <button onClick={clearFilters}>Clear Filters</button> <button style={styles.button} onClick={handleExport}>
          Export to Excel
        </button></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.bon_n}
                      onChange={(e) => handleInputChange(e, item.id, 'bon_n')}
                      style={styles.input}
                    />
                  ) : (
                    item.bon_n
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.employe_demandeur}
                      onChange={(e) => handleInputChange(e, item.id, 'employe_demandeur')}
                      style={styles.input}
                    />
                  ) : (
                    item.employe_demandeur
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.matriculedemandeur}
                      onChange={(e) => handleInputChange(e, item.id, 'matriculedemandeur')}
                      style={styles.input}
                    />
                  ) : (
                    item.matriculedemandeur
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <select
                      value={item.departement}
                      onChange={(e) => handleInputChange(e, item.id, 'departement')}
                      style={styles.select}
                    >
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
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.kst}
                      onChange={(e) => handleInputChange(e, item.id, 'kst')}
                      style={styles.input}
                    />
                  ) : (
                    item.kst
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.copycenter}
                      onChange={(e) => handleInputChange(e, item.id, 'copycenter')}
                      style={styles.input}
                    />
                  ) : (
                    item.copycenter
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.quantite_a4}
                      onChange={(e) => handleInputChange(e, item.id, 'quantite_a4')}
                      style={styles.input}
                    />
                  ) : (
                    item.quantite_a4
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.quantite_a3}
                      onChange={(e) => handleInputChange(e, item.id, 'quantite_a3')}
                      style={styles.input}
                    />
                  ) : (
                    item.quantite_a3
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="text"
                      value={item.quantite_a5}
                      onChange={(e) => handleInputChange(e, item.id, 'quantite_a5')}
                      style={styles.input}
                    />
                  ) : (
                    item.quantite_a5
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="date"
                      value={item.date_reception}
                      onChange={(e) => handleInputChange(e, item.id, 'date_reception')}
                      style={styles.input}
                    />
                  ) : (
                    item.date_reception
                  )}
                </td>
                <td style={styles.td}>
                  {editing === item.id ? (
                    <input
                      type="date"
                      value={item.date_prochaine}
                      onChange={(e) => handleInputChange(e, item.id, 'date_prochaine')}
                      style={styles.input}
                    />
                  ) : (
                    item.date_prochaine
                  )}
                </td>
              
                <td style={styles.td}>
                  {editing === item.id ? (
                    <button style={{marginRight:"2px"}} onClick={() => handleSave(item.id)}>Save</button>
                  ) : (
                    <button style={{marginRight:"2px"}} onClick={() => handleEdit(item.id)}>Edit</button>
                  )}
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataPage;
