import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Card, Modal, Form,
    InputNumber, Typography, Row, Col, Tooltip, ConfigProvider,
    message, Popconfirm, Switch,
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;
const PRIMARY = "#f97316";

const CATEGORIES = [
    "Khám tổng quát", "Tiêm phòng", "Phẫu thuật",
    "Xét nghiệm", "Chăm sóc răng", "Tắm & Grooming", "Khác",
];

const ICONS = ["🩺","💉","🔬","✂️","🦷","🛁","🚨","🔭","🐱","🐶","🛡️","✨","🧪","📡","🦠"];

// ── Service Modal ─────────────────────────────────────────────────
function ServiceModal({ open, onClose, onSuccess, editItem }) {
    const [form]    = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    useEffect(() => {
        if (!open) return;
        editItem ? form.setFieldsValue(editItem) : form.resetFields();
    }, [open, editItem]);

    const handleSubmit = async (values) => {
        setLoading(true);
        const endpoint = editItem ? `admin/services/${editItem._id}` : "admin/services";
        const method   = editItem ? "PUT" : "POST";
        const { res, data } = await fetchApi(endpoint, values, method);
        setLoading(false);
        if (res.ok) {
            messageApi.success(editItem ? "Cập nhật thành công!" : "Tạo dịch vụ thành công!");
            onSuccess(); onClose();
        } else {
            messageApi.error(data.message || "Thao tác thất bại");
        }
    };

    return (
        <Modal
            title={<span style={{ fontWeight: 700 }}>{editItem ? "✏️ Sửa dịch vụ" : "➕ Thêm dịch vụ mới"}</span>}
            open={open} onCancel={onClose} footer={null} width={620} destroyOnClose
        >
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item name="name" label={<b>Tên dịch vụ <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="VD: Khám tổng quát định kỳ" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="icon" label={<b>Icon</b>} initialValue="🩺">
                            <Select size="large" showSearch>
                                {ICONS.map(ic => <Option key={ic} value={ic}>{ic}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="category" label={<b>Danh mục <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Chọn danh mục" }]}>
                            <Select size="large" placeholder="Chọn danh mục">
                                {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="price" label={<b>Giá (₫) <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập giá" }]}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0}
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={v => v.replace(/,/g, "")} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="duration" label={<b>Thời gian (phút) <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập thời gian" }]}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={5} max={480} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label={<b>Mô tả</b>}>
                            <TextArea rows={3} style={{ borderRadius: 10 }} placeholder="Mô tả chi tiết dịch vụ..." />
                        </Form.Item>
                    </Col>
                </Row>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        {editItem ? "Lưu thay đổi" : "Tạo dịch vụ"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AdminServices() {
    const [services,   setServices]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [search,     setSearch]     = useState("");
    const [category,   setCategory]   = useState("");
    const [modalOpen,  setModalOpen]  = useState(false);
    const [editItem,   setEditItem]   = useState(null);
    const [messageApi, ctxHolder]     = message.useMessage();

    const load = useCallback(async (s, cat) => {
        setLoading(true);
        const params = new URLSearchParams({ limit: 100 });
        if (s)   params.append("search",   s);
        if (cat) params.append("category", cat);
        const { res, data } = await fetchApi(`admin/services?${params}`, null, "GET");
        if (res.ok) { setServices(data.services || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load("", ""); })();
    }, [load]);

    const handleToggle = async (id) => {
        const { res, data } = await fetchApi(`admin/services/${id}/toggle`, {}, "PUT");
        if (res.ok) { messageApi.success(data.message); setServices(prev => prev.map(s => s._id === id ? data.service : s)); }
        else messageApi.error("Thao tác thất bại");
    };

    const handleDelete = async (id) => {
        const { res } = await fetchApi(`admin/services/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success("Đã xóa dịch vụ!"); load(search, category); }
        else messageApi.error("Xóa thất bại");
    };

    const columns = [
        {
            title: "Dịch vụ", key: "service",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {r.icon}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                        <Tag color="orange" style={{ borderRadius: 6, marginTop: 2, fontSize: 11 }}>{r.category}</Tag>
                    </div>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: v => <Text style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{v?.toLocaleString("vi-VN")}₫</Text>,
        },
        {
            title: "Thời gian",
            dataIndex: "duration",
            render: v => <Text style={{ fontSize: 13 }}>{v} phút</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (v, r) => (
                <Switch checked={v} onChange={() => handleToggle(r._id)}
                    checkedChildren="Hoạt động" unCheckedChildren="Ẩn"
                    style={{ background: v ? "#22c55e" : "#9ca3af" }} />
            ),
        },
        {
            title: "Thao tác", key: "actions", width: 100,
            render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => { setEditItem(r); setModalOpen(true); }} />
                    </Tooltip>
                    <Popconfirm title="Xóa dịch vụ này?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
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
                    <Title level={3} style={{ margin: 0 }}>🩺 Quản lý dịch vụ</Title>
                    <Text style={{ color: "#9ca3af" }}>Tổng {total} dịch vụ</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => { setEditItem(null); setModalOpen(true); }}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Thêm dịch vụ
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm dịch vụ..." value={search} allowClear size="large"
                            style={{ borderRadius: 10 }}
                            onChange={e => { setSearch(e.target.value); load(e.target.value, category); }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select placeholder="Lọc danh mục" value={category || undefined} allowClear
                            onChange={v => { setCategory(v || ""); load(search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setCategory(""); load("", ""); }} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={services} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ pageSize: 15, showTotal: t => `Tổng ${t} dịch vụ` }}
                    scroll={{ x: 700 }} />
            </Card>

            <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)}
                onSuccess={() => load(search, category)} editItem={editItem} />
        </ConfigProvider>
    );
}