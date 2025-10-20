const analyticsService = require('./analyticsService');
const { ValidationError } = require('../../utils/errorHandler');

/**
 * Export report in various formats
 */
const exportReport = async (reportType, format, params, tenantId) => {
  // Validate report type
  const validReportTypes = ['sales', 'dishes', 'customers', 'staff', 'campaigns'];
  if (!validReportTypes.includes(reportType)) {
    throw new ValidationError('Invalid report type');
  }
  
  // Validate format
  const validFormats = ['json', 'csv', 'excel', 'pdf'];
  if (!validFormats.includes(format)) {
    throw new ValidationError('Invalid export format');
  }
  
  // Get data based on report type
  let data;
  switch (reportType) {
    case 'sales':
      data = await analyticsService.getSalesAnalytics(params, tenantId);
      break;
    case 'dishes':
      data = await analyticsService.getDishAnalytics(params, tenantId);
      break;
    case 'customers':
      data = await analyticsService.getCustomerAnalytics(params, tenantId);
      break;
    case 'staff':
      data = await analyticsService.getStaffAnalytics(params, tenantId);
      break;
    case 'campaigns':
      data = await analyticsService.getCampaignAnalytics(params, tenantId);
      break;
  }
  
  // Export based on format
  switch (format) {
    case 'json':
      return data;
    case 'csv':
      return exportToCSV(reportType, data);
    case 'excel':
      return exportToExcel(reportType, data);
    case 'pdf':
      return exportToPDF(reportType, data);
  }
};

/**
 * Export to CSV format
 */
const exportToCSV = (reportType, data) => {
  let csv = '';
  
  if (reportType === 'sales') {
    csv = 'Metric,Value\n';
    csv += `Total Orders,${data.summary.totalOrders}\n`;
    csv += `Total Revenue,${data.summary.totalRevenue}\n`;
    csv += `Average Order Value,${data.summary.averageOrderValue}\n`;
    csv += `Total Discount,${data.summary.totalDiscount}\n`;
  } else if (reportType === 'dishes') {
    csv = 'Dish Name,Category,Total Orders,Total Quantity,Total Revenue\n';
    data.allDishes.forEach(dish => {
      csv += `"${dish.name}","${dish.category}",${dish.totalOrders},${dish.totalQuantity},${dish.totalRevenue}\n`;
    });
  } else if (reportType === 'customers') {
    csv = 'Customer Name,Email,Total Spending,Order Count\n';
    data.topCustomers.forEach(customer => {
      csv += `"${customer.name}","${customer.email}",${customer.totalSpending},${customer.orderCount}\n`;
    });
  } else if (reportType === 'staff') {
    csv = 'Staff Name,Role,Total Orders,Total Sales,Average Order Value,Average Rating\n';
    data.allStaff.forEach(staff => {
      csv += `"${staff.name}","${staff.role}",${staff.totalOrders},${staff.totalSales},${staff.averageOrderValue},${staff.averageFeedbackRating}\n`;
    });
  } else if (reportType === 'campaigns') {
    csv = 'Campaign Name,Type,Status,Sent,Delivered,Opened,Clicked,Converted,Conversion Rate\n';
    data.forEach(campaign => {
      csv += `"${campaign.name}","${campaign.type}","${campaign.status}",${campaign.metrics.sent},${campaign.metrics.delivered},${campaign.metrics.opened},${campaign.metrics.clicked},${campaign.metrics.converted},${campaign.conversionRate}%\n`;
    });
  }
  
  return {
    data: Buffer.from(csv),
    contentType: 'text/csv',
    filename: `${reportType}-report-${Date.now()}.csv`
  };
};

/**
 * Export to Excel format (simplified - returns CSV for now)
 */
const exportToExcel = (reportType, data) => {
  // In production, use a library like exceljs or xlsx
  // For now, return CSV with Excel content type
  const csvResult = exportToCSV(reportType, data);
  return {
    ...csvResult,
    contentType: 'application/vnd.ms-excel',
    filename: `${reportType}-report-${Date.now()}.xls`
  };
};

/**
 * Export to PDF format (simplified - returns JSON for now)
 */
const exportToPDF = (reportType, data) => {
  // In production, use a library like pdfkit or puppeteer
  // For now, return JSON representation
  const jsonData = JSON.stringify(data, null, 2);
  return {
    data: Buffer.from(jsonData),
    contentType: 'application/pdf',
    filename: `${reportType}-report-${Date.now()}.pdf`
  };
};

module.exports = {
  exportReport
};
