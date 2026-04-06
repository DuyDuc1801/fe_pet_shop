import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Select, DatePicker, Space, Card,
    Typography, Row, Col, Statistic, Tooltip, ConfigProvider,
    message, Drawer, Divider, Avatar,
} from "antd";
import {
    ReloadOutlined, EyeOutlined, CheckOutlined,
    CarOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ClockCircleOutlined, DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";

const STATUS_CONFIG = {
    pending:   { color: "orange", label: "Chờ xác nhận", icon: <ClockCircleOutlined />  },
    confirmed: { color: "blue",   label: "Đã xác nhận",  icon: <CheckCircleOutlined />  },
    shipping:  { color: "purple", label: "Đang giao",     icon: <CarOutlined />          },
    delivered: { color: "green",  label: "Đã giao",       icon: <CheckCircleOutlined />  },
    cancelled: { color: "red",    label: "Đã hủy",        icon: <CloseCircleOutlined />  },
};

const NEXT_STATUS = {
    pending:   "confirmed",
    confirmed: "shipping",
    shipping:  "delivered",
};

function OrderDrawer({ order, open, onClose, onUpdate }) {
    const [loading,    setLoading]    = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    const handleStatus = async (status) => {
        setLoading(true);
        const { res, data } = await fetchApi(`admin/orders/${order._id}/status`, { status }, "PUT");
        setLoading(false);
        if (res.ok) { messageApi.success("Cập nhật thành công!"); onUpdate(data.order); onClose(); }
        else messageApi.error(data.message || "Thất bại");
    };

    if (!order) return null;
    const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const nextSt = NEXT_STATUS[order.status];

    return (
        <Drawer title={<span style={{ fontWeight: 700 }}>Chi tiết đơn hàng #{order._id?.slice(-8).toUpperCase()}</span>}
            open={open} onClose={onClose} width={440}
            footer={
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    {ctxHolder}
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Đóng</Button>
                    {nextSt && (
                        <Button type="primary" loading={loading} onClick={() => handleStatus(nextSt)}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                            {nextSt === "confirmed" ? "✅ Xác nhận" : nextSt === "shipping" ? "🚚 Giao hàng" : "✅ Hoàn thành"}
                        </Button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button danger onClick={() => handleStatus("cancelled")} loading={loading} style={{ borderRadius: 8 }}>Hủy đơn</Button>
                    )}
                </Space>
            }>
            {ctxHolder}

            <Tag color={cfg.color} style={{ borderRadius: 8, fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
                {cfg.icon} {cfg.label}
            </Tag>

            {/* Thông tin giao hàng */}
            <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 8 }}>📦 Thông tin giao hàng</Text>
                {[
                    ["Người nhận", order.shippingInfo?.fullName],
                    ["Điện thoại", order.shippingInfo?.phone],
                    ["Địa chỉ",    order.shippingInfo?.address],
                    ["Tỉnh/TP",    order.shippingInfo?.city],
                    ["Ghi chú",    order.shippingInfo?.note || "—"],
                ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <Text style={{ color: "#9ca3af", fontSize: 12, width: 80, flexShrink: 0 }}>{k}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 600 }}>{v}</Text>
                    </div>
                ))}
            </div>

            {/* Sản phẩm */}
            <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 10 }}>🛒 Sản phẩm</Text>
            {order.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 12px", background: "#fafafa", borderRadius: 10 }}>
                    <img src={item.image || "https://placehold.co/40x40/FFB347/fff?text=🐾"} alt={item.name}
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>x{item.quantity} · {item.price?.toLocaleString("vi-VN")}₫</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: PRIMARY }}>{(item.price * item.quantity)?.toLocaleString("vi-VN")}₫</div>
                </div>
            ))}

            <Divider />

            {/* Tổng tiền */}
            {[
                ["Tạm tính", order.itemsTotal],
                ["Phí ship", order.shippingFee],
            ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: "#6b7280" }}>{k}</Text>
                    <Text style={{ fontWeight: 600 }}>{v === 0 ? "Miễn phí" : `${v?.toLocaleString("vi-VN")}₫`}</Text>
                </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</Text>
                <Text style={{ fontWeight: 800, fontSize: 18, color: PRIMARY }}>{order.grandTotal?.toLocaleString("vi-VN")}₫</Text>
            </div>

            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fafafa", borderRadius: 10 }}>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    💳 Thanh toán: <b>{order.paymentMethod === "cod" ? "Tiền mặt khi nhận hàng" : "Chuyển khoản"}</b>
                    {" · "}
                    <b style={{ color: order.paymentStatus === "paid" ? "#22c55e" : "#f59e0b" }}>
                        {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </b>
                </Text>
            </div>
        </Drawer>
    );
}

export default function AdminOrders() {
    const [orders,     setOrders]     = useState([]);
    const [stats,      setStats]      = useState({});
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [page,       setPage]       = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [drawerOrder,  setDrawerOrder]  = useState(null);
    const [drawerOpen,   setDrawerOpen]   = useState(false);

    const PAGE_SIZE = 10;

    const loadStats = useCallback(async () => {
        const { res, data } = await fetchApi("admin/orders/stats", null, "GET");
        if (res.ok) setStats(data);
    }, []);

    const loadOrders = useCallback(async (pg, status) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (status) params.append("status", status);
        const { res, data } = await fetchApi(`admin/orders?${params}`, null, "GET");
        if (res.ok) { setOrders(data.orders || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadStats(); await loadOrders(1, ""); })();
    }, [loadStats, loadOrders]);

    const handleUpdate = (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        loadStats();
    };

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "_id",
            render: id => <Text style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>#{id.slice(-8).toUpperCase()}</Text>,
        },
        {
            title: "Khách hàng",
            key: "customer",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={28} style={{ background: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                        {r.user?.fullName?.charAt(0)}
                    </Avatar>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.user?.fullName}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.user?.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Sản phẩm",
            key: "items",
            render: (_, r) => <Text style={{ fontSize: 13 }}>{r.items?.length} sản phẩm</Text>,
        },
        {
            title: "Tổng tiền",
            dataIndex: "grandTotal",
            render: v => <Text style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{v?.toLocaleString("vi-VN")}₫</Text>,
            sorter: (a, b) => a.grandTotal - b.grandTotal,
        },
        {
            title: "Thanh toán",
            dataIndex: "paymentMethod",
            render: (v, r) => (
                <div>
                    <div style={{ fontSize: 12 }}>{v === "cod" ? "💵 COD" : "🏦 Chuyển khoản"}</div>
                    <Tag color={r.paymentStatus === "paid" ? "green" : "orange"} style={{ borderRadius: 6, fontSize: 10, marginTop: 2 }}>
                        {r.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa TT"}
                    </Tag>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: s => {
                const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
                return <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 600 }}>{cfg.label}</Tag>;
            },
        },
        {
            title: "Ngày đặt",
            dataIndex: "createdAt",
            render: v => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs(v).format("DD/MM/YYYY")}</Text>,
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 80,
            render: (_, r) => (
                <Tooltip title="Xem chi tiết">
                    <Button size="small" icon={<EyeOutlined />}
                        onClick={() => { setDrawerOrder(r); setDrawerOpen(true); }}
                        style={{ borderRadius: 8 }} />
                </Tooltip>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>

            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>🛒 Quản lý đơn hàng</Title>
                <Text style={{ color: "#9ca3af" }}>Tổng {total} đơn hàng</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[
                    { label: "Doanh thu", val: `${((stats.revenue || 0) / 1000000).toFixed(1)}M₫`, color: PRIMARY,   bg: "#fff7ed", icon: <DollarOutlined /> },
                    { label: "Chờ xác nhận", val: stats.pending   || 0, color: "#f59e0b", bg: "#fffbeb", icon: <ClockCircleOutlined />  },
                    { label: "Đang giao",    val: stats.shipping  || 0, color: "#a855f7", bg: "#fdf4ff", icon: <CarOutlined />           },
                    { label: "Đã giao",      val: stats.delivered || 0, color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleOutlined />   },
                ].map(s => (
                    <Col xs={12} lg={6} key={s.label}>
                        <Card bordered={false} style={{ borderRadius: 14, border: "1.5px solid #f3f4f6" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Text style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>{s.label}</Text>
                                    <Text style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</Text>
                                </div>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filter */}
            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Select placeholder="Lọc trạng thái" value={statusFilter || undefined} allowClear
                            onChange={v => { setStatusFilter(v || ""); setPage(1); loadOrders(1, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setStatusFilter(""); setPage(1); loadOrders(1, ""); }} size="large" style={{ borderRadius: 10 }}>
                            Đặt lại
                        </Button>
                    </Col>
                    <Col style={{ marginLeft: "auto" }}>
                        <Button icon={<ReloadOutlined />} onClick={() => loadOrders(page, statusFilter)} size="large"
                            style={{ borderRadius: 10, borderColor: PRIMARY, color: PRIMARY }}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={orders} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); loadOrders(p, statusFilter); }, showTotal: t => `Tổng ${t} đơn hàng` }}
                    scroll={{ x: 900 }} />
            </Card>

            <OrderDrawer
                key={drawerOrder?._id}
                order={drawerOpen ? drawerOrder : null}
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setDrawerOrder(null); }}
                onUpdate={handleUpdate}
            />
        </ConfigProvider>
    );
}