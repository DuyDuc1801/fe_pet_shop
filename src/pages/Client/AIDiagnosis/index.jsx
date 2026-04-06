import { useState, useRef, useEffect } from "react";
import {
    Row, Col, Card, Form, Input, Select, Button, Tag,
    Typography, ConfigProvider, Spin, Tabs, Avatar, Divider,
    Alert, Badge
} from "antd";
import {
    SendOutlined, RobotOutlined, UserOutlined,
    WarningOutlined, CheckCircleOutlined, CalendarOutlined,
    ExclamationCircleOutlined, MedicineBoxOutlined,
    InfoCircleOutlined, ExperimentOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// Giả định thư viện fetchApi của bạn
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ── Định nghĩa màu sắc & Tài nguyên ──────────────────────────────
const PRIMARY_NAVY = "#0f172a"; // Xanh đen chuyên nghiệp (màu nền chủ đạo)
const ACCENT_EMERALD = "rgb(249, 115, 22)"; // Xanh lục y tế (màu hành động)
const TEXT_DARK = "#1e293b";
const TEXT_SECONDARY = "#64748b";
const BORDER_COLOR = "#e2e8f0";

// URL HÌNH NỀN CHẤT LƯỢNG CAO PHÙ HỢP VỚI CLINIC
const BG_IMAGE_URL = "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?q=80&w=2500&auto=format&fit=crop";

const URGENCY_CONFIG = {
    low: { color: "#10b981", bg: "#f0fdf4", border: "#dcfce7", icon: <CheckCircleOutlined />, label: "MỨC ĐỘ: NHẸ" },
    medium: { color: "#f59e0b", bg: "#fffbeb", border: "#fef3c7", icon: <ExclamationCircleOutlined />, label: "CẦN THEO DÕI" },
    high: { color: "#ef4444", bg: "#fef2f2", border: "#fee2e2", icon: <WarningOutlined />, label: "NÊN ĐI KHÁM SỚM" },
    emergency: { color: "#ffffff", bg: "#b91c1c", border: "#991b1b", icon: <WarningOutlined />, label: "🚨 KHẨN CẤP" },
};

// ── Component: Kết quả chẩn đoán ────────────────────────────────
function DiagnosisResult({ result, onBooking }) {
    const urgency = URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.medium;
    const isEmergency = result.urgency === "emergency";

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both" }}>
            <Card bordered={false} style={{ 
                borderRadius: 24, 
                overflow: "hidden", 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
                background: "rgba(255, 255, 255, 0.98)" // Gần như trắng hoàn toàn
            }}>
                {/* Urgency Banner */}
                <div style={{ 
                    background: urgency.bg, 
                    padding: "28px 24px", 
                    borderLeft: `8px solid ${urgency.color}`, 
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ flex: 1 }}>
                        <Tag color={urgency.color} style={{ borderRadius: 4, fontWeight: 800, marginBottom: 8, border: "none" }}>
                            {urgency.label}
                        </Tag>
                        <Title level={4} style={{ margin: "4px 0", color: isEmergency ? "#fff" : TEXT_DARK }}>
                            {result.urgencyText}
                        </Title>
                    </div>
                    <div style={{ fontSize: 56, color: urgency.color, opacity: 0.7 }}>{urgency.icon}</div>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                        <Title level={5} style={{ color: TEXT_DARK, marginBottom: 16 }}><MedicineBoxOutlined /> Chẩn đoán khả thi</Title>
                        <Divider style={{ margin: "12px 0", borderColor: BORDER_COLOR }} />
                        {result.possibleConditions?.map((cond, i) => (
                            <div key={i} style={{ 
                                padding: "16px", 
                                borderRadius: "16px", 
                                background: "#f8fafc", 
                                marginBottom: 12,
                                border: `1px solid ${BORDER_COLOR}` 
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 16, color: TEXT_DARK }}>{cond.name}</Text>
                                    <Badge probability={cond.probability} />
                                </div>
                                <Text style={{ color: TEXT_SECONDARY, fontSize: 14, lineHeight: 1.6 }}>{cond.description}</Text>
                            </div>
                        ))}
                    </Col>

                    <Col xs={24} lg={10}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ padding: 20, borderRadius: 16, background: "#f0fdfa", border: "1px solid #ccfbf1" }}>
                                <Title level={5} style={{ color: "#0f766e", fontSize: 16, marginBottom: 10 }}>💡 Khuyến nghị bác sĩ</Title>
                                <Paragraph style={{ margin: 0, fontSize: 14, color: "#134e4a", lineHeight: 1.6 }}>{result.recommendation}</Paragraph>
                            </div>

                            {result.homeCare?.length > 0 && (
                                <div style={{ padding: "10px 0" }}>
                                    <Text strong style={{ display: "block", marginBottom: 16, color: TEXT_DARK, fontSize: 15 }}>🏠 Chăm sóc tại nhà:</Text>
                                    {result.homeCare.map((step, i) => (
                                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                                            <CheckCircleOutlined style={{ color: ACCENT_EMERALD, marginTop: 4, flexShrink: 0 }} />
                                            <Text style={{ fontSize: 14, color: "#334155" }}>{step}</Text>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <Divider style={{ borderColor: BORDER_COLOR }} />
                <div style={{ textAlign: "center", paddingBottom: 15 }}>
                    <Button type="primary" size="large" icon={<CalendarOutlined />} onClick={onBooking}
                        style={{ height: 55, padding: "0 45px", borderRadius: 28, fontWeight: 700, fontSize: 16, background: ACCENT_EMERALD, border: "none", boxShadow: `0 10px 20px -5px ${ACCENT_EMERALD}50` }}>
                        ĐẶT LỊCH KHÁM TẠI POOGI CLINIC
                    </Button>
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            <InfoCircleOutlined /> {result.disclaimer || "Lưu ý: Kết quả AI chỉ mang tính chất tham khảo lâm sàng sơ bộ."}
                        </Text>
                    </div>
                </div>
            </Card>
        </div>
    );
}


// ── Component: Chat Box ──────────────────────────────────────────
function ChatBox() {
    const [messages, setMessages] = useState([
        { role: "model", content: "Xin chào! Tôi là trợ lý chuyên sâu của PooGi. Bé cưng của bạn đang có biểu hiện gì bất thường, hãy mô tả chi tiết nhé!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const { res, data } = await fetchApi("ai/chat", { message: userMsg.content, history: messages.slice(-6) }, "POST");
        setLoading(false);
        if (res.ok) setMessages(prev => [...prev, { role: "model", content: data.response }]);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: 580 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: 18 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                        <Avatar icon={msg.role === "model" ? <RobotOutlined /> : <UserOutlined />} 
                                style={{ background: msg.role === "model" ? ACCENT_EMERALD : PRIMARY_NAVY, flexShrink: 0, marginTop: 4 }} />
                        <div style={{ 
                            maxWidth: "75%", padding: "14px 18px", borderRadius: 16,
                            background: msg.role === "user" ? ACCENT_EMERALD : "#f1f5f9",
                            color: msg.role === "user" ? "#fff" : TEXT_DARK,
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            fontSize: 14, lineHeight: 1.6
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <Spin style={{ alignSelf: "center", margin: "15px 0" }} />}
                <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", gap: 10, paddingTop: 18, borderTop: `1px solid ${BORDER_COLOR}` }}>
                <Input size="large" value={input} onChange={e => setInput(e.target.value)} onPressEnter={sendMessage}
                       placeholder="Nhập câu hỏi tư vấn thú cưng..." style={{ borderRadius: 14, height: 50 }} />
                <Button type="primary" size="large" icon={<SendOutlined />} onClick={sendMessage} 
                        style={{ background: ACCENT_EMERALD, borderRadius: 14, height: 50, width: 60, border: "none" }} />
            </div>
        </div>
    );
}

// ── Component Chính (Export) ────────────────────────────────────
export default function AIDiagnosisPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const handleDiagnose = async (values) => {
        setLoading(true);
        setResult(null);
        // Thêm log để bạn dễ debug ở backend
        console.log("Submitting values:", values);
        const { res, data } = await fetchApi("ai/diagnose", values, "POST");
        setLoading(false);
        if (res.ok) {
            setResult(data.result);
        } else {
            console.error(data.message);
            // Có thể thêm Alert báo lỗi ở đây
        }
    };

    const tabItems = [
        {
            key: "diagnose",
            label: <span><MedicineBoxOutlined /> Chẩn đoán thông minh</span>,
            children: (
                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} lg={result ? 10 : 14}>
                        <Card bordered={false} style={{ 
                            borderRadius: 24, 
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                            background: "rgba(255, 255, 255, 0.98)" 
                        }}>
                            <Title level={4} style={{ marginBottom: 28, color: TEXT_DARK, borderBottom: `2px solid ${ACCENT_EMERALD}30`, paddingBottom: 10, display: "inline-block" }}>🩺 Thông tin lâm sàng sơ bộ</Title>
                            <Form form={form} layout="vertical" onFinish={handleDiagnose} requiredMark={false}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="petType" label="Loài thú cưng" initialValue="Chó">
                                            <Select size="large" style={{ borderRadius: 10 }}>
                                                <Option value="Chó">🐶 Chó (Canine)</Option>
                                                <Option value="Mèo">🐱 Mèo (Feline)</Option>
                                                <Option value="Khác">🐾 Khác</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="petAge" label="Tuổi/Cân nặng">
                                            <Input size="large" placeholder="VD: 2 tuổi - 5kg" style={{ borderRadius: 10 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="symptoms" label="Mô tả triệu chứng chi tiết" rules={[{ required: true, message: "Vui lòng nhập triệu chứng" }, { min: 10, message: "Tối thiểu 10 ký tự" }]}>
                                    <TextArea rows={5} placeholder="Hãy mô tả hành vi, biểu hiện bất thường, thói quen ăn uống của bé..." style={{ borderRadius: 12 }} />
                                </Form.Item>
                                <Form.Item name="duration" label="Thời gian khởi phát">
                                    <Select size="large" style={{ borderRadius: 10 }}>
                                        <Option value="Dưới 24 giờ">Dưới 24 giờ</Option>
                                        <Option value="1-3 ngày">1-3 ngày</Option>
                                        <Option value="Hơn 1 tuần">Hơn 1 tuần</Option>
                                    </Select>
                                </Form.Item>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading}
                                    style={{ height: 58, borderRadius: 18, background: ACCENT_EMERALD, border: "none", fontWeight: 700, fontSize: 17, marginTop: 15, boxShadow: `0 8px 15px -3px ${ACCENT_EMERALD}40` }}>
                                    {loading ? "AI ĐANG PHÂN TÍCH..." : "BẮT ĐẦU PHÂN TÍCH NGAY"}
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                    {result && (
                        <Col xs={24} lg={14}>
                            <DiagnosisResult result={result} onBooking={() => navigate("/dat-lich-kham")} />
                        </Col>
                    )}
                </Row>
            )
        },
        {
            key: "chat",
            label: <span><RobotOutlined /> Tư vấn chuyên sâu 24/7</span>,
            children: (
                <Card bordered={false} style={{ 
                    borderRadius: 24, 
                    maxWidth: 850, 
                    margin: "0 auto", 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                    background: "rgba(255, 255, 255, 0.98)" 
                }}>
                    <ChatBox />
                </Card>
            )
        }
    ];

    return (
        <ConfigProvider theme={{ 
            token: { colorPrimary: ACCENT_EMERALD, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" },
            components: { 
                Card: { colorBgContainer: "rgba(255, 255, 255, 0.95)" },
                Tabs: { titleFontSize: 16 }
            }
        }}>
            {/* ── MAIN WRAPPER WITH BACKGROUND IMAGE ── */}
            <div style={{ 
                minHeight: "100vh", 
                padding: "50px 20px",
                backgroundImage: `linear-gradient(rgba(71, 33, 0, 0.87), rgba(15, 23, 42, 0.95)), url(${BG_IMAGE_URL})`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed", // Giúp nền giữ nguyên khi scroll
                backgroundPosition: "center"
            }}>
                <div style={{ maxWidth: 1350, margin: "0 auto" }}>
                    {/* Hero Header */}
                    <div style={{ textAlign: "center", marginBottom: 60 }}>
                        <Title level={1} style={{ color: "#fff", fontSize: 48, fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-1px" }}>
                            PooGi Clinical AI Assistant
                        </Title>
                        <Text style={{ color: "#94a3b8", fontSize: 20, fontWeight: 400, display: "block", maxWidth: 700, margin: "0 auto" }}>
                            Hệ thống trợ lý ảo hỗ trợ chẩn đoán lâm sàng và tư vấn chăm sóc sức khỏe thú cưng thông minh 24/7
                        </Text>
                    </div>

                    <Tabs items={tabItems} size="large" centered className="modern-tabs" />
                </div>
            </div>

            {/* ── CUSTOM CSS ── */}
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Tùy chỉnh màu sắc cho Tabs */
                .modern-tabs .ant-tabs-nav-list { color: #94a3b8 !important; }
                .modern-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${ACCENT_EMERALD} !important; font-weight: 600 !important; }
                .modern-tabs .ant-tabs-ink-bar { background: ${ACCENT_EMERALD} !important; height: 3px !important; }
                .modern-tabs .ant-tabs-nav::before { border-bottom: 1px solid rgba(148, 163, 184, 0.2) !important; }

                /* Tùy chỉnh Form */
                .ant-form-item-label label { font-weight: 600 !important; color: #334155 !important; font-size: 14px !important; }
                
                /* Tùy chỉnh scrollbar cho chat */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </ConfigProvider>
    );
}