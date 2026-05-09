import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Select, DatePicker, Space, Card,
    Typography, Row, Col, Statistic, Tooltip, ConfigProvider,
    message, Drawer, Input, Avatar, Badge,
} from "antd";
import {
    CalendarOutlined, CheckOutlined, ClockCircleOutlined,
    CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
    ReloadOutlined, PlayCircleOutlined, LoginOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const DOCTOR_COLOR = "#0ea5e9";

const STATUS_CONFIG = {
    Pending:    { color: "orange", label: "Chờ xác nhận",      next: "Confirmed"  },
    Confirmed:  { color: "blue",   label: "Đã xác nhận",       next: null         }, // chờ khách check-in
    CheckedIn:  { color: "cyan",   label: "Khách đã đến",      next: "InProgress" }, // bác sĩ bắt đầu khám
    InProgress: { color: "purple", label: "Đang khám",         next: "Completed"  },
    Completed:  { color: "green",  label: "Hoàn thành",        next: null         },
    Cancelled:  { color: "red",    label: "Đã hủy",            next: null         },
};

// ── Detail Drawer ─────────────────────────────────────────────────
function AptDrawer({ apt, open, onClose, onUpdate }) {
    const [note,    setNote]    = useState("");
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    useEffect(() => { 
        const setNoteFunc = async () => {
            if (apt) {
                setNote(apt.adminNote || ""); 
            }
        };
        setNoteFunc();
    }, [apt]);

    const handleStatus = async (status) => {
        setLoading(true);
        const endpoint = status === 'InProgress'
            ? `doctor/appointments/${apt._id}/start-exam`
            : `doctor/appointments/${apt._id}/status`;
        const body = status === 'InProgress' ? {} : { status, adminNote: note };
        const { res, data } = await fetchApi(endpoint, body, "PUT");
        setLoading(false);
        if (res.ok) { messageApi.success("Cập nhật thành công!"); onUpdate(); onClose(); }
        else messageApi.error(data.message || "Thất bại");
    };

    if (!apt) return null;
    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.Pending;

    return (
        <Drawer title={<span style={{ fontWeight: 700 }}>Chi tiết lịch hẹn</span>}
            open={open} onClose={onClose} width={420}
            footer={
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    {ctxHolder}
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Đóng</Button>

                    {/* Xác nhận lịch hẹn */}
                    {apt.status === 'Pending' && (
                        <Button type="primary" loading={loading}
                            onClick={() => handleStatus('Confirmed')}
                            style={{ background: "#22c55e", borderColor: "#22c55e", borderRadius: 8 }}>
                            ✅ Xác nhận
                        </Button>
                    )}

                    {/* Chờ khách check-in — không cho bắt đầu */}
                    {apt.status === 'Confirmed' && (
                        <Tooltip title="Khách hàng chưa xác nhận đã đến. Vui lòng đợi.">
                            <Button disabled style={{ borderRadius: 8 }}>
                                <ClockCircleOutlined /> Chờ khách check-in
                            </Button>
                        </Tooltip>
                    )}

                    {/* Bắt đầu khám khi khách đã check-in */}
                    {apt.status === 'CheckedIn' && (
                        <Button type="primary" loading={loading} icon={<PlayCircleOutlined />}
                            onClick={() => handleStatus('InProgress')}
                            style={{ background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, borderRadius: 8, fontWeight: 700 }}>
                            Bắt đầu khám
                        </Button>
                    )}

                    {/* Hoàn thành — điều hướng sang trang khám */}
                    {apt.status === 'InProgress' && (
                        <Button type="primary" loading={loading} icon={<CheckOutlined />}
                            onClick={() => window.location.href = `/doctor/appointments/${apt._id}/kham`}
                            style={{ background: PRIMARY_ORANGE, borderColor: PRIMARY_ORANGE, borderRadius: 8, fontWeight: 700 }}>
                            Nhập bệnh án
                        </Button>
                    )}

                    {['Pending','Confirmed','CheckedIn','InProgress'].includes(apt.status) && (
                        <Button danger loading={loading}
                            onClick={() => handleStatus('Cancelled')} style={{ borderRadius: 8 }}>
                            Hủy lịch
                        </Button>
                    )}
                </Space>
            }>
            {ctxHolder}

            {/* Pet info */}
            <div style={{ background: "#f0f9ff", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 14 }}>
                <div style={{ fontSize: 36 }}>{apt.service?.icon || "🩺"}</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{apt.petName}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {apt.petType}{apt.petAge ? ` · ${apt.petAge}` : ''}{apt.petWeight ? ` · ${apt.petWeight}` : ''}
                    </div>
                </div>
            </div>

            <Tag color={cfg.color} style={{ borderRadius: 8, fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{cfg.label}</Tag>

            {/* Check-in info */}
            {apt.checkedInAt && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#16a34a" }}>
                    ✅ Khách check-in lúc {dayjs(apt.checkedInAt).format("HH:mm DD/MM/YYYY")}
                </div>
            )}

            {/* Thông tin */}
            {[
                ["Dịch vụ",    apt.service?.name],
                ["Ngày khám",  dayjs(apt.date).format("DD/MM/YYYY")],
                ["Giờ khám",   apt.time],
                ["Khách hàng", apt.customer?.fullName],
                ["SĐT",        apt.customer?.phoneNumber || "—"],
                ["Phí",        `${apt.service?.price?.toLocaleString("vi-VN")}₫`],
            ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <Text style={{ color: "#9ca3af", width: 100, fontSize: 13, flexShrink: 0 }}>{k}</Text>
                    <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text>
                </div>
            ))}

            {apt.note && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#fafafa", borderRadius: 10, fontSize: 13, color: "#6b7280" }}>
                    📝 {apt.note}
                </div>
            )}

            <div style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 8 }}>Ghi chú cho bệnh nhân</Text>
                <Input.TextArea rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="VD: Nhịn ăn 4 tiếng trước khám..." style={{ borderRadius: 10 }} />
            </div>
        </Drawer>
    );
}

const PRIMARY_ORANGE = "#f97316";

// ── MAIN ──────────────────────────────────────────────────────────
export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [total,        setTotal]        = useState(0);
    const [page,         setPage]         = useState(1);
    const [filters,      setFilters]      = useState({ status: "", date: "" });
    const [drawerApt,    setDrawerApt]    = useState(null);
    const [drawerOpen,   setDrawerOpen]   = useState(false);
    const [stats, setStats] = useState({ today: 0, pending: 0, checkedIn: 0, completed: 0 });
    const [messageApi, ctxHolder] = message.useMessage();

    const PAGE_SIZE = 10;

    const loadStats = useCallback(async () => {
        const { res, data } = await fetchApi("doctor/dashboard", null, "GET");
        if (res.ok) {
            setStats({
                today:     data.stats.todayApts,
                pending:   data.stats.pendingApts,
                checkedIn: data.stats.checkedInApts || 0,
                completed: data.stats.completedApts,
            });
        }
    }, []);

    const loadData = useCallback(async (pg, f) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (f.status) params.append("status", f.status);
        if (f.date)   params.append("date",   f.date);
        const { res, data } = await fetchApi(`doctor/appointments?${params}`, null, "GET");
        if (res.ok) { setAppointments(data.appointments || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadStats(); await loadData(1, { status: "", date: "" }); })();
        // Poll mỗi 20s để cập nhật khi khách check-in
        const interval = setInterval(() => loadData(page, filters), 20000);
        return () => clearInterval(interval);
    }, [loadStats, loadData]);

    const handleFilter = (key, val) => {
        const nf = { ...filters, [key]: val };
        setFilters(nf); setPage(1); loadData(1, nf);
    };

    // Quick actions ngay trên bảng
    const handleQuickAction = async (apt, action) => {
        const endpoint = action === 'start'
            ? `doctor/appointments/${apt._id}/start-exam`
            : `doctor/appointments/${apt._id}/status`;
        const body = action === 'start' ? {} : {
            status: action === 'confirm' ? 'Confirmed' : 'Completed',
        };
        const { res, data } = await fetchApi(endpoint, body, "PUT");
        if (res.ok) {
            messageApi.success("Cập nhật thành công!");
            loadData(page, filters);
            loadStats();
        } else {
            messageApi.error(data.message || "Thất bại");
        }
    };

    const columns = [
        {
            title: "Thú cưng / Khách hàng", key: "pet",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
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
            title: "Dịch vụ", key: "service",
            render: (_, r) => <Text style={{ fontSize: 13 }}>{r.service?.name}</Text>,
        },
        {
            title: "Ngày & Giờ", key: "datetime",
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{dayjs(r.date).format("DD/MM/YYYY")}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{r.time}</div>
                </div>
            ),
        },
        {
            title: "Trạng thái", dataIndex: "status",
            render: (s, r) => (
                <div>
                    <Tag color={STATUS_CONFIG[s]?.color} style={{ borderRadius: 6, fontWeight: 600 }}>
                        {STATUS_CONFIG[s]?.label}
                    </Tag>
                    {s === 'CheckedIn' && (
                        <div style={{ fontSize: 11, color: "#06b6d4", marginTop: 3 }}>
                            ✅ Check-in {r.checkedInAt ? dayjs(r.checkedInAt).format("HH:mm") : ""}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Thao tác", key: "actions", width: 180,
            render: (_, r) => (
                <Space size={6}>
                    {/* Xác nhận lịch */}
                    {r.status === 'Pending' && (
                        <Tooltip title="Xác nhận">
                            <Button size="small" icon={<CheckOutlined />}
                                onClick={() => handleQuickAction(r, 'confirm')}
                                style={{ borderRadius: 8, background: "#22c55e", borderColor: "#22c55e", color: "#fff" }} />
                        </Tooltip>
                    )}

                    {/* Chờ check-in — disabled */}
                    {r.status === 'Confirmed' && (
                        <Tooltip title="Chờ khách hàng check-in">
                            <Button size="small" icon={<ClockCircleOutlined />} disabled
                                style={{ borderRadius: 8 }} />
                        </Tooltip>
                    )}

                    {/* Bắt đầu khám — chỉ khi CheckedIn */}
                    {r.status === 'CheckedIn' && (
                        <Tooltip title="Bắt đầu khám">
                            <Button size="small" icon={<PlayCircleOutlined />}
                                onClick={() => handleQuickAction(r, 'start')}
                                style={{ borderRadius: 8, background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, color: "#fff" }} />
                        </Tooltip>
                    )}

                    {/* Nhập bệnh án */}
                    {r.status === 'InProgress' && (
                        <Tooltip title="Nhập bệnh án">
                            <Button size="small" type="primary" icon={<CheckOutlined />}
                                onClick={() => window.location.href = `/doctor/appointments/${r._id}/kham`}
                                style={{ borderRadius: 8, background: PRIMARY_ORANGE, borderColor: PRIMARY_ORANGE }} />
                        </Tooltip>
                    )}

                    {/* Xem chi tiết */}
                    <Tooltip title="Chi tiết">
                        <Button size="small" icon={<EyeOutlined />}
                            onClick={() => { setDrawerApt(r); setDrawerOpen(true); }}
                            style={{ borderRadius: 8, borderColor: DOCTOR_COLOR, color: DOCTOR_COLOR }} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: DOCTOR_COLOR, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>📅 Lịch hẹn của tôi</Title>
                <Text style={{ color: "#9ca3af" }}>Tự động cập nhật mỗi 20 giây</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[
                    { label: "Hôm nay",     value: stats.today,     color: DOCTOR_COLOR, bg: "#f0f9ff" },
                    { label: "Chờ xác nhận",value: stats.pending,   color: "#f59e0b",    bg: "#fffbeb" },
                    { label: "Khách đã đến",value: stats.checkedIn, color: "#06b6d4",    bg: "#ecfeff" },
                    { label: "Hoàn thành",  value: stats.completed, color: "#22c55e",    bg: "#f0fdf4" },
                ].map(s => (
                    <Col xs={12} lg={6} key={s.label}>
                        <Card bordered={false} style={{ borderRadius: 14, border: "1.5px solid #e0f2fe" }}>
                            <Statistic value={s.value}
                                title={<span style={{ fontSize: 12, color: "#9ca3af" }}>{s.label}</span>}
                                valueStyle={{ fontSize: 26, fontWeight: 800, color: s.color }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filter */}
            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #e0f2fe", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Select placeholder="Lọc trạng thái" value={filters.status || undefined} allowClear
                            onChange={v => handleFilter("status", v || "")} style={{ width: "100%" }} size="large">
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <DatePicker placeholder="Lọc theo ngày" size="large" style={{ width: "100%" }} format="DD/MM/YYYY"
                            value={filters.date ? dayjs(filters.date) : null}
                            onChange={d => handleFilter("date", d ? d.format("YYYY-MM-DD") : "")} />
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setFilters({ status: "", date: "" }); setPage(1); loadData(1, { status: "", date: "" }); }}
                            size="large" style={{ borderRadius: 10 }}>Đặt lại</Button>
                    </Col>
                    <Col style={{ marginLeft: "auto" }}>
                        <Button icon={<ReloadOutlined />} onClick={() => { loadData(page, filters); loadStats(); }}
                            size="large" style={{ borderRadius: 10, borderColor: DOCTOR_COLOR, color: DOCTOR_COLOR }}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #e0f2fe" }}>
                <Table dataSource={appointments} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total,
                        onChange: p => { setPage(p); loadData(p, filters); },
                        showTotal: t => `Tổng ${t} lịch hẹn` }}
                    scroll={{ x: 750 }}
                    rowClassName={r => r.status === 'CheckedIn' ? 'row-checkedin' : r.status === 'InProgress' ? 'row-inprogress' : ''}
                />
            </Card>

            <AptDrawer key={drawerApt?._id}
                apt={drawerOpen ? drawerApt : null}
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setDrawerApt(null); }}
                onUpdate={() => { loadData(page, filters); loadStats(); }}
            />

            <style>{`
                .row-checkedin { background: #ecfeff !important; }
                .row-checkedin:hover > td { background: #cffafe !important; }
                .row-inprogress { background: #fdf4ff !important; }
                .row-inprogress:hover > td { background: #f3e8ff !important; }
            `}</style>
        </ConfigProvider>
    );
}