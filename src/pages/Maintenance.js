import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Alert,
  Pagination,
  Dropdown,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    vehicle: "",
    maintenanceType: "",
    description: "",
    date: "",
    cost: "",
    odometer: "",
    serviceProvider: "",
    status: "scheduled",
    nextMaintenanceDate: "",
    notes: "",
  });

  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchVehicles();
  }, [currentPage, searchTerm, vehicleFilter, token]);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/maintenance?page=${currentPage}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (vehicleFilter) {
        url += `&vehicle=${vehicleFilter}`;
      }

      const response = await axios.get(url, config);
      setMaintenanceRecords(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalRecords(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل سجلات الصيانة"
      );
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/vehicles?limit=1000`,
        config
      );
      setVehicles(response.data.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleVehicleFilterChange = (e) => {
    setVehicleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (record = null) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        vehicle: record.vehicle?._id || "",
        maintenanceType: record.maintenanceType || "",
        description: record.description || "",
        date: record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : "",
        cost: record.cost || "",
        odometer: record.odometer || "",
        serviceProvider: record.serviceProvider || "",
        status: record.status || "scheduled",
        nextMaintenanceDate: record.nextMaintenanceDate
          ? new Date(record.nextMaintenanceDate).toISOString().split("T")[0]
          : "",
        notes: record.notes || "",
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        vehicle: "",
        maintenanceType: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        cost: "",
        odometer: "",
        serviceProvider: "",
        status: "scheduled",
        nextMaintenanceDate: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (selectedRecord) {
        // Update existing maintenance record
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/maintenance/${selectedRecord._id}`,
          formData,
          config
        );
      } else {
        // Create new maintenance record
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/maintenance`,
          formData,
          config
        );
      }

      handleCloseModal();
      fetchMaintenanceRecords();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء حفظ سجل الصيانة");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف سجل الصيانة هذا؟")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/maintenance/${id}`,
          config
        );
        fetchMaintenanceRecords();
      } catch (err) {
        setError(
          err.response?.data?.message || "حدث خطأ أثناء حذف سجل الصيانة"
        );
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/maintenance/${id}/status`,
        { status: newStatus },
        config
      );
      fetchMaintenanceRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحديث حالة الصيانة"
      );
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return <span className="badge bg-info">مجدولة</span>;
      case "in_progress":
        return <span className="badge bg-warning">قيد التنفيذ</span>;
      case "completed":
        return <span className="badge bg-success">مكتملة</span>;
      case "cancelled":
        return <span className="badge bg-danger">ملغاة</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getMaintenanceTypeName = (type) => {
    switch (type) {
      case "oil_change":
        return "تغيير زيت";
      case "tire_rotation":
        return "تبديل إطارات";
      case "brake_service":
        return "صيانة فرامل";
      case "engine_repair":
        return "إصلاح محرك";
      case "transmission":
        return "صيانة ناقل الحركة";
      case "electrical":
        return "صيانة كهربائية";
      case "inspection":
        return "فحص دوري";
      case "other":
        return "أخرى";
      default:
        return type;
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة الصيانة</h2>
            <p className="text-muted">إجمالي سجلات الصيانة: {totalRecords}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة سجل صيانة جديد
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={8}>
              <InputGroup>
                <Form.Control
                  placeholder="البحث بنوع الصيانة أو الوصف أو مزود الخدمة"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={vehicleFilter}
                onChange={handleVehicleFilterChange}
              >
                <option value="">جميع المركبات</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : maintenanceRecords.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>المركبة</th>
                    <th>نوع الصيانة</th>
                    <th>التاريخ</th>
                    <th>التكلفة</th>
                    <th>قراءة العداد</th>
                    <th>مزود الخدمة</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td>
                        {record.vehicle
                          ? `${record.vehicle.make} ${record.vehicle.model}`
                          : "غير محدد"}
                      </td>
                      <td>{getMaintenanceTypeName(record.maintenanceType)}</td>
                      <td>
                        {record.date
                          ? new Date(record.date).toLocaleDateString("ar-SA")
                          : "-"}
                      </td>
                      <td>{record.cost} جنية</td>
                      <td>{record.odometer} كم</td>
                      <td>{record.serviceProvider}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowModal(record)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Dropdown className="d-inline-block me-1">
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            id={`status-dropdown-${record._id}`}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(record._id, "scheduled")
                              }
                            >
                              مجدولة
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(record._id, "in_progress")
                              }
                            >
                              قيد التنفيذ
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(record._id, "completed")
                              }
                            >
                              مكتملة
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(record._id, "cancelled")
                              }
                            >
                              ملغاة
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteRecord(record._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {renderPagination()}
        </Card.Body>
      </Card>

      {/* Maintenance Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRecord ? "تعديل سجل الصيانة" : "إضافة سجل صيانة جديد"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>المركبة</Form.Label>
                  <Form.Select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">اختر المركبة</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>نوع الصيانة</Form.Label>
                  <Form.Select
                    name="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">اختر نوع الصيانة</option>
                    <option value="oil_change">تغيير زيت</option>
                    <option value="tire_rotation">تبديل إطارات</option>
                    <option value="brake_service">صيانة فرامل</option>
                    <option value="engine_repair">إصلاح محرك</option>
                    <option value="transmission">صيانة ناقل الحركة</option>
                    <option value="electrical">صيانة كهربائية</option>
                    <option value="inspection">فحص دوري</option>
                    <option value="other">أخرى</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>الوصف</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>التاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>التكلفة (جنية)</Form.Label>
                  <Form.Control
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>قراءة العداد (كم)</Form.Label>
                  <Form.Control
                    type="number"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>مزود الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceProvider"
                    value={formData.serviceProvider}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>الحالة</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="scheduled">مجدولة</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغاة</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>تاريخ الصيانة القادمة</Form.Label>
                  <Form.Control
                    type="date"
                    name="nextMaintenanceDate"
                    value={formData.nextMaintenanceDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>ملاحظات</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              حفظ
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default Maintenance;
