import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate total quantity of 'a4' per department
  const a4QuantityByDepartment = data.reduce((acc, curr) => {
    if (!acc[curr.departement]) {
      acc[curr.departement] = 0;
    }
    acc[curr.departement] += curr.quantite_a4 || 0;
    return acc;
  }, {});

  // Prepare data for chart
  const chartData = {
    labels: Object.keys(a4QuantityByDepartment),
    datasets: [{
      label: 'Total Quantity of A4 per Department',
      data: Object.values(a4QuantityByDepartment),
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }]
  };

  // Customize chart options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="charts">
        <div className="chart">
          <Bar
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
