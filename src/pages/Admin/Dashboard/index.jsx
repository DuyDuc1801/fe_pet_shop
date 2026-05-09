import { useState, useEffect, useCallback } from "react";
import {
    Card, Row, Col, Select, Typography, ConfigProvider,
    Spin, Statistic, Table, Tag, Avatar, Segmented,
} from "antd";
import {
    DollarOutlined, ShoppingCartOutlined, CalendarOutlined,
    UserOutlined, ArrowUpOutlined, ArrowDownOutlined,
    InboxOutlined, TrophyOutlined,
} from "@ant-design/icons";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const PRIMARY = "#f97316";

const PIE_COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#ef4444","#f59e0b","#06b6d4","#ec4899"];

const FMT = (v) => {
    if (v >= 1_000_000_000) return `${(v/1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000)     return `${(v/1_000_000).toFixed(1)}M`;
    if (v >= 1_000)         return `${(v/1_000).toFixed(0)}K`;
    return `${v}`;
};
const FMT_VND = (v) => `${v?.toLocaleString("vi-VN")}₫`;

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bg, icon, isMoney }) {
    return (
        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>{label}</Text>
                    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.2 }}>
                        {isMoney ? FMT(value) + "₫" : value?.toLocaleString("vi-VN")}
                    </div>
                    {sub && <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, display: "block" }}>{sub}</Text>}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color, flexShrink: 0 }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

// ── Custom Tooltip cho chart ──────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#374151" }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}: <b>{FMT_VND(p.value)}</b>
                </div>
            ))}
        </div>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const currentYear  = dayjs().year();
    //const currentMonth = dayjs().month() + 1;

    const [year,       setYear]       = useState(currentYear);
    const [month,      setMonth]      = useState(0); // 0 = cả năm
    const [chartType,  setChartType]  = useState("bar"); // bar | line
    const [overview,   setOverview]   = useState(null);
    const [chartData,  setChartData]  = useState([]);
    const [topProds,   setTopProds]   = useState([]);
    const [catRev,     setCatRev]     = useState([]);
    const [loading,    setLoading]    = useState(true);

    const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const loadAll = useCallback(async (m, y) => {
        setLoading(true);
        const params = `month=${m}&year=${y}`;
        const [r1, r2, r3, r4] = await Promise.all([
            fetchApi(`admin/stats/overview?${params}`,         null, "GET"),
            fetchApi(`admin/stats/revenue-chart?${params}`,    null, "GET"),
            fetchApi(`admin/stats/top-products?${params}&limit=8`, null, "GET"),
            fetchApi(`admin/stats/category-revenue?${params}`, null, "GET"),
        ]);
        if (r1.res.ok) setOverview(r1.data);
        if (r2.res.ok) setChartData(r2.data.chartData || []);
        if (r3.res.ok) setTopProds(r3.data.topProducts || []);
        if (r4.res.ok) setCatRev(r4.data.categoryRevenue || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadAll(month, year); })();
    }, [loadAll]);

    const handleFilter = (m, y) => {
        setMonth(m); setYear(y);
        loadAll(m, y);
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
    );

    const rev = overview?.revenue || {};
    const ord = overview?.orders  || {};
    const apt = overview?.appointments || {};
    const imp = overview?.imports  || {};

    const topProdColumns = [
        { title: "Sản phẩm", key: "name", render: (_, r) => (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {r.image
                    ? <img src={r.image} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                    : <Avatar size={32} style={{ background: "#f3f4f6", color: "#9ca3af" }}><InboxOutlined /></Avatar>
                }
                <Text style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</Text>
            </div>
        )},
        { title: "Đã bán", dataIndex: "quantity", render: v =>
            <Text style={{ fontSize: 13 }}>{v?.toLocaleString("vi-VN")}</Text> },
        { title: "Doanh thu", dataIndex: "revenue", render: v =>
            <Text style={{ fontWeight: 700, color: PRIMARY }}>{FMT(v)}₫</Text>,
            sorter: (a, b) => a.revenue - b.revenue, defaultSortOrder: "descend" },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>

            {/* Header + Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>📊 Dashboard</Title>
                    <Text style={{ color: "#9ca3af" }}>{overview?.period?.label}</Text>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Chọn tháng */}
                    <Select value={month} onChange={v => handleFilter(v, year)}
                        style={{ width: 130 }} size="large">
                        <Option value={0}>Cả năm</Option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <Option key={m} value={m}>Tháng {m}</Option>
                        ))}
                    </Select>
                    {/* Chọn năm */}
                    <Select value={year} onChange={v => handleFilter(month, v)}
                        style={{ width: 100 }} size="large">
                        {YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
                    </Select>
                </div>
            </div>

            {/* ── Row 1: Doanh thu chính ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard label="Tổng doanh thu" value={rev.total} color={PRIMARY} bg="#fff7ed" icon={<DollarOutlined />} isMoney />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard label="Lợi nhuận gộp" value={rev.grossProfit}
                        sub={`Chi nhập: ${FMT(rev.importCost)}₫`}
                        color={rev.grossProfit >= 0 ? "#22c55e" : "#ef4444"} bg="#f0fdf4" icon={<ArrowUpOutlined />} isMoney />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard label="Từ đơn hàng" value={rev.fromOrders}
                        sub={`${ord.delivered} đơn giao thành công`}
                        color="#3b82f6" bg="#eff6ff" icon={<ShoppingCartOutlined />} isMoney />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard label="Từ đặt cọc khám" value={rev.fromDeposits}
                        sub={`${apt.completed} ca khám hoàn thành`}
                        color="#a855f7" bg="#fdf4ff" icon={<CalendarOutlined />} isMoney />
                </Col>
            </Row>

            {/* ── Row 2: Thống kê phụ ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Tổng đơn hàng" value={ord.total} color="#374151" bg="#f9fafb" icon={<ShoppingCartOutlined />} />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Đang giao" value={ord.shipping} color="#a855f7" bg="#fdf4ff" icon={<ShoppingCartOutlined />} />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Tổng lịch hẹn" value={apt.total} color="#374151" bg="#f9fafb" icon={<CalendarOutlined />} />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Đã check-in" value={apt.checkedIn} color="#06b6d4" bg="#ecfeff" icon={<CalendarOutlined />} />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Chi nhập hàng" value={imp.paidAmount} color="#ef4444" bg="#fff1f2" icon={<InboxOutlined />} isMoney />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <StatCard label="Người dùng mới" value={overview?.newUsers} color="#f59e0b" bg="#fffbeb" icon={<UserOutlined />} />
                </Col>
            </Row>

            {/* ── Biểu đồ doanh thu ── */}
            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>📈 Biểu đồ doanh thu</Title>
                        <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                            {month ? `Theo ngày — Tháng ${month}/${year}` : `Theo tháng — Năm ${year}`}
                        </Text>
                    </div>
                    <Segmented value={chartType} onChange={setChartType}
                        options={[{ label: "Cột", value: "bar" }, { label: "Đường", value: "line" }]} />
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    {chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <YAxis tickFormatter={FMT} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="orderRev"   name="Đơn hàng"    fill="#3b82f6" radius={[4,4,0,0]} />
                            <Bar dataKey="depositRev" name="Đặt cọc"     fill={PRIMARY}  radius={[4,4,0,0]} />
                            <Bar dataKey="importCost" name="Chi nhập hàng" fill="#ef4444" radius={[4,4,0,0]} />
                        </BarChart>
                    ) : (
                        <LineChart data={chartData} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <YAxis tickFormatter={FMT} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="revenue"    name="Tổng doanh thu" stroke={PRIMARY} strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="importCost" name="Chi nhập hàng"  stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="profit"     name="Lợi nhuận"      stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </Card>

            {/* ── Row: Top sản phẩm + Pie danh mục ── */}
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={14}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                        <Title level={5} style={{ margin: "0 0 16px" }}>🏆 Top sản phẩm bán chạy</Title>
                        <Table dataSource={topProds} columns={topProdColumns} rowKey="_id"
                            pagination={false} size="small"
                            locale={{ emptyText: "Chưa có dữ liệu" }}
                            rowClassName={(_, i) => i === 0 ? "row-gold" : ""}
                        />
                        <style>{`.row-gold td { background: #fffbeb !important; }`}</style>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", height: "100%" }}>
                        <Title level={5} style={{ margin: "0 0 16px" }}>🍩 Doanh thu theo danh mục</Title>
                        {catRev.length === 0 ? (
                            <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Chưa có dữ liệu</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={catRev} dataKey="revenue" nameKey="_id"
                                            cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                            paddingAngle={3}>
                                            {catRev.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={v => FMT_VND(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                    {catRev.map((c, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                            <span style={{ color: "#6b7280" }}>{c._id}</span>
                                            <span style={{ fontWeight: 700, color: "#374151" }}>{FMT(c.revenue)}₫</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* ── Summary đơn hàng + lịch hẹn ── */}
            <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                        <Title level={5} style={{ margin: "0 0 14px" }}>🛒 Trạng thái đơn hàng</Title>
                        {[
                            ["Chờ xác nhận", ord.pending,   "orange"],
                            ["Đã xác nhận",  ord.confirmed, "blue"  ],
                            ["Đang giao",    ord.shipping,  "purple"],
                            ["Đã giao",      ord.delivered, "green" ],
                            ["Đã hủy",       ord.cancelled, "red"   ],
                        ].map(([label, val, color]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
                                <Tag color={color} style={{ borderRadius: 6 }}>{label}</Tag>
                                <Text style={{ fontWeight: 700, fontSize: 14 }}>{val?.toLocaleString("vi-VN")}</Text>
                            </div>
                        ))}
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                        <Title level={5} style={{ margin: "0 0 14px" }}>📅 Trạng thái lịch hẹn</Title>
                        {[
                            ["Chờ xác nhận", apt.pending,    "orange"],
                            ["Đã xác nhận",  apt.confirmed,  "blue"  ],
                            ["Đã check-in",  apt.checkedIn,  "cyan"  ],
                            ["Đang khám",    apt.inProgress, "purple"],
                            ["Hoàn thành",   apt.completed,  "green" ],
                            ["Đã hủy",       apt.cancelled,  "red"   ],
                        ].map(([label, val, color]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
                                <Tag color={color} style={{ borderRadius: 6 }}>{label}</Tag>
                                <Text style={{ fontWeight: 700, fontSize: 14 }}>{val?.toLocaleString("vi-VN")}</Text>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

        </ConfigProvider>
    );
}