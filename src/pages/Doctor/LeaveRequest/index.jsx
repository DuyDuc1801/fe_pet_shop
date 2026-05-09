import { useState, useEffect, useCallback } from "react";
import {
    Card, Button, Tag, Typography, Spin, ConfigProvider, message,
    Modal, Select, DatePicker, Input, Row, Col, Empty, Tabs, Badge,
} from "antd";
import {
    PlusOutlined, DeleteOutlined, CalendarOutlined,
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;
const DOCTOR_COLOR    = "#0ea5e9";

const ALL_SLOTS = ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const STATUS_CONFIG = {
    pending:  { color: "orange", label: "Chờ duyệt",   icon: <ClockCircleOutlined />  },
    approved: { color: "green",  label: "Đã duyệt",    icon: <CheckCircleOutlined />  },
    rejected: { color: "red",    label: "Bị từ chối",  icon: <CloseCircleOutlined />  },
};

function RequestCard({ req, onCancel }) {
    const cfg = STATUS_CONFIG[req.status];
    return (
        <Card bordered={false} style={{ borderRadius: 14, border: "1.5px solid #e0f2fe", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Text style={{ fontWeight: 700, fontSize: 15 }}>
                            📅 {dayjs(req.date).format("dddd, DD/MM/YYYY")}
                        </Text>
                        <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 600 }}>
                            {cfg.icon} {cfg.label}
                        </Tag>
                        <Tag color={req.type === "full_day" ? "red" : "orange"} style={{ borderRadius: 6 }}>
                            {req.type === "full_day" ? "🚫 Cả ngày" : "⏰ Một số giờ"}
                        </Tag>
                    </div>

                    {req.type === "partial" && req.slots?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                            {req.slots.map(s => (
                                <Tag key={s} style={{ borderRadius: 6, background: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa" }}>{s}</Tag>
                            ))}
                        </div>
                    )}

                    <Text style={{ fontSize: 13, color: "#6b7280" }}>Lý do: {req.reason}</Text>

                    {req.adminNote && (
                        <div style={{ marginTop: 6, padding: "6px 12px", background: req.status === "approved" ? "#f0fdf4" : "#fff1f2", borderRadius: 8, fontSize: 12 }}>
                            💬 Admin: {req.adminNote}
                        </div>
                    )}
                </div>

                {req.status === "pending" && (
                    <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onCancel(req._id)}
                        style={{ borderRadius: 8 }}>
                        Hủy yêu cầu
                    </Button>
                )}
            </div>
        </Card>
    );
}

export default function DoctorLeaveRequestPage() {
    const [requests,   setRequests]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [modalOpen,  setModalOpen]  = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    // Form state
    const [leaveDate, setLeaveDate]  = useState(null);
    const [leaveType, setLeaveType]  = useState("full_day");
    const [slots,     setSlots]      = useState([]);
    const [reason,    setReason]     = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const { res, data } = await fetchApi("leave-requests/my", null, "GET");
        if (res.ok) setRequests(data.requests || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(); })();
    }, [load]);

    const handleSubmit = async () => {
        if (!leaveDate) { messageApi.warning("Vui lòng chọn ngày."); return; }
        if (!reason.trim()) { messageApi.warning("Vui lòng nhập lý do."); return; }
        if (leaveType === "partial" && slots.length === 0) { messageApi.warning("Vui lòng chọn ít nhất 1 slot giờ."); return; }

        setSaving(true);
        const { res, data } = await fetchApi("leave-requests", {
            date:   leaveDate.format("YYYY-MM-DD"),
            type:   leaveType,
            slots:  leaveType === "partial" ? slots : [],
            reason: reason.trim(),
        }, "POST");
        setSaving(false);

        if (res.ok) {
            messageApi.success("Gửi yêu cầu thành công! Đợi admin duyệt.");
            setModalOpen(false);
            setLeaveDate(null); setLeaveType("full_day"); setSlots([]); setReason("");
            load();
        } else {
            messageApi.error(data.message || "Gửi thất bại");
        }
    };

    const handleCancel = async (id) => {
        const { res } = await fetchApi(`leave-requests/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success("Đã hủy yêu cầu."); load(); }
        else messageApi.error("Hủy thất bại");
    };

    const grouped = {
        pending:  requests.filter(r => r.status === "pending"),
        approved: requests.filter(r => r.status === "approved"),
        rejected: requests.filter(r => r.status === "rejected"),
    };

    const tabItems = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
        key,
        label: (
            <span>
                {cfg.label}{" "}
                {grouped[key]?.length > 0 && (
                    <Badge count={grouped[key].length} style={{ background: key === "pending" ? "#f59e0b" : key === "approved" ? "#22c55e" : "#ef4444" }} />
                )}
            </span>
        ),
        children: loading ? (
            <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : grouped[key]?.length === 0 ? (
            <Empty description="Không có yêu cầu nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
            grouped[key].map(r => <RequestCard key={r._id} req={r} onCancel={handleCancel} />)
        ),
    }));

    return (
        <ConfigProvider theme={{ token: { colorPrimary: DOCTOR_COLOR, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>📋 Yêu cầu nghỉ phép</Title>
                    <Text style={{ color: "#9ca3af" }}>Mặc định làm việc tất cả các ngày. Gửi yêu cầu nếu muốn nghỉ.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}
                    style={{ background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Gửi yêu cầu nghỉ
                </Button>
            </div>

            {/* Info banner */}
            <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 14, padding: "14px 20px", marginBottom: 24, fontSize: 13, color: "#0369a1" }}>
                <b>ℹ️ Chính sách lịch làm việc:</b> Mặc định bạn làm việc tất cả ngày trong tuần. Muốn nghỉ ngày nào hoặc ca nào, hãy gửi yêu cầu và đợi admin duyệt.
                Sau khi được duyệt, hệ thống sẽ tự động block lịch đặt của khách hàng vào thời gian đó.
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #e0f2fe" }}>
                <Tabs items={tabItems} />
            </Card>

            {/* Modal gửi yêu cầu */}
            <Modal title={<span style={{ fontWeight: 700 }}>📝 Gửi yêu cầu nghỉ</span>}
                open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose width={480}>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ngày nghỉ <span style={{ color: "#ef4444" }}>*</span></Text>
                        <DatePicker value={leaveDate} onChange={setLeaveDate} format="DD/MM/YYYY" size="large"
                            style={{ width: "100%" }} placeholder="Chọn ngày muốn nghỉ"
                            disabledDate={d => d && d.isBefore(dayjs().startOf("day"))} />
                    </div>

                    <div>
                        <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Loại nghỉ <span style={{ color: "#ef4444" }}>*</span></Text>
                        <Select value={leaveType} onChange={v => { setLeaveType(v); setSlots([]); }} style={{ width: "100%" }} size="large">
                            <Option value="full_day">🚫 Nghỉ cả ngày</Option>
                            <Option value="partial">⏰ Nghỉ một số ca</Option>
                        </Select>
                    </div>

                    {leaveType === "partial" && (
                        <div>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Chọn ca nghỉ <span style={{ color: "#ef4444" }}>*</span></Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {ALL_SLOTS.map(slot => {
                                    const active = slots.includes(slot);
                                    return (
                                        <Tag key={slot} onClick={() => setSlots(prev => active ? prev.filter(s => s !== slot) : [...prev, slot].sort())}
                                            style={{ cursor: "pointer", borderRadius: 8, padding: "5px 14px", fontWeight: 600, transition: "all 0.15s",
                                                background: active ? "#ef4444" : "#f3f4f6",
                                                color:      active ? "#fff"    : "#6b7280",
                                                border:     active ? "1px solid #ef4444" : "1px solid #e5e7eb",
                                            }}>
                                            {slot}
                                        </Tag>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Lý do <span style={{ color: "#ef4444" }}>*</span></Text>
                        <TextArea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="VD: Nghỉ ốm, việc gia đình, hội nghị chuyên môn..."
                            style={{ borderRadius: 10 }} />
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Button onClick={() => setModalOpen(false)} style={{ borderRadius: 8 }}>Hủy</Button>
                        <Button type="primary" loading={saving} onClick={handleSubmit}
                            style={{ background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, borderRadius: 8, fontWeight: 600 }}>
                            Gửi yêu cầu
                        </Button>
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
}