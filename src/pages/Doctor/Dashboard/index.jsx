import { useState, useEffect, useCallback } from "react";
import {
    Row, Col, Card, Tag, Button, Typography, Spin, Avatar,
    ConfigProvider, Statistic, Rate, Drawer, Input, Select,
} from "antd";
import {
    CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
    StarFilled, UserOutlined, CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";
import { useAuth } from "../../../../contexts/useAuth";

const { Title, Text } = Typography;
const { Option }      = Select;
const PRIMARY = "#f97316";

const STATUS_CONFIG = {
    Pending:   { color: "orange", label: "Chờ xác nhận" },
    Confirmed: { color: "green",  label: "Đã xác nhận"  },
    Completed: { color: "blue",   label: "Hoàn thành"   },
    Cancelled: { color: "red",    label: "Đã hủy"       },
};

function AppointmentCard({ apt, onUpdate }) {
    const [loading,  setLoading]  = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [note,     setNote]     = useState(apt.adminNote || "");

    const handleStatus = async (status) => {
        setLoading(true);
        const { res } = await fetchApi(`doctor/appointments/${apt._id}/status`, { status, adminNote: note }, "PUT");
        setLoading(false);
        if (res.ok) { onUpdate(); setDrawerOpen(false); }
    };

    return (
        <>
            <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                {/* Avatar khách hàng */}
                {apt.customer?.avatar
                    ? <img src={apt.customer.avatar} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <Avatar size={42} style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}>{apt.customer?.fullName?.charAt(0)}</Avatar>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{apt.customer?.fullName}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {apt.service?.icon} {apt.service?.name} · 🐾 {apt.petName} ({apt.petType})
                    </div>
                    <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, marginTop: 2 }}>
                        <ClockCircleOutlined /> {apt.time} · {apt.service?.duration} phút
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Tag color={STATUS_CONFIG[apt.status]?.color} style={{ borderRadius: 6, fontWeight: 600, margin: 0 }}>
                        {STATUS_CONFIG[apt.status]?.label}
                    </Tag>
                    <Button size="small" onClick={() => setDrawerOpen(true)} style={{ borderRadius: 8, fontSize: 12 }}>
                        Xử lý
                    </Button>
                </div>
            </div>

            <Drawer title={`Lịch hẹn - ${apt.customer?.fullName}`}
                open={drawerOpen} onClose={() => setDrawerOpen(false)} width={380}
                footer={
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        {apt.status === 'Pending' && (
                            <Button type="primary" loading={loading} onClick={() => handleStatus('Confirmed')}
                                style={{ background: "#22c55e", borderColor: "#22c55e", borderRadius: 8 }}>
                                ✅ Xác nhận
                            </Button>
                        )}
                        {apt.status === 'Confirmed' && (
                            <Button type="primary" loading={loading} onClick={() => handleStatus('Completed')}
                                style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}>
                                <CheckOutlined /> Hoàn thành
                            </Button>
                        )}
                        {['Pending','Confirmed'].includes(apt.status) && (
                            <Button danger loading={loading} onClick={() => handleStatus('Cancelled')} style={{ borderRadius: 8 }}>
                                Hủy lịch
                            </Button>
                        )}
                    </div>
                }>
                {[
                    ["Khách hàng", apt.customer?.fullName],
                    ["SĐT",        apt.customer?.phoneNumber || "—"],
                    ["Dịch vụ",    `${apt.service?.icon} ${apt.service?.name}`],
                    ["Ngày khám",  dayjs(apt.date).format("DD/MM/YYYY")],
                    ["Giờ khám",   apt.time],
                    ["Thú cưng",   `${apt.petName} (${apt.petType})`],
                    ["Tuổi / Cân", `${apt.petAge || "?"} / ${apt.petWeight || "?"}`],
                ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <Text style={{ color: "#9ca3af", width: 100, fontSize: 13, flexShrink: 0 }}>{k}</Text>
                        <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text>
                    </div>
                ))}
                {apt.note && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#fafafa", borderRadius: 10, fontSize: 13, color: "#6b7280" }}>
                        📝 {apt.note}
                    </div>
                )}
                <div style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>Ghi chú cho bệnh nhân</Text>
                    <Input.TextArea rows={3} value={note} onChange={e => setNote(e.target.value)}
                        placeholder="VD: Nhịn ăn 4 tiếng trước mổ..." style={{ borderRadius: 10 }} />
                </div>
            </Drawer>
        </>
    );
}

export default function DoctorDashboard() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const { user }              = useAuth();

    const load = useCallback(async () => {
        setLoading(true);
        const { res, data: d } = await fetchApi("doctor/dashboard", null, "GET");
        if (res.ok) setData(d);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(); })();
    }, [load]);

    if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;
    if (!data)   return null;

    const { stats, todayAppointments, recentReviews } = data;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <Title level={3} style={{ margin: 0 }}>👨‍⚕️ Dashboard bác sĩ</Title>
                <Text style={{ color: "#9ca3af" }}>Xin chào, BS. {user?.fullName} · {dayjs().format("dddd, DD/MM/YYYY")}</Text>
            </div>

            {/* Stat cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                    { label: "Hôm nay",       value: stats.todayApts,    color: PRIMARY,   bg: "#fff7ed", icon: <CalendarOutlined />    },
                    { label: "Chờ xác nhận",  value: stats.pendingApts,  color: "#f59e0b", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
                    { label: "Tháng này",     value: stats.monthApts,    color: "#3b82f6", bg: "#eff6ff", icon: <CalendarOutlined />    },
                    { label: "Hoàn thành",    value: stats.completedApts,color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
                ].map(s => (
                    <Col xs={12} lg={6} key={s.label}>
                        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Statistic value={s.value}
                                    title={<span style={{ fontSize: 12, color: "#9ca3af" }}>{s.label}</span>}
                                    valueStyle={{ fontSize: 28, fontWeight: 800, color: s.color }} />
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                {/* Lịch hẹn hôm nay */}
                <Col xs={24} lg={15}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <Title level={5} style={{ margin: 0 }}>📅 Lịch hẹn hôm nay</Title>
                            <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs().format("DD/MM/YYYY")}</Text>
                        </div>
                        {todayAppointments.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                                <CalendarOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                                <div>Không có lịch hẹn hôm nay</div>
                            </div>
                        ) : (
                            todayAppointments.map(apt => (
                                <AppointmentCard key={apt._id} apt={apt} onUpdate={load} />
                            ))
                        )}
                    </Card>
                </Col>

                {/* Rating + Reviews */}
                <Col xs={24} lg={9}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 16 }}>
                        <Title level={5} style={{ margin: "0 0 14px" }}>⭐ Đánh giá của tôi</Title>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: PRIMARY, lineHeight: 1 }}>{stats.avgRating}</div>
                            <div>
                                <Rate disabled value={parseFloat(stats.avgRating)} allowHalf style={{ fontSize: 16, color: "#f59e0b" }} />
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{stats.reviewCount} đánh giá</div>
                            </div>
                        </div>
                        <div>
                            {recentReviews.map(r => (
                                <div key={r._id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <Text style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.fullName}</Text>
                                        <Rate disabled value={r.rating} style={{ fontSize: 11, color: "#f59e0b" }} />
                                    </div>
                                    {r.comment && <Text style={{ fontSize: 12, color: "#6b7280" }}>{r.comment}</Text>}
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </ConfigProvider>
    );
}