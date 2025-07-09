import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, reset } from "../features/auth/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate("/");
    }

    // Reset auth state on component unmount
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-3">جمعية الخير</h2>
                  <p className="text-muted">
                    تسجيل الدخول إلى نظام إدارة الجمعية
                  </p>
                </div>

                {isError && <Alert variant="danger">{message}</Alert>}

                <Form noValidate validated={validated} onSubmit={onSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>البريد الإلكتروني</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="أدخل البريد الإلكتروني"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      يرجى إدخال بريد إلكتروني صحيح
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label>كلمة المرور</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      يرجى إدخال كلمة المرور
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                      className="py-2"
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        "تسجيل الدخول"
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      ليس لديك حساب؟{" "}
                      <Link to="/register" className="text-decoration-none">
                        إنشاء حساب جديد
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
