import { useState, useEffect, useCallback } from "react";
import {
    Row, Col, Card, Typography, Table, Tag, Spin,
    ConfigProvider, Avatar,
} from "antd";
import {
    ShoppingCartOutlined, CalendarOutlined, DollarOutlined,
    UserOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from "@ant-design/icons";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
            <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6 }}>{label}</Text>
            {payload.map(p => (
                <div key={p.name} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
                    {p.name}: <b>{typeof p.value === "number" && p.value > 100000
                        ? `${(p.value / 1000000).toFixed(1)}M₫`
                        : p.value}</b>
                </div>
            ))}
        </div>
    );
}

function StatCard({ title, value, color, bg, icon, growth }) {
    const isUp = growth >= 0;
    return (
        <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>
                        {title}
                    </Text>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1c1c1c", fontFamily: "'Be Vietnam Pro',sans-serif" }}>
                        {typeof value === "number" && value > 100000
                            ? `${(value / 1000000).toFixed(1)}M₫`
                            : value?.toLocaleString("vi-VN")}
                    </div>
                    {growth !== undefined && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                            {isUp ? <ArrowUpOutlined style={{ color: "#22c55e", fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: "#ef4444", fontSize: 12 }} />}
                            <Text style={{ fontSize: 12, color: isUp ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                                {Math.abs(growth)}% so với tháng trước
                            </Text>
                        </div>
                    )}
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color, flexShrink: 0 }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

export default function AdminDashboard() {
    const [overview,    setOverview]    = useState(null);
    const [chartData,   setChartData]   = useState([]);
    const [catData,     setCatData]     = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders,setRecentOrders]= useState([]);
    const [loading,     setLoading]     = useState(true);

    const CAT_COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#f59e0b","#ef4444"];

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [ov, chart, cat, top, orders] = await Promise.all([
            fetchApi("admin/stats/overview",         null, "GET"),
            fetchApi("admin/stats/revenue-chart?months=12", null, "GET"),
            fetchApi("admin/stats/category-revenue", null, "GET"),
            fetchApi("admin/stats/top-products",     null, "GET"),
            fetchApi("admin/orders?limit=5",         null, "GET"),
        ]);
        if (ov.res.ok)     setOverview(ov.data);
        if (chart.res.ok)  setChartData(chart.data.data || []);
        if (cat.res.ok)    setCatData(cat.data.data || []);
        if (top.res.ok)    setTopProducts(top.data.products || []);
        if (orders.res.ok) setRecentOrders(orders.data.orders || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadAll(); })();
    }, [loadAll]);

    const ORDER_STATUS = {
        pending:   { color: "orange", label: "Chờ xác nhận" },
        confirmed: { color: "blue",   label: "Đã xác nhận"  },
        shipping:  { color: "purple", label: "Đang giao"     },
        delivered: { color: "green",  label: "Đã giao"       },
        cancelled: { color: "red",    label: "Đã hủy"        },
    };

    const orderColumns = [
        { title: "Mã đơn", dataIndex: "_id", render: id => <Text style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>#{id.slice(-8).toUpperCase()}</Text> },
        {
            title: "Khách hàng", key: "customer",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={28} style={{ background: PRIMARY, fontSize: 12, fontWeight: 700 }}>{r.user?.fullName?.charAt(0)}</Avatar>
                    <Text style={{ fontSize: 13 }}>{r.user?.fullName}</Text>
                </div>
            ),
        },
        { title: "Tổng tiền", dataIndex: "grandTotal", render: v => <Text style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{v?.toLocaleString("vi-VN")}₫</Text> },
        { title: "Trạng thái", dataIndex: "status", render: s => { const cfg = ORDER_STATUS[s]; return <Tag color={cfg?.color} style={{ borderRadius: 6, fontWeight: 600 }}>{cfg?.label}</Tag>; } },
        { title: "Ngày đặt", dataIndex: "createdAt", render: v => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs(v).format("DD/MM/YYYY")}</Text> },
    ];

    if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;

    const ov = overview?.thisMonth || {};
    const gr = overview?.growth    || {};

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            <div style={{ marginBottom: 28 }}>
                <Title level={3} style={{ margin: 0 }}>📊 Dashboard tổng quan</Title>
                <Text style={{ color: "#9ca3af" }}>
                    Cập nhật lúc {dayjs().format("HH:mm · DD/MM/YYYY")} · Hôm nay: {overview?.today?.orders || 0} đơn · {overview?.today?.appointments || 0} lịch hẹn
                </Text>
            </div>

            {/* Stat cards — dữ liệu thực */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} lg={6}><StatCard title="Doanh thu tháng" value={ov.revenue}      color="#f97316" bg="#fff7ed" icon={<DollarOutlined />}       growth={gr.revenue}      /></Col>
                <Col xs={12} lg={6}><StatCard title="Đơn hàng"        value={ov.orders}       color="#3b82f6" bg="#eff6ff" icon={<ShoppingCartOutlined />}  growth={gr.orders}       /></Col>
                <Col xs={12} lg={6}><StatCard title="Lịch hẹn"        value={ov.appointments} color="#22c55e" bg="#f0fdf4" icon={<CalendarOutlined />}      growth={gr.appointments} /></Col>
                <Col xs={12} lg={6}><StatCard title="Khách hàng mới"  value={ov.newUsers}     color="#a855f7" bg="#fdf4ff" icon={<UserOutlined />}          growth={gr.newUsers}     /></Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Area chart doanh thu thực */}
                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6" }}>
                        <Title level={5} style={{ margin: "0 0 20px" }}>Doanh thu 12 tháng gần nhất</Title>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.18} />
                                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0}    />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={PRIMARY} strokeWidth={2.5} fill="url(#gr1)" dot={false} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Pie chart danh mục thực */}
                <Col xs={24} lg={8}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6", height: "100%" }}>
                        <Title level={5} style={{ margin: "0 0 4px" }}>Doanh thu theo danh mục</Title>
                        <Text style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 12 }}>Từ đơn hàng đã giao</Text>
                        {catData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>Chưa có dữ liệu</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="revenue">
                                            {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => [`${(v/1000000).toFixed(1)}M₫`]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                                    {catData.slice(0,5).map((c, i) => (
                                        <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[i % CAT_COLORS.length] }} />
                                                <Text style={{ fontSize: 12, color: "#6b7280" }}>{c._id || "Khác"}</Text>
                                            </div>
                                            <Text style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[i % CAT_COLORS.length] }}>{(c.revenue/1000000).toFixed(1)}M₫</Text>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bar chart + top products */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={14}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6" }}>
                        <Title level={5} style={{ margin: "0 0 20px" }}>Đơn hàng & Lịch hẹn theo tháng</Title>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} barSize={10}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="orders"       name="Đơn hàng"  fill="#3b82f6" radius={[4,4,0,0]} />
                                <Bar dataKey="appointments" name="Lịch hẹn"  fill={PRIMARY} radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Top products thực */}
                <Col xs={24} lg={10}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6", height: "100%" }}>
                        <Title level={5} style={{ margin: "0 0 16px" }}>🏆 Sản phẩm bán chạy</Title>
                        {topProducts.map((p, i) => (
                            <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : "#cd7f32", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <img src={p.images?.[0] || "https://placehold.co/36x36/FFB347/fff?text=🐾"}
                                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt={p.name} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Đã bán: {p.sold}</div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 12, color: PRIMARY, flexShrink: 0 }}>
                                    {(p.salePrice || p.price)?.toLocaleString("vi-VN")}₫
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0" }}>Chưa có dữ liệu</div>}
                    </Card>
                </Col>
            </Row>

            {/* Recent orders */}
            <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Title level={5} style={{ margin: 0 }}>Đơn hàng gần đây</Title>
                    <a href="/admin/orders" style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>Xem tất cả →</a>
                </div>
                <Table dataSource={recentOrders} columns={orderColumns} rowKey="_id" pagination={false} size="small"
                    locale={{ emptyText: "Chưa có đơn hàng" }} />
            </Card>
        </ConfigProvider>
    );
}