import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  });

  // Report data states
  const [memberReport, setMemberReport] = useState(null);
  const [financialReport, setFinancialReport] = useState(null);
  const [vehicleReport, setVehicleReport] = useState(null);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (activeTab === "members") {
      fetchMemberReport();
    } else if (activeTab === "financial") {
      fetchFinancialReport();
    } else if (activeTab === "vehicles") {
      fetchVehicleReport();
    }
  }, [activeTab, dateRange, token]);

  const fetchMemberReport = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:8888/api/reports/members?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        config
      );
      setMemberReport(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل تقرير الأعضاء"
      );
      setLoading(false);
    }
  };

  const fetchFinancialReport = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:8888/api/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        config
      );
      setFinancialReport(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل التقرير المالي"
      );
      setLoading(false);
    }
  };

  const fetchVehicleReport = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:8888/api/reports/vehicles?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        config
      );
      setVehicleReport(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحميل تقرير المركبات"
      );
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      };

      let url = '';
      if (activeTab === 'members') {
        url = `http://localhost:8888/api/pdf/members?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else if (activeTab === 'financial') {
        url = `http://localhost:8888/api/pdf/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else if (activeTab === 'vehicles') {
        url = `http://localhost:8888/api/pdf/vehicles?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else {
        url = `http://localhost:8888/api/pdf/comprehensive?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const response = await axios.get(url, config);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      link.download = `${activeTab}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تنزيل التقرير");
      setLoading(false);
    }
  };

  // Member Status Chart Data
  const getMemberStatusChartData = () => {
    if (!memberReport || !memberReport.statusDistribution) return null;

    return {
      labels: ["نشط", "غير نشط", "متوفى", "منسحب"],
      datasets: [
        {
          data: [
            memberReport.statusDistribution.active || 0,
            memberReport.statusDistribution.inactive || 0,
            memberReport.statusDistribution.deceased || 0,
            memberReport.statusDistribution.withdrawn || 0,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Financial Chart Data
  const getFinancialChartData = () => {
    if (!financialReport || !financialReport.monthlyBreakdown) return null;

    const months = Object.keys(financialReport.monthlyBreakdown);
    const incomeData = months.map(
      (month) => financialReport.monthlyBreakdown[month].income || 0
    );
    const expenseData = months.map(
      (month) => financialReport.monthlyBreakdown[month].expenses || 0
    );

    return {
      labels: months,
      datasets: [
        {
          label: "الإيرادات",
          data: incomeData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "المصروفات",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Vehicle Usage Chart Data
  const getVehicleUsageChartData = () => {
    if (!vehicleReport || !vehicleReport.vehicles) return null;

    const vehicleNames = vehicleReport.vehicles.map(
      (v) => `${v.make} ${v.model}`
    );
    const tripCounts = vehicleReport.vehicles.map((v) => v.tripCount || 0);

    return {
      labels: vehicleNames,
      datasets: [
        {
          label: "عدد الرحلات",
          data: tripCounts,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Row>
          <Col>
            <h2>التقارير</h2>
            <p className="text-muted">عرض وتحليل بيانات الجمعية</p>
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={handlePrintReport}
            >
              <i className="bi bi-printer me-2"></i>
              طباعة
            </Button>
            <Button variant="outline-success" onClick={handleExportReport} disabled={loading}>
              <i className="bi bi-file-pdf me-2"></i>
              {loading ? 'جاري التحميل...' : 'تحميل PDF'}
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
            <Col md={6}>
              <Form.Group>
                <Form.Label>من تاريخ</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>إلى تاريخ</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-4">
        <Tab eventKey="members" title="تقرير الأعضاء">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : memberReport ? (
            <div>
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي الأعضاء</h5>
                      <h2 className="mb-0">{memberReport.totalMembers}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">أعضاء جدد</h5>
                      <h2 className="mb-0">{memberReport.newMembers}</h2>
                      <small className="text-muted">خلال الفترة المحددة</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">معدل النمو</h5>
                      <h2 className="mb-0">{memberReport.growthRate}%</h2>
                      <small className="text-muted">
                        مقارنة بالفترة السابقة
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">توزيع حالة الأعضاء</h5>
                      <div style={{ height: "300px" }}>
                        {getMemberStatusChartData() && (
                          <Pie
                            data={getMemberStatusChartData()}
                            options={{ maintainAspectRatio: false }}
                          />
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">
                        توزيع الأعضاء حسب المدينة
                      </h5>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>المدينة</th>
                            <th>عدد الأعضاء</th>
                            <th>النسبة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberReport.cityDistribution &&
                            Object.entries(memberReport.cityDistribution).map(
                              ([city, count]) => (
                                <tr key={city}>
                                  <td>{city}</td>
                                  <td>{count}</td>
                                  <td>
                                    {(
                                      (count / memberReport.totalMembers) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Alert variant="info">لا توجد بيانات متاحة للفترة المحددة</Alert>
          )}
        </Tab>

        <Tab eventKey="financial" title="التقرير المالي">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : financialReport ? (
            <div>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي الإيرادات</h5>
                      <h2 className="mb-0">
                        {financialReport.totalIncome} جنية
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي المصروفات</h5>
                      <h2 className="mb-0">
                        {financialReport.totalExpenses} جنية
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">صافي الدخل</h5>
                      <h2 className="mb-0">{financialReport.netIncome} جنية</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">نسبة المصروفات</h5>
                      <h2 className="mb-0">{financialReport.expenseRatio}%</h2>
                      <small className="text-muted">من إجمالي الإيرادات</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={12}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">
                        الإيرادات والمصروفات الشهرية
                      </h5>
                      <div style={{ height: "300px" }}>
                        {getFinancialChartData() && (
                          <Bar
                            data={getFinancialChartData()}
                            options={{
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
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

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">
                        توزيع الإيرادات حسب النوع
                      </h5>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>نوع الإيراد</th>
                            <th>المبلغ</th>
                            <th>النسبة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialReport.incomeByType &&
                            Object.entries(financialReport.incomeByType).map(
                              ([type, amount]) => (
                                <tr key={type}>
                                  <td>{getPaymentTypeName(type)}</td>
                                  <td>{amount} جنية</td>
                                  <td>
                                    {(
                                      (amount / financialReport.totalIncome) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">
                        توزيع المصروفات حسب الفئة
                      </h5>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>الفئة</th>
                            <th>المبلغ</th>
                            <th>النسبة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialReport.expensesByCategory &&
                            Object.entries(
                              financialReport.expensesByCategory
                            ).map(([category, amount]) => (
                              <tr key={category}>
                                <td>{getExpenseCategoryName(category)}</td>
                                <td>{amount} جنية</td>
                                <td>
                                  {(
                                    (amount / financialReport.totalExpenses) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Alert variant="info">لا توجد بيانات متاحة للفترة المحددة</Alert>
          )}
        </Tab>

        <Tab eventKey="vehicles" title="تقرير المركبات">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : vehicleReport ? (
            <div>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي المركبات</h5>
                      <h2 className="mb-0">{vehicleReport.totalVehicles}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي الرحلات</h5>
                      <h2 className="mb-0">{vehicleReport.totalTrips}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">إجمالي تكاليف الصيانة</h5>
                      <h2 className="mb-0">
                        {vehicleReport.totalMaintenanceCost} جنية
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <h5 className="card-title">متوسط المسافة المقطوعة</h5>
                      <h2 className="mb-0">
                        {vehicleReport.averageTripDistance} كم
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={12}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">استخدام المركبات</h5>
                      <div style={{ height: "300px" }}>
                        {getVehicleUsageChartData() && (
                          <Bar
                            data={getVehicleUsageChartData()}
                            options={{
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
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

              <Row className="mb-4">
                <Col md={12}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">تفاصيل المركبات</h5>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>المركبة</th>
                            <th>عدد الرحلات</th>
                            <th>إجمالي المسافة</th>
                            <th>تكاليف الصيانة</th>
                            <th>الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicleReport.vehicles &&
                            vehicleReport.vehicles.map((vehicle) => (
                              <tr key={vehicle._id}>
                                <td>
                                  {vehicle.make} {vehicle.model} -{" "}
                                  {vehicle.licensePlate}
                                </td>
                                <td>{vehicle.tripCount}</td>
                                <td>{vehicle.totalDistance} كم</td>
                                <td>{vehicle.maintenanceCost} جنية</td>
                                <td>{getVehicleStatusName(vehicle.status)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Alert variant="info">لا توجد بيانات متاحة للفترة المحددة</Alert>
          )}
        </Tab>
      </Tabs>
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

const getVehicleStatusName = (status) => {
  switch (status) {
    case "available":
      return "متاح";
    case "in_use":
      return "قيد الاستخدام";
    case "in-use":
      return "قيد الاستخدام";
    case "maintenance":
      return "صيانة";
    case "out_of_service":
      return "خارج الخدمة";
    default:
      return status;
  }
};

export default Reports;
