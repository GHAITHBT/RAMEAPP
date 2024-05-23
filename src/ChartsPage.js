import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ChartsPage1.css';
import ZoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin

// Register the necessary components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, ZoomPlugin);

function ExportableChart() {
  const barChartRefs = useRef([]);
  const pieChartRef = useRef(null);
  const userChartRef = useRef(null);

  const [data, setData] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [topDepartments, setTopDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-data');
        setData(response.data);

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

  // Add zoom plugin options
  const zoomOptions = {
    pan: {
      enabled: true,
      mode: 'xy',
      rangeMin: {
        x: null,
        y: null,
      },
      rangeMax: {
        x: null,
        y: null,
      },
    },
    zoom: {
      wheel: {
        enabled: true,
      },
      pinch: {
        enabled: true,
      },
      mode: 'xy',
      rangeMin: {
        x: null,
        y: null,
      },
      rangeMax: {
        x: null,
        y: null,
      },
    },
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: 'Charts Data',
      Author: 'Your Name',
    };
    wb.SheetNames.push('Bar Chart Data');
    const wsBar = XLSX.utils.json_to_sheet(
      departments.map((dept) => ({
        Department: dept,
        'Total A4': departmentQuantities[dept].totalA4,
        'Total A3': departmentQuantities[dept].totalA3,
        'Total A5': departmentQuantities[dept].totalA5,
      }))
    );
    wb.Sheets['Bar Chart Data'] = wsBar;

    wb.SheetNames.push('Pie Chart Data');
    const wsPie = XLSX.utils.json_to_sheet(
      departments.map((dept, index) => ({
        Department: dept,
        'Total A4': departmentQuantities[dept].totalA4,
        'Total A3': departmentQuantities[dept].totalA3,
        'Total A5': departmentQuantities[dept].totalA5,
        Color: colors[index % colors.length],
      }))
    );
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
      downloadLink.click();
    }
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF('landscape');
    const scaleFactor = window.devicePixelRatio || 1;
    const currentDate = new Date();
    const chartDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/T/g, '_').slice(0, -5); // Format: YYYY-MM-DD_HH-MM

    for (let i = 0; i < barChartRefs.current.length; i++) {
      const chartCanvas = barChartRefs.current[i].canvas;
      if (chartCanvas) {
        const chartImage = await html2canvas(chartCanvas, {
          scale: scaleFactor,
          useCORS: true,
          logging: true, // Enable logging for debugging
          allowTaint: false, // Disable taint on the canvas
          quality: 5000,
        });
        const imgData = chartImage.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        if (i < barChartRefs.current.length - 1) {
          pdf.addPage();
        }
      }
    }

    const userChartCanvas = userChartRef.current?.canvas;
    if (userChartCanvas) {
      const userChartImage = await html2canvas(userChartCanvas, { scale: scaleFactor });
      const imgData = userChartImage.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
    }

    pdf.save(`charts_${chartDateTime}.pdf`);
};

  
  return (
    <div style={{marginTop: "70px"}}>
      <button onClick={exportToPDF}>Export to PDF</button>

      <div className="chart-grid">
        {departments.map((dept, index) => (
          <div className="chart-container" key={dept}>
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
                  zoom: zoomOptions,
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
      </div>

     

      <div className="chart-container">
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
              zoom: zoomOptions,
              title: {
                display: true,
                text: 'Total Quantities by User',
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default ExportableChart;