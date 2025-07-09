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
import { register, reset } from "../features/auth/authSlice";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { username, fullName, email, password, confirmPassword } = formData;
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

    // Clear password error when user types
    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("كلمات المرور غير متطابقة");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    const userData = {
      username,
      fullName,
      email,
      password,
    };

    dispatch(register(userData));
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
                    إنشاء حساب جديد في نظام إدارة الجمعية
                  </p>
                </div>

                {isError && (
                  <Alert variant="danger">
                    {message}
                    {message.includes("اسم المستخدم") && (
                      <div className="mt-2">
                        <small>جرب استخدام اسم مستخدم مختلف</small>
                      </div>
                    )}
                    {message.includes("البريد الإلكتروني") && (
                      <div className="mt-2">
                        <small>جرب استخدام بريد إلكتروني مختلف</small>
                      </div>
                    )}
                  </Alert>
                )}
                {isSuccess && (
                  <Alert variant="success">
                    تم إنشاء الحساب بنجاح! سيتم توجيهك إلى لوحة التحكم.
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={onSubmit}>
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>اسم المستخدم</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={username}
                      onChange={onChange}
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      يرجى إدخال اسم المستخدم
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="fullName">
                    <Form.Label>الاسم الكامل</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={fullName}
                      onChange={onChange}
                      placeholder="أدخل الاسم الكامل"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      يرجى إدخال الاسم الكامل
                    </Form.Control.Feedback>
                  </Form.Group>

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

                  <Form.Group className="mb-3" controlId="password">
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

                  <Form.Group className="mb-4" controlId="confirmPassword">
                    <Form.Label>تأكيد كلمة المرور</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      placeholder="أدخل كلمة المرور مرة أخرى"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      يرجى تأكيد كلمة المرور
                    </Form.Control.Feedback>
                    {passwordError && (
                      <Form.Text className="text-danger">{passwordError}</Form.Text>
                    )}
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
                          جاري إنشاء الحساب...
                        </>
                      ) : (
                        "إنشاء الحساب"
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      لديك حساب بالفعل؟{" "}
                      <Link to="/login" className="text-decoration-none">
                        تسجيل الدخول
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

export default Register; 