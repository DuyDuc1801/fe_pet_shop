import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Form, Input, Button, ConfigProvider, Typography, message,
} from "antd";
import {
    UserOutlined, LockOutlined, MailOutlined, PhoneOutlined,
    EyeInvisibleOutlined, EyeTwoTone
} from "@ant-design/icons";
import fetchApi from "../../../utils/fetchApi";

const { Title } = Typography;
const PRIMARY = "#f97316";
const PRIMARY_LIGHT = "#fff7ed";

const PawIcon = ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <ellipse cx="6" cy="7" rx="2" ry="3" />
        <ellipse cx="18" cy="7" rx="2" ry="3" />
        <ellipse cx="3.5" cy="13" rx="1.5" ry="2.5" />
        <ellipse cx="20.5" cy="13" rx="1.5" ry="2.5" />
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
        borderRadius: 10,
        border: "1.5px solid #e5e7eb",
        fontSize: 14,
    };

    return (
        <ConfigProvider
            theme={{
                token: { colorPrimary: PRIMARY, borderRadius: 10, fontFamily: "'Be Vietnam Pro', sans-serif" },
            }}
        >
            {contextHolder}
            <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Be Vietnam Pro', sans-serif" }}>

                {/* Left panel */}
                <div style={{
                    flex: 1, background: PRIMARY, display: "flex", flexDirection: "column",
                    justifyContent: "center", padding: "60px 56px", position: "relative", overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
                    <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />

                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56, textDecoration: "none", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <PawIcon size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>PooGi</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>Phòng khám & Cửa hàng</div>
                        </div>
                    </Link>

                    <Title style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(28px,3vw,38px)", lineHeight: 1.2, margin: "0 0 20px", position: "relative", zIndex: 1 }}>
                        Tạo tài khoản,<br />bắt đầu hành trình!
                    </Title>

                    <p style={{ color: "rgba(255,255,255,.82)", fontSize: 15, lineHeight: 1.8, maxWidth: 380, position: "relative", zIndex: 1, marginBottom: 40 }}>
                        Đăng ký miễn phí để trải nghiệm đầy đủ tính năng đặt lịch khám, mua sắm và chăm sóc thú cưng tại PooGi.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 }}>
                        {["Đặt lịch khám dễ dàng", "Theo dõi đơn hàng realtime", "Nhận thông báo quan trọng", "Tích điểm & ưu đãi thành viên"].map((f) => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,.9)", fontSize: 14, fontWeight: 500 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,.6)", flexShrink: 0 }} />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right form panel */}
                <div style={{ width: 720, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", background: "#fff", overflowY: "auto" }}>
                    <div style={{ animation: "fadeUp .55s ease both" }}>
                        <Title style={{ fontSize: 30, fontWeight: 700, color: PRIMARY, marginBottom: 8, textAlign: "center" }}>Đăng ký tài khoản</Title>
                        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
                            Điền thông tin bên dưới để tạo tài khoản mới
                        </p>

                        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                            <Form.Item
                                name="fullName"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Họ và tên</span>}
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input prefix={<UserOutlined style={{ color: "#9ca3af" }} />} placeholder="Nguyễn Văn A" size="large" style={inputStyle} />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Email</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập email" },
                                    { type: "email", message: "Email không hợp lệ" },
                                ]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input prefix={<MailOutlined style={{ color: "#9ca3af" }} />} placeholder="ten@email.com" size="large" style={inputStyle} />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Số điện thoại <span style={{ color: "#9ca3af", fontWeight: 400 }}>(tuỳ chọn)</span></span>}
                                style={{ marginBottom: 16 }}
                            >
                                <Input prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />} placeholder="0901 234 567" size="large" style={inputStyle} />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Mật khẩu</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu" },
                                    { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
                                ]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                                    placeholder="Tối thiểu 6 ký tự"
                                    size="large"
                                    style={inputStyle}
                                    iconRender={(v) => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={<span style={{ fontWeight: 600, fontSize: 13.5, color: "#374151" }}>Xác nhận mật khẩu</span>}
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) return Promise.resolve();
                                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
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
                                    iconRender={(v) => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>

                            <Form.Item noStyle>
                                <Button
                                    type="primary" htmlType="submit" block loading={loading}
                                    style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 700, background: PRIMARY, borderColor: PRIMARY, boxShadow: "0 6px 20px rgba(249,115,22,.3)" }}
                                >
                                    {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#6b7280" }}>
                            Đã có tài khoản? <Link to="/login" style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>Đăng nhập ngay</Link>
                        </div>

                        <div style={{ textAlign: "center", marginTop: 20 }}>
                            <Link to="/" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>← Quay về trang chủ</Link>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
                        @media (max-width: 860px) { .register-left { display: none; } }
                    `}</style>
                </div>
            </div>
        </ConfigProvider>
    );
}