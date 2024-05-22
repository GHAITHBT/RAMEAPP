import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import './DataPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function ExportableChart() {
  const barChartRefs = useRef([]);
  const pieChartRef = useRef(null);
  const userChartRef = useRef(null);

  const [data, setData] = useState([]);
  const [selectedChart, setSelectedChart] = useState({ type: '', index: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const totalQuantitiesPerMonth = data.reduce((acc, curr) => {
    const dept = curr.departement || 'Unknown';
    const date = format(parseISO(curr.date_reception), 'yyyy-MM');
    if (!acc[dept]) {
      acc[dept] = {};
    }
    if (!acc[dept][date]) {
      acc[dept][date] = { quantite_a4: 0, quantite_a3: 0, quantite_a5: 0 };
    }
    acc[dept][date].quantite_a4 += curr.quantite_a4 || 0;
    acc[dept][date].quantite_a3 += curr.quantite_a3 || 0;
    acc[dept][date].quantite_a5 += curr.quantite_a5 || 0;
    return acc;
  }, {});

  const totalQuantitiesPerUser = data.reduce((acc, curr) => {
    const user = curr.employe_demandeur || 'Unknown';
    if (!acc[user]) {
      acc[user] = { quantite_a4: 0, quantite_a3: 0, quantite_a5: 0 };
    }
    acc[user].quantite_a4 += curr.quantite_a4 || 0;
    acc[user].quantite_a3 += curr.quantite_a3 || 0;
    acc[user].quantite_a5 += curr.quantite_a5 || 0;
    return acc;
  }, {});

  const departments = Object.keys(totalQuantitiesPerMonth);
  const users = Object.keys(totalQuantitiesPerUser);
  const dates = Array.from(new Set(data.map(item => format(parseISO(item.date_reception), 'yyyy-MM')))).sort();

  const departmentQuantities = departments.reduce((acc, dept) => {
    const totalA4 = Object.values(totalQuantitiesPerMonth[dept]).reduce((sum, month) => sum + month.quantite_a4, 0);
    const totalA3 = Object.values(totalQuantitiesPerMonth[dept]).reduce((sum, month) => sum + month.quantite_a3, 0);
    const totalA5 = Object.values(totalQuantitiesPerMonth[dept]).reduce((sum, month) => sum + month.quantite_a5, 0);
    acc[dept] = { totalA4, totalA3, totalA5 };
    return acc;
  }, {});

  const colors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(255, 99, 132, 0.6)',
  ];

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: 'Charts Data',
      Author: 'Your Name',
    };
    wb.SheetNames.push('Bar Chart Data');
    const wsBar = XLSX.utils.json_to_sheet(departments.map(dept => ({
      Department: dept,
      'Total A4': departmentQuantities[dept].totalA4,
      'Total A3': departmentQuantities[dept].totalA3,
      'Total A5': departmentQuantities[dept].totalA5,
    })));
    wb.Sheets['Bar Chart Data'] = wsBar;

    wb.SheetNames.push('Pie Chart Data');
    const wsPie = XLSX.utils.json_to_sheet(departments.map((dept, index) => ({
      Department: dept,
      'Total A4': departmentQuantities[dept].totalA4,
      'Total A3': departmentQuantities[dept].totalA3,
      'Total A5': departmentQuantities[dept].totalA5,
      Color: colors[index % colors.length],
    })));
    wb.Sheets['Pie Chart Data'] = wsPie;
    XLSX.writeFile(wb, 'charts_data.xlsx');
  };

  const exportToPNG = (chartType, index) => {
    let chartCanvas;
    if (chartType === 'bar') {
      chartCanvas = barChartRefs.current[index]?.canvas;
    } else if (chartType === 'pie') {
      chartCanvas = pieChartRef.current?.canvas;
    } else if (chartType === 'user') {
      chartCanvas = userChartRef.current?.canvas;
    }

    if (chartCanvas) {
      const pngUrl = chartCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${chartType}_chart.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error('Chart canvas not found');
    }
  };

  const handleChartClick = (chartType, index) => {
    setSelectedChart({ type: chartType, index });
  };

  return (
    <div className="dashboard-container">
      <div className="charts-container">
        <div className="chart-item">
          <h2>Total Quantities per Month and Department</h2>
          {departments.map((dept, index) => (
            <div key={dept} className="chart-item" onClick={() => handleChartClick('bar', index)}>
              <h3>{dept}</h3>
              <Bar
                ref={el => barChartRefs.current[index] = el?.chartInstance}
                data={{
                  labels: dates
                  ,
                  datasets: [
                    {
                      label: 'A4',
                      data: dates.map(date => totalQuantitiesPerMonth[dept][date]?.quantite_a4 || 0),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'A3',
                      data: dates.map(date => totalQuantitiesPerMonth[dept][date]?.quantite_a3 || 0),
                      backgroundColor: 'rgba(153, 102, 255, 0.6)',
                      borderColor: 'rgba(153, 102, 255, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'A5',
                      data: dates.map(date => totalQuantitiesPerMonth[dept][date]?.quantite_a5 || 0),
                      backgroundColor: 'rgba(255, 159, 64, 0.6)',
                      borderColor: 'rgba(255, 159, 64, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
              {selectedChart.type === 'bar' && selectedChart.index === index && (
                <button onClick={() => exportToPNG('bar', index)}>Export as PNG</button>
              )}
            </div>
          ))}
        </div>

        <div className="chart-item">
          <h2>Total Quantities per Department</h2>
          <Pie
            ref={el => pieChartRef.current = el?.chartInstance}
            data={{
              labels: departments,
              datasets: [
                {
                  label: 'Total A4',
                  data: departments.map(dept => departmentQuantities[dept].totalA4),
                  backgroundColor: colors.slice(0, departments.length),
                  borderColor: colors.slice(0, departments.length).map(color => color.replace('0.6', '1')),
                  borderWidth: 1
                },
                {
                  label: 'Total A3',
                  data: departments.map(dept => departmentQuantities[dept].totalA3),
                  backgroundColor: colors.slice(0, departments.length),
                  borderColor: colors.slice(0, departments.length).map(color => color.replace('0.6', '1')),
                  borderWidth: 1
                },
                {
                  label: 'Total A5',
                  data: departments.map(dept => departmentQuantities[dept].totalA5),
                  backgroundColor: colors.slice(0, departments.length),
                  borderColor: colors.slice(0, departments.length).map(color => color.replace('0.6', '1')),
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: false,
              maintainAspectRatio: true
            }}
          />
          {selectedChart.type === 'pie' && (
            <button onClick={() => exportToPNG('pie')}>Export Pie Chart to PNG</button>
          )}
        </div>

        <div className="chart-item">
          <h2>Total Quantities per User</h2>
          <Bar
            ref={el => userChartRef.current = el?.chartInstance}
            data={{
              labels: users,
              datasets: [
                {
                  label: 'A4',
                  data: users.map(user => totalQuantitiesPerUser[user].quantite_a4),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
                },
                {
                  label: 'A3',
                  data: users.map(user => totalQuantitiesPerUser[user].quantite_a3),
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 1
                },
                {
                  label: 'A5',
                  data: users.map(user => totalQuantitiesPerUser[user].quantite_a5),
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1
                }
              ]
            }}
            options={{
              maintainAspectRatio: false,
              responsive: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
          {selectedChart.type === 'user' && (
            <button onClick={() => exportToPNG('user')}>Export User Chart to PNG</button>
          )}
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={exportToExcel}>Export to Excel</button>
      </div>
    </div>
  );
}

export default ExportableChart;
