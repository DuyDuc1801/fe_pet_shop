import {Layout,Space,Row,Col,Typography,Divider} from "antd";
import {PhoneOutlined,MailOutlined,
    EnvironmentOutlined,FacebookOutlined,YoutubeOutlined,InstagramOutlined} from "@ant-design/icons";

const {Footer: AntFooter} = Layout;
const { Text } = Typography;

function Footer() {
  const PRIMARY = "#f97316";
  const DARK_BG = "#1a1a1a";
  const linkCols = [
    {
      title: "Dịch vụ",
      links: ["Khám tổng quát", "Tiêm phòng", "Phẫu thuật", "Tắm & Grooming", "Lưu trú thú cưng", "Xét nghiệm"],
    },
    {
      title: "Cửa hàng",
      links: ["Thức ăn chó", "Thức ăn mèo", "Phụ kiện", "Đồ chơi", "Thuốc & Vitamin", "Chuồng & Lồng"],
    },
  ];

  const contacts = [
    { icon: <EnvironmentOutlined />, label: "Địa chỉ",  value: "1 Cẩm Phương, xã Suối Hai, TP.Hà Nội" },
    { icon: <PhoneOutlined />, label: "Hotline",  value: "1900 1234  ·  0901 234 567" },
    { icon: <MailOutlined />, label: "Email",    value: "hello@poogi.vn" },
  ];

  const ColTitle = ({ children }) => (
    <Text style={{ display: "block", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: 18, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {children}
    </Text>
  );

  return (
    <AntFooter style={{ background: DARK_BG, padding: 0 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
        <Row gutter={[48, 40]}>
          {/* Brand */}
          <Col xs={24} md={8}>
            <Text style={{ display: "block", color: "#9ca3af", fontSize: 13.5, lineHeight: 1.8, margin: "16px 0 20px", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Chăm sóc sức khỏe toàn diện cho thú cưng — từ khám chữa bệnh,
              grooming đến thực phẩm và phụ kiện chất lượng cao.
            </Text>
            <Space>
              {[
                { icon: <FacebookOutlined />,  href: "#" },
                { icon: <InstagramOutlined />, href: "#" },
                { icon: <YoutubeOutlined />,   href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  style={{ width: 36, height: 36, borderRadius: 8, background: "#2d2d2d", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 16, transition: "all .2s", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.color = "#9ca3af"; }}
                >
                  {s.icon}
                </a>
              ))}
            </Space>
          </Col>

          {/* Link cols */}
          {linkCols.map((col) => (
            <Col xs={12} md={4} key={col.title}>
              <ColTitle>{col.title}</ColTitle>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {col.links.map((link) => (
                  <a key={link} href="#" className="paw-foot-link">
                    {link}
                  </a>
                ))}
              </Space>
            </Col>
          ))}

          {/* Contact */}
          <Col xs={24} md={8}>
            <Text style={{ display: "block", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase",  marginBottom: 18, fontFamily: "'Be Vietnam Pro', sans-serif" 
            }}> Liên hệ </Text>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              {contacts.map((c) => (
                <div key={c.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(249,115,22,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY, fontSize: 15, flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <Text style={{ display: "block", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{c.label}</Text>
                    <Text style={{ color: "#9ca3af", fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{c.value}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </Col>
        </Row>
      </div>

      <Divider style={{ borderColor: "#2d2d2d", margin: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Text style={{ color: "#6b7280", fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          © 2026 <span style={{ color: PRIMARY, fontWeight: 600 }}>PooGi</span>. Tất cả quyền được bảo lưu.
        </Text>
        <Space split={<Divider type="vertical" style={{ borderColor: "#333" }} />}>
          {["Chính sách bảo mật", "Điều khoản dịch vụ", "Sơ đồ trang"].map((t) => (
            <a key={t} href="#"
              style={{ color: "#6b7280", fontSize: 13, textDecoration: "none", fontFamily: "'Be Vietnam Pro', sans-serif", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              {t}
            </a>
          ))}
        </Space>
      </div>
    </AntFooter>
  );
}

export default Footer;