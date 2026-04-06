import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Button, Tag, Typography, Spin,
    ConfigProvider, Avatar, Divider, Rate, Card, Space, Badge
} from "antd";
import {
    CalendarOutlined, ArrowLeftOutlined, StarFilled,
    ClockCircleOutlined, CheckCircleOutlined, MailOutlined,
    PhoneOutlined, TrophyOutlined, MedicineBoxOutlined,
    UserOutlined, RightOutlined
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

const DAY_VI = {
    monday: 'Thứ 2', tuesday: 'Thứ 3', wednesday: 'Thứ 4',
    thursday: 'Thứ 5', friday: 'Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật',
};

const MOCK_REVIEWS = [
    { id: 1, name: 'Nguyễn Thị Hoa', rating: 5, date: '10/03/2026', comment: 'Bác sĩ rất tận tâm, giải thích rõ ràng từng bước điều trị cho bé mèo nhà mình.' },
    { id: 2, name: 'Trần Minh Tuấn', rating: 5, date: '05/03/2026', comment: 'Chuyên nghiệp, nhẹ nhàng với thú cưng. Bé chó không sợ hãi gì cả!' },
];

export default function DoctorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const BANNER_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { res, data } = await fetchApi(`doctors/${id}`, null, 'GET');
            if (res.ok) setDoctor(data.doctor);
            else navigate('/bac-si');
            setLoading(false);
        })();
    }, [id, navigate]);

    useEffect(() => {
    (async () => {
        setLoading(true);
        // Lấy chi tiết bác sĩ
        const { res, data } = await fetchApi(`doctors/${id}`, null, 'GET');
        if (res.ok) {
            setDoctor(data.doctor);

            // GỌI THÊM ĐOẠN NÀY: Lấy review thực tế từ route bạn đã có
            const reviewRes = await fetchApi(`reviews/doctor/${id}`, null, 'GET');
            if (reviewRes.res.ok) {
                setReviews(reviewRes.data.reviews || []);
            }
        } else {
            navigate('/bac-si');
        }
        setLoading(false);
    })();
}, [id, navigate]);

    if (loading) return <div style={{ textAlign: 'center', padding: 150 }}><Spin size="large" tip="Đang tải hồ sơ bác sĩ..." /></div>;
    if (!doctor) return null;

    const user = doctor.user || {};
    const schedule = Object.entries(doctor.workSchedule || {}).filter(([, slots]) => slots?.length > 0);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', sans-serif" } }}>
            <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
                
                {/* ── Banner Header ── */}
            <div style={{ 
                width: '100vw',
                height: 280, // Tăng nhẹ chiều cao để show ảnh đẹp hơn
                position: 'relative',
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${BANNER_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed', // Hiệu ứng Parallax khi cuộn
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: 1200, padding: '24px', position: 'relative', zIndex: 1 }}>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/bac-si')}
                        type="text"
                        style={{ color: '#fff'}}
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>

                {/* ── Main Content Container ── */}
                <div style={{ maxWidth: 1200, margin: '-100px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <Row gutter={[32, 32]}>
                        
                        {/* Cột trái: Profile Card */}
                        <Col xs={24} lg={8}>
                            <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ marginTop: -80 }}>
                                    <Badge dot color="#22c55e" offset={[-15, 125]} style={{ width: 20, height: 20 }}>
                                        <Avatar 
                                            size={160} 
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                            style={{ border: '6px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                                        />
                                    </Badge>
                                </div>
                                
                                <div style={{ marginTop: 20 }}>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800 }}>BS. {user.fullName}</Title>
                                    <Text strong style={{ color: PRIMARY, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>
                                        {doctor.specialty || 'Chuyên gia đa khoa'}
                                    </Text>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
                                    <div style={{ flex: 1, padding: '12px', background: '#f8fafc', borderRadius: 16 }}>
                                        <Text strong style={{ display: 'block', fontSize: 18 }}>4.9</Text>
                                        <Rate disabled value={5} style={{ fontSize: 10, color: '#f59e0b' }} />
                                    </div>
                                    <div style={{ flex: 1, padding: '12px', background: '#f8fafc', borderRadius: 16 }}>
                                        <Text strong style={{ display: 'block', fontSize: 18 }}>500+</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Bệnh nhân</Text>
                                    </div>
                                </div>

                                <Button 
                                    type="primary" size="large" block 
                                    icon={<CalendarOutlined />}
                                    onClick={() => navigate('/dat-lich-kham')}
                                    style={{ height: 50, borderRadius: 12, fontWeight: 700, background: PRIMARY, border: 'none', boxShadow: `0 8px 15px ${PRIMARY}40` }}
                                >
                                    ĐẶT LỊCH KHÁM
                                </Button>
                                
                                <Divider style={{ margin: '24px 0' }} />
                                
                                <div style={{ textAlign: 'left' }}>
                                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <MailOutlined style={{ color: '#94a3b8', marginTop: 4 }} />
                                            <Text style={{ color: '#475569' }}>{user.email || 'doctor@poogi.vn'}</Text>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <PhoneOutlined style={{ color: '#94a3b8', marginTop: 4 }} />
                                            <Text style={{ color: '#475569' }}>{user.phoneNumber || '1900 1234'}</Text>
                                        </div>
                                    </Space>
                                </div>
                            </Card>
                        </Col>

                        {/* Cột phải: Detailed Info */}
                        <Col xs={24} lg={16}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                
                                {/* Intro Section */}
                                <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <Title level={4} style={{ marginBottom: 16 }}><UserOutlined style={{ color: PRIMARY }} /> Giới thiệu chuyên gia</Title>
                                    <Paragraph style={{ fontSize: 16, color: '#475569', lineHeight: 1.8 }}>
                                        {doctor.bio || `Bác sĩ ${user.fullName} là một trong những chuyên gia hàng đầu tại PooGi Clinic với hơn 5 năm kinh nghiệm lâm sàng. Bác sĩ nổi tiếng với sự nhẹ nhàng, kiên nhẫn và phương pháp điều trị tiên tiến, giúp hàng ngàn thú cưng vượt qua các bệnh lý phức tạp.`}
                                    </Paragraph>
                                    
                                    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                                        <Col span={12}>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, background: '#f0fdf4', borderRadius: 16 }}>
                                                <TrophyOutlined style={{ fontSize: 24, color: '#16a34a' }} />
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Bằng cấp</Text>
                                                    <Text strong>{doctor.degree || 'Thạc sĩ Thú y'}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, background: '#eff6ff', borderRadius: 16 }}>
                                                <MedicineBoxOutlined style={{ fontSize: 24, color: '#2563eb' }} />
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Chuyên khoa</Text>
                                                    <Text strong>{doctor.specialty || 'Nội khoa & Phẫu thuật'}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Work Schedule Section */}
                                <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <Title level={4} style={{ marginBottom: 20 }}><ClockCircleOutlined style={{ color: PRIMARY }} /> Lịch làm việc tuần này</Title>
                                    <Row gutter={[12, 12]}>
                                        {schedule.map(([day, slots]) => (
                                            <Col xs={24} sm={12} key={day}>
                                                <div style={{ 
                                                    padding: '16px', borderRadius: 20, border: '1px solid #f1f5f9', 
                                                    background: '#fff', transition: '0.3s'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                        <Text strong style={{ color: DARK_NAVY }}>{DAY_VI[day]}</Text>
                                                        <Badge status="processing" color={PRIMARY} />
                                                    </div>
                                                    <Space wrap size={6}>
                                                        {slots.map(slot => (
                                                            <Tag key={slot} style={{ borderRadius: 6, background: '#fff7ed', border: '1px solid #fed7aa', color: PRIMARY, margin: 0 }}>
                                                                {slot}
                                                            </Tag>
                                                        ))}
                                                    </Space>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>

                                {/* Reviews Section */}
                                <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <Title level={4} style={{ margin: 0 }}><StarFilled style={{ color: '#f59e0b' }} /> Phản hồi từ chủ nuôi</Title>
                                        <Button type="link" icon={<RightOutlined />}>Xem tất cả</Button>
                                    </div>
                                    {reviews.map((r, i) => (
                                        <div key={r.id} style={{ 
                                            padding: '20px', background: '#f8fafc', borderRadius: 20, 
                                            marginBottom: i < reviews.length - 1 ? 16 : 0 
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Space>
                                                    <Avatar size="small" style={{ background: PRIMARY }}>{r.name.charAt(0)}</Avatar>
                                                    <Text strong>{r.name}</Text>
                                                </Space>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{r.date}</Text>
                                            </div>
                                            <Rate disabled value={r.rating} style={{ fontSize: 10, marginBottom: 8 }} />
                                            <Paragraph style={{ margin: 0, color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>
                                                "{r.comment}"
                                            </Paragraph>
                                        </div>
                                    ))}
                                </Card>

                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            <style>{`
                .ant-typography h1, .ant-typography h2, .ant-typography h3, .ant-typography h4 {
                    font-family: 'Inter', sans-serif !important;
                }
                .ant-card {
                    transition: transform 0.3s ease;
                }
            `}</style>
        </ConfigProvider>
    );
}