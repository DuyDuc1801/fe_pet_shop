import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Button, Tag, Typography, Spin,
    ConfigProvider, Card, Divider, Avatar, Space
} from "antd";
import {
    CalendarOutlined, ArrowLeftOutlined, ClockCircleOutlined,
    CheckCircleOutlined, QuestionCircleOutlined, PhoneOutlined
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

// Hình ảnh minh họa chất lượng cao cho Header
const HEADER_BG = "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop";

const FAQ_DEFAULT = [
    { q: 'Dịch vụ này mất bao lâu?', a: 'Thời gian thực hiện phụ thuộc vào tình trạng thú cưng, thông thường từ 30–90 phút.' },
    { q: 'Thú cưng có cần nhịn ăn trước không?', a: 'Tùy loại dịch vụ. Với phẫu thuật cần nhịn ăn 8–12 giờ. Khám thông thường không cần.' },
    { q: 'Chi phí đã bao gồm thuốc chưa?', a: 'Phí dịch vụ chưa bao gồm thuốc điều trị. Chi phí thuốc sẽ được tư vấn thêm sau khi khám.' },
    { q: 'Có thể đặt lịch khẩn cấp không?', a: 'Có. Vui lòng gọi hotline 1900 1234 để được hỗ trợ đặt lịch khẩn cấp ngoài giờ.' },
];

const PROCESS_STEPS = [
    { icon: '📋', title: 'Đặt lịch', desc: 'Đặt lịch trực tuyến hoặc gọi hotline 1900 1234' },
    { icon: '🏥', title: 'Tiếp nhận', desc: 'Đăng ký tại quầy, điền thông tin thú cưng' },
    { icon: '🩺', title: 'Thực hiện', desc: 'Bác sĩ thực hiện dịch vụ, theo dõi trong suốt quá trình' },
    { icon: '📝', title: 'Tư vấn', desc: 'Nhận kết quả và hướng dẫn chăm sóc tại nhà' },
];

export default function ServiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { res, data } = await fetchApi(`services/${id}`, null, 'GET');
            if (res.ok) setService(data.service || data);
            else navigate('/dich-vu');
            setLoading(false);
        })();
    }, [id, navigate]);

    if (loading) return <div style={{ textAlign: 'center', padding: 150 }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
    if (!service) return null;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" } }}>
            {/* ── HERO BANNER SECTION ── */}
            <div style={{ 
                position: 'relative', height: 280, display: 'flex', alignItems: 'flex-end', padding: '0 40px 60px',
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${HEADER_BG})`,
                backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
            }}>
                <div style={{ maxWidth: 1300, margin: '0 auto', width: '100%' }}>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        type="text" 
                        onClick={() => navigate('/dich-vu')}
                        style={{ color: '#fff', position: 'absolute', top: 30, left: 30, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    >
                        Quay lại dịch vụ
                    </Button>
                    <Tag color="orange" style={{ borderRadius: 4, fontWeight: 700, marginBottom: 12, border: 'none' }}>
                        {service.category?.toUpperCase()}
                    </Tag>
                    <Title style={{ color: '#fff', margin: 0, fontSize: 40, fontWeight: 800 }}>{service.name}</Title>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: 1300, margin: '-40px auto 80px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                <Row gutter={[32, 32]}>
                    
                    {/* CỘT PHẢI: CHI TIẾT DỊCH VỤ */}
                    <Col xs={24} lg={16}>
                        <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                            <Title level={4} style={{ marginBottom: 20 }}>📋 Mô tả dịch vụ</Title>
                            <Paragraph style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.8 }}>
                                {service.description || `Dịch vụ ${service.name} tại PooGi được thực hiện bởi đội ngũ bác sĩ thú y giàu kinh nghiệm, với trang thiết bị hiện đại. Chúng tôi cam kết mang lại sự chăm sóc tốt nhất cho thú cưng của bạn.`}
                            </Paragraph>

                            <Divider style={{ margin: '32px 0' }} />

                            <Title level={4} style={{ marginBottom: 16 }}>✅ Dịch vụ bao gồm</Title>
                            <Row gutter={[16, 12]}>
                                {[
                                    'Thăm khám trực tiếp bởi bác sĩ chuyên môn',
                                    'Tư vấn chi tiết về tình trạng sức khỏe',
                                    'Hồ sơ bệnh án điện tử lưu trữ lâu dài',
                                    'Hỗ trợ sau dịch vụ qua hotline 24/7',
                                ].map(item => (
                                    <Col xs={24} sm={12} key={item}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
                                            <Text style={{ fontSize: 14, color: '#374151' }}>{item}</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            <Divider style={{ margin: '32px 0' }} />

                            {/* QUY TRÌNH (PROCESS) */}
                            <Title level={4} style={{ marginBottom: 30 }}>🔄 Quy trình thực hiện</Title>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 22, left: '10%', right: '10%', height: 2, background: '#fed7aa', zIndex: 0 }} />
                                {PROCESS_STEPS.map((step, i) => (
                                    <div key={i} style={{ textAlign: 'center', zIndex: 1, width: '22%' }}>
                                        <div style={{ 
                                            width: 46, height: 46, borderRadius: '50%', background: PRIMARY, color: '#fff', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 12px',
                                            boxShadow: '0 4px 10px rgba(249,115,22,0.3)', border: '4px solid #fff'
                                        }}>
                                            {step.icon}
                                        </div>
                                        <Text strong style={{ display: 'block', fontSize: 13 }}>{step.title}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>{step.desc}</Text>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* FAQ SECTION */}
                        <Card bordered={false} style={{ borderRadius: 24, marginTop: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                            <Title level={4} style={{ marginBottom: 20 }}><QuestionCircleOutlined style={{ color: PRIMARY }} /> Câu hỏi thường gặp</Title>
                            {FAQ_DEFAULT.map((faq, i) => (
                                <div key={i} style={{ borderBottom: i < FAQ_DEFAULT.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        style={{ padding: '18px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <Text strong style={{ fontSize: 15, color: openFaq === i ? PRIMARY : DARK_NAVY }}>{faq.q}</Text>
                                        <span style={{ color: PRIMARY, fontSize: 20, transition: '0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                                    </div>
                                    {openFaq === i && (
                                        <div style={{ paddingBottom: 18 }}>
                                            <Text style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</Text>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Card>
                    </Col>

                    {/* CỘT TRÁI: BOOKING CARD (STICKY) */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: 24 }}>
                            <Card bordered={false} style={{ borderRadius: 24, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                                <div style={{ background: '#fff7ed', padding: '24px', margin: '-24px -24px 24px' }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Phí dịch vụ trọn gói</Text>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: PRIMARY, margin: '8px 0' }}>
                                        {service.price?.toLocaleString('vi-VN')}₫
                                    </div>
                                    <Text strong><ClockCircleOutlined /> ~{service.duration} phút thực hiện</Text>
                                </div>
                                
                                <Button 
                                    type="primary" size="large" block icon={<CalendarOutlined />}
                                    onClick={() => navigate('/dat-lich-kham')}
                                    style={{ height: 56, borderRadius: 16, fontWeight: 800, fontSize: 16, background: PRIMARY, border: 'none', boxShadow: `0 8px 20px ${PRIMARY}40` }}
                                >
                                    ĐẶT LỊCH KHÁM NGAY
                                </Button>
                                
                                <Divider style={{ margin: '24px 0' }} />
                                
                                <div style={{ textAlign: 'left', background: '#f8fafc', padding: 16, borderRadius: 16 }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <Avatar size={40} style={{ background: PRIMARY }} icon={<PhoneOutlined />} />
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Tư vấn nhanh 24/7</Text>
                                            <div style={{ fontWeight: 800, fontSize: 18, color: DARK_NAVY }}>1900 1234</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card bordered={false} style={{ borderRadius: 24, marginTop: 24, background: DARK_NAVY, color: '#fff', textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
                                <Text strong style={{ color: '#fff', display: 'block', fontSize: 15 }}>Cam kết PooGi Standard</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Dịch vụ đạt chuẩn y khoa quốc tế, an toàn tuyệt đối cho bé cưng.</Text>
                            </Card>
                        </div>
                    </Col>

                </Row>
            </div>
        </ConfigProvider>
    );
}