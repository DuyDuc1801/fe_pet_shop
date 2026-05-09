import { useState, useEffect, useRef } from "react";
import {
    Card, Button, Typography, ConfigProvider, Spin, Tabs,
    Select, Input, Upload, Tag, Avatar, Row, Col,
    Alert, Divider, Rate, message,
} from "antd";
import {
    RobotOutlined, UserOutlined, SendOutlined,
    CameraOutlined, LoadingOutlined, CalendarOutlined,
    MedicineBoxOutlined, BulbOutlined, WarningOutlined,
    CheckCircleOutlined, ExclamationCircleOutlined,
    HeartOutlined, FileTextOutlined, StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option }   = Select;
const PRIMARY = "#f97316";
const PRIMARY_LIGHT = "#fff7ed";

// ── Urgency config ─────────────────────────────────────────────────
const URGENCY = {
    low:       { color: "#22c55e", bg: "#f0fdf4", border: "#86efac", icon: <CheckCircleOutlined />,       label: "Không khẩn cấp"  },
    medium:    { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", icon: <ExclamationCircleOutlined />, label: "Cần theo dõi"    },
    high:      { color: "#ef4444", bg: "#fff1f2", border: "#fca5a5", icon: <WarningOutlined />,            label: "Nên đi khám sớm" },
    emergency: { color: "#dc2626", bg: "#450a0a", border: "#dc2626", icon: <WarningOutlined />,            label: "🚨 KHẨN CẤP"    },
};

// ── BƯỚC 1: Chọn loài ─────────────────────────────────────────────
const PET_TYPES = [
    { value: "Chó",  icon: "🐶" },
    { value: "Mèo",  icon: "🐱" },
    { value: "Khác", icon: "🐾" },
];

// ── Triệu chứng phổ biến gợi ý theo loài ─────────────────────────
const SYMPTOM_SUGGESTIONS = {
    "Chó":  ["Bỏ ăn", "Tiêu chảy", "Nôn mửa", "Ho khan", "Ngứa da", "Mệt mỏi", "Đi tiểu nhiều", "Sưng bụng"],
    "Mèo":  ["Bỏ ăn", "Hắt hơi", "Chảy nước mắt", "Nôn mửa", "Rụng lông", "Táo bón", "Thở khò khè", "Lơ mơ"],
    "Khác": ["Bỏ ăn", "Hành vi bất thường", "Mệt mỏi", "Thay đổi màu lông/da"],
};

// ── Kết quả chẩn đoán ─────────────────────────────────────────────
function DiagnosisResult({ result, onBooking }) {
    const urgency = URGENCY[result.urgency] || URGENCY.medium;
    const isEmergency = result.urgency === "emergency";

    return (
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
            {/* Urgency banner */}
            <div style={{ background: urgency.bg, border: `2px solid ${urgency.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24, color: urgency.color }}>{urgency.icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: urgency.color }}>{urgency.label}</div>
                    <div style={{ fontSize: 13, color: isEmergency ? "#fca5a5" : "#6b7280", marginTop: 2 }}>{result.urgencyText}</div>
                </div>
                {(result.urgency === "high" || isEmergency) && (
                    <Button type="primary" icon={<CalendarOutlined />} onClick={onBooking}
                        style={{ background: "#ef4444", borderColor: "#ef4444", borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
                        Đặt lịch ngay
                    </Button>
                )}
            </div>

            {/* Phân tích ảnh nếu có */}
            {result.imageAnalysis && (
                <Alert type="info" showIcon icon={<CameraOutlined />}
                    message="Nhận xét từ ảnh"
                    description={result.imageAnalysis}
                    style={{ borderRadius: 12, marginBottom: 16 }}
                />
            )}

            <Row gutter={[16, 16]}>
                {/* Bệnh có thể */}
                <Col xs={24} lg={14}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", height: "100%" }}>
                        <Title level={5} style={{ margin: "0 0 14px" }}>🔍 Bệnh có thể gặp</Title>
                        {result.possibleConditions?.map((c, i) => (
                            <div key={i} style={{ padding: "12px 0", borderBottom: i < result.possibleConditions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <Text style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</Text>
                                    <Tag color={c.probability === "cao" ? "red" : c.probability === "trung bình" ? "orange" : "default"}
                                        style={{ borderRadius: 6, fontWeight: 600 }}>{c.probability}</Tag>
                                </div>
                                <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{c.description}</Text>
                            </div>
                        ))}
                    </Card>
                </Col>

                {/* Khuyến nghị + chăm sóc */}
                <Col xs={24} lg={10}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                            <Title level={5} style={{ margin: "0 0 10px" }}>💡 Khuyến nghị</Title>
                            <Paragraph style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{result.recommendation}</Paragraph>
                        </Card>
                        {result.homeCare?.length > 0 && (
                            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                                <Title level={5} style={{ margin: "0 0 10px" }}>🏠 Chăm sóc tại nhà</Title>
                                {result.homeCare.map((s, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: PRIMARY_LIGHT, color: PRIMARY, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                                        <Text style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{s}</Text>
                                    </div>
                                ))}
                            </Card>
                        )}
                    </div>
                </Col>

                {/* Warning signs */}
                {result.warningSigns?.length > 0 && (
                    <Col xs={24}>
                        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #fecdd3", background: "#fff1f2" }}>
                            <Title level={5} style={{ margin: "0 0 12px", color: "#ef4444" }}>⚠️ Đến bác sĩ ngay nếu thấy</Title>
                            <Row gutter={[12, 8]}>
                                {result.warningSigns.map((s, i) => (
                                    <Col xs={24} sm={12} key={i}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <span style={{ color: "#ef4444", flexShrink: 0 }}>•</span>
                                            <Text style={{ fontSize: 13, color: "#7f1d1d" }}>{s}</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                )}

                {/* Disclaimer + Book */}
                <Col xs={24}>
                    <Alert type="info" showIcon
                        message={result.disclaimer || "Đây là tư vấn sơ bộ, không thay thế khám trực tiếp."}
                        style={{ borderRadius: 12 }}
                        action={
                            <Button size="small" type="primary" icon={<CalendarOutlined />} onClick={onBooking}
                                style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}>
                                Đặt lịch khám
                            </Button>
                        }
                    />
                </Col>
            </Row>

            <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }`}</style>
        </div>
    );
}

// ── Tab 1: Chẩn đoán theo flow ─────────────────────────────────────
function DiagnoseTab({ navigate }) {
    const [step,        setStep]        = useState(0); // 0=loài, 1=triệu chứng, 2=chi tiết+ảnh, 3=kết quả
    const [petType,     setPetType]     = useState("");
    const [petAge,      setPetAge]      = useState("");
    const [petWeight,   setPetWeight]   = useState("");
    const [petBreed,    setPetBreed]    = useState("");
    const [selectedSym, setSelectedSym] = useState([]);
    const [customSym,   setCustomSym]   = useState("");
    const [duration,    setDuration]    = useState("");
    const [addInfo,     setAddInfo]     = useState("");
    const [imageFile,   setImageFile]   = useState(null);
    const [imagePreview,setImagePreview]= useState("");
    const [loading,     setLoading]     = useState(false);
    const [result,      setResult]      = useState(null);
    const [messageApi,  ctxHolder]      = message.useMessage();

    const toggleSym = (s) => setSelectedSym(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const handleImageUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
            setImageFile(file);
        };
        reader.readAsDataURL(file);
        return false;
    };

    const handleSubmit = async () => {
        const symptoms = [...selectedSym, ...(customSym.trim() ? [customSym.trim()] : [])].join(", ");
        if (!symptoms) { messageApi.warning("Vui lòng chọn hoặc nhập ít nhất một triệu chứng!"); return; }

        setLoading(true);
        setStep(3);

        let imageBase64 = null, imageMimeType = null;
        if (imageFile) {
            const reader = new FileReader();
            await new Promise(resolve => {
                reader.onload = e => {
                    const dataUrl = e.target.result;
                    imageBase64  = dataUrl.split(",")[1];
                    imageMimeType= imageFile.type;
                    resolve();
                };
                reader.readAsDataURL(imageFile);
            });
        }

        const { res, data } = await fetchApi("ai/diagnose", {
            petType, petAge, petWeight, petBreed,
            symptoms, duration, additionalInfo: addInfo,
            imageBase64, imageMimeType,
        }, "POST");

        setLoading(false);
        if (res.ok) setResult(data.result);
        else { messageApi.error("AI không thể phân tích, vui lòng thử lại."); setStep(2); }
    };

    const reset = () => { setStep(0); setResult(null); setPetType(""); setSelectedSym([]); setCustomSym(""); setImageFile(null); setImagePreview(""); };

    return (
        <div>
            {ctxHolder}
            {/* Step 0: Chọn loài */}
            {step === 0 && (
                <div style={{ textAlign: "center" }}>
                    <Title level={4} style={{ marginBottom: 8 }}>Thú cưng của bạn là gì?</Title>
                    <Text style={{ color: "#6b7280" }}>Chọn để AI phân tích chính xác hơn</Text>
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
                        {PET_TYPES.map(pt => (
                            <div key={pt.value} onClick={() => { setPetType(pt.value); setStep(1); }}
                                style={{ width: 120, height: 120, borderRadius: 20, border: "2px solid #f3f4f6", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = PRIMARY_LIGHT; e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}>
                                <span style={{ fontSize: 44 }}>{pt.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{pt.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 1: Chọn triệu chứng */}
            {step === 1 && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0 }}>Triệu chứng đang gặp?</Title>
                        <Button size="small" onClick={() => setStep(0)} style={{ borderRadius: 8 }}>← Quay lại</Button>
                    </div>
                    <Text style={{ color: "#6b7280", display: "block", marginBottom: 16 }}>Chọn một hoặc nhiều triệu chứng:</Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                        {(SYMPTOM_SUGGESTIONS[petType] || []).map(s => (
                            <Tag key={s} onClick={() => toggleSym(s)}
                                style={{ cursor: "pointer", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                                    background: selectedSym.includes(s) ? PRIMARY : "#f3f4f6",
                                    color:      selectedSym.includes(s) ? "#fff"   : "#374151",
                                    border:     selectedSym.includes(s) ? `1px solid ${PRIMARY}` : "1px solid #e5e7eb",
                                }}>
                                {selectedSym.includes(s) ? "✓ " : ""}{s}
                            </Tag>
                        ))}
                    </div>
                    <TextArea rows={2} value={customSym} onChange={e => setCustomSym(e.target.value)}
                        placeholder="Mô tả thêm triệu chứng khác..." style={{ borderRadius: 10, marginBottom: 20 }} />
                    <Button type="primary" size="large" block disabled={selectedSym.length === 0 && !customSym.trim()}
                        onClick={() => setStep(2)}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, height: 48, fontWeight: 700 }}>
                        Tiếp theo →
                    </Button>
                </div>
            )}

            {/* Step 2: Chi tiết + ảnh */}
            {step === 2 && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0 }}>Thông tin thêm</Title>
                        <Button size="small" onClick={() => setStep(1)} style={{ borderRadius: 8 }}>← Quay lại</Button>
                    </div>

                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Tuổi</Text>
                            <Input value={petAge} onChange={e => setPetAge(e.target.value)}
                                placeholder="2 tuổi..." style={{ borderRadius: 10 }} size="large" />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Cân nặng</Text>
                            <Input value={petWeight} onChange={e => setPetWeight(e.target.value)}
                                placeholder="5kg..." style={{ borderRadius: 10 }} size="large" />
                        </Col>
                        <Col xs={24} sm={12}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Giống / Breed</Text>
                            <Input value={petBreed} onChange={e => setPetBreed(e.target.value)}
                                placeholder="Golden, Corgi..." style={{ borderRadius: 10 }} size="large" />
                        </Col>
                        <Col xs={24} sm={12}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Thời gian xuất hiện</Text>
                            <Select value={duration} onChange={setDuration} style={{ width: "100%" }} size="large" placeholder="Chọn...">
                                <Option value="Dưới 24 giờ">Dưới 24 giờ</Option>
                                <Option value="1-2 ngày">1-2 ngày</Option>
                                <Option value="3-7 ngày">3-7 ngày</Option>
                                <Option value="Hơn 1 tuần">Hơn 1 tuần</Option>
                            </Select>
                        </Col>
                        <Col xs={24}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Tiền sử bệnh / Ghi chú thêm</Text>
                            <TextArea rows={3} value={addInfo} onChange={e => setAddInfo(e.target.value)}
                                placeholder="Đã tiêm phòng chưa? Đang dùng thuốc gì không?..."
                                style={{ borderRadius: 10 }} />
                        </Col>

                        {/* Upload ảnh */}
                        <Col xs={24}>
                            <Text style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                                📸 Chụp ảnh thú cưng <span style={{ color: "#9ca3af", fontWeight: 400 }}>(tùy chọn — AI sẽ phân tích thêm)</span>
                            </Text>
                            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                                <Upload showUploadList={false} beforeUpload={handleImageUpload} accept="image/*">
                                    <div style={{ width: 100, height: 100, borderRadius: 14, border: `2px dashed ${PRIMARY}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: PRIMARY_LIGHT, gap: 6 }}>
                                        <CameraOutlined style={{ fontSize: 24, color: PRIMARY }} />
                                        <Text style={{ fontSize: 11, color: PRIMARY }}>Thêm ảnh</Text>
                                    </div>
                                </Upload>
                                {imagePreview && (
                                    <div style={{ position: "relative" }}>
                                        <img src={imagePreview} alt="preview" style={{ width: 100, height: 100, borderRadius: 14, objectFit: "cover", border: "2px solid #f3f4f6" }} />
                                        <div onClick={() => { setImageFile(null); setImagePreview(""); }}
                                            style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            ✕
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Button type="primary" size="large" block onClick={handleSubmit} style={{ marginTop: 24, background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, height: 50, fontWeight: 700, fontSize: 15 }}>
                        🔍 Phân tích với AI
                    </Button>
                </div>
            )}

            {/* Step 3: Kết quả */}
            {step === 3 && (
                loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: PRIMARY }} />} />
                        <div style={{ marginTop: 20, color: "#6b7280", fontSize: 15 }}>AI đang phân tích triệu chứng{imageFile ? " và ảnh" : ""}...</div>
                        <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Thường mất 5-10 giây</div>
                    </div>
                ) : result ? (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <Title level={4} style={{ margin: 0 }}>Kết quả phân tích AI</Title>
                            <Button onClick={reset} style={{ borderRadius: 8 }}>🔄 Phân tích lại</Button>
                        </div>
                        <DiagnosisResult result={result} onBooking={() => navigate("/dat-lich-kham")} />
                    </div>
                ) : null
            )}
        </div>
    );
}

// ── Tab 2: Chat với AI + context HSBA ─────────────────────────────
function ChatTab() {
    const [messages,  setMessages]  = useState([
        { role: "model", content: "Xin chào! Tôi là PooGi AI 🐾 Hãy chọn thú cưng để tôi tư vấn dựa trên lịch sử khám của bé, hoặc chat tự do về sức khỏe thú cưng!" }
    ]);
    const [input,     setInput]     = useState("");
    const [loading,   setLoading]   = useState(false);
    const [pets,      setPets]      = useState([]);
    const [selPet,    setSelPet]    = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        fetchApi("ai/pet-context", null, "GET").then(({ res, data }) => {
            if (res.ok) setPets(data.pets || []);
        });
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSelectPet = (petName) => {
        const pet = pets.find(p => p.petName === petName);
        setSelPet(pet);
        setMessages([{
            role: "model",
            content: `Đã chọn bé **${pet.petName}** (${pet.petType || "Chưa rõ loài"}). Tôi đã xem qua ${pet.recentRecords?.length || 0} lần khám gần đây. Bạn muốn hỏi gì về bé?`,
        }]);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const { res, data } = await fetchApi("ai/chat", {
            message:    userMsg.content,
            history:    messages.slice(-10),
            petContext: selPet,
        }, "POST");

        setLoading(false);
        if (res.ok) setMessages(prev => [...prev, { role: "model", content: data.response }]);
        else setMessages(prev => [...prev, { role: "model", content: "Xin lỗi, tôi đang gặp sự cố. Thử lại sau nhé! 🙏" }]);
    };

    const QUICK_QUESTIONS = [
        "Bao lâu nên tắm cho chó một lần?",
        "Thức ăn nào tốt cho mèo lớn tuổi?",
        "Dấu hiệu chó bị stress là gì?",
        "Lịch tiêm phòng cho mèo con?",
    ];

    return (
        <div>
            {/* Chọn thú cưng có HSBA */}
            {pets.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>
                        🐾 Chat với context lịch sử khám:
                    </Text>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Tag onClick={() => { setSelPet(null); setMessages([{ role: "model", content: "Xin chào! Tôi là PooGi AI 🐾 Hỏi gì về sức khỏe thú cưng nhé!" }]); }}
                            style={{ cursor: "pointer", borderRadius: 20, padding: "4px 14px", background: !selPet ? PRIMARY : "#f3f4f6", color: !selPet ? "#fff" : "#374151", border: "none", fontWeight: 600 }}>
                            Chat tự do
                        </Tag>
                        {pets.map(p => (
                            <Tag key={p.petName} onClick={() => handleSelectPet(p.petName)}
                                style={{ cursor: "pointer", borderRadius: 20, padding: "4px 14px", background: selPet?.petName === p.petName ? PRIMARY : "#f3f4f6", color: selPet?.petName === p.petName ? "#fff" : "#374151", border: "none", fontWeight: 600 }}>
                                {p.petName} ({p.recentRecords?.length} lần khám)
                            </Tag>
                        ))}
                    </div>
                </div>
            )}

            {/* Message list */}
            <div style={{ height: 420, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                        <Avatar size={32} style={{ background: msg.role === "model" ? PRIMARY : "#6b7280", flexShrink: 0 }}>
                            {msg.role === "model" ? <RobotOutlined /> : <UserOutlined />}
                        </Avatar>
                        <div style={{
                            maxWidth: "75%", padding: "10px 14px",
                            borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                            background: msg.role === "user" ? PRIMARY : "#f3f4f6",
                            color: msg.role === "user" ? "#fff" : "#1c1c1c",
                            fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: "flex", gap: 10 }}>
                        <Avatar size={32} style={{ background: PRIMARY }}><RobotOutlined /></Avatar>
                        <div style={{ background: "#f3f4f6", borderRadius: "4px 16px 16px 16px", padding: "10px 16px" }}>
                            <Spin size="small" /> <span style={{ marginLeft: 8, fontSize: 13, color: "#9ca3af" }}>Đang suy nghĩ...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {QUICK_QUESTIONS.map(q => (
                    <Tag key={q} onClick={() => setInput(q)}
                        style={{ cursor: "pointer", borderRadius: 20, padding: "3px 10px", borderColor: PRIMARY, color: PRIMARY, fontSize: 12 }}>
                        {q}
                    </Tag>
                ))}
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
                <Input value={input} onChange={e => setInput(e.target.value)} onPressEnter={sendMessage}
                    placeholder="Hỏi về sức khỏe thú cưng..." size="large" disabled={loading}
                    style={{ borderRadius: 12, flex: 1 }} />
                <Button type="primary" size="large" icon={<SendOutlined />} onClick={sendMessage}
                    loading={loading} disabled={!input.trim()}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, width: 48 }} />
            </div>
        </div>
    );
}

// ── Tab 3: Tư vấn nhanh theo chủ đề ──────────────────────────────
function QuickAdviceTab() {
    const [petType,   setPetType]   = useState("Chó");
    const [category,  setCategory]  = useState("");
    const [loading,   setLoading]   = useState(false);
    const [advice,    setAdvice]    = useState(null);

    const CATEGORIES = [
        { key: "diet",      icon: "🥗", label: "Dinh dưỡng"         },
        { key: "vaccine",   icon: "💉", label: "Tiêm phòng"         },
        { key: "behavior",  icon: "🧠", label: "Hành vi & Tâm lý"   },
        { key: "emergency", icon: "🚨", label: "Xử lý khẩn cấp"     },
        { key: "grooming",  icon: "🛁", label: "Vệ sinh & Grooming" },
    ];

    const handleFetch = async (cat) => {
        setCategory(cat); setLoading(true); setAdvice(null);
        const { res, data } = await fetchApi("ai/quick-advice", { category: cat, petType }, "POST");
        setLoading(false);
        if (res.ok) setAdvice(data.advice);
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <Text style={{ fontWeight: 600 }}>Loài:</Text>
                {PET_TYPES.map(pt => (
                    <Tag key={pt.value} onClick={() => setPetType(pt.value)}
                        style={{ cursor: "pointer", borderRadius: 20, padding: "4px 14px", fontWeight: 600,
                            background: petType === pt.value ? PRIMARY : "#f3f4f6",
                            color:      petType === pt.value ? "#fff"   : "#374151",
                            border: "none" }}>
                        {pt.icon} {pt.value}
                    </Tag>
                ))}
            </div>

            <Text style={{ fontWeight: 600, display: "block", marginBottom: 12 }}>Chọn chủ đề tư vấn:</Text>
            <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
                {CATEGORIES.map(c => (
                    <Col xs={12} sm={8} key={c.key}>
                        <div onClick={() => handleFetch(c.key)}
                            style={{ border: `2px solid ${category === c.key ? PRIMARY : "#f3f4f6"}`, borderRadius: 14, padding: "16px 14px", cursor: "pointer", textAlign: "center", background: category === c.key ? PRIMARY_LIGHT : "#fff", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = PRIMARY_LIGHT; }}
                            onMouseLeave={e => { if (category !== c.key) { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.background = "#fff"; } }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            {loading && (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: PRIMARY }} />} />
                    <div style={{ marginTop: 12, color: "#6b7280" }}>AI đang chuẩn bị tư vấn...</div>
                </div>
            )}

            {advice && !loading && (
                <div style={{ animation: "fadeUp 0.4s ease both" }}>
                    <Card bordered={false} style={{ borderRadius: 16, border: `1.5px solid ${PRIMARY}`, background: PRIMARY_LIGHT }}>
                        <Title level={5} style={{ margin: "0 0 6px", color: PRIMARY }}>{advice.title}</Title>
                        <Paragraph style={{ color: "#6b7280", margin: "0 0 16px" }}>{advice.summary}</Paragraph>
                        <Divider style={{ margin: "12px 0" }} />
                        <div style={{ marginBottom: 14 }}>
                            <Text style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>📌 Điểm chính:</Text>
                            {advice.keyPoints?.map((k, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                    <span style={{ color: PRIMARY, flexShrink: 0 }}>•</span>
                                    <Text style={{ fontSize: 13 }}>{k}</Text>
                                </div>
                            ))}
                        </div>
                        {advice.warnings?.length > 0 && (
                            <Alert type="warning" showIcon message={advice.warnings[0]} style={{ borderRadius: 10, marginBottom: 12 }} />
                        )}
                        <div style={{ marginBottom: 14 }}>
                            <Text style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>🏠 Mẹo tại nhà:</Text>
                            {advice.homeTips?.map((t, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                    <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                                    <Text style={{ fontSize: 13 }}>{t}</Text>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: "10px 14px", background: "#fff1f2", borderRadius: 10, fontSize: 13, color: "#ef4444" }}>
                            🏥 {advice.whenToVisit}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function AIDiagnosisPage() {
    const navigate = useNavigate();

    const tabItems = [
        {
            key: "diagnose",
            label: <span><MedicineBoxOutlined /> Chẩn đoán triệu chứng</span>,
            children: (
                <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", maxWidth: 800, margin: "0 auto" }}>
                    <DiagnoseTab navigate={navigate} />
                </Card>
            ),
        },
        {
            key: "chat",
            label: <span><RobotOutlined /> Chat với AI</span>,
            children: (
                <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", maxWidth: 700, margin: "0 auto" }}>
                    <ChatTab />
                </Card>
            ),
        },
        {
            key: "quick",
            label: <span><BulbOutlined /> Tư vấn nhanh</span>,
            children: (
                <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", maxWidth: 720, margin: "0 auto" }}>
                    <QuickAdviceTab />
                </Card>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {/* Hero */}
            <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%)", borderRadius: 20, padding: "32px 36px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.12 }}>🤖</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, marginBottom: 10 }}>
                    ✨ Powered by Google Gemini AI
                </div>
                <Title level={2} style={{ margin: "0 0 6px" }}>🩺 PooGi AI — Trợ lý sức khỏe thú cưng</Title>
                <Text style={{ color: "#6b7280", fontSize: 15 }}>
                    Chẩn đoán theo flow · Phân tích ảnh · Chat với context HSBA · Tư vấn theo chủ đề
                </Text>
                <div style={{ marginTop: 10 }}>
                    <Tag color="orange" style={{ borderRadius: 8 }}>⚠️ Chỉ mang tính tham khảo — không thay thế bác sĩ</Tag>
                </div>
            </div>

            <Tabs items={tabItems} size="large" />

            <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }`}</style>
        </ConfigProvider>
    );
}