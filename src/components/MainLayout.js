import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Navbar, Button, Dropdown, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const APP_VERSION = 'v1.0.0';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Adjust sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // User avatar fallback
  const getAvatar = () => {
    if (user?.avatar) return <img src={user.avatar} alt="avatar" className="user-avatar" />;
    if (user?.name) return <span className="user-avatar bg-primary-gradient">{user.name[0]}</span>;
    return <span className="user-avatar bg-primary-gradient">م</span>;
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar custom-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`} style={{ width: sidebarOpen ? '250px' : '64px' }}>
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center">
            <img src="/favicon.jpg" alt="logo" className="sidebar-logo me-2" />
            {sidebarOpen && <span className="sidebar-title">جمعية الخير</span>}
          </div>
          <Button variant="link" className="sidebar-toggle d-none d-md-inline-block" onClick={toggleSidebar}>
            <i className={`bi ${sidebarOpen ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
          </Button>
        </div>
        <hr className="bg-light my-0" />
        
        {/* User Info Section */}
        {sidebarOpen && (
          <div className="user-info-section p-3 text-center">
            {getAvatar()}
            <div className="user-details mt-2">
              <div className="fw-bold text-white">{user?.name || 'المستخدم'}</div>
              <div className="small text-white-50">{user?.role ? (user.role === 'admin' ? 'مدير' : 'موظف') : 'مستخدم'}</div>
            </div>
          </div>
        )}
        
        <Nav className="flex-column p-3 sidebar-nav">
          <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''} title="لوحة التحكم">
            <i className="bi bi-speedometer2"></i>
            {sidebarOpen && 'لوحة التحكم'}
          </Nav.Link>
          <Nav.Link as={Link} to="/members" className={location.pathname === '/members' ? 'active' : ''} title="إدارة الأعضاء">
            <i className="bi bi-people"></i>
            {sidebarOpen && 'إدارة الأعضاء'}
          </Nav.Link>
          <Nav.Link as={Link} to="/payments" className={location.pathname === '/payments' ? 'active' : ''} title="المدفوعات">
            <i className="bi bi-cash-coin"></i>
            {sidebarOpen && 'المدفوعات'}
          </Nav.Link>
          <Nav.Link as={Link} to="/expenses" className={location.pathname === '/expenses' ? 'active' : ''} title="المصروفات">
            <i className="bi bi-credit-card"></i>
            {sidebarOpen && 'المصروفات'}
          </Nav.Link>
          <Nav.Link as={Link} to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''} title="المركبات">
            <i className="bi bi-truck"></i>
            {sidebarOpen && 'المركبات'}
          </Nav.Link>
          <Nav.Link as={Link} to="/trips" className={location.pathname === '/trips' ? 'active' : ''} title="الرحلات">
            <i className="bi bi-map"></i>
            {sidebarOpen && 'الرحلات'}
          </Nav.Link>
          <Nav.Link as={Link} to="/maintenance" className={location.pathname === '/maintenance' ? 'active' : ''} title="الصيانة">
            <i className="bi bi-tools"></i>
            {sidebarOpen && 'الصيانة'}
          </Nav.Link>
          <Nav.Link as={Link} to="/reports" className={location.pathname === '/reports' ? 'active' : ''} title="التقارير">
            <i className="bi bi-file-earmark-bar-graph"></i>
            {sidebarOpen && 'التقارير'}
          </Nav.Link>
          
          {/* Divider before logout */}
          <hr className="bg-light my-3" />
          
          {/* Logout Button */}
          <Nav.Link onClick={handleLogout} className="logout-link" title="تسجيل الخروج">
            <i className="bi bi-box-arrow-right"></i>
            {sidebarOpen && 'تسجيل الخروج'}
          </Nav.Link>
        </Nav>
        
        <div className="sidebar-footer text-center mt-auto p-2 small text-white-50">
          {sidebarOpen && <>
            <div>الإصدار {APP_VERSION}</div>
            <div>© {new Date().getFullYear()} جمعية الخير</div>
          </>}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Page Content */}
        <div className="main-content">
          <Container fluid>
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
