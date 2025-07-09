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

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    member: "",
    amount: "",
    paymentDate: "",
    dueDate: "",
    paymentMethod: "cash",
    paymentType: "membership_fee",
    isPaid: true,
    isInstallment: false,
    totalAmount: "",
    installmentCount: "",
    paidInstallments: "",
    notes: "",
  });

  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, [currentPage, searchTerm, dateFilter, token]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/payments?page=${currentPage}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      const response = await axios.get(url, config);
      setPayments(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalPayments(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات المدفوعات"
      );
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/members?limit=1000`,
        config
      );
      setMembers(response.data.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (payment = null) => {
    if (payment) {
      setSelectedPayment(payment);
      setFormData({
        member: payment.member?._id || "",
        amount: payment.amount || "",
        paymentDate: payment.paymentDate
          ? new Date(payment.paymentDate).toISOString().split("T")[0]
          : "",
        dueDate: payment.dueDate
          ? new Date(payment.dueDate).toISOString().split("T")[0]
          : "",
        paymentMethod: payment.paymentMethod || "cash",
        paymentType: payment.paymentType || "membership_fee",
        isPaid: payment.isPaid || true,
        isInstallment: payment.isInstallment || false,
        totalAmount: payment.totalAmount || "",
        installmentCount: payment.installmentCount || "",
        paidInstallments: payment.paidInstallments || "",
        notes: payment.notes || "",
      });
    } else {
      setSelectedPayment(null);
      setFormData({
        member: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        paymentMethod: "cash",
        paymentType: "membership_fee",
        isPaid: true,
        isInstallment: false,
        totalAmount: "",
        installmentCount: "",
        paidInstallments: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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

      if (selectedPayment) {
        // Update existing payment
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/payments/${selectedPayment._id}`,
          formData,
          config
        );
      } else {
        // Create new payment
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/payments`,
          formData,
          config
        );
      }

      handleCloseModal();
      fetchPayments();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء حفظ بيانات المدفوعات"
      );
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه المدفوعات؟")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:8888/api'}/payments/${id}`, config);
        fetchPayments();
      } catch (err) {
        setError(err.response?.data?.message || "حدث خطأ أثناء حذف المدفوعات");
      }
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

  const getPaymentStatusBadge = (isPaid) => {
    return isPaid ? (
      <span className="badge bg-success">مدفوع</span>
    ) : (
      <span className="badge bg-warning">غير مدفوع</span>
    );
  };

  const getPaymentTypeName = (type) => {
    switch (type) {
      case "membership_fee":
        return "رسوم عضوية";
      case "donation":
        return "تبرع";
      case "event_fee":
        return "رسوم فعالية";
      case "other":
        return "أخرى";
      default:
        return type;
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case "cash":
        return "نقدي";
      case "bank_transfer":
        return "تحويل بنكي";
      case "credit_card":
        return "بطاقة ائتمان";
      case "check":
        return "شيك";
      default:
        return method;
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة المدفوعات</h2>
            <p className="text-muted">إجمالي المدفوعات: {totalPayments}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة مدفوعات جديدة
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
                  placeholder="البحث باسم العضو أو رقم المرجع"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={handleDateFilterChange}
                placeholder="تصفية حسب التاريخ"
              />
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
          ) : payments.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>العضو</th>
                    <th>المبلغ</th>
                    <th>نوع المدفوعات</th>
                    <th>طريقة الدفع</th>
                    <th>تاريخ الدفع</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        {payment.member
                          ? `${payment.member.fullName?.first || ""} ${
                              payment.member.fullName?.last || ""
                            }`
                          : "غير محدد"}
                      </td>
                      <td>{payment.amount} جنية</td>
                      <td>{getPaymentTypeName(payment.paymentType)}</td>
                      <td>{getPaymentMethodName(payment.paymentMethod)}</td>
                      <td>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString(
                              "ar-SA"
                            )
                          : "-"}
                      </td>
                      <td>
                        {payment.dueDate
                          ? new Date(payment.dueDate).toLocaleDateString(
                              "ar-SA"
                            )
                          : "-"}
                      </td>
                      <td>{getPaymentStatusBadge(payment.isPaid)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowModal(payment)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeletePayment(payment._id)}
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

      {/* Payment Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPayment ? "تعديل بيانات المدفوعات" : "إضافة مدفوعات جديدة"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>العضو</Form.Label>
                  <Form.Select
                    name="member"
                    value={formData.member}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">اختر العضو</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.fullName.first} {member.fullName.middle}{" "}
                        {member.fullName.last}
                      </option>
                    ))}
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
                  <Form.Label>تاريخ الدفع</Form.Label>
                  <Form.Control
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>تاريخ الاستحقاق</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>طريقة الدفع</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="credit_card">بطاقة ائتمان</option>
                    <option value="check">شيك</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>نوع المدفوعات</Form.Label>
                  <Form.Select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="membership_fee">رسوم عضوية</option>
                    <option value="donation">تبرع</option>
                    <option value="event_fee">رسوم فعالية</option>
                    <option value="other">أخرى</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="تم الدفع"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="دفعة بالتقسيط"
                    name="isInstallment"
                    checked={formData.isInstallment}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.isInstallment && (
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>المبلغ الإجمالي</Form.Label>
                    <Form.Control
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      required={formData.isInstallment}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>عدد الأقساط</Form.Label>
                    <Form.Control
                      type="number"
                      name="installmentCount"
                      value={formData.installmentCount}
                      onChange={handleInputChange}
                      required={formData.isInstallment}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>الأقساط المدفوعة</Form.Label>
                    <Form.Control
                      type="number"
                      name="paidInstallments"
                      value={formData.paidInstallments}
                      onChange={handleInputChange}
                      required={formData.isInstallment}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

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

export default Payments;
