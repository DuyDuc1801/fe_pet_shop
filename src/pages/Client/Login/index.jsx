import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import {
  Form, Input, Button, Checkbox, Divider, ConfigProvider, Typography, message,
} from "antd";
import {
  UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone
} from "@ant-design/icons";
import "./style.scss";
import postApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const PRIMARY       = "#f97316";

// ── Paw SVG ──────────────────────────────────────────────────────
const PawIcon = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="6"    cy="7"  rx="2"   ry="3"   />
    <ellipse cx="18"   cy="7"  rx="2"   ry="3"   />
    <ellipse cx="3.5"  cy="13" rx="1.5" ry="2.5" />
    <ellipse cx="20.5" cy="13" rx="1.5" ry="2.5" />
    <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
  </svg>
);

// ── Decorative paw prints ────────────────────────────────────────
const PawPrint = ({ style }) => (
  <div style={{ position: "absolute", opacity: 0.06, pointerEvents: "none", ...style }}>
    <PawIcon size={48} color={PRIMARY} />
  </div>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await postApi("login", values);
    if (!result.res.status) {
        setLoading(false);
        return messageApi.error(result.data.message || "Đăng nhập thất bại");
    }
    setLoading(false);
    localStorage.setItem("token", result.data.token);
    localStorage.setItem("userRole", result.data.role);
    localStorage.setItem("userName", result.data.name);
    messageApi.success("Đăng nhập thành công! 🐾");
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PRIMARY,
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
        components: {
          Input: {
            borderRadius: 10,
            paddingBlock: 10,
          },
        },
      }}
    >
      {contextHolder}

      <div className="login-page">

        {/* ── Left decorative panel ── */}
        <div className="login-left">
          <PawPrint style={{ top: 140,  left: 40  }} />
          <PawPrint style={{ top: 320,  right: 60 }} />
          <PawPrint style={{ bottom: 160, left: 160 }} />
          <PawPrint style={{ bottom: 60,  right: 40 }} />

          <Link to="/" className="login-left__logo">
            <div className="login-left__logo-icon">
              <PawIcon size={24} color="#fff" />
            </div>
            <div>
              <div className="login-left__logo-name">PooGi</div>
              <div className="login-left__logo-sub">Phòng khám & Cửa hàng</div>
            </div>
          </Link>

          <Title className="login-left__headline">
            Chào mừng trở lại,<br />người bạn của thú cưng!
          </Title>

          <p className="login-left__desc">
            Đăng nhập để đặt lịch khám, theo dõi đơn hàng và nhận ưu đãi độc quyền dành riêng cho thành viên PooGi.
          </p>

          <div className="login-left__features">
            {[
              "Đặt lịch khám online 24/7",
              "Theo dõi hồ sơ sức khỏe thú cưng",
              "Nhận thông báo lịch tiêm phòng",
              "Ưu đãi thành viên & tích điểm",
            ].map((f) => (
              <div key={f} className="login-left__feature">
                <div className="login-left__feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-right">
          {/* Subtle background paws */}
          <PawPrint style={{ bottom: 60, right: 30, opacity: 0.04 }} />
          <PawPrint style={{ top: 40,   right: 60, opacity: 0.03 }} />

          <div className="login-form-wrap">
            <Title className="login-title">Đăng nhập</Title>

            {/* Main form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              style={{ gap: 0 }}
            >
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151", fontFamily: "'Be Vietnam Pro', sans-serif" }}>Email</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email",  message: "Email không hợp lệ" },
                ]}
                style={{ marginBottom: 16 }}
              >
                <Input
                  className="login-input"
                  prefix={<UserOutlined />}
                  placeholder="ten@email.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151", fontFamily: "'Be Vietnam Pro', sans-serif" }}>Mật khẩu</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" }
                ]}
                style={{ marginBottom: 12 }}
              >
                <Input.Password
                  className="login-input"
                  prefix={<LockOutlined />}
                  placeholder="••••••••"
                  size="large"
                  iconRender={(visible) => visible ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>

              {/* Remember + Forgot */}
              <div className="login-meta" style={{ marginBottom: 24 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle initialValue={true}>
                  <Checkbox style={{ fontSize: 13, color: "#6b7280", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className="login-forgot">Quên mật khẩu?</Link>
              </div>

              <Form.Item noStyle>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="login-btn"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </Form.Item>
            </Form>

            <div className="login-register">
              Chưa có tài khoản?{" "}
              <Link to="/register">Đăng ký ngay</Link>
            </div>

            {/* Back to home */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/" style={{ color: "#9ca3af", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>

      </div>
    </ConfigProvider>
  );
}