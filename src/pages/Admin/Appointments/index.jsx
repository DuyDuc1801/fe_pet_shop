import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Select, DatePicker, Space, Card,
    Input, Typography, Row, Col, Statistic,
    Tooltip, ConfigProvider, message, Drawer,
} from "antd";
import {
    CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
    CloseCircleOutlined, EyeOutlined,
    ReloadOutlined, CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";

const STATUS_CONFIG = {
    Pending:   { color: "orange", label: "Chờ xác nhận" },
    Confirmed: { color: "green", label: "Đã xác nhận"},
    Completed: { color: "blue", label: "Hoàn thành"},
    Cancelled: { color: "red", label: "Đã hủy" },
};

// Đặt NGOÀI component — không bị recreate mỗi render
function InfoRow({ label, value, color }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <Text style={{ color: "#9ca3af", fontSize: 13 }}>{label}</Text>
            <Text style={{ fontWeight: 600, fontSize: 13, color: color || "#1c1c1c" }}>{value}</Text>
        </div>
    );
}

function StatCards({ stats }) {
    const cards = [
        { label: "Hôm nay", value: stats.todayTotal, color: PRIMARY,   bg: "#fff7ed", icon: <CalendarOutlined /> },
        { label: "Chờ xác nhận", value: stats.pending,    color: "#f59e0b", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
        { label: "Đã xác nhận", value: stats.confirmed,  color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
        { label: "Hoàn thành", value: stats.completed,  color: "#3b82f6", bg: "#eff6ff", icon: <CheckOutlined /> },
    ];
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {cards.map(c => (
                <Col xs={12} lg={6} key={c.label}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Statistic
                                title={<span style={{ fontSize: 12, color: "#6b7280" }}>{c.label}</span>}
                                value={c.value ?? 0}
                                valueStyle={{ fontSize: 28, fontWeight: 700, color: c.color }}
                            />
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: c.color }}>
                                {c.icon}
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

// ── DetailDrawer ──────────────────────────────────────────────────
// FIX: Không dùng useEffect để sync state từ prop.
// Dùng initializer function + reset bằng `key` ở phía cha.
// Khi `key` thay đổi, React unmount rồi mount lại component → state tự reset.
function DetailDrawer({ apt, open, onClose, onUpdateStatus }) {
    const [newStatus, setNewStatus] = useState(() => apt?.status || '');
    const [adminNote, setAdminNote] = useState(() => apt?.adminNote || '');
    const [loading,   setLoading]   = useState(false);
    const [messageApi, ctxHolder]   = message.useMessage();

    const handleSave = async () => {
        setLoading(true);
        const { res, data } = await fetchApi(
            `admin/appointments/${apt._id}/status`,
            { status: newStatus, adminNote },
            'PUT'
        );
        setLoading(false);
        if (res.ok) {
            messageApi.success('Cập nhật thành công!');
            onUpdateStatus(data.appointment);
            onClose();
        } else {
            messageApi.error(data.message || 'Cập nhật thất bại');
        }
    };

    if (!apt) return null;

    return (
        <Drawer
            title={<span style={{ fontWeight: 700 }}>Chi tiết lịch hẹn</span>}
            open={open} onClose={onClose} width={420}
            footer={
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Đóng</Button>
                    <Button type="primary" loading={loading} onClick={handleSave}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        Lưu thay đổi
                    </Button>
                </Space>
            }
        >
            {ctxHolder}

            <div style={{ background: "#fff7ed", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 36 }}>{apt.service?.icon || "🩺"}</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{apt.petName}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {apt.petType}{apt.petAge ? ` · ${apt.petAge}` : ''}{apt.petWeight ? ` · ${apt.petWeight}` : ''}
                    </div>
                </div>
            </div>

            <InfoRow label="Dịch vụ" value={apt.service?.name} />
            <InfoRow label="Bác sĩ" value={apt.doctor?.user?.fullName} />
            <InfoRow label="Ngày khám" value={dayjs(apt.date).format('DD/MM/YYYY')} />
            <InfoRow label="Giờ khám" value={apt.time} />
            <InfoRow label="Khách hàng" value={apt.customer?.fullName} />
            <InfoRow label="SĐT" value={apt.customer?.phoneNumber || '—'} />
            <InfoRow label="Phí dịch vụ" value={`${apt.service?.price?.toLocaleString('vi-VN')}₫`} color={PRIMARY} />

            {apt.note && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#fafafa", borderRadius: 10, fontSize: 13, color: "#6b7280" }}>
                    📝 {apt.note}
                </div>
            )}

            <div style={{ marginTop: 24 }}>
                <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 8 }}>Cập nhật trạng thái</Text>
                <Select value={newStatus} onChange={setNewStatus} style={{ width: "100%", marginBottom: 12 }} size="large">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <Option key={k} value={k}>
                            <Tag color={v.color} style={{ borderRadius: 6 }}>{v.label}</Tag>
                        </Option>
                    ))}
                </Select>

                <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 8 }}>Ghi chú cho khách</Text>
                <Input.TextArea rows={3} value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="VD: Nhớ nhịn ăn trước 4 tiếng..."
                    style={{ borderRadius: 10 }} />
            </div>
        </Drawer>
    );
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ status: '', date: '' });
    const [detailApt, setDetailApt] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const PAGE_SIZE = 10;

    // loadStats: không phụ thuộc state nào → khai báo ngoài để stable ref
    const loadStats = useCallback(async () => {
        const { res, data } = await fetchApi('admin/appointments/stats', null, 'GET');
        if (res.ok) setStats(data);
    }, []);

    const loadData = useCallback(async (pg, f) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (f.status) params.append('status', f.status);
        if (f.date)   params.append('date',   f.date);
        const { res, data } = await fetchApi(`admin/appointments?${params}`, null, 'GET');
        if (res.ok) {
            setAppointments(data.appointments);
            setTotal(data.total);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => {
            await loadStats();
            await loadData(1, { status: '', date: '' });
        })();
    }, [loadStats, loadData]);

    const handleFilter = (key, val) => {
        const newFilters = { ...filters, [key]: val };
        setFilters(newFilters);
        setPage(1);
        loadData(1, newFilters);
    };

    const handleReset = () => {
        const reset = { status: '', date: '' };
        setFilters(reset);
        setPage(1);
        loadData(1, reset);
    };

    const handleUpdateStatus = useCallback((updatedApt) => {
        setAppointments(prev => prev.map(a => a._id === updatedApt._id ? updatedApt : a));
        loadStats();
    }, [loadStats]);

    const quickConfirm = async (id) => {
        const { res, data } = await fetchApi(`admin/appointments/${id}/status`, { status: 'Confirmed' }, 'PUT');
        if (res.ok) {
            messageApi.success('Đã xác nhận lịch hẹn!');
            handleUpdateStatus(data.appointment);
        } else {
            messageApi.error(data.message);
        }
    };

    const columns = [
        {
            title: "Thú cưng / Khách hàng",
            key: "pet",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {r.service?.icon || "🩺"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.petName} ({r.petType})</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{r.customer?.fullName}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Dịch vụ",
            key: "service",
            render: (_, r) => (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.service?.name}</div>
                    <div style={{ fontSize: 12, color: PRIMARY }}>{r.service?.price?.toLocaleString('vi-VN')}₫</div>
                </div>
            ),
        },
        {
            title: "Bác sĩ",
            key: "doctor",
            render: (_, r) => <Text style={{ fontSize: 13 }}>{r.doctor?.user?.fullName}</Text>,
        },
        {
            title: "Ngày & Giờ",
            key: "datetime",
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{dayjs(r.date).format('DD/MM/YYYY')}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{r.time}</div>
                </div>
            ),
            sorter: (a, b) => (a.date + a.time).localeCompare(b.date + b.time),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: s => {
                const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.Pending;
                return <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 600 }}>{cfg.label}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            render: (_, r) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button size="small" icon={<EyeOutlined />}
                            onClick={() => { setDetailApt(r); setDrawerOpen(true); }}
                            style={{ borderRadius: 8 }} />
                    </Tooltip>
                    {r.status === 'Pending' && (
                        <Tooltip title="Xác nhận nhanh">
                            <Button size="small" type="primary" icon={<CheckOutlined />}
                                onClick={() => quickConfirm(r._id)}
                                style={{ background: "#22c55e", borderColor: "#22c55e", borderRadius: 8 }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>📅 Quản lý lịch hẹn</Title>
                <Text style={{ color: "#6b7280" }}>Xem, xác nhận và cập nhật trạng thái lịch hẹn</Text>
            </div>

            <StatCards stats={stats} />

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Select placeholder="Lọc theo trạng thái" value={filters.status || undefined}
                            onChange={v => handleFilter('status', v || '')} allowClear style={{ width: "100%" }} size="large">
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <DatePicker placeholder="Lọc theo ngày" size="large" style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            value={filters.date ? dayjs(filters.date) : null}
                            onChange={d => handleFilter('date', d ? d.format('YYYY-MM-DD') : '')} />
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={handleReset} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                    <Col style={{ marginLeft: "auto" }}>
                        <Button icon={<ReloadOutlined />} onClick={() => loadData(page, filters)} size="large"
                            style={{ borderRadius: 10, borderColor: PRIMARY, color: PRIMARY }}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table
                    dataSource={appointments} columns={columns} rowKey="_id" loading={loading}
                    pagination={{
                        current: page, pageSize: PAGE_SIZE, total,
                        onChange: (p) => { setPage(p); loadData(p, filters); },
                        showTotal: (t) => `Tổng ${t} lịch hẹn`,
                    }}
                    scroll={{ x: 800 }}
                    rowClassName={r => r.status === 'Pending' ? 'row-pending' : ''}
                />
            </Card>

            {/* key={detailApt?._id} → mỗi lần mở apt mới, React remount DetailDrawer
                → useState initializer chạy lại → không cần useEffect để reset state */}
            <DetailDrawer
                key={detailApt?._id}
                apt={drawerOpen ? detailApt : null}
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setDetailApt(null); }}
                onUpdateStatus={handleUpdateStatus}
            />

            <style>{`
                .row-pending { background: #fffbf0 !important; }
                .row-pending:hover > td { background: #fff7ed !important; }
            `}</style>
        </ConfigProvider>
    );
}