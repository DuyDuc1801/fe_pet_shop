import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Card, Modal, Form,
    Typography, Row, Col, Tooltip, ConfigProvider, message,
    Popconfirm, Avatar, Tabs, Checkbox,
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined, KeyOutlined, UserOutlined,
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea, Password } = Input;
const PRIMARY = "#f97316";

const SPECIALTIES = ["Nội khoa", "Ngoại khoa", "Da liễu", "Răng hàm mặt", "Sản khoa", "Nhãn khoa", "Đa khoa", "Khác"];

const DAY_LABELS = { monday: "Thứ 2", tuesday: "Thứ 3", wednesday: "Thứ 4", thursday: "Thứ 5", friday: "Thứ 6", saturday: "Thứ 7", sunday: "Chủ nhật" };
const ALL_SLOTS  = ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// ── Doctor Modal ──────────────────────────────────────────────────
function DoctorModal({ open, onClose, onSuccess, editItem, allServices }) {
    const [form]    = Form.useForm();
    const [loading, setLoading]   = useState(false);
    const [schedule,setSchedule]  = useState({});
    const [messageApi, ctxHolder] = message.useMessage();

    useEffect(() => {
        if (!open) return;
        if (editItem) {
            form.setFieldsValue({
                fullName:    editItem.user?.fullName,
                phoneNumber: editItem.user?.phoneNumber,
                specialty:   editItem.specialty,
                degree:      editItem.degree,
                bio:         editItem.bio,
                photo:       editItem.photo,
                serviceIds:  editItem.services?.map(s => s._id || s),
            });
            const handleSet = () =>{
                setSchedule(editItem.workSchedule || {});
            }
            handleSet();
        } else {
            form.resetFields();
            const handleSet = () =>{
                setSchedule({});
            }
            handleSet();
        }
    }, [open, editItem]);

    const toggleSlot = (day, slot) => {
        setSchedule(prev => {
            const slots = prev[day] || [];
            return {
                ...prev,
                [day]: slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot].sort(),
            };
        });
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const payload = { ...values, workSchedule: schedule };
        const endpoint = editItem ? `admin/doctors/${editItem._id}` : "admin/doctors";
        const method   = editItem ? "PUT" : "POST";
        const { res, data } = await fetchApi(endpoint, payload, method);
        setLoading(false);
        if (res.ok) {
            messageApi.success(editItem ? "Cập nhật thành công!" : "Tạo bác sĩ thành công!");
            onSuccess(); onClose();
        } else {
            messageApi.error(data.message || "Thao tác thất bại");
        }
    };

    const tabItems = [
        {
            key: "info", label: "📋 Thông tin cơ bản",
            children: (
                <Row gutter={16} style={{ marginTop: 12 }}>
                    {!editItem && (
                        <>
                            <Col span={24}>
                                <div style={{ background: "#fff7ed", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
                                    ⚠️ Sau khi tạo, bác sĩ có thể đăng nhập bằng email và mật khẩu này.
                                </div>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="email" label={<b>Email <span style={{ color: "#ef4444" }}>*</span></b>}
                                    rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                                    <Input size="large" style={{ borderRadius: 10 }} placeholder="doctor@poogi.vn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="password" label={<b>Mật khẩu <span style={{ color: "#ef4444" }}>*</span></b>}
                                    rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Ít nhất 6 ký tự" }]}>
                                    <Password size="large" style={{ borderRadius: 10 }} placeholder="Ít nhất 6 ký tự" />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                    <Col span={12}>
                        <Form.Item name="fullName" label={<b>Họ và tên <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập họ tên" }]}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="Nguyễn Văn An" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phoneNumber" label={<b>Số điện thoại</b>}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="0912345678" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="specialty" label={<b>Chuyên khoa <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Chọn chuyên khoa" }]}>
                            <Select size="large" placeholder="Chọn chuyên khoa">
                                {SPECIALTIES.map(s => <Option key={s} value={s}>{s}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="degree" label={<b>Bằng cấp / Học vị <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập bằng cấp" }]}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="Tiến sĩ Thú y - ĐH Nông Lâm" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="photo" label={<b>URL ảnh đại diện</b>}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="https://..." />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="bio" label={<b>Giới thiệu bản thân</b>}>
                            <TextArea rows={3} style={{ borderRadius: 10 }} placeholder="Mô tả kinh nghiệm, chuyên môn..." />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="serviceIds" label={<b>Dịch vụ thực hiện được</b>}>
                            <Select mode="multiple" size="large" placeholder="Chọn các dịch vụ" optionFilterProp="label">
                                {allServices.map(s => (
                                    <Option key={s._id} value={s._id} label={s.name}>{s.icon} {s.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: "schedule", label: "📅 Lịch làm mặc định",
            children: (
                <div style={{ marginTop: 12 }}>
                    <Text style={{ color: "#6b7280", fontSize: 13, display: "block", marginBottom: 16 }}>
                        Chọn các khung giờ làm việc mặc định. Bác sĩ có thể điều chỉnh từng ngày trong Doctor Portal.
                    </Text>
                    {Object.entries(DAY_LABELS).map(([day, label]) => (
                        <div key={day} style={{ marginBottom: 14 }}>
                            <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6 }}>{label}</Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {ALL_SLOTS.map(slot => {
                                    const active = (schedule[day] || []).includes(slot);
                                    return (
                                        <Tag key={slot} onClick={() => toggleSlot(day, slot)}
                                            style={{ cursor: "pointer", borderRadius: 8, padding: "4px 12px", fontWeight: 600, transition: "all 0.15s",
                                                background: active ? PRIMARY : "#f3f4f6",
                                                color:      active ? "#fff"   : "#6b7280",
                                                border:     active ? `1px solid ${PRIMARY}` : "1px solid #e5e7eb",
                                            }}>
                                            {slot}
                                        </Tag>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <Modal title={<span style={{ fontWeight: 700 }}>{editItem ? "✏️ Sửa thông tin bác sĩ" : "➕ Thêm bác sĩ mới"}</span>}
            open={open} onCancel={onClose} footer={null} width={720} destroyOnClose>
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Tabs items={tabItems} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        {editItem ? "Lưu thay đổi" : "Tạo bác sĩ"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

// ── Reset Password Modal ──────────────────────────────────────────
function ResetPwModal({ open, onClose, doctorId }) {
    const [pw, setPw] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const handleReset = async () => {
        if (pw.length < 6) { messageApi.warning("Mật khẩu phải ít nhất 6 ký tự!"); return; }
        setLoading(true);
        const { res, data } = await fetchApi(`admin/doctors/${doctorId}/reset-password`, { newPassword: pw }, "PUT");
        setLoading(false);
        if (res.ok) { messageApi.success("Đặt lại mật khẩu thành công!"); setPw(""); onClose(); }
        else messageApi.error(data.message || "Thất bại");
    };

    return (
        <Modal title="🔑 Đặt lại mật khẩu" open={open} onCancel={onClose} destroyOnClose
            footer={[
                <Button key="cancel" onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>,
                <Button key="ok" type="primary" loading={loading} onClick={handleReset}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}>Đặt lại</Button>,
            ]}>
            {ctxHolder}
            <Text style={{ display: "block", marginBottom: 12, color: "#6b7280" }}>Nhập mật khẩu mới cho bác sĩ này:</Text>
            <Input.Password value={pw} onChange={e => setPw(e.target.value)} size="large"
                style={{ borderRadius: 10 }} placeholder="Ít nhất 6 ký tự" />
        </Modal>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AdminDoctors() {
    const [doctors,     setDoctors]     = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [total,       setTotal]       = useState(0);
    const [search,      setSearch]      = useState("");
    const [specialty,   setSpecialty]   = useState("");
    const [modalOpen,   setModalOpen]   = useState(false);
    const [editItem,    setEditItem]    = useState(null);
    const [resetPwId,   setResetPwId]   = useState(null);
    const [messageApi,  ctxHolder]      = message.useMessage();

    const load = useCallback(async (s, spec) => {
        setLoading(true);
        const params = new URLSearchParams({ limit: 50 });
        if (s)    params.append("search",    s);
        if (spec) params.append("specialty", spec);
        const { res, data } = await fetchApi(`admin/doctors?${params}`, null, "GET");
        if (res.ok) { setDoctors(data.doctors || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    const loadServices = useCallback(async () => {
        const { res, data } = await fetchApi("admin/services?limit=100", null, "GET");
        if (res.ok) setAllServices(data.services || []);
    }, []);

    useEffect(() => {
        (async () => { await load("", ""); await loadServices(); })();
    }, [load, loadServices]);

    const handleDelete = async (id) => {
        const { res, data } = await fetchApi(`admin/doctors/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success(data.message); load(search, specialty); }
        else messageApi.error("Xóa thất bại");
    };

    const columns = [
        {
            title: "Bác sĩ", key: "doctor",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {r.photo || r.user?.avatar
                        ? <img src={r.photo || r.user?.avatar} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        : <Avatar size={44} style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}>{r.user?.fullName?.charAt(0)}</Avatar>
                    }
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>BS. {r.user?.fullName}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{r.user?.email}</div>
                        {r.user?.phoneNumber && <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.user.phoneNumber}</div>}
                    </div>
                </div>
            ),
        },
        {
            title: "Chuyên khoa", key: "specialty",
            render: (_, r) => (
                <div>
                    <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>{r.specialty}</Tag>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{r.degree}</div>
                </div>
            ),
        },
        {
            title: "Dịch vụ",
            render: (_, r) => (
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {r.services?.length > 0 ? `${r.services.length} dịch vụ` : "Chưa gán"}
                </Text>
            ),
        },
        {
            title: "Đánh giá",
            render: (_, r) => (
                <Text style={{ fontSize: 13 }}>⭐ {r.rating?.toFixed(1) || "—"} ({r.reviewCount || 0})</Text>
            ),
        },
        {
            title: "Thao tác", key: "actions", width: 130,
            render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => { setEditItem(r); setModalOpen(true); }} />
                    </Tooltip>
                    <Tooltip title="Đặt lại mật khẩu">
                        <Button size="small" icon={<KeyOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => setResetPwId(r._id)} />
                    </Tooltip>
                    <Popconfirm title="Xóa bác sĩ này?" description="Tài khoản sẽ chuyển về Customer." onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
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
                    <Title level={3} style={{ margin: 0 }}>👨‍⚕️ Quản lý bác sĩ</Title>
                    <Text style={{ color: "#9ca3af" }}>Tổng {total} bác sĩ</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => { setEditItem(null); setModalOpen(true); }}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Thêm bác sĩ
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm theo tên, email..." value={search} allowClear size="large"
                            style={{ borderRadius: 10 }}
                            onChange={e => { setSearch(e.target.value); load(e.target.value, specialty); }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select placeholder="Lọc chuyên khoa" value={specialty || undefined} allowClear
                            onChange={v => { setSpecialty(v || ""); load(search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {SPECIALTIES.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setSpecialty(""); load("", ""); }} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={doctors} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} bác sĩ` }}
                    scroll={{ x: 700 }} />
            </Card>

            <DoctorModal open={modalOpen} onClose={() => setModalOpen(false)}
                onSuccess={() => load(search, specialty)}
                editItem={editItem} allServices={allServices} />

            <ResetPwModal open={!!resetPwId} onClose={() => setResetPwId(null)} doctorId={resetPwId} />
        </ConfigProvider>
    );
}