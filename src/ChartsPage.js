import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ChartsPage1.css';
 
// Register the necessary components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);
 
function ExportableChart() {
  const barChartRefs = useRef([]);
  const barChartRefs1 = useRef([]);
  const barChartRefs2 = useRef([]);
  const pieChartRef = useRef(null);
  const userChartRef = useRef(null);
 
  const [data, setData] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [topDepartments, setTopDepartments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [uniqueMonths, setUniqueMonths] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.110.22.39:3001/get-data');
        setData(response.data);
 
        // Calculate unique months
        const months = Array.from(new Set(response.data.map(item => format(parseISO(item.date_reception), 'yyyy-MM')))).sort();
        setUniqueMonths(months);
 
        // Calculate top 10 requesting employees
        const totalQuantitiesPerUser = response.data.reduce((acc, curr) => {
          const user = curr.employe_demandeur || 'Unknown';
          if (!acc[user]) {
            acc[user] = { total: 0 };
          }
          acc[user].total += (curr.quantite_a4 || 0) + (curr.quantite_a3 || 0) + (curr.quantite_a5 || 0);
          return acc;
        }, {});
 
        const sortedTopEmployees = Object.entries(totalQuantitiesPerUser)
          .sort(([, a], [, b]) => b.total - a.total)
          .slice(0, 10)
          .map(([user, { total }]) => ({ user, total }));
 
        setTopEmployees(sortedTopEmployees);
 
        // Calculate top departments
        const totalQuantitiesPerDepartment = response.data.reduce((acc, curr) => {
          const department = curr.departement || 'Unknown';
          if (!acc[department]) {
            acc[department] = 0;
          }
          acc[department] += (curr.quantite_a4 || 0) + (curr.quantite_a3 || 0) + (curr.quantite_a5 || 0);
          return acc;
        }, {});
 
        const sortedTopDepartments = Object.entries(totalQuantitiesPerDepartment)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([department, total]) => ({ department, total }));
 
        setTopDepartments(sortedTopDepartments);
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
 
  const exportToPDF = async () => {
    const pdf = new jsPDF('landscape');
    const scaleFactor = window.devicePixelRatio || 1;
    const currentDate = new Date();
    const chartDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/T/g, '_').slice(0, -5); // Format: YYYY-MM-DD_HH-MM
 
    const allCharts = [...barChartRefs.current, pieChartRef.current, userChartRef.current,barChartRefs1.current,barChartRefs2.current]; // Include all chart refs
 
    for (let i = 0; i < allCharts.length; i++) {
      const chartCanvas = allCharts[i]?.canvas;
      if (chartCanvas) {
        const chartImage = await html2canvas(chartCanvas, {
          scale: scaleFactor,
          useCORS: true,
          logging: true, // Enable logging for debugging
          allowTaint: false, // Disable taint on the canvas
          quality: 50000,
        });
        const imgData = chartImage.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
 
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        if (i < allCharts.length - 1) {
          pdf.addPage();
        }
      }
    }
 
    pdf.save(`Charts_${chartDateTime}.pdf`);
  };
 
  const topDepartmentsLabels = topDepartments.map(item => item.department);
  const topDepartmentsData = topDepartments.map(item => item.total);
 
  const filteredData = selectedMonth ? data.filter(item => format(parseISO(item.date_reception), 'yyyy-MM') === selectedMonth) : data;
 
  const totalQuantitiesPerMonthForEmployees = filteredData.reduce((acc, curr) => {
    const user = curr.employe_demandeur || 'Unknown';
    const date = format(parseISO(curr.date_reception), 'yyyy-MM');
    if (!acc[user]) {
      acc[user] = {};
    }
    if (!acc[user][date]) {
      acc[user][date] = { quantite_a4: 0, quantite_a3: 0, quantite_a5: 0 };
    }
    acc[user][date].quantite_a4 += curr.quantite_a4 || 0;
    acc[user][date].quantite_a3 += curr.quantite_a3 || 0;
    acc[user][date].quantite_a5 += curr.quantite_a5 || 0;
    return acc;
  }, {});
 
  const totalQuantitiesPerMonthForDepartments = filteredData.reduce((acc, curr) => {
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
  }, {});return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={exportToPDF}>Export to PDF</button>
     
     
 
      <div className="chart-grid">
        {departments.map((dept, index) => (
          <div className="chart-container" key={dept} style={{ width: '490px', height: '600px' }}>
            <h3>{`Department: ${dept}`}</h3>
            <Bar
              ref={(el) => (barChartRefs.current[index] = el)}
              data={{
                labels: dates,
                datasets: [
                  {
                    label: `Quantité A4 - ${dept}`,
                    data: dates.map((date) => totalQuantitiesPerMonth[dept][date]?.quantite_a4 || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  },
                  {
                    label: `Quantité A3 - ${dept}`,
                    data: dates.map((date) => totalQuantitiesPerMonth[dept][date]?.quantite_a3 || 0),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                  },
                  {
                    label: `Quantité A5 - ${dept}`,
                    data: dates.map((date) => totalQuantitiesPerMonth[dept][date]?.quantite_a5 || 0),
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  },
                ],
              }}
              options={{
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  title: {
                    display: true,
                    text: `Quantities per Month for ${dept}`,
                  },
                },
              }}
            />
          </div>
        ))}
 
        <div className="chart-container" style={{ width: '600px', height: '600px' }}>
          <h3>Top Departments by Quantity</h3>
          <Bar
            ref={pieChartRef} // Ref for top departments chart
            data={{
              labels: topDepartmentsLabels,
              datasets: [
                {
                  label: 'Total Quantity',
                  data: topDepartmentsData,
                  backgroundColor: colors,
                },
              ],
            }}
            options={{
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Top Departments by Quantity',
                },
              },
            }}
          />
        </div>
 
        <div className="chart-container" style={{ width: '600px', height: '600px' }}>
          <h3>Total Quantities by User</h3>
          <Bar
            ref={userChartRef}
            data={{
              labels: users,
              datasets: [
                {
                  label: 'Quantité A4',
                  data: users.map((user) => totalQuantitiesPerUser[user].quantite_a4),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: 'Quantité A3',
                  data: users.map((user) => totalQuantitiesPerUser[user].quantite_a3),
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
                {
                  label: 'Quantité A5',
                  data: users.map((user) => totalQuantitiesPerUser[user].quantite_a5),
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
              ],
            }}
            options={{
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Total Quantities by User',
                },
              },
            }}
          />
        </div>
 
        <div className="chart-container" style={{ width: '600px', height: '600px' }}>
          <h3>Total Quantities per Month for Employees</h3>
          <Bar
           ref={barChartRefs1}
            data={{
              labels: dates,
              datasets: users.map((user, index) => ({
                label: user,
                data: dates.map((date) => totalQuantitiesPerMonthForEmployees[user][date]?.quantite_a4 || 0),
                backgroundColor: colors[index % colors.length],
              })),
            }}
            options={{
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Total Quantities per Month for Employees',
                },
              },
            }}
          />
        </div>
 
        <div className="chart-container" style={{ width: '600px', height: '600px' }}>
          <h3>Total Quantities per Month for Departments</h3>
          <Bar
           ref={barChartRefs2}
            data={{
              labels: dates,
              datasets: departments.map((dept, index) => ({
                label: dept,
                data: dates.map((date) => totalQuantitiesPerMonthForDepartments[dept][date]?.quantite_a4 || 0),
                backgroundColor: colors[index % colors.length],
              })),
            }}
            options={{
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Total Quantities per Month for Departments',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
 
export default ExportableChart;