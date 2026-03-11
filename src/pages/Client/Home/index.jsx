import { Link } from "react-router-dom";
import {
  Row, Col, Button, Card, Tag, Rate, Avatar,
  Carousel, Statistic, ConfigProvider, Typography, Space, Badge,
} from "antd";
import {
  CalendarOutlined, ShoppingOutlined, HeartOutlined,
  StarFilled, ArrowRightOutlined, CheckCircleFilled,
  MedicineBoxOutlined, ScissorOutlined, HomeOutlined,
  SafetyCertificateOutlined, TrophyOutlined, TeamOutlined,
  SmileOutlined, RightOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PRIMARY      = "#f97316";
const PRIMARY_LIGHT = "#fff7ed";
const PRIMARY_DARK  = "#ea6c0a";

// ── Paw SVG ──────────────────────────────────────────────────────
const PawIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="6" cy="7" rx="2" ry="3" />
    <ellipse cx="18" cy="7" rx="2" ry="3" />
    <ellipse cx="3.5" cy="13" rx="1.5" ry="2.5" />
    <ellipse cx="20.5" cy="13" rx="1.5" ry="2.5" />
    <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
  </svg>
);

// ── Section wrapper ───────────────────────────────────────────────
function Section({ children, style = {}, className = "" }) {
  return (
    <section className={className} style={{ padding: "80px 0", ...style }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {children}
      </div>
    </section>
  );
}

// ── Section heading ───────────────────────────────────────────────
function SectionHead({ tag, title, sub, center = true }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 52 }}>
      {tag && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY_LIGHT, color: PRIMARY, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 14 }}>
          <PawIcon size={12} color={PRIMARY} /> {tag}
        </div>
      )}
      <Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#1c1c1c", margin: "0 0 14px", lineHeight: 1.2 }}>
        {title}
      </Title>
      {sub && (
        <Text style={{ color: "#6b7280", fontSize: 16, maxWidth: 560, display: "block", margin: center ? "0 auto" : "0", lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {sub}
        </Text>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", background: "#fff8f3", overflow: "hidden", minHeight: 600 }}>
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(249,115,22,.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: "30%", width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,.05)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px", position: "relative" }}>
        <Row gutter={[48, 40]} align="middle">
          {/* Text side */}
          <Col xs={24} lg={12}>
            <div style={{ animation: "fadeUp .7s ease both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: PRIMARY_LIGHT, color: PRIMARY, fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 20, marginBottom: 20 }}>
                <PawIcon size={14} color={PRIMARY} /> Phòng khám & Cửa hàng thú cưng số 1 TP.HCM
              </div>

              <Title style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px,5vw,58px)", fontWeight: 700, color: "#1c1c1c", lineHeight: 1.15, marginBottom: 20 }}>
                Chăm sóc thú cưng<br />
                <span style={{ color: PRIMARY }}>tận tâm & chuyên nghiệp</span>
              </Title>

              <Paragraph style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8, marginBottom: 32, fontFamily: "'Be Vietnam Pro', sans-serif", maxWidth: 480 }}>
                Đội ngũ bác sĩ thú y giàu kinh nghiệm, trang thiết bị hiện đại và dịch vụ chăm sóc toàn diện — tất cả vì sức khỏe của người bạn bốn chân.
              </Paragraph>

              <Space size={12} wrap>
                <Link to="/dat-lich-kham">
                  <Button type="primary" size="large" icon={<CalendarOutlined />}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, height: 52, paddingInline: 28, fontSize: 15, fontWeight: 600, boxShadow: "0 6px 20px rgba(249,115,22,.35)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    Đặt lịch khám ngay
                  </Button>
                </Link>
                <Link to="/san-pham">
                  <Button size="large" icon={<ShoppingOutlined />}
                    style={{ borderRadius: 12, height: 52, paddingInline: 28, fontSize: 15, fontWeight: 600, borderColor: "#e5e7eb", color: "#374151", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    Xem cửa hàng
                  </Button>
                </Link>
              </Space>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
                {[
                  { num: "5,000+", label: "Thú cưng đã khám" },
                  { num: "10+",    label: "Năm kinh nghiệm" },
                  { num: "4.9★",   label: "Đánh giá trung bình" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Image side */}
          <Col xs={24} lg={12} style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* main image placeholder */}
              <div style={{
                width: "min(460px, 100%)", height: 420, borderRadius: 32,
                background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 120, boxShadow: "0 24px 60px rgba(249,115,22,.20)",
                margin: "0 auto",
              }}>
                🐾
              </div>

              {/* Floating cards */}
              <div style={{ position: "absolute", top: 24, left: -20, background: "#fff", borderRadius: 16, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,.10)", animation: "float 3s ease-in-out infinite" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: PRIMARY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY, fontSize: 18 }}>🩺</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1c1c", fontFamily: "'Be Vietnam Pro', sans-serif" }}>Khám hôm nay</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Còn 3 suất trống</div>
                  </div>
                </div>
              </div>

              <div style={{ position: "absolute", bottom: 32, right: -16, background: "#fff", borderRadius: 16, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,.10)", animation: "float 3.5s ease-in-out infinite .5s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleFilled style={{ color: "#22c55e", fontSize: 22 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1c1c", fontFamily: "'Be Vietnam Pro', sans-serif" }}>Miễn phí tư vấn</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Gọi 1900 1234</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      `}</style>
    </section>
  );
}


const SERVICES = [
  { icon: "🩺", title: "Khám tổng quát",    desc: "Kiểm tra sức khỏe định kỳ, chẩn đoán bệnh bởi bác sĩ thú y chuyên nghiệp.",   color: "#fff7ed", accent: "#f97316" },
  { icon: "💉", title: "Tiêm phòng",         desc: "Lịch tiêm phòng đầy đủ, vaccine chính hãng, đảm bảo miễn dịch cho thú cưng.", color: "#f0fdf4", accent: "#22c55e" },
  { icon: "✂️", title: "Tắm & Grooming",    desc: "Dịch vụ tắm, cắt tỉa lông chuyên nghiệp với sản phẩm an toàn cho thú cưng.",  color: "#eff6ff", accent: "#3b82f6" },
  { icon: "🏠", title: "Lưu trú thú cưng",  desc: "Không gian thoải mái, vệ sinh sạch sẽ, camera giám sát 24/7 cho bạn an tâm.", color: "#fdf4ff", accent: "#a855f7" },
  { icon: "🔬", title: "Xét nghiệm",        desc: "Máy xét nghiệm hiện đại, trả kết quả nhanh, chẩn đoán chính xác tại chỗ.",    color: "#fff1f2", accent: "#f43f5e" },
  { icon: "🦷", title: "Chăm sóc răng",     desc: "Vệ sinh răng miệng, nhổ răng, điều trị nha chu cho chó và mèo.",               color: "#fefce8", accent: "#eab308" },
];

function Services() {
  return (
    <Section style={{ background: "#fff" }}>
      <SectionHead tag="Dịch vụ" title="Chăm sóc toàn diện cho thú cưng" sub="Từ khám chữa bệnh đến làm đẹp — chúng tôi cung cấp đầy đủ dịch vụ chăm sóc sức khỏe cho người bạn bốn chân của bạn." />

      <Row gutter={[24, 24]}>
        {SERVICES.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title}>
            <Card hoverable bordered={false}
              style={{ borderRadius: 20, height: "100%", transition: "all .25s", border: "1.5px solid #f3f4f6" }}
              styles={{ body: { padding: 28 } }}
              className="service-card"
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>
                {s.icon}
              </div>
              <Title level={5} style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, marginBottom: 8, color: "#1c1c1c" }}>{s.title}</Title>
              <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{s.desc}</Text>
              <div style={{ marginTop: 16 }}>
                <Link to="/dich-vu" style={{ color: s.accent, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Xem thêm <RightOutlined style={{ fontSize: 11 }} />
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.08) !important; border-color: ${PRIMARY} !important; }
      `}</style>
    </Section>
  );
}


function BookingBanner() {
  return (
    <section style={{ background: PRIMARY, padding: "64px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} lg={14}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.75)", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              <PawIcon size={12} color="rgba(255,255,255,.75)" /> Đặt lịch ngay hôm nay
            </div>
            <Title style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(26px,4vw,40px)", margin: "0 0 12px", lineHeight: 1.2 }}>
              Thú cưng của bạn xứng đáng được chăm sóc tốt nhất
            </Title>
            <Text style={{ color: "rgba(255,255,255,.85)", fontSize: 15, lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Đặt lịch trực tuyến dễ dàng, nhận xác nhận ngay qua SMS/Zalo. Hàng trăm lịch hẹn mỗi tuần, phục vụ tận tình.
            </Text>
            <div style={{ display: "flex", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
              {["Xác nhận qua Zalo/SMS", "Nhắc lịch tự động", "Đổi/hủy linh hoạt"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  <CheckCircleFilled style={{ color: "rgba(255,255,255,.8)" }} /> {f}
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} lg={10} style={{ textAlign: "center" }}>
            <Space direction="vertical" size={12} style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex" }}>
              <Link to="/dat-lich-kham" style={{ display: "block" }}>
                <Button size="large" block
                  style={{ background: "#fff", color: PRIMARY, border: "none", borderRadius: 12, height: 52, fontSize: 15, fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,.15)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  <CalendarOutlined /> Đặt lịch khám ngay
                </Button>
              </Link>
              <a href="tel:19001234" style={{ display: "block" }}>
                <Button size="large" block ghost
                  style={{ borderColor: "rgba(255,255,255,.5)", color: "#fff", borderRadius: 12, height: 52, fontSize: 15, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  📞 Gọi 1900 1234
                </Button>
              </a>
            </Space>
          </Col>
        </Row>
      </div>
    </section>
  );
}


const PRODUCTS = [
  { emoji: "🦴", name: "Thức ăn Royal Canin", category: "Chó", price: "285.000₫", oldPrice: "320.000₫", rating: 4.8, reviews: 142, badge: "Bán chạy" },
  { emoji: "🐟", name: "Pate Whiskas Cá Ngừ", category: "Mèo", price: "45.000₫",  oldPrice: null,        rating: 4.7, reviews: 98,  badge: "Mới" },
  { emoji: "🎾", name: "Bóng đồ chơi tương tác", category: "Phụ kiện", price: "125.000₫", oldPrice: "150.000₫", rating: 4.9, reviews: 67, badge: "Giảm 17%" },
  { emoji: "🛁", name: "Sữa tắm Pet Head",  category: "Grooming", price: "195.000₫", oldPrice: null,      rating: 4.6, reviews: 53,  badge: null },
];

function FeaturedProducts() {
  return (
    <Section style={{ background: "#fafafa" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
        <SectionHead tag="Cửa hàng" title={<>Sản phẩm<br /><span style={{ color: PRIMARY }}>nổi bật</span></>} center={false} />
        <Link to="/san-pham">
          <Button icon={<ArrowRightOutlined />} iconPosition="end"
            style={{ borderRadius: 10, borderColor: PRIMARY, color: PRIMARY, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Xem tất cả
          </Button>
        </Link>
      </div>

      <Row gutter={[20, 20]}>
        {PRODUCTS.map((p) => (
          <Col xs={12} sm={12} md={6} key={p.name}>
            <Card hoverable bordered={false}
              style={{ borderRadius: 18, border: "1.5px solid #f3f4f6", overflow: "hidden" }}
              styles={{ body: { padding: 16 } }}
              className="product-card"
              cover={
                <div style={{ height: 160, background: PRIMARY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
                  {p.emoji}
                  {p.badge && (
                    <Tag style={{ position: "absolute", top: 10, left: 10, background: PRIMARY, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 11, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      {p.badge}
                    </Tag>
                  )}
                </div>
              }
            >
              <Text style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Be Vietnam Pro', sans-serif", textTransform: "uppercase", letterSpacing: "0.8px" }}>{p.category}</Text>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1c1c", margin: "4px 0 8px", fontFamily: "'Be Vietnam Pro', sans-serif", lineHeight: 1.4 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                <StarFilled style={{ color: "#f59e0b", fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{p.rating} ({p.reviews})</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: PRIMARY, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{p.price}</span>
                  {p.oldPrice && <span style={{ fontSize: 12, color: "#d1d5db", textDecoration: "line-through", marginLeft: 6, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{p.oldPrice}</span>}
                </div>
                <Button type="primary" size="small" icon={<ShoppingOutlined />}
                  style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.09) !important; }
      `}</style>
    </Section>
  );
}


const WHY_US = [
  { icon: <SafetyCertificateOutlined style={{ fontSize: 28, color: PRIMARY }} />, title: "Bác sĩ có chứng chỉ", desc: "Đội ngũ bác sĩ thú y được đào tạo bài bản, có chứng chỉ hành nghề từ Bộ Nông nghiệp." },
  { icon: <MedicineBoxOutlined style={{ fontSize: 28, color: "#3b82f6" }} />,      title: "Thiết bị hiện đại",  desc: "Máy X-quang, siêu âm, xét nghiệm máu tại chỗ — chẩn đoán nhanh, chính xác." },
  { icon: <HomeOutlined style={{ fontSize: 28, color: "#22c55e" }} />,             title: "Không gian sạch sẽ", desc: "Khu vực khám, phẫu thuật và lưu trú được khử trùng tiêu chuẩn bệnh viện mỗi ngày." },
  { icon: <SmileOutlined style={{ fontSize: 28, color: "#a855f7" }} />,            title: "Dịch vụ 24/7",       desc: "Đường dây hỗ trợ khẩn cấp 24/7, luôn có bác sĩ trực sẵn sàng tư vấn qua điện thoại." },
];

function WhyUs() {
  return (
    <Section style={{ background: "#fff" }}>
      <Row gutter={[60, 40]} align="middle">
        <Col xs={24} lg={10}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY_LIGHT, color: PRIMARY, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 14 }}>
            <PawIcon size={12} color={PRIMARY} /> Tại sao chọn chúng tôi
          </div>
          <Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#1c1c1c", lineHeight: 1.2, margin: "0 0 20px" }}>
            Sức khỏe thú cưng là <span style={{ color: PRIMARY }}>ưu tiên hàng đầu</span>
          </Title>
          <Paragraph style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.8, fontFamily: "'Be Vietnam Pro', sans-serif", marginBottom: 28 }}>
            Hơn 10 năm kinh nghiệm chăm sóc thú cưng, chúng tôi hiểu rằng mỗi bé đều đặc biệt và cần được yêu thương theo cách riêng.
          </Paragraph>

          {/* Stats */}
          <Row gutter={[24, 24]}>
            {[
              { val: "5,000+", label: "Thú cưng đã khám" },
              { val: "98%",    label: "Khách hàng hài lòng" },
              { val: "15",     label: "Bác sĩ chuyên khoa" },
              { val: "10+",    label: "Năm kinh nghiệm" },
            ].map((s) => (
              <Col span={12} key={s.label}>
                <div style={{ background: "#fafafa", borderRadius: 16, padding: "16px 20px", border: "1.5px solid #f3f4f6" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            {WHY_US.map((w) => (
              <Col xs={24} sm={12} key={w.title}>
                <div style={{ background: "#fafafa", borderRadius: 20, padding: 24, border: "1.5px solid #f3f4f6", height: "100%", transition: "all .25s" }}
                  className="why-card">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}>
                    {w.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1c1c", marginBottom: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{w.title}</div>
                  <Text style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{w.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
          <style>{`.why-card:hover { background:#fff8f3 !important; border-color:${PRIMARY} !important; transform:translateY(-3px); box-shadow:0 8px 24px rgba(249,115,22,.10); }`}</style>
        </Col>
      </Row>
    </Section>
  );
}

const REVIEWS = [
  { name: "Chị Ngọc Anh", pet: "Chủ của Milo 🐶", avatar: "N", rating: 5, text: "Bác sĩ rất tận tình và chuyên nghiệp. Milo bị viêm da nặng nhưng chỉ sau 2 tuần điều trị đã khỏi hẳn. Phòng khám sạch sẽ, nhân viên thân thiện, mình rất yên tâm." },
  { name: "Anh Minh Tuấn", pet: "Chủ của Luna 🐱", avatar: "M", rating: 5, text: "Luna của mình được chẩn đoán rất nhanh và chính xác. Phòng mổ hiện đại, ca phẫu thuật thành công. Cảm ơn đội ngũ bác sĩ PawCare rất nhiều!" },
  { name: "Chị Thu Hương", pet: "Chủ của Bông 🐩", avatar: "T", rating: 5, text: "Dịch vụ grooming tuyệt vời! Bông được tắm và cắt tỉa đẹp lắm, mùi thơm, lông mềm mịn. Nhân viên rất nhẹ nhàng với bé, mình sẽ quay lại thường xuyên." },
];

function Testimonials() {
  return (
    <Section style={{ background: "#fff8f3" }}>
      <SectionHead tag="Đánh giá" title="Khách hàng nói gì về chúng tôi" sub="Hàng nghìn khách hàng tin tưởng PawCare để chăm sóc người bạn bốn chân của họ." />

      <Row gutter={[24, 24]}>
        {REVIEWS.map((r) => (
          <Col xs={24} md={8} key={r.name}>
            <Card bordered={false}
              style={{ borderRadius: 20, height: "100%", border: "1.5px solid #fde8d6" }}
              styles={{ body: { padding: 28 } }}>
              <Rate disabled defaultValue={r.rating} style={{ fontSize: 14, color: PRIMARY, marginBottom: 16 }} />
              <Paragraph style={{ color: "#374151", fontSize: 14.5, lineHeight: 1.8, fontFamily: "'Be Vietnam Pro', sans-serif", marginBottom: 20, fontStyle: "italic" }}>
                "{r.text}"
              </Paragraph>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar style={{ background: PRIMARY, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{r.avatar}</Avatar>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1c1c", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{r.pet}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Section>
  );
}


const BLOGS = [
  { emoji: "🥗", cat: "Dinh dưỡng", title: "Chế độ ăn lý tưởng cho chó theo từng giai đoạn", date: "12 Mar 2025", read: "5 phút" },
  { emoji: "💊", cat: "Sức khỏe",   title: "Những dấu hiệu nhận biết mèo bị bệnh cần gặp bác sĩ", date: "8 Mar 2025",  read: "4 phút" },
  { emoji: "🛁", cat: "Grooming",   title: "Hướng dẫn tắm chó tại nhà đúng cách và an toàn",   date: "3 Mar 2025",  read: "6 phút" },
];

function Blog() {
  return (
    <Section style={{ background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
        <SectionHead tag="Tin tức" title={<>Kiến thức<br /><span style={{ color: PRIMARY }}>chăm sóc thú cưng</span></>} center={false} />
        <Link to="/tin-tuc">
          <Button icon={<ArrowRightOutlined />} iconPosition="end"
            style={{ borderRadius: 10, borderColor: PRIMARY, color: PRIMARY, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Xem tất cả
          </Button>
        </Link>
      </div>

      <Row gutter={[24, 24]}>
        {BLOGS.map((b) => (
          <Col xs={24} md={8} key={b.title}>
            <Card hoverable bordered={false}
              style={{ borderRadius: 20, border: "1.5px solid #f3f4f6", overflow: "hidden" }}
              styles={{ body: { padding: 22 } }}
              className="blog-card"
              cover={
                <div style={{ height: 180, background: PRIMARY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
                  {b.emoji}
                </div>
              }
            >
              <Tag style={{ background: PRIMARY_LIGHT, color: PRIMARY, border: "none", borderRadius: 6, fontWeight: 600, fontSize: 11, marginBottom: 10, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{b.cat}</Tag>
              <Title level={5} style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: 15, color: "#1c1c1c", lineHeight: 1.5, margin: "0 0 12px" }}>{b.title}</Title>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{b.date} · {b.read} đọc</Text>
                <Link to="/tin-tuc" style={{ color: PRIMARY, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Đọc thêm <RightOutlined style={{ fontSize: 10 }} />
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`.blog-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,.08) !important; }`}</style>
    </Section>
  );
}
export default function Home() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro', sans-serif", borderRadius: 10 } }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
      `}</style>
      <div>
        <Hero />
        <Services />
        <BookingBanner />
        <FeaturedProducts />
        <WhyUs />
        <Testimonials />
        <Blog />
      </div>
    </ConfigProvider>
  );
}