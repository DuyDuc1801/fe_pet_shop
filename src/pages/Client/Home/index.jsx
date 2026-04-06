import { Link } from "react-router-dom";
import { Row, Col, Button, Card, Tag, Rate, Avatar, ConfigProvider, Typography, Space, Divider } from "antd";
import {
    CalendarOutlined, ShoppingOutlined, ArrowRightOutlined,
    CheckCircleFilled, StarFilled, RightOutlined,
    PhoneOutlined, EnvironmentOutlined, HeartFilled,
    SafetyCertificateFilled, TrophyFilled
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";
const BG_SOFT = "#f8fafc";

const IMAGES = {
    hero: "https://i.pinimg.com/1200x/63/82/c5/6382c56ac236b44290d42944f5603204.jpg",
    services: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1400&q=80",
    products: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1400&q=80",
    cta: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&q=80",
    doctor: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80",
};

// ── HERO ─────────────────────────────────────────────────────────
function Hero() {
    return (
        <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden", background: DARK_NAVY }}>
            <img src={IMAGES.hero} alt="PooGi"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, objectPosition: "center 30%" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.95) 30%, rgba(15,23,42,0.2) 100%)" }} />

            <div style={{ position: "relative", zIndex: 2, maxWidth: 1300, margin: "0 auto", padding: "0 24px", width: "100%" }}>
                <div style={{ maxWidth: 700, animation: "fadeUp 0.8s ease-out" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "6px 20px", marginBottom: 28 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>OPEN: 07:00 – 21:00 DAILY</span>
                    </div>

                    <Title style={{ color: "#fff", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1, letterSpacing: "-2px" }}>
                        Chăm sóc thú cưng <br />
                        <span style={{ background: "linear-gradient(to right, #fb923c, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tận tâm nhất</span>
                    </Title>

                    <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: 19, lineHeight: 1.7, marginBottom: 40, maxWidth: 550 }}>
                        Hệ thống y tế thú y PooGi mang đến dịch vụ chăm sóc chuẩn quốc tế với đội ngũ chuyên gia giàu kinh nghiệm.
                    </Paragraph>

                    <Space size={16} wrap>
                        <Link to="/dat-lich-kham">
                            <Button type="primary" size="large" icon={<CalendarOutlined />}
                                style={{ background: PRIMARY, border: "none", borderRadius: 16, height: 60, paddingInline: 36, fontSize: 16, fontWeight: 800, boxShadow: `0 12px 24px -6px ${PRIMARY}60` }}>
                                ĐẶT LỊCH NGAY
                            </Button>
                        </Link>
                        <Link to="/dich-vu">
                            <Button size="large" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: 16, height: 60, paddingInline: 32, fontSize: 16, fontWeight: 600 }}>
                                XEM DỊCH VỤ
                            </Button>
                        </Link>
                    </Space>
                </div>
            </div>
        </section>
    );
}

// ── QUICK LINKS ──────────────────────────────────────────────────
const QUICK_LINKS = [
    { emoji: "📅", title: "Đặt lịch", link: "/dat-lich-kham", bg: "#eff6ff", border: "#dbeafe" },
    { emoji: "🛒", title: "Cửa hàng", link: "/san-pham", bg: "#f0fdf4", border: "#dcfce7" },
    { emoji: "🩺", title: "Dịch vụ", link: "/dich-vu", bg: "#fff7ed", border: "#ffedd5" },
    { emoji: "👨‍⚕️", title: "Bác sĩ", link: "/bac-si", bg: "#f5f3ff", border: "#ede9fe" },
    { emoji: "📦", title: "Đơn hàng", link: "/don-hang-cua-toi", bg: "#fdf2f8", border: "#fce7f3" },
    { emoji: "🔍", title: "Tra cứu", link: "/ai-chan-doan", bg: "#f8fafc", border: "#e2e8f0" },
];

function QuickLinks() {
    return (
        <section style={{ padding: "40px 0", background: "#fff", position: "relative", marginTop: -60, zIndex: 10 }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
                <Row gutter={[16, 16]}>
                    {QUICK_LINKS.map(q => (
                        <Col xs={12} sm={8} md={4} key={q.title}>
                            <Link to={q.link} style={{ textDecoration: "none" }}>
                                <div style={{ background: "#fff", border: `1px solid #f1f5f9`, borderRadius: 24, padding: "24px 16px", textAlign: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05)"; }}>
                                    <div style={{ fontSize: 36, marginBottom: 12, display: "block" }}>{q.emoji}</div>
                                    <Text strong style={{ fontSize: 14, color: DARK_NAVY, display: "block" }}>{q.title}</Text>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>
    );
}

// ── SERVICES ─────────────────────────────────────────────────────
function Services() {
    return (
        <section style={{ padding: "120px 0", background: "#fff" }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
                <Row gutter={[80, 48]} align="middle">
                    <Col xs={24} lg={12}>
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", inset: "-20px", background: PRIMARY, borderRadius: 40, opacity: 0.1, transform: "rotate(-3deg)" }} />
                            <img src={IMAGES.services} alt="Vet" style={{ width: "100%", borderRadius: 40, position: "relative", zIndex: 1, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }} />
                            <div style={{ position: "absolute", bottom: -30, right: -30, background: "#fff", padding: "24px", borderRadius: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", zIndex: 2, maxWidth: 240 }}>
                                <Space size={12} align="start">
                                    <CheckCircleFilled style={{ color: "#22c55e", fontSize: 24 }} />
                                    <div>
                                        <Text strong style={{ display: "block", fontSize: 16 }}>Bác sĩ tay nghề cao</Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Đội ngũ hơn 10 năm kinh nghiệm trong ngành.</Text>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Tag color="orange" style={{ borderRadius: 8, fontWeight: 700, marginBottom: 16, border: "none", padding: "4px 12px" }}>DỊCH VỤ CỦA CHÚNG TÔI</Tag>
                        <Title level={2} style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: DARK_NAVY, margin: "0 0 24px", lineHeight: 1.2 }}>
                            Tiêu chuẩn vàng cho <br /><span style={{ color: PRIMARY }}>sức khỏe thú cưng</span>
                        </Title>
                        <Paragraph style={{ fontSize: 17, color: "#64748b", lineHeight: 1.8, marginBottom: 40 }}>
                            Chúng tôi hiểu rằng thú cưng là thành viên gia đình. PooGi cung cấp lộ trình điều trị minh bạch và trang thiết bị hiện đại nhất.
                        </Paragraph>
                        <Row gutter={[20, 20]}>
                            {[
                                { t: "Khám tổng quát", i: "🩺" },
                                { t: "Tiêm phòng", i: "💉" },
                                { t: "Phẫu thuật", i: "🔬" },
                                { t: "Grooming", i: "🛁" },
                            ].map(s => (
                                <Col span={12} key={s.t}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 16, background: BG_SOFT }}>
                                        <span style={{ fontSize: 20 }}>{s.i}</span>
                                        <Text strong>{s.t}</Text>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <Link to="/dich-vu">
                            <Button type="primary" size="large" icon={<ArrowRightOutlined />} iconPosition="end"
                                style={{ background: DARK_NAVY, border: "none", borderRadius: 12, height: 52, paddingInline: 32, fontWeight: 700, marginTop: 40 }}>
                                XEM CHI TIẾT DỊCH VỤ
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </div>
        </section>
    );
}

// ── CTA BOOKING ──────────────────────────────────────────────────
function CTABooking() {
    return (
        <section style={{ padding: "80px 24px" }}>
            <div style={{ 
                maxWidth: 1300, margin: "0 auto", 
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #f97316 100%)`, 
                borderRadius: 48, padding: "80px 40px", textAlign: "center",
                position: "relative", overflow: "hidden",
                boxShadow: `0 30px 60px -12px ${PRIMARY}40`
            }}>
                <div style={{ position: "absolute", top: -50, right: -50, fontSize: 200, opacity: 0.1, color: "#fff" }}>🐾</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <Title level={2} style={{ color: "#fff", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, margin: "0 0 20px" }}>
                        Sẵn sàng chăm sóc bé cưng?
                    </Title>
                    <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, marginBottom: 40 }}>
                        Đặt lịch online chỉ trong 1 phút — Tiết kiệm thời gian, xác nhận ngay qua Zalo.
                    </Paragraph>
                    <Link to="/dat-lich-kham">
                        <Button size="large" style={{ background: "#fff", color: PRIMARY, border: "none", borderRadius: 16, height: 64, paddingInline: 48, fontSize: 18, fontWeight: 800 }}>
                            ĐẶT LỊCH NGAY
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ── REVIEWS ──────────────────────────────────────────────────────
const REVIEWS = [
    { name: "Ngọc Anh", pet: "Chủ của Milo 🐶", text: "Bác sĩ rất tận tình, Milo đã khỏi hẳn bệnh viêm da chỉ sau 2 tuần. Phòng khám cực sạch!", rating: 5 },
    { name: "Minh Tuấn", pet: "Chủ của Luna 🐱", text: "Dịch vụ phẫu thuật ở đây rất an toàn. Tôi hoàn toàn tin tưởng đội ngũ PooGi.", rating: 5 },
    { name: "Thu Hương", pet: "Chủ của Bông 🐩", text: "Grooming tuyệt vời, cắt tỉa rất xinh và thơm lâu. Nhân viên siêu nhẹ nhàng.", rating: 5 },
];

function Reviews() {
    return (
        <section style={{ padding: "120px 0", background: BG_SOFT }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 70 }}>
                    <Tag color="orange" style={{ borderRadius: 8, fontWeight: 700, marginBottom: 16, border: "none", padding: "4px 12px" }}>TESTIMONIALS</Tag>
                    <Title level={2} style={{ fontWeight: 800, color: DARK_NAVY, fontSize: 42 }}>Cộng đồng yêu thú cưng tin dùng</Title>
                </div>
                <Row gutter={[24, 24]}>
                    {REVIEWS.map(r => (
                        <Col xs={24} md={8} key={r.name}>
                            <Card bordered={false} style={{ borderRadius: 32, height: "100%", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)" }}>
                                <Rate disabled defaultValue={r.rating} style={{ fontSize: 14, color: PRIMARY, marginBottom: 20 }} />
                                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: DARK_NAVY, fontStyle: "italic", marginBottom: 30 }}>
                                    "{r.text}"
                                </Paragraph>
                                <Space size={14}>
                                    <Avatar size={48} style={{ background: PRIMARY, fontWeight: 700 }}>{r.name.charAt(0)}</Avatar>
                                    <div>
                                        <Text strong style={{ display: "block", fontSize: 16 }}>{r.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>{r.pet}</Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function Home() {
    return (
        <ConfigProvider theme={{ 
            token: { 
                colorPrimary: PRIMARY, 
                fontFamily: "'Be Vietnam Pro', sans-serif",
                borderRadius: 16
            } 
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                section { overflow: hidden; }
                .ant-btn { display: inline-flex; align-items: center; justify-content: center; }
            `}</style>
            
            <div style={{ background: "#fff" }}>
                <Hero />
                <QuickLinks />
                <Services />
                <CTABooking />
                <Reviews />
                
            </div>
        </ConfigProvider>
    );
}