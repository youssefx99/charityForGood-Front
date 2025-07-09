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

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formData, setFormData] = useState({
    vehicle: "",
    purpose: "",
    startDate: "",
    endDate: "",
    startOdometer: "",
    endOdometer: "",
    destination: "",
    driver: "",
    status: "scheduled",
    notes: "",
  });

  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
  }, [currentPage, searchTerm, statusFilter, token]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `http://localhost:8888/api/trips?page=${currentPage}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await axios.get(url, config);
      setTrips(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalTrips(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات الرحلات"
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
        "http://localhost:8888/api/vehicles?status=available&limit=1000",
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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (trip = null) => {
    if (trip) {
      setSelectedTrip(trip);
      setFormData({
        vehicle: trip.vehicle?._id || "",
        purpose: trip.purpose || "",
        startDate: trip.startDate
          ? new Date(trip.startDate).toISOString().split("T")[0]
          : "",
        endDate: trip.endDate
          ? new Date(trip.endDate).toISOString().split("T")[0]
          : "",
        startOdometer: trip.startOdometer || "",
        endOdometer: trip.endOdometer || "",
        destination: trip.destination || "",
        driver: trip.driver || "",
        status: trip.status || "scheduled",
        notes: trip.notes || "",
      });
    } else {
      setSelectedTrip(null);
      setFormData({
        vehicle: "",
        purpose: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        startOdometer: "",
        endOdometer: "",
        destination: "",
        driver: "",
        status: "scheduled",
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

      if (selectedTrip) {
        // Update existing trip
        await axios.put(
          `http://localhost:8888/api/trips/${selectedTrip._id}`,
          formData,
          config
        );
      } else {
        // Create new trip
        await axios.post("http://localhost:8888/api/trips", formData, config);
      }

      handleCloseModal();
      fetchTrips();
      fetchVehicles(); // Refresh vehicles as their status might change
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء حفظ بيانات الرحلة"
      );
    }
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه الرحلة؟")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`http://localhost:8888/api/trips/${id}`, config);
        fetchTrips();
        fetchVehicles(); // Refresh vehicles as their status might change
      } catch (err) {
        setError(err.response?.data?.message || "حدث خطأ أثناء حذف الرحلة");
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
        `http://localhost:8888/api/trips/${id}/status`,
        { status: newStatus },
        config
      );
      fetchTrips();
      fetchVehicles(); // Refresh vehicles as their status might change
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحديث حالة الرحلة"
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

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة الرحلات</h2>
            <p className="text-muted">إجمالي الرحلات: {totalTrips}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة رحلة جديدة
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
                  placeholder="البحث بالغرض أو الوجهة أو السائق"
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
                <option value="scheduled">مجدولة</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
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
          ) : trips.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>المركبة</th>
                    <th>الغرض</th>
                    <th>الوجهة</th>
                    <th>تاريخ البداية</th>
                    <th>تاريخ النهاية</th>
                    <th>السائق</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip._id}>
                      <td>
                        {trip.vehicle
                          ? `${trip.vehicle.make} ${trip.vehicle.model}`
                          : "غير محدد"}
                      </td>
                      <td>{trip.purpose}</td>
                      <td>{trip.destination}</td>
                      <td>
                        {trip.startDate
                          ? new Date(trip.startDate).toLocaleDateString("ar-SA")
                          : "-"}
                      </td>
                      <td>
                        {trip.endDate
                          ? new Date(trip.endDate).toLocaleDateString("ar-SA")
                          : "-"}
                      </td>
                      <td>{trip.driver?.fullName || "غير محدد"}</td>
                      <td>{getStatusBadge(trip.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowModal(trip)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Dropdown className="d-inline-block me-1">
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            id={`status-dropdown-${trip._id}`}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(trip._id, "scheduled")
                              }
                            >
                              مجدولة
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(trip._id, "in_progress")
                              }
                            >
                              قيد التنفيذ
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(trip._id, "completed")
                              }
                            >
                              مكتملة
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleUpdateStatus(trip._id, "cancelled")
                              }
                            >
                              ملغاة
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteTrip(trip._id)}
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

      {/* Trip Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTrip ? "تعديل بيانات الرحلة" : "إضافة رحلة جديدة"}
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
                  <Form.Label>الغرض</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>تاريخ البداية</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>تاريخ النهاية</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>قراءة العداد عند البداية</Form.Label>
                  <Form.Control
                    type="number"
                    name="startOdometer"
                    value={formData.startOdometer}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>قراءة العداد عند النهاية</Form.Label>
                  <Form.Control
                    type="number"
                    name="endOdometer"
                    value={formData.endOdometer}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>الوجهة</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>السائق</Form.Label>
                  <Form.Control
                    type="text"
                    name="driver"
                    value={formData.driver}
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

export default Trips;
