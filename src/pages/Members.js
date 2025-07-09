import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Form, InputGroup, Modal, Spinner, Alert, Pagination } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import MainLayout from '../components/MainLayout';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    fullName: {
      first: '',
      middle: '',
      last: ''
    },
    dateOfBirth: '',
    nationalId: '',
    contact: {
      phone: '',
      email: ''
    },
    primaryAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'المملكة العربية السعودية'
    },
    tribeAffiliation: '',
    membershipStatus: 'active'
  });
  
  const { token } = useSelector((state) => state.auth);
  const limit = 10;

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, statusFilter, token]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      let url = `http://localhost:8888/api/members?page=${currentPage}&limit=${limit}`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await axios.get(url, config);
      setMembers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalMembers(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل بيانات الأعضاء');
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

  const handleShowModal = (member = null) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        fullName: {
          first: member.fullName.first || '',
          middle: member.fullName.middle || '',
          last: member.fullName.last || ''
        },
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
        nationalId: member.nationalId || '',
        contact: {
          phone: member.contact?.phone || '',
          email: member.contact?.email || ''
        },
        primaryAddress: {
          street: member.primaryAddress?.street || '',
          city: member.primaryAddress?.city || '',
          state: member.primaryAddress?.state || '',
          postalCode: member.primaryAddress?.postalCode || '',
          country: member.primaryAddress?.country || 'المملكة العربية السعودية'
        },
        tribeAffiliation: member.tribeAffiliation || '',
        membershipStatus: member.membershipStatus || 'active'
      });
    } else {
      setSelectedMember(null);
      setFormData({
        fullName: {
          first: '',
          middle: '',
          last: ''
        },
        dateOfBirth: '',
        nationalId: '',
        contact: {
          phone: '',
          email: ''
        },
        primaryAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'المملكة العربية السعودية'
        },
        tribeAffiliation: '',
        membershipStatus: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (selectedMember) {
        // Update existing member
        await axios.put(
          `http://localhost:8888/api/members/${selectedMember._id}`,
          formData,
          config
        );
      } else {
        // Create new member
        await axios.post("http://localhost:8888/api/members", formData, config);
      }

      handleCloseModal();
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات العضو');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العضو؟')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        await axios.delete(`http://localhost:8888/api/members/${id}`, config);
        fetchMembers();
      } catch (err) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء حذف العضو');
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

  const getMembershipStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">نشط</span>;
      case 'inactive':
        return <span className="badge bg-warning">غير نشط</span>;
      case 'deceased':
        return <span className="badge bg-danger">متوفى</span>;
      case 'withdrawn':
        return <span className="badge bg-secondary">منسحب</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>إدارة الأعضاء</h2>
            <p className="text-muted">إجمالي الأعضاء: {totalMembers}</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              إضافة عضو جديد
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
                  placeholder="البحث بالاسم أو رقم الهوية"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="deceased">متوفى</option>
                <option value="withdrawn">منسحب</option>
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
          ) : members.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">لا توجد بيانات للعرض</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>رقم الهوية</th>
                    <th>رقم الهاتف</th>
                    <th>المدينة</th>
                    <th>حالة العضوية</th>
                    <th>تاريخ الانضمام</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>
                        {member.fullName.first} {member.fullName.middle} {member.fullName.last}
                      </td>
                      <td>{member.nationalId}</td>
                      <td>{member.contact?.phone}</td>
                      <td>{member.primaryAddress?.city}</td>
                      <td>{getMembershipStatusBadge(member.membershipStatus)}</td>
                      <td>
                        {member.joinDate ? new Date(member.joinDate).toLocaleDateString('ar-SA') : '-'}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowModal(member)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteMember(member._id)}
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

      {/* Member Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMember ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>الاسم الأول</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName.first"
                    value={formData.fullName.first}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>اسم الأب</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName.middle"
                    value={formData.fullName.middle}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>اسم العائلة</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName.last"
                    value={formData.fullName.last}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>تاريخ الميلاد</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>رقم الهوية</Form.Label>
                  <Form.Control
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>رقم الهاتف</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>البريد الإلكتروني</Form.Label>
                  <Form.Control
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>الشارع</Form.Label>
                  <Form.Control
                    type="text"
                    name="primaryAddress.street"
                    value={formData.primaryAddress.street}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>المدينة</Form.Label>
                  <Form.Control
                    type="text"
                    name="primaryAddress.city"
                    value={formData.primaryAddress.city}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>المنطقة</Form.Label>
                  <Form.Control
                    type="text"
                    name="primaryAddress.state"
                    value={formData.primaryAddress.state}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>الرمز البريدي</Form.Label>
                  <Form.Control
                    type="text"
                    name="primaryAddress.postalCode"
                    value={formData.primaryAddress.postalCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>القبيلة</Form.Label>
                  <Form.Control
                    type="text"
                    name="tribeAffiliation"
                    value={formData.tribeAffiliation}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>حالة العضوية</Form.Label>
                  <Form.Select
                    name="membershipStatus"
                    value={formData.membershipStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="deceased">متوفى</option>
                    <option value="withdrawn">منسحب</option>
                  </Form.Select>
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

export default Members;
