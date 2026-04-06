import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Row, Col, Card, Tag, Button, Typography,
    Spin, Empty, ConfigProvider, Input, Tabs, Space
} from "antd";
import { 
    SearchOutlined, CalendarOutlined, ArrowRightOutlined, 
    AppstoreOutlined, MedicineBoxOutlined, ClockCircleOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text, Paragraph } = Typography;

const PRIMARY_ORANGE = "#f97316";
const DARK_NAVY = "#0f172a";
const BG_HERO = "https://res.cloudinary.com/dve4vnfng/image/upload/v1774772006/BannerShop_l0tvkm.png";

// ── Component: Square Service Card (Ô vuông ngang) ──────────────
function ServiceCardSquare({ service }) {
    const navigate = useNavigate();

    return (
        <Card 
            hoverable 
            bordered={false}
            style={{ 
                borderRadius: 20, 
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(249,115,22,0.15)';
                e.currentTarget.style.transform = 'translateY(-6px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Tag color="orange" style={{ borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 10 }}>
                        {service.category?.toUpperCase()}
                    </Tag>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}><ClockCircleOutlined /> {service.duration}p</Text>
                </div>

                <Title level={5} style={{ margin: '0 0 10px', color: DARK_NAVY, fontWeight: 700, minHeight: 44 }}>
                    {service.name}
                </Title>

                <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                    {service.description || "Dịch vụ y tế chất lượng cao dành cho thú cưng tại PooGi Clinic."}
                </Paragraph>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: 800, color: PRIMARY_ORANGE }}>
                        {service.price?.toLocaleString('vi-VN')}
                    </Text>
                    <Text style={{ fontSize: 12, color: PRIMARY_ORANGE, fontWeight: 600 }}>VNĐ</Text>
                </div>

                <Row gutter={8}>
                    <Col span={10}>
                        <Button 
                            block
                            onClick={() => navigate(`/dich-vu/${service._id}`)}
                            style={{ borderRadius: 10, fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0' }}
                        >
                            Chi tiết
                        </Button>
                    </Col>
                    <Col span={14}>
                        <Button 
                            type="primary" 
                            block 
                            icon={<CalendarOutlined />}
                            onClick={() => navigate('/dat-lich-kham')}
                            style={{ borderRadius: 10, fontSize: 12, fontWeight: 600, background: PRIMARY_ORANGE, border: 'none' }}
                        >
                            Đặt lịch
                        </Button>
                    </Col>
                </Row>
            </div>
        </Card>
    );
}

// ── Page Chính ──────────────────────────────────────────────────
export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');

    const loadServices = useCallback(async () => {
        try {
            const { res, data } = await fetchApi('services', null, 'GET');
            if (res.ok) setServices(data.services || data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadServices(); }, [loadServices]);

    const categories = useMemo(() => {
        const cats = services.map(s => s.category).filter(Boolean);
        return ['Tất cả', ...new Set(cats)];
    }, [services]);

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            const matchTab = activeTab === 'Tất cả' || s.category === activeTab;
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
            return matchTab && matchSearch;
        });
    }, [services, activeTab, search]);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY_ORANGE, fontFamily: "'Be Vietnam Pro', sans-serif" } }}>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                
                {/* Hero Section */}
                <div style={{ 
                    padding: '70px 20px', 
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${BG_HERO})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', textAlign: 'center'
                }}>
                    <Title level={1} style={{ color: '#fff', marginBottom: 16, fontSize: 36 }}>
                        Dịch Vụ Y Tế PooGi
                    </Title>
                    <Text style={{ color: '#cbd5e1', fontSize: 16, display: 'block', marginBottom: 30 }}>
                        Chăm sóc bé cưng bằng cả trái tim và công nghệ hiện đại
                    </Text>
                    <div style={{ maxWidth: 550, margin: '0 auto' }}>
                        <Input 
                            prefix={<SearchOutlined style={{ color: PRIMARY_ORANGE }} />}
                            placeholder="Tìm kiếm dịch vụ..." 
                            size="large" allowClear
                            onChange={e => setSearch(e.target.value)}
                            style={{ borderRadius: 14, height: 54, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                        />
                    </div>
                </div>

                {/* Main Content (Mở rộng lề) */}
                <div style={{ maxWidth: 1500, margin: '-28px auto 80px', padding: '0 24px' }}>
                    
                    {/* Filter Bar */}
                    <Card style={{ borderRadius: 16, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}} bodyStyle={{ padding: '12px 24px 2px' }}>
                        <Tabs 
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            centered
                            items={categories.map(cat => ({
                                key: cat,
                                label: <span style={{ padding: '0', fontWeight: 600, fontSize: 15 }}>{cat}</span>
                            }))}
                        />
                    </Card>

                    {/* Grid Danh sách (4 cột trên máy tính) */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>
                    ) : filteredServices.length > 0 ? (
                        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
                            <Row gutter={[20, 20]}>
                                {filteredServices.map(s => (
                                    <Col key={s._id} xs={24} sm={12} md={8} lg={6}>
                                        <ServiceCardSquare service={s} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <Empty description="Không tìm thấy dịch vụ nào" style={{ padding: 100, background: '#fff', borderRadius: 20 }} />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .ant-tabs-nav::before { border: none !important; }
                .ant-tabs-tab { color: #94a3b8 !important; }
                .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${PRIMARY_ORANGE} !important; }
                .ant-tabs-ink-bar { background: ${PRIMARY_ORANGE} !important; height: 3px !important; }
            `}</style>
        </ConfigProvider>
    );
}