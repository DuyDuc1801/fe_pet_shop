import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Form, Input, Button, ConfigProvider, Typography, message,
} from "antd";
import {
    UserOutlined, LockOutlined, MailOutlined, PhoneOutlined,
    EyeInvisibleOutlined, EyeTwoTone,
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";

// Ảnh khác với Login để phân biệt 2 trang
const BG_IMAGE = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80";

const PawIcon = ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <ellipse cx="9.5"  cy="6"   rx="2"    ry="3.5" />
        <ellipse cx="14.5" cy="6"   rx="2"    ry="3.5" />
        <ellipse cx="5"    cy="9.5" rx="1.75" ry="2.5" />
        <ellipse cx="19"   cy="9.5" rx="1.75" ry="2.5" />
        <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
    </svg>
);

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values) => {
        setLoading(true);
        const { res, data } = await fetchApi("auth/register", {
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            phoneNumber: values.phoneNumber,
        });

        if (!res.ok) {
            setLoading(false);
            return messageApi.error(data.message || "Đăng ký thất bại");
        }

        messageApi.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
        setLoading(false);
        setTimeout(() => navigate("/login"), 1000);
    };

    const inputStyle = {
        borderRadius: 12,
        border: "1.5px solid #e5e7eb",
        height: 48,
    };

    return (
        <ConfigProvider theme={{
            token: { colorPrimary: PRIMARY, borderRadius: 10, fontFamily: "'Be Vietnam Pro', sans-serif" },
        }}>
            {contextHolder}

            <div style={{ display: "flex", minHeight: "85vh" }}>

                {/* ── Cột trái: Ảnh + gradient + text ── */}
                <div style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    display: "none",
                }}>
                    {/* Ảnh nền */}
                    <img
                        src={BG_IMAGE}
                        alt="PooGi"
                        style={{
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                            filter: "blur(2px) brightness(0.55)",
                            transform: "scale(1.05)",
                        }}
                    />

                    {/* Gradient overlay */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(160deg, rgba(249,115,22,0.55) 0%, rgba(15,15,15,0.75) 60%, rgba(0,0,0,0.88) 100%)",
                    }} />

                    {/* Content */}
                    <div style={{
                        position: "relative", zIndex: 2,
                        height: "100%",
                        display: "flex", flexDirection: "column",
                        padding: "40px 48px",
                    }}>
                        {/* Logo */}
                        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: "100px" }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: PRIMARY, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
                            }}>
                                <PawIcon size={28} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", lineHeight: 1.1, fontFamily: "'Be Vietnam Pro',sans-serif" }}>PooGi</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", letterSpacing: "0.5px" }}>Phòng khám & Cửa hàng</div>
                            </div>
                        </Link>

                        {/* Main text */}
                        <div style={{ marginBottom: 48 }}>
                            {/* Badge */}
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: "rgba(249,115,22,0.25)", backdropFilter: "blur(8px)",
                                border: "1px solid rgba(249,115,22,0.4)",
                                borderRadius: 20, padding: "5px 14px",
                                marginBottom: 20,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.5px" }}>
                                    Đang hoạt động 7:00 – 21:00
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: "clamp(28px, 3vw, 42px)",
                                fontWeight: 800, color: "#fff",
                                fontFamily: "'Be Vietnam Pro', sans-serif",
                                lineHeight: 1.25, margin: "0 0 16px",
                                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                            }}>
                                Tạo tài khoản,<br />
                                <span style={{ color: "#fb923c" }}>bắt đầu</span> hành trình!
                            </h1>

                            <p style={{
                                fontSize: 15, color: "rgba(255,255,255,0.75)",
                                lineHeight: 1.8, margin: "0 0 32px",
                                maxWidth: 380,
                            }}>
                                Đăng ký miễn phí để đặt lịch khám, mua sắm và chăm sóc thú cưng — tất cả trong một nền tảng.
                            </p>

                            {/* Feature pills */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { icon: "📅", text: "Đặt lịch khám online 24/7"              },
                                    { icon: "🐾", text: "Hồ sơ sức khỏe thú cưng trọn đời"       },
                                    { icon: "🛒", text: "Cửa hàng thức ăn & phụ kiện chính hãng" },
                                    { icon: "🎁", text: "Tích điểm & ưu đãi thành viên"           },
                                ].map(f => (
                                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: "rgba(255,255,255,0.12)",
                                            backdropFilter: "blur(8px)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 16, flexShrink: 0,
                                        }}>
                                            {f.icon}
                                        </div>
                                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                                            {f.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats — giống hệt Login */}
                        <div style={{
                            display: "flex", gap: 24,
                            padding: "20px 24px",
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.12)",
                        }}>
                            {[
                                { value: "500+", label: "Bệnh nhân/tháng" },
                                { value: "4.9★", label: "Đánh giá"        },
                                { value: "4",    label: "Bác sĩ"          },
                            ].map(s => (
                                <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fb923c", fontFamily: "'Be Vietnam Pro',sans-serif" }}>{s.value}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Cột phải: Form đăng ký ── */}
                <div style={{
                    width: "100%",
                    maxWidth: 600,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "48px 40px",
                    background: "#fff",
                    position: "relative",
                    overflowY: "auto",
                }}>
                    {/* Mobile logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: PRIMARY, display: "flex",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <PawIcon color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 17, color: "#1c1c1c", fontFamily: "'Be Vietnam Pro',sans-serif", lineHeight: 1.1 }}>PooGi</div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>Phòng khám & Cửa hàng</div>
                        </div>
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 28 }}>
                        <Title level={2} style={{ margin: "0 0 6px", fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 800, fontSize: 28 }}>
                            Đăng ký tài khoản
                        </Title>
                        <Text style={{ color: "#6b7280", fontSize: 14 }}>
                            Điền thông tin bên dưới để tạo tài khoản mới.
                        </Text>
                    </div>

                    {/* Form */}
                    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>

                        <Form.Item
                            name="fullName"
                            label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Họ và tên</span>}
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                                placeholder="Nguyễn Văn A"
                                size="large"
                                style={inputStyle}
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Email</span>}
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email",  message: "Email không hợp lệ"  },
                            ]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                                placeholder="ten@email.com"
                                size="large"
                                style={inputStyle}
                            />
                        </Form.Item>

                        <Form.Item
                            name="phoneNumber"
                            label={
                                <span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>
                                    Số điện thoại{" "}
                                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>(tuỳ chọn)</span>
                                </span>
                            }
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                                placeholder="0901 234 567"
                                size="large"
                                style={inputStyle}
                            />
                        </Form.Item>

                        {/* Mật khẩu — 2 cột */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Mật khẩu</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu" },
                                    { min: 6, message: "Ít nhất 6 ký tự" },
                                ]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                                    placeholder="Tối thiểu 6 ký tự"
                                    size="large"
                                    style={inputStyle}
                                    iconRender={v => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Xác nhận mật khẩu</span>}
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value)
                                                return Promise.resolve();
                                            return Promise.reject(new Error("Mật khẩu không khớp!"));
                                        },
                                    }),
                                ]}
                                style={{ marginBottom: 24 }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                                    placeholder="Nhập lại mật khẩu"
                                    size="large"
                                    style={inputStyle}
                                    iconRender={v => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>
                        </div>

                        <Button
                            type="primary" htmlType="submit" block loading={loading}
                            style={{
                                height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700,
                                background: PRIMARY, borderColor: PRIMARY,
                                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                            }}
                        >
                            {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
                        </Button>
                    </Form>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>hoặc</Text>
                        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                    </div>

                    {/* Login link */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <Text style={{ color: "#6b7280", fontSize: 14 }}>
                            Đã có tài khoản?{" "}
                            <Link to="/login" style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>
                                Đăng nhập ngay
                            </Link>
                        </Text>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <Link to="/" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            ← Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS — hiện cột trái trên desktop, giống Login */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

                @media (min-width: 768px) {
                    div[style*="display: none"] {
                        display: flex !important;
                    }
                }
            `}</style>
        </ConfigProvider>
    );
}