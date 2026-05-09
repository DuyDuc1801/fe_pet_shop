import { useState, useEffect, useCallback } from "react";
import {
    Card, Tag, Button, Typography, Spin, ConfigProvider,
    message, Modal, Input, Tooltip, Steps, Badge,
} from "antd";
import {
    CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined,
    CloseCircleOutlined, StarOutlined, WarningOutlined,
    LoginOutlined, LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";
import ReviewModal from "../../../../src/components/common/ReviewModal";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";

// ── Config trạng thái ─────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending:    { color: "orange", label: "Chờ xác nhận",    step: 0 },
    Confirmed:  { color: "blue",   label: "Đã xác nhận",     step: 1 },
    CheckedIn:  { color: "cyan",   label: "Đã đến phòng khám", step: 2 },
    InProgress: { color: "purple", label: "Đang khám",        step: 3 },
    Completed:  { color: "green",  label: "Hoàn thành",       step: 4 },
    Cancelled:  { color: "red",    label: "Đã hủy",           step: -1 },
};

const CANCEL_HOURS_BEFORE = 2;

function canCancel(apt) {
    if (!['Pending', 'Confirmed'].includes(apt.status)) return { can: false, reason: '' };
    const diff = dayjs(`${apt.date} ${apt.time}`, 'YYYY-MM-DD HH:mm').diff(dayjs(), 'hour');
    if (diff < CANCEL_HOURS_BEFORE)
        return { can: false, reason: `Không thể hủy trong vòng ${CANCEL_HOURS_BEFORE} tiếng trước giờ khám` };
    return { can: true, reason: '' };
}

function canCheckin(apt) {
    if (apt.status !== 'Confirmed') return false;
    const diff = dayjs(`${apt.date} ${apt.time}`, 'YYYY-MM-DD HH:mm').diff(dayjs(), 'minute');
    return diff <= 120 && diff >= -30; // trong vòng 2h trước đến 30p sau giờ hẹn
}

// ── Progress steps ─────────────────────────────────────────────────
function AptProgress({ status }) {
    if (status === 'Cancelled') return null;
    const steps = [
        { title: "Chờ xác nhận" },
        { title: "Đã xác nhận"  },
        { title: "Đã đến"       },
        { title: "Đang khám"    },
        { title: "Hoàn thành"   },
    ];
    const current = STATUS_CONFIG[status]?.step ?? 0;
    return (
        <Steps size="small" current={current} items={steps}
            style={{ marginTop: 14 }}
            progressDot
        />
    );
}

// ── Booking Card ───────────────────────────────────────────────────
function BookingCard({ apt, onCancel, onCheckin, onReview, checkingIn }) {
    const cfg       = STATUS_CONFIG[apt.status] || STATUS_CONFIG.Pending;
    const cancelInfo= canCancel(apt);
    const showCheckin = canCheckin(apt);
    const canReview = apt.status === 'Completed';

    return (
        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {/* Icon dịch vụ */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {apt.service?.icon || "🩺"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{apt.service?.name}</div>
                            <div style={{ fontSize: 13, color: "#6b7280" }}>BS. {apt.doctor?.user?.fullName}</div>
                        </div>
                        <Tag color={cfg.color} style={{ borderRadius: 8, fontWeight: 600, padding: "3px 10px", height: "fit-content" }}>
                            {cfg.label}
                        </Tag>
                    </div>

                    {/* Thông tin */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: "#6b7280" }}><CalendarOutlined /> {dayjs(apt.date).format("DD/MM/YYYY")}</span>
                        <span style={{ fontSize: 13, color: "#6b7280" }}><ClockCircleOutlined /> {apt.time}</span>
                        <span style={{ fontSize: 13, color: PRIMARY, fontWeight: 700 }}>{apt.service?.price?.toLocaleString("vi-VN")}₫</span>
                    </div>

                    {/* Thú cưng */}
                    {apt.petName && (
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                            🐾 {apt.petName} · {apt.petType}{apt.petAge ? ` · ${apt.petAge}` : ""}
                        </div>
                    )}

                    {/* Check-in banner — nổi bật khi đến giờ */}
                    {showCheckin && (
                        <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px solid #93c5fd", borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8" }}>📍 Bạn đã đến phòng khám chưa?</div>
                                <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>Bấm xác nhận để bác sĩ biết bạn đã có mặt và chuẩn bị khám</div>
                            </div>
                            <Button type="primary" icon={checkingIn ? <LoadingOutlined /> : <LoginOutlined />}
                                loading={checkingIn} onClick={() => onCheckin(apt._id)}
                                style={{ background: "#2563eb", borderColor: "#2563eb", borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
                                Xác nhận đã đến
                            </Button>
                        </div>
                    )}

                    {/* Đã check-in badge */}
                    {apt.status === 'CheckedIn' && (
                        <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#16a34a" }}>
                            ✅ Bạn đã xác nhận đến lúc {apt.checkedInAt ? dayjs(apt.checkedInAt).format("HH:mm") : ""}. Đợi bác sĩ gọi vào khám nhé!
                        </div>
                    )}

                    {/* Đang khám */}
                    {apt.status === 'InProgress' && (
                        <div style={{ background: "#fdf4ff", border: "1.5px solid #d8b4fe", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#7c3aed" }}>
                            🩺 Bác sĩ đang khám cho bé nhà bạn...
                        </div>
                    )}

                    {/* Progress bar */}
                    <AptProgress status={apt.status} />

                    {/* Admin note */}
                    {apt.adminNote && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "#fafafa", borderRadius: 10, fontSize: 12, color: "#6b7280" }}>
                            💬 Ghi chú: {apt.adminNote}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {['Pending','Confirmed'].includes(apt.status) && (
                            cancelInfo.can ? (
                                <Button danger onClick={() => onCancel(apt._id)} size="small" style={{ borderRadius: 8 }}>
                                    Hủy lịch
                                </Button>
                            ) : (
                                <Tooltip title={cancelInfo.reason}>
                                    <Button danger disabled size="small" style={{ borderRadius: 8 }}>
                                        <WarningOutlined /> Không thể hủy
                                    </Button>
                                </Tooltip>
                            )
                        )}
                        {canReview && (
                            <Button icon={<StarOutlined />} size="small" onClick={() => onReview(apt)}
                                style={{ borderRadius: 8, borderColor: "#f59e0b", color: "#f59e0b", fontWeight: 600 }}>
                                Đánh giá bác sĩ
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function MyBookingsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [cancelId,     setCancelId]     = useState("");
    const [cancelNote,   setCancelNote]   = useState("");
    const [cancelling,   setCancelling]   = useState(false);
    const [checkingIn,   setCheckingIn]   = useState("");  // appointment _id đang check-in
    const [reviewApt,    setReviewApt]    = useState(null);
    const [reviewOpen,   setReviewOpen]   = useState(false);
    const [messageApi,   ctxHolder]       = message.useMessage();

    const load = useCallback(async () => {
        setLoading(true);
        const { res, data } = await fetchApi("appointments/my", null, "GET");
        if (res.ok) setAppointments(data.appointments || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(); })();
        // Poll mỗi 30 giây để cập nhật trạng thái (khi bác sĩ bắt đầu khám)
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [load]);

    const handleCancel = async () => {
        setCancelling(true);
        const { res, data } = await fetchApi(`appointments/${cancelId}/cancel`, { note: cancelNote }, "PUT");
        setCancelling(false);
        if (res.ok) {
            messageApi.success("Đã hủy lịch hẹn");
            setCancelId(""); setCancelNote(""); load();
        } else {
            messageApi.error(data.message || "Hủy thất bại");
        }
    };

    const handleCheckin = async (aptId) => {
        setCheckingIn(aptId);
        const { res, data } = await fetchApi(`appointments/${aptId}/checkin`, {}, "POST");
        setCheckingIn("");
        if (res.ok) {
            messageApi.success(data.message);
            load();
        } else {
            messageApi.error(data.message || "Check-in thất bại");
        }
    };

    // Group theo trạng thái
    const groups = {
        upcoming:   appointments.filter(a => ['Pending','Confirmed','CheckedIn','InProgress'].includes(a.status)),
        completed:  appointments.filter(a => a.status === 'Completed'),
        cancelled:  appointments.filter(a => a.status === 'Cancelled'),
    };

    const sections = [
        { key: "upcoming",  label: "🗓️ Sắp tới & Đang diễn ra",  data: groups.upcoming  },
        { key: "completed", label: "✅ Đã hoàn thành",             data: groups.completed },
        { key: "cancelled", label: "❌ Đã hủy",                    data: groups.cancelled },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <Title level={3} style={{ margin: "0 0 24px" }}>📅 Lịch khám của tôi</Title>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
            ) : (
                sections.map(sec => (
                    <div key={sec.key} style={{ marginBottom: 32 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>
                            {sec.label}
                            <Badge count={sec.data.length} style={{ marginLeft: 8, background: PRIMARY }} />
                        </div>
                        {sec.data.length === 0 ? (
                            <div style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0" }}>Không có lịch nào</div>
                        ) : (
                            sec.data.map(apt => (
                                <BookingCard key={apt._id} apt={apt}
                                    onCancel={setCancelId}
                                    onCheckin={handleCheckin}
                                    checkingIn={checkingIn === apt._id}
                                    onReview={a => { setReviewApt(a); setReviewOpen(true); }}
                                />
                            ))
                        )}
                    </div>
                ))
            )}

            {/* Modal hủy */}
            <Modal title="Hủy lịch hẹn" open={!!cancelId}
                onOk={handleCancel} onCancel={() => { setCancelId(""); setCancelNote(""); }}
                okText="Xác nhận hủy" cancelText="Đóng"
                okButtonProps={{ danger: true, loading: cancelling }}>
                <Text style={{ color: "#6b7280", display: "block", marginBottom: 12 }}>
                    Bạn có chắc muốn hủy lịch hẹn này?
                </Text>
                <Input.TextArea rows={3} value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                    placeholder="Lý do hủy (tuỳ chọn)..." style={{ borderRadius: 10 }} />
            </Modal>

            {/* Review modal */}
            {reviewApt && (
                <ReviewModal type="doctor"
                    targetName={`BS. ${reviewApt.doctor?.user?.fullName}`}
                    targetImage={reviewApt.doctor?.photo}
                    appointmentId={reviewApt._id}
                    open={reviewOpen}
                    onClose={() => { setReviewOpen(false); setReviewApt(null); }}
                    onSuccess={() => { messageApi.success("Cảm ơn đánh giá của bạn!"); load(); }}
                />
            )}
        </ConfigProvider>
    );
}