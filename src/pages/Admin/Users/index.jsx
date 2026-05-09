import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Card, Modal, Form,
    Typography, Row, Col, Tooltip, ConfigProvider, message,
    Popconfirm, Avatar,
} from "antd";
import {
    PlusOutlined, SearchOutlined, ReloadOutlined,
    KeyOutlined, DeleteOutlined, UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { Password }    = Input;
const PRIMARY = "#f97316";

const ROLE_CONFIG = {
    Admin:    { color: "red",    label: "Quản trị viên" },
    Staff:    { color: "green",  label: "Nhân viên"     },
    Customer: { color: "orange", label: "Khách hàng"    },
};

// ── Create User Modal ─────────────────────────────────────────────
function CreateUserModal({ open, onClose, onSuccess }) {
    const [form]    = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const handleSubmit = async (values) => {
        setLoading(true);
        const { res, data } = await fetchApi("admin/users", values, "POST");
        setLoading(false);
        if (res.ok) { messageApi.success("Tạo người dùng thành công!"); onSuccess(); onClose(); form.resetFields(); }
        else messageApi.error(data.message || "Tạo thất bại");
    };

    return (
        <Modal title={<span style={{ fontWeight: 700 }}>➕ Thêm người dùng mới</span>}
            open={open} onCancel={onClose} footer={null} destroyOnClose width={500}>
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} style={{ marginTop: 16 }}>
                <Form.Item name="fullName" label={<b>Họ và tên <span style={{ color: "#ef4444" }}>*</span></b>}
                    rules={[{ required: true, message: "Nhập họ tên" }]}>
                    <Input size="large" style={{ borderRadius: 10 }} placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="email" label={<b>Email <span style={{ color: "#ef4444" }}>*</span></b>}
                    rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                    <Input size="large" style={{ borderRadius: 10 }} placeholder="user@example.com" />
                </Form.Item>
                <Form.Item name="password" label={<b>Mật khẩu <span style={{ color: "#ef4444" }}>*</span></b>}
                    rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Ít nhất 6 ký tự" }]}>
                    <Password size="large" style={{ borderRadius: 10 }} placeholder="Ít nhất 6 ký tự" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phoneNumber" label={<b>Số điện thoại</b>}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="0912345678" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="role" label={<b>Role</b>} initialValue="Customer">
                            <Select size="large">
                                {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                                    <Option key={k} value={k}>{v.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        Tạo người dùng
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

// ── Reset Password Modal ──────────────────────────────────────────
function ResetPwModal({ open, onClose, userId }) {
    const [pw, setPw]         = useState("");
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const handle = async () => {
        if (pw.length < 6) { messageApi.warning("Ít nhất 6 ký tự!"); return; }
        setLoading(true);
        const { res, data } = await fetchApi(`admin/users/${userId}/reset-password`, { newPassword: pw }, "PUT");
        setLoading(false);
        if (res.ok) { messageApi.success("Đặt lại thành công!"); setPw(""); onClose(); }
        else messageApi.error(data.message || "Thất bại");
    };

    return (
        <Modal title="🔑 Đặt lại mật khẩu" open={open} onCancel={onClose} destroyOnClose
            footer={[
                <Button key="c" onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>,
                <Button key="ok" type="primary" loading={loading} onClick={handle}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}>Xác nhận</Button>,
            ]}>
            {ctxHolder}
            <Text style={{ display: "block", marginBottom: 12, color: "#6b7280" }}>Nhập mật khẩu mới:</Text>
            <Input.Password value={pw} onChange={e => setPw(e.target.value)} size="large"
                style={{ borderRadius: 10 }} placeholder="Ít nhất 6 ký tự" />
        </Modal>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AdminUsers() {
    const [users,       setUsers]       = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [total,       setTotal]       = useState(0);
    const [page,        setPage]        = useState(1);
    const [search,      setSearch]      = useState("");
    const [roleFilter,  setRoleFilter]  = useState("");
    const [createOpen,  setCreateOpen]  = useState(false);
    const [resetPwId,   setResetPwId]   = useState(null);
    const [messageApi,  ctxHolder]      = message.useMessage();

    const PAGE_SIZE = 10;

    const load = useCallback(async (pg, s, role) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (s)    params.append("search", s);
        if (role) params.append("role",   role);
        const { res, data } = await fetchApi(`admin/users?${params}`, null, "GET");
        if (res.ok) { setUsers(data.users || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(1, "", ""); })();
    }, [load]);

    const handleRoleChange = async (userId, newRole) => {
        const { res, data } = await fetchApi(`admin/users/${userId}/role`, { role: newRole }, "PUT");
        if (res.ok) {
            messageApi.success("Cập nhật role thành công!");
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } else {
            messageApi.error(data.message || "Thất bại");
        }
    };

    const handleDelete = async (id) => {
        const { res } = await fetchApi(`admin/users/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success("Đã xóa người dùng!"); load(page, search, roleFilter); }
        else messageApi.error("Xóa thất bại");
    };

    const columns = [
        {
            title: "Người dùng", key: "user",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {r.avatar
                        ? <img src={r.avatar} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                        : <Avatar size={40} style={{ background: PRIMARY, fontWeight: 700 }}>{r.fullName?.charAt(0)}</Avatar>
                    }
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.fullName}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.email}</div>
                        {r.phoneNumber && <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.phoneNumber}</div>}
                    </div>
                </div>
            ),
        },
        {
            title: "Role", dataIndex: "role",
            render: (role, r) => (
                <Select value={role} size="small" style={{ width: 150 }}
                    onChange={v => handleRoleChange(r._id, v)}>
                    {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                        <Option key={k} value={k}>
                            <Tag color={v.color} style={{ borderRadius: 6, margin: 0 }}>{v.label}</Tag>
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Ngày đăng ký", dataIndex: "createdAt",
            render: v => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs(v).format("DD/MM/YYYY")}</Text>,
        },
        {
            title: "Thao tác", key: "actions", width: 110,
            render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Tooltip title="Đặt lại mật khẩu">
                        <Button size="small" icon={<KeyOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => setResetPwId(r._id)} />
                    </Tooltip>
                    <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(r._id)}
                        okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
                        <Button size="small" icon={<DeleteOutlined />} danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>👥 Quản lý người dùng</Title>
                    <Text style={{ color: "#9ca3af" }}>Tổng {total} tài khoản</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Thêm người dùng
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm tên hoặc email..." value={search} allowClear size="large"
                            style={{ borderRadius: 10 }}
                            onChange={e => { setSearch(e.target.value); load(1, e.target.value, roleFilter); }} />
                    </Col>
                    <Col xs={24} sm={7}>
                        <Select placeholder="Lọc theo role" value={roleFilter || undefined} allowClear
                            onChange={v => { setRoleFilter(v || ""); load(1, search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setRoleFilter(""); load(1, "", ""); }} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={users} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); load(p, search, roleFilter); }, showTotal: t => `Tổng ${t} người dùng` }}
                    scroll={{ x: 650 }} />
            </Card>

            <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)}
                onSuccess={() => load(page, search, roleFilter)} />

            <ResetPwModal open={!!resetPwId} onClose={() => setResetPwId(null)} userId={resetPwId} />
        </ConfigProvider>
    );
}