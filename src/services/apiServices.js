// Utility functions for API services
import api from '../utils/api';

// Member API services
export const memberService = {
  // Get all members with pagination
  getMembers: async (page = 1, limit = 10, search = '', status = '') => {
    let url = `/members?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single member by ID
  getMember: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
  
  // Create a new member
  createMember: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },
  
  // Update an existing member
  updateMember: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },
  
  // Delete a member
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  }
};

// Payment API services
export const paymentService = {
  // Get all payments with pagination
  getPayments: async (page = 1, limit = 10, search = '', status = '', memberId = '') => {
    let url = `/payments?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    if (memberId) url += `&member=${memberId}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single payment by ID
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  
  // Create a new payment
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  
  // Update an existing payment
  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },
  
  // Delete a payment
  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
};

// Expense API services
export const expenseService = {
  // Get all expenses with pagination
  getExpenses: async (page = 1, limit = 10, search = '', category = '') => {
    let url = `/expenses?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (category) url += `&category=${category}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single expense by ID
  getExpense: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  // Create a new expense
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  
  // Update an existing expense
  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  
  // Delete an expense
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  
  // Approve an expense
  approveExpense: async (id) => {
    const response = await api.put(`/expenses/${id}/approve`, {});
    return response.data;
  },
  
  // Reject an expense
  rejectExpense: async (id) => {
    const response = await api.put(`/expenses/${id}/reject`, {});
    return response.data;
  }
};

// Vehicle API services
export const vehicleService = {
  // Get all vehicles with pagination
  getVehicles: async (page = 1, limit = 10, search = '', status = '') => {
    let url = `/vehicles?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single vehicle by ID
  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  
  // Create a new vehicle
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },
  
  // Update an existing vehicle
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },
  
  // Delete a vehicle
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
  
  // Update vehicle status
  updateVehicleStatus: async (id, status) => {
    const response = await api.put(`/vehicles/${id}/status`, { status });
    return response.data;
  }
};

// Trip API services
export const tripService = {
  // Get all trips with pagination
  getTrips: async (page = 1, limit = 10, search = '', status = '', vehicleId = '') => {
    let url = `/trips?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    if (vehicleId) url += `&vehicle=${vehicleId}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single trip by ID
  getTrip: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },
  
  // Create a new trip
  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },
  
  // Update an existing trip
  updateTrip: async (id, tripData) => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data;
  },
  
  // Delete a trip
  deleteTrip: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },
  
  // Update trip status
  updateTripStatus: async (id, status) => {
    const response = await api.put(`/trips/${id}/status`, { status });
    return response.data;
  }
};

// Maintenance API services
export const maintenanceService = {
  // Get all maintenance records with pagination
  getMaintenanceRecords: async (page = 1, limit = 10, search = '', vehicleId = '') => {
    let url = `/maintenance?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (vehicleId) url += `&vehicle=${vehicleId}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get a single maintenance record by ID
  getMaintenanceRecord: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },
  
  // Create a new maintenance record
  createMaintenanceRecord: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },
  
  // Update an existing maintenance record
  updateMaintenanceRecord: async (id, maintenanceData) => {
    const response = await api.put(`/maintenance/${id}`, maintenanceData);
    return response.data;
  },
  
  // Delete a maintenance record
  deleteMaintenanceRecord: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
  
  // Update maintenance status
  updateMaintenanceStatus: async (id, status) => {
    const response = await api.put(`/maintenance/${id}/status`, { status });
    return response.data;
  }
};

// Report API services
export const reportService = {
  // Get member reports
  getMemberReport: async (startDate, endDate) => {
    const response = await api.get(`/reports/members?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  // Get financial reports
  getFinancialReport: async (startDate, endDate) => {
    const response = await api.get(`/reports/financial?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  // Get vehicle reports
  getVehicleReport: async (startDate, endDate) => {
    const response = await api.get(`/reports/vehicles?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  }
};

// Export all services
export const services = {
  member: memberService,
  payment: paymentService,
  expense: expenseService,
  vehicle: vehicleService,
  trip: tripService,
  maintenance: maintenanceService,
  report: reportService
};
