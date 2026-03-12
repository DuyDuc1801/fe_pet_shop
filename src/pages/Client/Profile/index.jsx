import { useState, useEffect } from "react";
import {
    Form, Input, Button, Card, Avatar, Typography, message,
    Tabs, Divider, ConfigProvider, Row, Col, Tag,
} from "antd";
import {
    UserOutlined, PhoneOutlined, MailOutlined,
    LockOutlined, EditOutlined, CheckOutlined,
    EyeInvisibleOutlined, EyeTwoTone, CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../../contexts/useAuth";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";
const PRIMARY_LIGHT = "#fff7ed";

const ROLE_LABEL = {
    Admin: { color: "red", label: "Quản trị viên" },
    Doctor: { color: "blue", label: "Bác sĩ" },
    Staff: { color: "green", label: "Nhân viên" },
    Customer: { color: "orange", label: "Khách hàng" },
};

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Điền sẵn thông tin vào form khi user load xong
    useEffect(() => {
        if (user) {
            profileForm.setFieldsValue({
                fullName: user.fullName,
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user]);

    const onSaveProfile = async (values) => {
        setLoadingProfile(true);
        const { res, data } = await fetchApi("auth/profile", values, "PUT");

        if (!res.ok) {
            setLoadingProfile(false);
            return messageApi.error(data.message || "Cập nhật thất bại");
        }

        updateUser(data.user);
        messageApi.success("Cập nhật thông tin thành công! 🐾");
        setLoadingProfile(false);
    };

    const onChangePassword = async (values) => {
        setLoadingPassword(true);
        const { res, data } = await fetchApi("auth/change-password", {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        }, "PUT");

        if (!res.ok) {
            setLoadingPassword(false);
            return messageApi.error(data.message || "Đổi mật khẩu thất bại");
        }

        messageApi.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
        setLoadingPassword(false);
    };

    const roleInfo = ROLE_LABEL[user?.role] || ROLE_LABEL.Customer;

    const inputStyle = { borderRadius: 10, border: "1.5px solid #e5e7eb" };

    const tabItems = [
        {
            key: "profile",
            label: <span><EditOutlined /> Thông tin cá nhân</span>,
            children: (
                <Form form={profileForm} layout="vertical" onFinish={onSaveProfile} requiredMark={false}>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="fullName"
                                label={<span style={{ fontWeight: 600, color: "#374151" }}>Họ và tên</span>}
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            >
                                <Input prefix={<UserOutlined style={{ color: "#9ca3af" }} />} size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="phoneNumber"
                                label={<span style={{ fontWeight: 600, color: "#374151" }}>Số điện thoại</span>}
                            >
                                <Input prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />} size="large" style={inputStyle} placeholder="0901 234 567" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Email chỉ hiển thị, không sửa */}
                    <Form.Item label={<span style={{ fontWeight: 600, color: "#374151" }}>Email</span>}>
                        <Input
                            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                            value={user?.email}
                            disabled
                            size="large"
                            style={{ ...inputStyle, background: "#f9fafb" }}
                        />
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>Email không thể thay đổi</Text>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary" htmlType="submit" loading={loadingProfile}
                            icon={<CheckOutlined />}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 44, fontWeight: 600, paddingInline: 32 }}
                        >
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: "password",
            label: <span><LockOutlined /> Đổi mật khẩu</span>,
            children: (
                <Form form={passwordForm} layout="vertical" onFinish={onChangePassword} requiredMark={false} style={{ maxWidth: 480 }}>
                    <Form.Item
                        name="currentPassword"
                        label={<span style={{ fontWeight: 600, color: "#374151" }}>Mật khẩu hiện tại</span>}
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="••••••••"
                            size="large"
                            style={inputStyle}
                            iconRender={(v) => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label={<span style={{ fontWeight: 600, color: "#374151" }}>Mật khẩu mới</span>}
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu mới" },
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
                        label={<span style={{ fontWeight: 600, color: "#374151" }}>Xác nhận mật khẩu mới</span>}
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                },
                            }),
                        ]}
                        style={{ marginBottom: 24 }}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Nhập lại mật khẩu mới"
                            size="large"
                            style={inputStyle}
                            iconRender={(v) => v ? <EyeTwoTone twoToneColor={PRIMARY} /> : <EyeInvisibleOutlined />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary" htmlType="submit" loading={loadingPassword}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 44, fontWeight: 600, paddingInline: 32 }}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro', sans-serif" } }}>
            {contextHolder}
            <div style={{ background: "#fafafa", minHeight: "calc(100vh - 200px)", padding: "40px 24px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>

                    {/* Header card */}
                    <Card bordered={false} style={{ borderRadius: 20, marginBottom: 24, border: "1.5px solid #f3f4f6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                            <Avatar
                                size={80}
                                style={{ background: PRIMARY, fontSize: 32, fontWeight: 700, flexShrink: 0 }}
                            >
                                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                    <Title level={4} style={{ margin: 0, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                                        {user?.fullName}
                                    </Title>
                                    <Tag color={roleInfo.color} style={{ borderRadius: 6, fontWeight: 600 }}>
                                        {roleInfo.label}
                                    </Tag>
                                </div>
                                <Text style={{ color: "#6b7280", fontSize: 14 }}>{user?.email}</Text>
                                {user?.phoneNumber && (
                                    <div style={{ marginTop: 4 }}>
                                        <Text style={{ color: "#6b7280", fontSize: 13 }}>
                                            <PhoneOutlined style={{ marginRight: 6 }} />
                                            {user.phoneNumber}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Form tabs */}
                    <Card bordered={false} style={{ borderRadius: 20, border: "1.5px solid #f3f4f6" }}>
                        <Tabs
                            items={tabItems}
                            size="large"
                            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                        />
                    </Card>
                </div>
            </div>
        </ConfigProvider>
    );
}