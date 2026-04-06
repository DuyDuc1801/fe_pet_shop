import { useState, useEffect, useCallback } from "react";
import {
    Row, Col, Card, Avatar, Tag, Button, Typography,
    Spin, Empty, ConfigProvider, Input, Space, Divider
} from "antd";
import {
    SearchOutlined, CalendarOutlined,
    StarFilled, MedicineBoxOutlined,
    CheckCircleFilled, ArrowRightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

const SPECIALTIES = ['Tất cả', 'Nội khoa', 'Ngoại khoa', 'Da liễu', 'Dinh dưỡng', 'Răng hàm mặt'];

const DAY_MAP = {
    monday: 'T2', tuesday: 'T3', wednesday: 'T4',
    thursday: 'T5', friday: 'T6', saturday: 'T7', sunday: 'CN',
};

// ── Component: DoctorCard Nâng Cấp ──────────────────────────
function DoctorCard({ doctor }) {
    const navigate = useNavigate();
    const user = doctor.user || {};
    const workDays = Object.entries(doctor.workSchedule || {})
        .filter(([, slots]) => slots?.length > 0)
        .map(([day]) => DAY_MAP[day])
        .filter(Boolean);

    return (
        <Card
            hoverable
            bordered={false}
            style={{ 
                borderRadius: 24, 
                overflow: 'hidden', 
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'}
        >
            {/* Ảnh & Trạng thái */}
            <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar 
                        size={110} 
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                        style={{ border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    />
                    <div style={{ position: 'absolute', bottom: 5, right: 5, background: '#22c55e', width: 20, height: 20, borderRadius: '50%', border: '3px solid #fff' }} />
                </div>
                <div style={{ marginTop: 12 }}>
                    <Title level={5} style={{ margin: 0, fontWeight: 800, fontSize: 18, color: DARK_NAVY }}>
                        BS. {user.fullName}
                    </Title>
                    <Text strong style={{ color: PRIMARY, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {doctor.specialty || 'Đa khoa'}
                    </Text>
                </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Thông tin phụ */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>4.9</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Đánh giá</Text>
                    </div>
                    <Divider type="vertical" style={{ height: 32 }} />
                    <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{workDays.length}+</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Ngày trực</Text>
                    </div>
                </div>

                {workDays.length > 0 && (
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Space size={4} wrap style={{ justifyContent: 'center' }}>
                            {workDays.map(d => (
                                <Tag key={d} style={{ borderRadius: 6, margin: 0, fontSize: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                                    {d}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
                <Button 
                    block 
                    onClick={() => navigate(`/bac-si/${doctor._id}`)}
                    style={{ borderRadius: 12, fontWeight: 600, height: 40 }}
                >
                    Hồ sơ
                </Button>
                <Button 
                    type="primary" 
                    block 
                    icon={<CalendarOutlined />}
                    onClick={() => navigate('/dat-lich-kham')}
                    style={{ borderRadius: 12, fontWeight: 700, height: 40, background: PRIMARY, border: 'none' }}
                >
                    Đặt lịch
                </Button>
            </div>
        </Card>
    );
}

// ── Page Chính ──────────────────────────────────────────────────
export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('Tất cả');

    const BG_DOCTORS = "https://res.cloudinary.com/dve4vnfng/image/upload/v1774772267/listdoctors_p44riq.jpg";

    const loadDoctors = useCallback(async () => {
        setLoading(true);
        const { res, data } = await fetchApi('doctors', null, 'GET');
        if (res.ok) setDoctors(data.doctors || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        let isMounted = true; // Biến cờ để tránh leak memory

        const fetchData = async () => {
            if (isMounted) {
                await loadDoctors();
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Cleanup khi component unmount
        };
    }, [loadDoctors]);

    const filtered = doctors.filter(d => {
        const name = d.user?.fullName?.toLowerCase() || '';
        const spec = d.specialty?.toLowerCase() || '';
        const matchSearch = !search || name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
        const matchSpecialty = specialty === 'Tất cả' || d.specialty === specialty;
        return matchSearch && matchSpecialty;
    });

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', sans-serif" } }}>
            <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
                
                {/* Hero Section */}
                <div style={{ 
                    position: 'relative', 
                    padding: '60px 40px', 
                    marginBottom: 40, 
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${BG_DOCTORS})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed', // Hiệu ứng Parallax nhẹ khi cuộn
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Tag color="orange" style={{ borderRadius: 20, padding: '4px 20px', fontWeight: 800, marginBottom: 20, border: 'none', fontSize: 12 }}>
                            POOGI MEDICAL TEAM
                        </Tag>
                        <Title level={1} style={{ color: '#fff', fontSize: 48, fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
                            Đội Ngũ Bác Sĩ Chuyên Khoa
                        </Title>
                        <Paragraph style={{ color: '#cbd5e1', fontSize: 18, marginBottom: 40, fontWeight: 400 }}>
                            Hội tụ những chuyên gia thú y hàng đầu, tận tâm chăm sóc và bảo vệ sức khỏe cho bé cưng của bạn.
                        </Paragraph>

                        <div style={{ maxWidth: 550, margin: '0 auto' }}>
                            <Input 
                                prefix={<SearchOutlined style={{ color: PRIMARY }} />}
                                placeholder="Tìm kiếm bác sĩ hoặc chuyên khoa..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                size="large"
                                allowClear
                                style={{ 
                                    borderRadius: 16, 
                                    height: 60, 
                                    border: 'none', 
                                    fontSize: 16,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)' 
                                }} 
                            />
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
                    {/* Filter Pills */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
                        {SPECIALTIES.map(s => (
                            <Button 
                                key={s} 
                                onClick={() => setSpecialty(s)}
                                style={{
                                    borderRadius: 50,
                                    height: 40,
                                    padding: '0 24px',
                                    fontWeight: specialty === s ? 700 : 500,
                                    background: specialty === s ? PRIMARY : '#fff',
                                    color: specialty === s ? '#fff' : '#475569',
                                    border: specialty === s ? 'none' : '1px solid #e2e8f0',
                                    boxShadow: specialty === s ? '0 4px 12px rgba(249,115,22,0.3)' : 'none'
                                }}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
                    ) : filtered.length === 0 ? (
                        <Card bordered={false} style={{ textAlign: 'center', borderRadius: 24, padding: 60 }}>
                            <Empty description="Không tìm thấy bác sĩ phù hợp" />
                        </Card>
                    ) : (
                        <Row gutter={[24, 24]}>
                            {filtered.map(d => (
                                <Col key={d._id} xs={24} sm={12} lg={8} xl={6}>
                                    <DoctorCard doctor={d} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </div>

            <style>{`
                .ant-typography h1, .ant-typography h2, .ant-typography h3, .ant-typography h4, .ant-typography h5 {
                    font-family: 'Inter', 'Be Vietnam Pro', sans-serif !important;
                }
                .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
                    box-shadow: 0 0 0 2px ${PRIMARY}30 !important;
                }
            `}</style>
        </ConfigProvider>
    );
}