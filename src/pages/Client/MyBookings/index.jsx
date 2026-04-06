import { useState, useEffect, useCallback } from "react";
import {
    Card, Tag, Button, Typography, Spin, Empty,
    ConfigProvider, message, Modal, Input, Tooltip,
    Tabs, Avatar, Space, Divider, Badge
} from "antd";
import {
    CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined,
    CloseCircleOutlined, StarFilled, WarningOutlined,
    MedicineBoxOutlined, UserOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";
import ReviewModal from "../../../components/common/ReviewModal";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

const STATUS_CONFIG = {
    Pending:   { color: "orange", label: "Chờ xác nhận",  icon: <ClockCircleOutlined /> },
    Confirmed: { color: "green",  label: "Đã xác nhận",  icon: <CheckCircleOutlined /> },
    Completed: { color: "blue",   label: "Hoàn thành",   icon: <CheckCircleOutlined /> },
    Cancelled: { color: "red",    label: "Đã hủy",       icon: <CloseCircleOutlined /> },
};

const CANCEL_HOURS_BEFORE = 2;

function canCancelAppointment(apt) {
    if (!['Pending', 'Confirmed'].includes(apt.status)) return { can: false, reason: '' };
    const aptDateTime = dayjs(`${apt.date} ${apt.time}`, 'YYYY-MM-DD HH:mm');
    const hoursLeft   = aptDateTime.diff(dayjs(), 'hour');
    if (hoursLeft < CANCEL_HOURS_BEFORE) {
        return {
            can:    false,
            reason: `Chính sách: Không thể hủy trước giờ khám ${CANCEL_HOURS_BEFORE} tiếng`,
        };
    }
    return { can: true, reason: '' };
}

// ── Component con: Thẻ lịch hẹn nâng cấp ────────────────────────
function BookingCard({ apt, onCancel, onReview }) {
    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.Pending;
    const cancelInfo = canCancelAppointment(apt);
    const canReview = apt.status === 'Completed';

    return (
        <Card 
            bordered={false} 
            style={{ 
                borderRadius: 20, 
                marginBottom: 16, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                border: "1px solid #f1f5f9"
            }}
            bodyStyle={{ padding: "20px 24px" }}
        >
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                
                {/* Khối Thời gian */}
                <div style={{ 
                    textAlign: "center", 
                    padding: "12px 16px", 
                    background: "#f8fafc", 
                    borderRadius: 16, 
                    minWidth: 100,
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ color: PRIMARY, fontWeight: 800, fontSize: 18 }}>{apt.time}</div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginTop: 2 }}>
                        {dayjs(apt.date).format("DD MMM")}
                    </div>
                </div>

                {/* Thông tin bác sĩ & Dịch vụ */}
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16, color: DARK_NAVY }}>{apt.service?.name}</Text>
                        <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 700, border: "none", fontSize: 11 }}>
                            {cfg.label.toUpperCase()}
                        </Tag>
                    </div>
                    <Space split={<Divider type="vertical" />} style={{ fontSize: 13, color: "#64748b" }}>
                        <span><UserOutlined /> BS. {apt.doctor?.user?.fullName}</span>
                        {apt.petName && <span>🐾 {apt.petName} ({apt.petType})</span>}
                    </Space>
                </div>

                {/* Phí & Hành động */}
                <div style={{ textAlign: "right", minWidth: 150 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: DARK_NAVY, marginBottom: 12 }}>
                        {apt.service?.price?.toLocaleString("vi-VN")}₫
                    </div>
                    <Space>
                        {['Pending', 'Confirmed'].includes(apt.status) && (
                            cancelInfo.can ? (
                                <Button type="text" danger onClick={() => onCancel(apt._id)} style={{ fontWeight: 600 }}>
                                    Hủy lịch
                                </Button>
                            ) : (
                                <Tooltip title={cancelInfo.reason}>
                                    <Text type="secondary" style={{ fontSize: 12, cursor: "help" }}><WarningOutlined /> Quy định hủy</Text>
                                </Tooltip>
                            )
                        )}
                        {canReview && (
                            <Button icon={<StarFilled />} onClick={() => onReview(apt)}
                                style={{ borderRadius: 10, background: "#fff", borderColor: "#f59e0b", color: "#f59e0b", fontWeight: 700 }}>
                                Đánh giá
                            </Button>
                        )}
                        <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} 
                            style={{ background: DARK_NAVY, border: "none" }}
                        />
                    </Space>
                </div>
            </div>
        </Card>
    );
}

// ── COMPONENT CHÍNH ───────────────────────────────────────────
export default function MyBookingsPage() {
    const [appointments, setAppointments] = useState({ upcoming: [], completed: [], cancelled: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [cancelId, setCancelId] = useState("");
    const [cancelNote, setCancelNote] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [reviewApt, setReviewApt] = useState(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const load = useCallback(async () => {
        setLoading(true);
        const { res, data } = await fetchApi("appointments/my", null, "GET");
        if (res.ok) {
            const all = data || [];
            setAppointments({
                upcoming:  all.filter(a => ['Pending','Confirmed'].includes(a.status)),
                completed: all.filter(a => a.status === 'Completed'),
                cancelled: all.filter(a => a.status === 'Cancelled'),
            });
        }
        console.log(data);
        setLoading(false);
    }, []);

    useEffect(() => { 
        const initFetch = async () => {load(); }
        initFetch();
    }, [load]);

    const handleCancel = async () => {
        setCancelling(true);
        const { res, data } = await fetchApi(`appointments/${cancelId}/cancel`, { note: cancelNote }, "PUT");
        setCancelling(false);

        if (res.ok) {
            messageApi.success("Đã hủy lịch hẹn thành công");
            setCancelId(""); setCancelNote("");
            load();
        } else messageApi.error(data.message || "Hủy thất bại");
    };

    const tabItems = [
        { key: "upcoming", label: `Sắp tới (${appointments.upcoming.length})` },
        { key: "completed", label: `Hoàn thành (${appointments.completed.length})` },
        { key: "cancelled", label: `Đã hủy (${appointments.cancelled.length})` },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" } }}>
            {ctxHolder}
            
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 0" }}>
                <div style={{ marginBottom: 32 }}>
                    <Title level={2} style={{ fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>Lịch khám của tôi</Title>
                    <Text type="secondary">Theo dõi và quản lý các cuộc hẹn chăm sóc thú cưng của bạn</Text>
                </div>

                <div style={{ background: "#fff", borderRadius: 16, padding: "0 16px", marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab}
                        items={tabItems}
                        tabBarStyle={{ marginBottom: 0 }}
                        className="custom-booking-tabs"
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}><Spin size="large" tip="Đang tải lịch hẹn..." /></div>
                ) : appointments[activeTab].length === 0 ? (
                    <Card bordered={false} style={{ borderRadius: 24, textAlign: "center", padding: "60px 0" }}>
                        <Empty 
                            image={<CalendarOutlined style={{ fontSize: 60, color: "#e5e7eb" }} />}
                            description={
                                <Space direction="vertical" size={4}>
                                    <Text strong style={{ fontSize: 16, color: "#94a3b8" }}>Không tìm thấy lịch hẹn nào</Text>
                                    <Text type="secondary">Các cuộc hẹn của bạn sẽ xuất hiện tại đây</Text>
                                </Space>
                            }
                        />
                    </Card>
                ) : (
                    <div style={{ animation: "fadeUp 0.6s ease" }}>
                        {appointments[activeTab].map(apt => (
                            <BookingCard 
                                key={apt._id} 
                                apt={apt} 
                                onCancel={setCancelId} 
                                onReview={a => { setReviewApt(a); setReviewOpen(true); }} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Hủy lịch */}
            <Modal
                title={<Space><WarningOutlined style={{ color: "#ef4444" }} /><span>Xác nhận hủy lịch hẹn</span></Space>}
                open={!!cancelId}
                onOk={handleCancel}
                onCancel={() => { setCancelId(""); setCancelNote(""); }}
                okText="Xác nhận hủy"
                okButtonProps={{ danger: true, loading: cancelling, style: { borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
                centered
            >
                <Paragraph>Bạn đang thực hiện hủy lịch hẹn. Vui lòng cho bác sĩ biết lý do để chúng tôi hỗ trợ bạn tốt hơn lần sau:</Paragraph>
                <Input.TextArea rows={4} value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                    placeholder="Ví dụ: Tôi bận việc đột xuất, tôi muốn đổi sang bác sĩ khác..." style={{ borderRadius: 12 }} />
            </Modal>

            {/* Review Modal */}
            {reviewApt && (
                <ReviewModal
                    type="doctor"
                    targetName={`BS. ${reviewApt.doctor?.user?.fullName}`}
                    targetImage={reviewApt.doctor?.photo}
                    appointmentId={reviewApt._id}
                    open={reviewOpen}
                    onClose={() => { setReviewOpen(false); setReviewApt(null); }}
                    onSuccess={() => { messageApi.success("Cảm ơn bạn đã đánh giá bác sĩ!"); load(); }}
                />
            )}

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .custom-booking-tabs .ant-tabs-ink-bar { background: ${PRIMARY} !important; height: 3px !important; }
                .custom-booking-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${PRIMARY} !important; font-weight: 700 !important; }
                .custom-booking-tabs .ant-tabs-nav::before { border-bottom: none !important; }
            `}</style>
        </ConfigProvider>
    );
}