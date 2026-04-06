import { useState, useEffect, useCallback } from "react";
import {
    Card, Button, Typography, Spin, ConfigProvider, message,
    Modal, Select, Tag, Badge, Row, Col, TimePicker, Tooltip,
} from "antd";
import { LeftOutlined, RightOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const PRIMARY = "#f97316";

const DEFAULT_SLOTS = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"];

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function DoctorSchedulePage() {
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
    const [schedules,    setSchedules]    = useState([]);
    const [aptMap,       setAptMap]       = useState({});
    const [loading,      setLoading]      = useState(true);
    const [modalDate,    setModalDate]    = useState(null);
    const [modalType,    setModalType]    = useState("working");
    const [modalSlots,   setModalSlots]   = useState([]);
    const [modalReason,  setModalReason]  = useState("");
    const [saving,       setSaving]       = useState(false);
    const [messageApi,   ctxHolder]       = message.useMessage();

    const load = useCallback(async (month) => {
        setLoading(true);
        const { res, data } = await fetchApi(`doctor/schedule?month=${month}`, null, "GET");
        if (res.ok) { setSchedules(data.schedules || []); setAptMap(data.aptMap || {}); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(currentMonth); })();
    }, [currentMonth, load]);

    // Build calendar grid
    const startOfMonth = dayjs(`${currentMonth}-01`);
    const daysInMonth  = startOfMonth.daysInMonth();
    const firstDayOfWeek = startOfMonth.day(); // 0=Sun

    const scheduleMap = {};
    schedules.forEach(s => { scheduleMap[s.date] = s; });

    const openModal = (date) => {
        const existing = scheduleMap[date];
        setModalDate(date);
        setModalType(existing?.type || "working");
        setModalSlots(existing?.slots || [...DEFAULT_SLOTS]);
        setModalReason(existing?.reason || "");
    };

    const handleSave = async () => {
        setSaving(true);
        const { res, data } = await fetchApi("doctor/schedule", {
            date:   modalDate,
            type:   modalType,
            slots:  modalType === "working" ? modalSlots : [],
            reason: modalReason,
        }, "POST");
        setSaving(false);
        if (res.ok) {
            messageApi.success("Đã lưu lịch!");
            setModalDate(null);
            load(currentMonth);
        } else {
            messageApi.error(data.message || "Lưu thất bại");
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        const { res } = await fetchApi(`doctor/schedule/${modalDate}`, null, "DELETE");
        setSaving(false);
        if (res.ok) {
            messageApi.success("Đã xóa lịch!");
            setModalDate(null);
            load(currentMonth);
        } else {
            messageApi.error("Xóa thất bại");
        }
    };

    const toggleSlot = (slot) => {
        setModalSlots(prev =>
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
        );
    };

    // Render từng ô ngày
    const renderDay = (day) => {
        const date    = `${currentMonth}-${String(day).padStart(2, "0")}`;
        const sched   = scheduleMap[date];
        const aptCount = aptMap[date] || 0;
        const isPast  = dayjs(date).isBefore(dayjs().startOf("day"));
        const isToday = date === dayjs().format("YYYY-MM-DD");

        let bg     = "#fff";
        let border = "1px solid #f3f4f6";
        let textColor = "#1c1c1c";

        if (sched?.type === "dayoff")  { bg = "#fff1f2"; border = "1px solid #fecdd3"; textColor = "#ef4444"; }
        if (sched?.type === "working") { bg = "#f0fdf4"; border = "1px solid #bbf7d0"; }
        if (isPast)                    { bg = "#fafafa"; textColor = "#d1d5db"; }
        if (isToday)                   { border = `2px solid ${PRIMARY}`; }

        return (
            <div key={day} onClick={() => !isPast && openModal(date)}
                style={{ border, borderRadius: 10, padding: "8px 6px", background: bg, cursor: isPast ? "default" : "pointer", minHeight: 68, transition: "all 0.15s", position: "relative" }}
                onMouseEnter={e => { if (!isPast) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
                {/* Số ngày */}
                <div style={{ fontWeight: isToday ? 800 : 600, fontSize: 14, color: isToday ? PRIMARY : textColor, marginBottom: 4 }}>{day}</div>

                {/* Badge loại */}
                {sched && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: sched.type === "dayoff" ? "#ef4444" : "#22c55e" }}>
                        {sched.type === "dayoff" ? "🔴 Nghỉ" : `🟢 ${sched.slots?.length} slot`}
                    </div>
                )}

                {/* Số lịch hẹn */}
                {aptCount > 0 && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: PRIMARY, color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {aptCount}
                    </div>
                )}
            </div>
        );
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>📆 Quản lý lịch làm việc</Title>
                    <Text style={{ color: "#9ca3af" }}>Đăng ký lịch làm và lịch nghỉ theo tháng</Text>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {/* Legend */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginRight: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "#f0fdf4", border: "1px solid #bbf7d0" }} /><Text style={{ fontSize: 12 }}>Làm việc</Text></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "#fff1f2", border: "1px solid #fecdd3" }} /><Text style={{ fontSize: 12 }}>Nghỉ</Text></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: PRIMARY }} /><Text style={{ fontSize: 12 }}>Có lịch hẹn</Text></div>
                    </div>
                    <Button icon={<LeftOutlined />} onClick={() => setCurrentMonth(dayjs(`${currentMonth}-01`).subtract(1, "month").format("YYYY-MM"))} />
                    <Button style={{ minWidth: 120, fontWeight: 700 }}>
                        {dayjs(`${currentMonth}-01`).format("MM/YYYY")}
                    </Button>
                    <Button icon={<RightOutlined />} onClick={() => setCurrentMonth(dayjs(`${currentMonth}-01`).add(1, "month").format("YYYY-MM"))} />
                </div>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
                ) : (
                    <>
                        {/* Header ngày trong tuần */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
                            {DAY_LABELS.map(d => (
                                <div key={d} style={{ textAlign: "center", fontWeight: 700, fontSize: 12, color: "#9ca3af", padding: "6px 0" }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                            {/* Empty cells */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
                            {/* Days */}
                            {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
                        </div>
                    </>
                )}
            </Card>

            {/* Modal đăng ký lịch */}
            <Modal
                title={<span style={{ fontWeight: 700 }}>📅 Đăng ký lịch — {modalDate && dayjs(modalDate).format("DD/MM/YYYY")}</span>}
                open={!!modalDate} onCancel={() => setModalDate(null)} footer={null} width={480}
            >
                <div style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Loại lịch</Text>
                    <Select value={modalType} onChange={setModalType} style={{ width: "100%", marginBottom: 20 }} size="large">
                        <Option value="working">🟢 Làm việc</Option>
                        <Option value="dayoff">🔴 Ngày nghỉ</Option>
                    </Select>

                    {modalType === "working" && (
                        <>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                                Chọn slot giờ làm ({modalSlots.length} slot)
                            </Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                {DEFAULT_SLOTS.map(slot => (
                                    <Tag key={slot} onClick={() => toggleSlot(slot)}
                                        style={{
                                            cursor: "pointer", borderRadius: 8, padding: "5px 14px",
                                            background: modalSlots.includes(slot) ? PRIMARY : "#f3f4f6",
                                            color:      modalSlots.includes(slot) ? "#fff" : "#374151",
                                            border:     modalSlots.includes(slot) ? `1px solid ${PRIMARY}` : "1px solid #e5e7eb",
                                            fontWeight: 600, transition: "all 0.15s",
                                        }}>
                                        {slot}
                                    </Tag>
                                ))}
                            </div>
                        </>
                    )}

                    {modalType === "dayoff" && (
                        <>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Lý do nghỉ</Text>
                            <input value={modalReason} onChange={e => setModalReason(e.target.value)}
                                placeholder="VD: Nghỉ phép, hội nghị..."
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", marginBottom: 20, fontSize: 14, outline: "none" }} />
                        </>
                    )}

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        {scheduleMap[modalDate] && (
                            <Button danger onClick={handleDelete} loading={saving} style={{ borderRadius: 8 }}>
                                <DeleteOutlined /> Xóa lịch
                            </Button>
                        )}
                        <Button onClick={() => setModalDate(null)} style={{ borderRadius: 8 }}>Hủy</Button>
                        <Button type="primary" onClick={handleSave} loading={saving}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                            Lưu lịch
                        </Button>
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
}