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

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    status: "available",
    currentOdometer: "",
    fuelType: "gasoline",
    registrationExpiry: "",
    insuranceExpiry: "",
    notes: "",
  });

  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm, statusFilter, token]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `http://localhost:8888/api/vehicles?page=${currentPage}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await axios.get(url, config);
      setVehicles(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalVehicles(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات المركبات"
      );
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || "",
        licensePlate: vehicle.licensePlate || "",
        status: vehicle.status || "available",
        currentOdometer: vehicle.currentOdometer || "",
        fuelType: vehicle.fuelType || "gasoline",
        registrationExpiry: vehicle.registrationExpiry
          ? new Date(vehicle.registrationExpiry).toISOString().split("T")[0]
          : "",
        insuranceExpiry: vehicle.insuranceExpiry
          ? new Date(vehicle.insuranceExpiry).toISOString().split("T")[0]
          : "",
        notes: vehicle.notes || "",
      });
    } else {
      setSelectedVehicle(null);
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear().toString(),
        licensePlate: "",
        status: "available",
        currentOdometer: "",
        fuelType: "gasoline",
        registrationExpiry: "",
        insuranceExpiry: "",
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

      if (selectedVehicle) {
        // Update existing vehicle
        await axios.put(
          `http://localhost:8888/api/vehicles/${selectedVehicle._id}`,
          formData,
          config
        );
      } else {
        // Create new vehicle
        await axios.post(
          "http://localhost:8888/api/vehicles",
          formData,
          config
        );
      }

      handleCloseModal();
      fetchVehicles();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء حفظ بيانات المركبة"
      );
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه المركبة؟")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`http://localhost:8888/api/vehicles/${id}`, config);
        fetchVehicles();
      } catch (err) {
        setError(err.response?.data?.message || "حدث خطأ أثناء حذف المركبة");
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
        `http://localhost:8888/api/vehicles/${id}/status`,
        { status: newStatus },
        config
      );
      fetchVehicles();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحديث حالة المركبة"
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
      case "available":
        return <span className="badge bg-success">متاح</span>;
      case "in_use":
        return <span className="badge bg-warning">قيد الاستخدام</span>;
      case "maintenance":
        return <span className="badge bg-danger">صيانة</span>;
      case "out_of_service":
        return <span className="badge bg-secondary">خارج الخدمة</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  const getFuelTypeName = (fuelType) => {
    switch (fuelType) {
      case "gasoline":
        return "بنزين";
      case "diesel":
        return "ديزل";
      case "electric":
        return "كهربائي";
      case "hybrid":
        return "هجين";
      default:
        return fuelType;
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة المركبات</h2>
            <p className="text-muted">إجمالي المركبات: {totalVehicles}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة مركبة جديدة
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
                  placeholder="البحث بالشركة المصنعة أو رقم اللوحة"
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
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">جميع الحالات</option>
                <option value="available">متاح</option>
                <option value="in_use">قيد الاستخدام</option>
                <option value="maintenance">صيانة</option>
                <option value="out_of_service">خارج الخدمة</option>
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
          ) : vehicles.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>الشركة المصنعة</th>
                    <th>الطراز</th>
                    <th>السنة</th>
                    <th>رقم اللوحة</th>
                    <th>قراءة العداد</th>
                    <th>نوع الوقود</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>{vehicle.make}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.year}</td>
                      <td>{vehicle.licensePlate}</td>
                      <td>{vehicle.currentOdometer} كم</td>
                      <td>{getFuelTypeName(vehicle.fuelType)}</td>
                      <td>{getStatusBadge(vehicle.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowModal(vehicle)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Dropdown className="d-inline-block me-1">
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            id={`status-dropdown-${vehicle._id}`}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(vehicle._id, "available")
                              }
                            >
                              متاح
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(vehicle._id, "in_use")
                              }
                            >
                              قيد الاستخدام
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(vehicle._id, "maintenance")
                              }
                            >
                              صيانة
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(
                                  vehicle._id,
                                  "out_of_service"
                                )
                              }
                            >
                              خارج الخدمة
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle._id)}
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

      {/* Vehicle Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedVehicle ? "تعديل بيانات المركبة" : "إضافة مركبة جديدة"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>الشركة المصنعة</Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>الطراز</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>السنة</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>رقم اللوحة</Form.Label>
                  <Form.Control
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>قراءة العداد الحالية (كم)</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentOdometer"
                    value={formData.currentOdometer}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>نوع الوقود</Form.Label>
                  <Form.Select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="gasoline">بنزين</option>
                    <option value="diesel">ديزل</option>
                    <option value="electric">كهربائي</option>
                    <option value="hybrid">هجين</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>تاريخ انتهاء التسجيل</Form.Label>
                  <Form.Control
                    type="date"
                    name="registrationExpiry"
                    value={formData.registrationExpiry}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>تاريخ انتهاء التأمين</Form.Label>
                  <Form.Control
                    type="date"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleInputChange}
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
                    <option value="available">متاح</option>
                    <option value="in_use">قيد الاستخدام</option>
                    <option value="maintenance">صيانة</option>
                    <option value="out_of_service">خارج الخدمة</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
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

export default Vehicles;
