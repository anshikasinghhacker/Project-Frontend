interface Result {
  id: number;
  testName: string;
  testType: string;
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  rank?: number;
  totalStudents?: number;
}

export const generateCSVReport = (results: Result[], userName: string) => {
  // Create CSV headers
  const headers = [
    'Test Name',
    'Type',
    'Subject',
    'Date',
    'Score',
    'Total Marks',
    'Percentage',
    'Status',
    'Rank',
  ];

  // Create CSV rows
  const rows = results.map(result => [
    result.testName,
    result.testType,
    result.subject,
    new Date(result.date).toLocaleDateString(),
    result.score.toString(),
    result.totalMarks.toString(),
    `${result.percentage}%`,
    result.status,
    result.rank ? `${result.rank}/${result.totalStudents}` : 'N/A',
  ]);

  // Combine headers and rows
  const csvContent = [
    `Performance Report - ${userName}`,
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    'Summary Statistics',
    `Total Tests: ${results.length}`,
    `Average Score: ${Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)}%`,
    `Best Score: ${Math.max(...results.map(r => r.percentage))}%`,
    `Tests Passed: ${results.filter(r => r.status === 'Pass').length}`,
    `Tests Failed: ${results.filter(r => r.status === 'Fail').length}`,
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `performance_report_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generatePDFReport = (results: Result[], userName: string) => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Performance Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #1976d2;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 10px;
          }
          h2 {
            color: #555;
            margin-top: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #1976d2;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .pass {
            color: green;
            font-weight: bold;
          }
          .fail {
            color: red;
            font-weight: bold;
          }
          .summary {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
          }
          .summary-item {
            margin: 10px 0;
            font-size: 16px;
          }
          .header-info {
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Performance Report</h1>
        <div class="header-info">
          <p><strong>Student:</strong> ${userName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <h2>Test Results</h2>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(result => `
              <tr>
                <td>${result.testName}</td>
                <td>${result.testType}</td>
                <td>${result.subject}</td>
                <td>${new Date(result.date).toLocaleDateString()}</td>
                <td>${result.score}/${result.totalMarks}</td>
                <td>${result.percentage}%</td>
                <td class="${result.status.toLowerCase()}">${result.status}</td>
                <td>${result.rank ? `${result.rank}/${result.totalStudents}` : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h2>Summary Statistics</h2>
          <div class="summary-item">📊 <strong>Total Tests:</strong> ${results.length}</div>
          <div class="summary-item">📈 <strong>Average Score:</strong> ${Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)}%</div>
          <div class="summary-item">🏆 <strong>Best Score:</strong> ${Math.max(...results.map(r => r.percentage))}%</div>
          <div class="summary-item">✅ <strong>Tests Passed:</strong> ${results.filter(r => r.status === 'Pass').length}</div>
          <div class="summary-item">❌ <strong>Tests Failed:</strong> ${results.filter(r => r.status === 'Fail').length}</div>
        </div>
        
        <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px;">
          <p>© 2025 Educator Platform - Performance Report</p>
        </div>
      </body>
    </html>
  `;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

export const downloadReport = (results: Result[], userName: string, format: 'csv' | 'pdf' = 'csv') => {
  if (format === 'csv') {
    generateCSVReport(results, userName);
  } else {
    generatePDFReport(results, userName);
  }
};