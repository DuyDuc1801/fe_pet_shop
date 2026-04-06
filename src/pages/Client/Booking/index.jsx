import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Steps, Card, Row, Col, Button, Form, Input, Select,
    DatePicker, Typography, Tag, message, Result,
    ConfigProvider, Spin, Avatar, Badge, Divider, Space
} from "antd";
import {
    CalendarOutlined, UserOutlined, CheckCircleFilled,
    ClockCircleOutlined, MedicineBoxOutlined, ArrowLeftOutlined,
    ArrowRightOutlined, HeartOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

// ── Component con: Service Item ──────────────────────────────────
function ServiceItem({ svc, isSelected, onSelect }) {
    return (
        <div onClick={() => onSelect(svc)} style={{
            border: `2px solid ${isSelected ? PRIMARY : "#f1f5f9"}`,
            borderRadius: 20, padding: "20px", cursor: "pointer",
            background: isSelected ? "#fff7ed" : "#fff",
            transition: "all .3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative", height: "100%",
            boxShadow: isSelected ? "0 10px 20px rgba(249,115,22,0.1)" : "0 4px 6px rgba(0,0,0,0.02)"
        }}>
            {isSelected && <CheckCircleFilled style={{ position: "absolute", top: 16, right: 16, color: PRIMARY, fontSize: 20 }} />}
            <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon || '🩺'}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: DARK_NAVY, marginBottom: 6 }}>{svc.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text strong style={{ color: PRIMARY }}>{svc.price?.toLocaleString('vi-VN')}₫</Text>
                <Divider type="vertical" />
                <Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> {svc.duration}p</Text>
            </div>
        </div>
    );
}

// ── COMPONENT CHÍNH ──────────────────────────────────────────────
export default function BookingPage() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const [current, setCurrent] = useState(0);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailSlots] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [done, setDone] = useState(false);
    const [bookingCode, setBookingCode] = useState("");

    const [selService, setSelService] = useState(null);
    const [selDoctor, setSelDoctor] = useState(null);
    const [selDate, setSelDate] = useState(null);
    const [selTime, setSelTime] = useState(null);

    // 1. Load danh sách dịch vụ
    useEffect(() => {
        (async () => {
            const { res, data } = await fetchApi('services', null, 'GET');
            if (res.ok) setServices(data.services || []);
        })();
    }, []);

    // 2. Load bác sĩ theo dịch vụ
    useEffect(() => {
        if (!selService) return;
        (async () => {
            setDoctors([]); setSelDoctor(null); setSelDate(null); setSelTime(null);
            setLoadingDoctors(true);
            const { res, data } = await fetchApi(`doctors?serviceId=${selService._id}`, null, 'GET');
            if (res.ok) setDoctors(data.doctors || []);
            setLoadingDoctors(false);
        })();
    }, [selService?._id]);

    // 3. Load khung giờ trống
    useEffect(() => {
        if (!selDoctor || !selDate) return;
        (async () => {
            setSelTime(null); setLoadingSlots(true);
            const dateStr = selDate.format('YYYY-MM-DD');
            const { res, data } = await fetchApi(`appointments/available-slots?doctorId=${selDoctor._id}&date=${dateStr}`, null, 'GET');
            if (res.ok) setAvailSlots(data.availableSlots || []);
            setLoadingSlots(false);
        })();
    }, [selDoctor?._id, selDate]);

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            setLoadingSubmit(true);
            const { res, data } = await fetchApi('appointments', {
                doctorId: selDoctor._id,
                serviceId: selService._id,
                date: selDate.format('YYYY-MM-DD'),
                time: selTime,
                ...values,
            });
            setLoadingSubmit(false);
            if (!res.ok) return messageApi.error(data.message || 'Đặt lịch thất bại');
            
            // Chốt mã booking một lần duy nhất tại đây (Tránh lỗi Impure function)
            setBookingCode(`BK${Math.floor(1000 + Math.random() * 9000)}`);
            setDone(true);
        } catch { setLoadingSubmit(false); }
    };

    const canNext = [!!selService, !!selDoctor && !!selDate && !!selTime, true][current];

    const STEPS = [
        { title: 'Dịch vụ', icon: <MedicineBoxOutlined /> },
        { title: 'Thời gian', icon: <CalendarOutlined /> },
        { title: 'Thú cưng', icon: <HeartOutlined /> },
    ];

    if (done) {
        return (
            <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
                <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                    <Card bordered={false} style={{ borderRadius: 32, maxWidth: 600, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
                        <Result
                            status="success"
                            title={<Title level={2} style={{ margin: 0 }}>Hoàn tất đặt lịch!</Title>}
                            subTitle={
                                <Text style={{ fontSize: 16, color: "#64748b" }}>
                                    Mã lịch hẹn: <strong>#{bookingCode}</strong>. Bé <strong>{form.getFieldValue('petName')}</strong> đang chờ được chăm sóc!
                                </Text>
                            }
                            extra={[
                                <Button type="primary" size="large" key="my" onClick={() => navigate('/lich-cua-toi')} style={{ borderRadius: 12, height: 50, paddingInline: 40, background: PRIMARY, border: "none", fontWeight: 700 }}>XEM LỊCH CỦA TÔI</Button>,
                                <Button size="large" key="home" onClick={() => navigate('/')} style={{ borderRadius: 12, height: 50, fontWeight: 600 }}>VỀ TRANG CHỦ</Button>
                            ]}
                        />
                    </Card>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" } }}>
            {contextHolder}
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <div style={{ background: DARK_NAVY, padding: "60px 24px 120px", textAlign: "center" }}>
                    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                        <Tag color="orange" style={{ borderRadius: 20, padding: "4px 16px", fontWeight: 700, marginBottom: 16, border: "none" }}>POOGI CLINIC</Tag>
                        <Title style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: 0 }}>Đặt Lịch Chăm Sóc</Title>
                        <Text style={{ color: "#94a3b8", fontSize: 16 }}>Chuyên gia thú y luôn sẵn sàng hỗ trợ bé cưng của bạn</Text>
                    </div>
                </div>

                <div style={{ maxWidth: 1100, margin: "-80px auto 60px", padding: "0 24px" }}>
                    <Card bordered={false} style={{ borderRadius: 32, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)", overflow: "hidden" }}>
                        <div style={{ padding: "32px 40px", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
                            <Steps current={current} type="navigation" size="small" items={STEPS} />
                        </div>

                        <div style={{ padding: "40px", minHeight: 450 }}>
                            {current === 0 && (
                                <div style={{ animation: "fadeIn 0.5s ease" }}>
                                    <Title level={4} style={{ marginBottom: 32 }}><MedicineBoxOutlined /> 1. Chọn loại hình dịch vụ</Title>
                                    <Row gutter={[16, 16]}>
                                        {services.map(svc => (
                                            <Col xs={24} sm={12} md={8} key={svc._id}>
                                                <ServiceItem svc={svc} isSelected={selService?._id === svc._id} onSelect={setSelService} />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {current === 1 && (
                                <div style={{ animation: "fadeIn 0.5s ease" }}>
                                    <Title level={4} style={{ marginBottom: 32 }}><CalendarOutlined /> 2. Bác sĩ & Thời gian khám</Title>
                                    <Text strong style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Chọn bác sĩ phụ trách {loadingDoctors && <Spin size="small" style={{marginLeft: 8}} />}</Text>
                                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                                        {doctors.map(doc => (
                                            <Col xs={24} sm={12} md={8} key={doc._id}>
                                                <Card onClick={() => setSelDoctor(doc)} bodyStyle={{ padding: 16 }}
                                                    style={{ borderRadius: 20, cursor: "pointer", border: `2px solid ${selDoctor?._id === doc._id ? PRIMARY : "#f1f5f9"}`, background: selDoctor?._id === doc._id ? "#fff7ed" : "#fff" }}>
                                                    <Space size={16}>
                                                        <Avatar size={54} src={doc.user?.avatar} icon={<UserOutlined />} />
                                                        <div>
                                                            <div style={{ fontWeight: 800, color: DARK_NAVY }}>BS. {doc.user?.fullName}</div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>{doc.specialty}</Text>
                                                        </div>
                                                    </Space>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>

                                    {selDoctor && (
                                        <Row gutter={32}>
                                            <Col xs={24} md={12}>
                                                <Text strong style={{ display: "block", marginBottom: 12 }}>Chọn ngày khám</Text>
                                                <DatePicker style={{ width: "100%", height: 50, borderRadius: 12 }} 
                                                    disabledDate={c => c && c < dayjs().startOf('day')}
                                                    onChange={d => { setSelDate(d); setSelTime(null); }} value={selDate} format="DD/MM/YYYY" />
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Text strong style={{ display: "block", marginBottom: 12 }}>Khung giờ trống {loadingSlots && <Spin size="small" style={{marginLeft: 8}}/>}</Text>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                    {availableSlots.map(t => (
                                                        <Button key={t} onClick={() => setSelTime(t)}
                                                            style={{ borderRadius: 10, height: 40, background: selTime === t ? PRIMARY : "#fff", color: selTime === t ? "#fff" : DARK_NAVY, borderColor: selTime === t ? PRIMARY : "#e2e8f0", fontWeight: 600 }}>{t}</Button>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            )}

                            {current === 2 && (
                                <div style={{ animation: "fadeIn 0.5s ease" }}>
                                    <Title level={4} style={{ marginBottom: 32 }}><HeartOutlined /> 3. Thông tin thú cưng</Title>
                                    <Form form={form} layout="vertical" requiredMark={false}>
                                        <Row gutter={24}>
                                            <Col span={12}><Form.Item name="petName" label="Tên thú cưng" rules={[{required: true}]}><Input size="large" placeholder="Ví dụ: Milo" style={{borderRadius: 12}}/></Form.Item></Col>
                                            <Col span={12}><Form.Item name="petType" label="Loài" initialValue="Chó"><Select size="large" style={{borderRadius: 12}}><Option value="Chó">🐕 Chó</Option><Option value="Mèo">🐈 Mèo</Option><Option value="Khác">🐾 Khác</Option></Select></Form.Item></Col>
                                            <Col span={12}><Form.Item name="petAge" label="Tuổi"><Input size="large" placeholder="Ví dụ: 2 tuổi" style={{borderRadius: 12}}/></Form.Item></Col>
                                            <Col span={12}><Form.Item name="petWeight" label="Cân nặng"><Input size="large" placeholder="Ví dụ: 5kg" style={{borderRadius: 12}}/></Form.Item></Col>
                                            <Col span={24}><Form.Item name="note" label="Ghi chú thêm"><Input.TextArea rows={4} placeholder="Mô tả triệu chứng..." style={{borderRadius: 12}}/></Form.Item></Col>
                                        </Row>
                                    </Form>
                                </div>
                            )}
                        </div>

                        <div style={{ background: "#f8fafc", padding: "24px 40px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 16 }}>
                                {selService && <Badge status="success" text={selService.name} />}
                                {selDoctor && <Badge status="processing" text={`BS. ${selDoctor.user?.fullName.split(' ').pop()}`} />}
                            </div>
                            <Space size={16}>
                                {current > 0 && <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrent(c => c - 1)} style={{ borderRadius: 12, height: 50, fontWeight: 600 }}>Quay lại</Button>}
                                {current < 2 ? (
                                    <Button type="primary" size="large" disabled={!canNext} onClick={() => setCurrent(c => c + 1)} style={{ borderRadius: 12, height: 50, paddingInline: 32, fontWeight: 700, background: PRIMARY, border: "none" }}>TIẾP THEO <ArrowRightOutlined /></Button>
                                ) : (
                                    <Button type="primary" size="large" loading={loadingSubmit} onClick={handleSubmit} style={{ borderRadius: 12, height: 50, paddingInline: 40, fontWeight: 800, background: PRIMARY, border: "none", boxShadow: `0 8px 20px ${PRIMARY}40` }}>XÁC NHẬN ĐẶT LỊCH</Button>
                                )}
                            </Space>
                        </div>
                    </Card>
                    <div style={{ textAlign: "center", marginTop: 24, color: "#94a3b8", fontSize: 13 }}>
                        <SafetyCertificateOutlined /> Bảo mật thông tin chuẩn PooGi Standard 2026
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .ant-steps-item-title { font-weight: 600 !important; }
            `}</style>
        </ConfigProvider>
    );
}