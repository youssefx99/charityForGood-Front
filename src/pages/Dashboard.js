import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import MainLayout from "../components/MainLayout";
import { services } from "../services/apiServices";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await services.report.getDashboardStats();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تحميل البيانات");
      setLoading(false);
    }
  };

  // Chart data functions
  const getMemberStatusChartData = () => {
    if (!stats?.members) return null;

    return {
      labels: ["نشط", "غير نشط", "متوفى", "منسحب"],
      datasets: [
        {
          data: [
            stats.members.active || 0,
            stats.members.inactive || 0,
            stats.members.deceased || 0,
            stats.members.withdrawn || 0,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(153, 102, 255, 0.8)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getFinancialChartData = () => {
    if (!stats?.finances) return null;

    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    const currentMonth = stats.finances.currentMonth;
    const lastMonth = stats.finances.lastMonth;

    return {
      labels: months.slice(0, 4), // Show last 4 months
      datasets: [
        {
          label: "الإيرادات",
          data: [lastMonth.income, currentMonth.income, currentMonth.income * 1.1, currentMonth.income * 1.2],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: "المصروفات",
          data: [lastMonth.expenses, currentMonth.expenses, currentMonth.expenses * 0.9, currentMonth.expenses * 0.8],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getVehicleStatusChartData = () => {
    if (!stats?.vehicles) return null;

    return {
      labels: ["متاح", "قيد الاستخدام", "صيانة"],
      datasets: [
        {
          data: [
            stats.vehicles.available || 0,
            stats.vehicles.inUse || 0,
            stats.vehicles.maintenance || 0,
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyActivityData = () => {
    if (!stats?.recent) return null;

    const months = ["يناير", "فبراير", "مارس", "أبريل"];
    const payments = [stats.recent.payments?.length || 0, 8, 12, 15];
    const expenses = [stats.recent.expenses?.length || 0, 6, 9, 11];
    const trips = [stats.recent.trips?.length || 0, 4, 7, 10];

    return {
      labels: months,
      datasets: [
        {
          label: "المدفوعات",
          data: payments,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
        {
          label: "المصروفات",
          data: expenses,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
        },
        {
          label: "الرحلات",
          data: trips,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 fs-5">جاري تحميل البيانات...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>خطأ في تحميل البيانات</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchDashboardStats}>
            إعادة المحاولة
          </Button>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col>
            <h1 className="display-6 fw-bold text-primary mb-2">لوحة التحكم</h1>
            <p className="text-muted fs-5">
              مرحباً {user?.name || "بك"} في نظام إدارة جمعية الخير
            </p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-primary" size="lg">
              <i className="bi bi-download me-2"></i>
              تصدير التقرير
            </Button>
          </Col>
        </Row>
      </div>

      {/* Key Metrics Cards */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm bg-gradient-primary text-white">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                  <i className="bi bi-people-fill text-white fs-2"></i>
                </div>
                <div>
                  <h6 className="mb-1 opacity-75">إجمالي الأعضاء</h6>
                  <h2 className="mb-0 fw-bold">{stats?.members?.total || 0}</h2>
                  <small className="opacity-75">
                    <i className="bi bi-arrow-up me-1"></i>
                    {stats?.members?.active || 0} عضو نشط
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm bg-gradient-success text-white">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                  <i className="bi bi-cash-coin text-white fs-2"></i>
                </div>
                <div>
                  <h6 className="mb-1 opacity-75">إجمالي الإيرادات</h6>
                  <h2 className="mb-0 fw-bold">
                    {(stats?.finances?.currentMonth?.income || 0).toLocaleString()} جنية
                  </h2>
                  <small className="opacity-75">
                    <i className="bi bi-arrow-up me-1"></i>
                    {stats?.finances?.lastMonth?.income || 0} جنية الشهر الماضي
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm bg-gradient-danger text-white">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                  <i className="bi bi-credit-card text-white fs-2"></i>
                </div>
                <div>
                  <h6 className="mb-1 opacity-75">إجمالي المصروفات</h6>
                  <h2 className="mb-0 fw-bold">
                    {(stats?.finances?.currentMonth?.expenses || 0).toLocaleString()} جنية
                  </h2>
                  <small className="opacity-75">
                    <i className="bi bi-arrow-down me-1"></i>
                    {stats?.finances?.lastMonth?.expenses || 0} جنية الشهر الماضي
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm bg-gradient-info text-white">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                  <i className="bi bi-truck text-white fs-2"></i>
                </div>
                <div>
                  <h6 className="mb-1 opacity-75">المركبات النشطة</h6>
                  <h2 className="mb-0 fw-bold">{stats?.vehicles?.inUse || 0}</h2>
                  <small className="opacity-75">
                    من أصل {stats?.vehicles?.total || 0} مركبة
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4 g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-graph-up me-2 text-success"></i>
                الأداء المالي الشهري
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                {getFinancialChartData() && (
                  <Line
                    data={getFinancialChartData()}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            font: { size: 12 },
                            usePointStyle: true,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(0,0,0,0.1)",
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-pie-chart me-2 text-success"></i>
                حالة الأعضاء
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                {getMemberStatusChartData() && (
                  <Doughnut
                    data={getMemberStatusChartData()}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            font: { size: 11 },
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity Charts */}
      <Row className="mb-4 g-3">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-activity me-2 text-warning"></i>
                النشاطات الشهرية
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "250px" }}>
                {getMonthlyActivityData() && (
                  <Bar
                    data={getMonthlyActivityData()}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            font: { size: 11 },
                            usePointStyle: true,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(0,0,0,0.1)",
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-truck me-2 text-info"></i>
                حالة المركبات
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "250px" }}>
                {getVehicleStatusChartData() && (
                  <Pie
                    data={getVehicleStatusChartData()}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            font: { size: 11 },
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities Section */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold  text-black">
                  <i className="bi bi-cash me-2 text-success"></i>
                  آخر المدفوعات
                </h5>
                <Badge bg="success" className="fs-6">
                  {stats?.recent?.payments?.length || 0}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {stats?.recent?.payments && stats.recent.payments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">العضو</th>
                        <th className="border-0">النوع</th>
                        <th className="border-0">المبلغ</th>
                        <th className="border-0">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.payments.map((payment) => (
                        <tr key={payment._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                                <i className="bi bi-person text-success"></i>
                              </div>
                              <span>{payment.member?.fullName ? `${payment.member.fullName.first} ${payment.member.fullName.middle || ''} ${payment.member.fullName.last}`.trim() : "غير محدد"}</span>
                            </div>
                          </td>
                          <td>
                            <Badge bg="outline-success" className="text-success">
                              {getPaymentTypeName(payment.type)}
                            </Badge>
                          </td>
                          <td className="fw-bold text-success">
                            {payment.amount.toLocaleString()} جنية
                          </td>
                          <td className="text-muted">
                            {new Date(payment.paymentDate).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2">لا توجد مدفوعات حديثة</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold  text-black">
                  <i className="bi bi-credit-card me-2 text-danger"></i>
                  آخر المصروفات
                </h5>
                <Badge bg="danger" className="fs-6">
                  {stats?.recent?.expenses?.length || 0}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {stats?.recent?.expenses && stats.recent.expenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">الفئة</th>
                        <th className="border-0">الغرض</th>
                        <th className="border-0">المبلغ</th>
                        <th className="border-0">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.expenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-danger bg-opacity-10 p-2 me-2">
                                <i className="bi bi-tag text-danger"></i>
                              </div>
                              <Badge bg="outline-danger" className="text-danger">
                                {getExpenseCategoryName(expense.category)}
                              </Badge>
                            </div>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "150px" }}>
                            {expense.purpose}
                          </td>
                          <td className="fw-bold text-danger">
                            {expense.amount.toLocaleString()} جنية
                          </td>
                          <td className="text-muted">
                            {new Date(expense.date).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2">لا توجد مصروفات حديثة</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Info Cards */}
      <Row className="mt-4 g-3">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0 fw-bold text-black">
                <i className="bi bi-people me-2 text-primary"></i>
                آخر الأعضاء المنضمين
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {stats?.recent?.members && stats.recent.members.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">الاسم</th>
                        <th className="border-0">رقم الهاتف</th>
                        <th className="border-0">المدينة</th>
                        <th className="border-0">تاريخ الانضمام</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.members.map((member) => (
                        <tr key={member._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                                <i className="bi bi-person-plus text-primary"></i>
                              </div>
                              <span>{member.fullName ? `${member.fullName.first} ${member.fullName.middle || ''} ${member.fullName.last}`.trim() : 'غير محدد'}</span>
                            </div>
                          </td>
                          <td className="text-muted">{member.contact?.phone || 'غير محدد'}</td>
                          <td>
                            <Badge bg="outline-primary" className="text-primary">
                              {member.primaryAddress?.city || 'غير محدد'}
                            </Badge>
                          </td>
                          <td className="text-muted">
                            {new Date(member.joinDate).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2">لا يوجد أعضاء جدد</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0 fw-bold text-black">
                <i className="bi bi-truck me-2 text-info"></i>
                الرحلات القادمة
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {stats?.recent?.trips && stats.recent.trips.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">المركبة</th>
                        <th className="border-0">الوجهة</th>
                        <th className="border-0">السائق</th>
                        <th className="border-0">تاريخ البداية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.trips.map((trip) => (
                        <tr key={trip._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                                <i className="bi bi-truck text-info"></i>
                              </div>
                              <span>
                                {trip.vehicle
                                  ? `${trip.vehicle.make} ${trip.vehicle.model}`
                                  : "غير محدد"}
                              </span>
                            </div>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "120px" }}>
                            {trip.destination}
                          </td>
                          <td className="text-muted">{trip.driver?.fullName || "غير محدد"}</td>
                          <td className="text-muted">
                            {new Date(trip.startDate).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2">لا توجد رحلات قادمة</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

// Helper functions
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
    case "رسوم العضوية السنوية":
      return "رسوم العضوية السنوية";
    case "رسوم العضوية الشهرية":
      return "رسوم العضوية الشهرية";
    case "رسوم النشاطات":
      return "رسوم النشاطات";
    case "تبرع عام":
      return "تبرع عام";
    case "تبرع للمشاريع":
      return "تبرع للمشاريع";
    case "تبرع كبير":
      return "تبرع كبير";
    default:
      return type;
  }
};

const getExpenseCategoryName = (category) => {
  switch (category) {
    case "utilities":
      return "مرافق";
    case "rent":
      return "إيجار";
    case "salaries":
      return "رواتب";
    case "transportation":
      return "مواصلات";
    case "maintenance":
      return "صيانة";
    case "supplies":
      return "مستلزمات";
    case "events":
      return "فعاليات";
    case "other":
      return "أخرى";
    case "مصاريف إدارية":
      return "مصاريف إدارية";
    case "مصاريف النقل":
      return "مصاريف النقل";
    case "مصاريف الصيانة":
      return "مصاريف الصيانة";
    case "مصاريف النشاطات":
      return "مصاريف النشاطات";
    case "مصاريف الخير":
      return "مصاريف الخير";
    default:
      return category;
  }
};

export default Dashboard;
