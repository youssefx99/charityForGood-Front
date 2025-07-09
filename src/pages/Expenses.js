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
} from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: "",
    purpose: "",
    approvalStatus: "pending",
    spentBy: "",
    notes: "",
    receiptImage: "",
  });

  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, searchTerm, categoryFilter, token]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses?page=${currentPage}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }

      const response = await axios.get(url, config);
      setExpenses(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalExpenses(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات المصروفات"
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

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (expense = null) => {
    if (expense) {
      setSelectedExpense(expense);
      setFormData({
        category: expense.category || "",
        amount: expense.amount || "",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : "",
        purpose: expense.purpose || "",
        approvalStatus: expense.approvalStatus || "pending",
        spentBy: expense.spentBy || "",
        notes: expense.notes || "",
        receiptImage: expense.receiptImage || "",
      });
    } else {
      setSelectedExpense(null);
      setFormData({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        purpose: "",
        approvalStatus: "pending",
        spentBy: "",
        notes: "",
        receiptImage: "",
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

      if (selectedExpense) {
        // Update existing expense
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses/${selectedExpense._id}`,
          formData,
          config
        );
      } else {
        // Create new expense
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses`,
          formData,
          config
        );
      }

      handleCloseModal();
      fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء حفظ بيانات المصروفات"
      );
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا المصروف؟")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses/${id}`, config);
        fetchExpenses();
      } catch (err) {
        setError(err.response?.data?.message || "حدث خطأ أثناء حذف المصروف");
      }
    }
  };

  const handleApproveExpense = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses/${id}/approve`,
        {},
        config
      );
      fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء الموافقة على المصروف"
      );
    }
  };

  const handleRejectExpense = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/expenses/${id}/reject`,
        {},
        config
      );
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء رفض المصروف");
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

  const getApprovalStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="badge bg-success">تمت الموافقة</span>;
      case "pending":
        return <span className="badge bg-warning">قيد الانتظار</span>;
      case "rejected":
        return <span className="badge bg-danger">مرفوض</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة المصروفات</h2>
            <p className="text-muted">إجمالي المصروفات: {totalExpenses}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة مصروف جديد
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
                  placeholder="البحث بالغرض أو المنفق"
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
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
              >
                <option value="">جميع الفئات</option>
                <option value="utilities">مرافق</option>
                <option value="rent">إيجار</option>
                <option value="salaries">رواتب</option>
                <option value="transportation">مواصلات</option>
                <option value="maintenance">صيانة</option>
                <option value="supplies">مستلزمات</option>
                <option value="events">فعاليات</option>
                <option value="other">أخرى</option>
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
          ) : expenses.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>الفئة</th>
                    <th>المبلغ</th>
                    <th>التاريخ</th>
                    <th>الغرض</th>
                    <th>المنفق</th>
                    <th>حالة الموافقة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{expense.category}</td>
                      <td>{expense.amount} جنية</td>
                      <td>
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString("ar-SA")
                          : "-"}
                      </td>
                      <td>{expense.purpose}</td>
                      <td>
                        {expense.spentBy?.fullName || expense.spentBy}
                      </td>{" "}
                      <td>{getApprovalStatusBadge(expense.approvalStatus)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowModal(expense)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {expense.approvalStatus === "pending" && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleApproveExpense(expense._id)}
                            >
                              <i className="bi bi-check-circle"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => handleRejectExpense(expense._id)}
                            >
                              <i className="bi bi-x-circle"></i>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense._id)}
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

      {/* Expense Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedExpense ? "تعديل بيانات المصروف" : "إضافة مصروف جديد"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>الفئة</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">اختر الفئة</option>
                    <option value="utilities">مرافق</option>
                    <option value="rent">إيجار</option>
                    <option value="salaries">رواتب</option>
                    <option value="transportation">مواصلات</option>
                    <option value="maintenance">صيانة</option>
                    <option value="supplies">مستلزمات</option>
                    <option value="events">فعاليات</option>
                    <option value="other">أخرى</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>المبلغ (جنية)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
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
                  <Form.Label>المنفق</Form.Label>
                  <Form.Control
                    type="text"
                    name="spentBy"
                    value={formData.spentBy}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
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
                  <Form.Label>حالة الموافقة</Form.Label>
                  <Form.Select
                    name="approvalStatus"
                    value={formData.approvalStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="approved">تمت الموافقة</option>
                    <option value="rejected">مرفوض</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>صورة الإيصال (اختياري)</Form.Label>
                  <Form.Control
                    type="text"
                    name="receiptImage"
                    value={formData.receiptImage}
                    onChange={handleInputChange}
                    placeholder="رابط الصورة"
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

export default Expenses;
