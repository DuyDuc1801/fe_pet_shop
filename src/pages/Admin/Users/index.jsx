import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Space, Card,
    Typography, Row, Col, ConfigProvider, message,
    Avatar, Tooltip, Popconfirm, Modal, Form,
} from "antd";
import { SearchOutlined, ReloadOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";

const ROLE_CONFIG = {
    Admin:    { color: "red",    label: "Quản trị viên" },
    Doctor:   { color: "blue",   label: "Bác sĩ"        },
    Staff:    { color: "green",  label: "Nhân viên"      },
    Customer: { color: "orange", label: "Khách hàng"     },
};

export default function AdminUsers() {
    const [users,      setUsers]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [page,       setPage]       = useState(1);
    const [search,     setSearch]     = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [messageApi, ctxHolder]     = message.useMessage();

    const PAGE_SIZE = 10;

    const loadUsers = useCallback(async (pg, s, role) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (s)    params.append("search", s);
        if (role) params.append("role",   role);
        const { res, data } = await fetchApi(`admin/users?${params}`, null, "GET");
        if (res.ok) { setUsers(data.users || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadUsers(1, "", ""); })();
    }, [loadUsers]);

    const handleRoleChange = async (userId, newRole) => {
        const { res, data } = await fetchApi(`admin/users/${userId}/role`, { role: newRole }, "PUT");
        if (res.ok) {
            messageApi.success("Cập nhật role thành công!");
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } else {
            messageApi.error(data.message || "Thất bại");
        }
    };

    const columns = [
        {
            title: "Người dùng",
            key: "user",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {r.avatar ? (
                        <img src={r.avatar} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                        <Avatar size={40} style={{ background: PRIMARY, fontWeight: 700 }}>{r.fullName?.charAt(0)}</Avatar>
                    )}
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.fullName}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Điện thoại",
            dataIndex: "phoneNumber",
            render: v => <Text style={{ fontSize: 13 }}>{v || "—"}</Text>,
        },
        {
            title: "Role",
            dataIndex: "role",
            render: (role, r) => (
                <Select value={role} size="small" style={{ width: 140 }}
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
            title: "Ngày tham gia",
            dataIndex: "createdAt",
            render: v => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs(v).format("DD/MM/YYYY")}</Text>,
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
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm theo tên hoặc email..." value={search} allowClear size="large"
                            onChange={e => { setSearch(e.target.value); loadUsers(1, e.target.value, roleFilter); }}
                            style={{ borderRadius: 10 }} />
                    </Col>
                    <Col xs={24} sm={7}>
                        <Select placeholder="Lọc theo role" value={roleFilter || undefined} allowClear
                            onChange={v => { setRoleFilter(v || ""); loadUsers(1, search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setRoleFilter(""); loadUsers(1, "", ""); }} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={users} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); loadUsers(p, search, roleFilter); }, showTotal: t => `Tổng ${t} người dùng` }}
                    scroll={{ x: 700 }} />
            </Card>
        </ConfigProvider>
    );
}