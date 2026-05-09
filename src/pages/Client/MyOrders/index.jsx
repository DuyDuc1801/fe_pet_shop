import { useState, useEffect, useCallback } from "react";
import {
    Card, Tag, Button, Typography, Spin, Empty,
    ConfigProvider, message, Modal, Input, Pagination, Space, Divider, Badge, Avatar
} from "antd";
import {
    ShoppingOutlined, ClockCircleOutlined, CarOutlined,
    CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, 
    StarFilled, WarningOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi"; // Cập nhật lại đường dẫn cho đúng với dự án của bạn
import ReviewModal from "../../../components/common/ReviewModal"; // Cập nhật lại đường dẫn

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

const STATUS_CONFIG = {
    all:       { color: "default", label: "Tất cả",      icon: null },
    pending:   { color: "orange",  label: "Chờ xác nhận",  icon: <ClockCircleOutlined />, canCancel: true },
    confirmed: { color: "blue",    label: "Đã xác nhận",  icon: <CheckCircleOutlined />, canCancel: true },
    shipping:  { color: "purple",  label: "Đang giao",    icon: <CarOutlined />,         canCancel: false },
    delivered: { color: "green",   label: "Đã giao",      icon: <CheckCircleOutlined />, canCancel: false },
    cancelled: { color: "error",   label: "Đã hủy",       icon: <CloseCircleOutlined />, canCancel: false },
};

// ── Component con: Thẻ đơn hàng chuyên nghiệp ──────────────────
function OrderCard({ order, onCancel, onReview }) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const navigate = useNavigate();
    const canReview = order.status === 'delivered';

    return (
        <Card 
            bordered={false} 
            style={{ 
                borderRadius: 20, 
                marginBottom: 20, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                border: "1px solid #f1f5f9"
            }}
            bodyStyle={{ padding: "20px 24px" }}
        >
            {/* Header: Mã đơn & Trạng thái */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Space size={12}>
                    <div style={{ background: "#fff7ed", padding: "6px 12px", borderRadius: 10 }}>
                        <Text strong style={{ color: PRIMARY, fontSize: 13 }}>#{order._id.slice(-8).toUpperCase()}</Text>
                    </div>
                    <Divider type="vertical" />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY")}
                    </Text>
                </Space>
                <Tag color={cfg.color} icon={cfg.icon} style={{ borderRadius: 6, fontWeight: 700, padding: "4px 12px", border: "none" }}>
                    {cfg.label.toUpperCase()}
                </Tag>
            </div>

            {/* Content: Danh sách sản phẩm (ĐÃ FIX: Thêm nút đánh giá cho từng item) */}
            <div style={{ marginBottom: 20 }}>
                {order.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                        <Badge count={item.quantity} offset={[-2, 38]} color={PRIMARY}>
                            <Avatar 
                                src={item.image || "https://placehold.co/100x100/f3f4f6/9ca3af?text=🐾"} 
                                shape="square" size={64} 
                                style={{ borderRadius: 12, border: "1px solid #f1f5f9" }} 
                            />
                        </Badge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 4 }} ellipsis>{item.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>Đơn giá: {item.price.toLocaleString("vi-VN")}₫</Text>
                        </div>
                        
                        {/* Cột hiển thị Giá tổng + Nút đánh giá của MỖI SẢN PHẨM */}
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            <Text strong style={{ fontSize: 15 }}>{(item.price * item.quantity).toLocaleString("vi-VN")}₫</Text>
                            
                            {/* Nút đánh giá cho từng sản phẩm riêng biệt */}
                            {canReview && (
                                <Button 
                                    size="small"
                                    icon={<StarFilled />} 
                                    onClick={() => onReview(order, item)}
                                    style={{ borderRadius: 6, borderColor: "#f59e0b", color: "#f59e0b" }}
                                >
                                    Đánh giá
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: Tổng tiền & Nút bấm (ĐÃ FIX: Xóa nút đánh giá ở góc dưới) */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                background: "#f8fafc", 
                margin: "0 -24px -20px", 
                padding: "16px 24px", 
                borderRadius: "0 0 20px 20px" 
            }}>
                <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Tổng thanh toán: </Text>
                    <Text style={{ fontSize: 20, fontWeight: 900, color: PRIMARY }}>{order.grandTotal.toLocaleString("vi-VN")}₫</Text>
                </div>
                <Space size={10}>
                    {cfg.canCancel && (
                        <Button type="text" danger onClick={() => onCancel(order._id)} style={{ fontWeight: 600 }}>
                            Hủy đơn
                        </Button>
                    )}
                    
                    <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/don-hang-cua-toi/${order._id}`)}
                        style={{ background: DARK_NAVY, borderColor: DARK_NAVY, borderRadius: 10, fontWeight: 600, height: 40 }}
                    >
                        Chi tiết đơn
                    </Button>
                </Space>
            </div>
        </Card>
    );
}

// ── COMPONENT CHÍNH ───────────────────────────────────────────
export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [cancelId, setCancelId] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    
    // State quản lý Modal Đánh giá
    const [reviewOrder, setReviewOrder] = useState(null);
    const [reviewItem, setReviewItem] = useState(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    
    const [messageApi, ctxHolder] = message.useMessage();
    const navigate = useNavigate();

    const PAGE_SIZE = 5;

    const loadOrders = useCallback(async (pg, status) => {
        setLoading(true);
        const st = status === "all" ? "" : status;
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (st) params.append("status", st);
        
        const { res, data } = await fetchApi(`orders/my?${params}`, null, "GET");
        if (res.ok) { setOrders(data.orders); setTotal(data.total); }
        setLoading(false);
    }, []);

    useEffect(() => {
        const initFetch = async () => {
            await loadOrders(1, "all");
        };
        initFetch();
    }, [loadOrders]);

    const handleCancel = async () => {
        if (!cancelReason.trim()) return messageApi.warning("Vui lòng nhập lý do hủy");
        setCancelling(true);
        const { res, data } = await fetchApi(`orders/my/${cancelId}/cancel`, { reason: cancelReason }, "PUT");
        setCancelling(false);
        if (res.ok) {
            messageApi.success("Đã hủy đơn hàng thành công");
            setCancelId(""); setCancelReason("");
            loadOrders(page, statusFilter);
        } else messageApi.error(data.message || "Hủy thất bại");
    };

    // ĐÃ FIX: Nhận trực tiếp item được click thay vì hardcode phần tử đầu tiên
    const handleOpenReview = (order, item) => {
        setReviewOrder(order);
        setReviewItem(item);
        setReviewOpen(true);
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" } }}>
            {ctxHolder}
            
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 0" }}>
                <div style={{ marginBottom: 32 }}>
                    <Title level={2} style={{ fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>Đơn hàng của tôi</Title>
                    <Text type="secondary">Theo dõi trạng thái và quản lý lịch sử mua hàng của bạn</Text>
                </div>

                {/* Status Tabs */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "0 16px", marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <div className="custom-order-tabs" style={{ display: "flex", gap: "20px", padding: "10px 0", overflowX: "auto" }}>
                        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                            <div 
                                key={key}
                                onClick={() => { setStatusFilter(key); setPage(1); loadOrders(1, key); }}
                                style={{
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    fontWeight: statusFilter === key ? 700 : 500,
                                    color: statusFilter === key ? PRIMARY : "#64748b",
                                    borderBottom: statusFilter === key ? `3px solid ${PRIMARY}` : "3px solid transparent",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.3s"
                                }}
                            >
                                {val.label}
                            </div>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}><Spin size="large" tip="Đang tải danh sách..." /></div>
                ) : orders.length === 0 ? (
                    <Card bordered={false} style={{ borderRadius: 24, textAlign: "center", padding: "80px 0" }}>
                        <Empty 
                            image={<ShoppingOutlined style={{ fontSize: 80, color: "#e5e7eb" }} />}
                            description={
                                <Space direction="vertical" size={4}>
                                    <Text strong style={{ fontSize: 18, color: "#94a3b8" }}>Chưa có đơn hàng nào</Text>
                                    <Text type="secondary">Hãy khám phá các sản phẩm tuyệt vời của PooGi nhé!</Text>
                                    <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate("/san-pham")}
                                        style={{ marginTop: 16, borderRadius: 10, height: 44, background: PRIMARY, border: "none", fontWeight: 700 }}>
                                        MUA SẮM NGAY
                                    </Button>
                                </Space>
                            }
                        />
                    </Card>
                ) : (
                    <>
                        <div style={{ animation: "fadeUp 0.6s ease" }}>
                            {orders.map(o => <OrderCard key={o._id} order={o} onCancel={setCancelId} onReview={handleOpenReview} />)}
                        </div>
                        <div style={{ textAlign: "center", marginTop: 40 }}>
                            <Pagination 
                                current={page} 
                                pageSize={PAGE_SIZE} 
                                total={total}
                                onChange={p => { setPage(p); loadOrders(p, statusFilter); window.scrollTo(0,0); }}
                                showSizeChanger={false} 
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Modal hủy đơn */}
            <Modal
                title={<Space><WarningOutlined style={{ color: "#ef4444" }} /><span>Xác nhận hủy đơn</span></Space>}
                open={!!cancelId}
                onOk={handleCancel}
                onCancel={() => { setCancelId(""); setCancelReason(""); }}
                okText="Xác nhận hủy"
                okButtonProps={{ danger: true, loading: cancelling, style: { borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
                centered
            >
                <Paragraph>Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng cho PooGi biết lý do để chúng mình cải thiện nhé:</Paragraph>
                <Input.TextArea rows={4} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                    placeholder="Ví dụ: Tôi muốn đổi sản phẩm khác, địa chỉ nhận hàng sai..." style={{ borderRadius: 12 }} />
            </Modal>

            {/* Review Modal */}
            {reviewOrder && reviewItem && (
                <ReviewModal
                    type="product"
                    targetName={reviewItem.name}
                    targetImage={reviewItem.image}
                    orderId={reviewOrder._id}
                    productId={reviewItem.product} // ID của sản phẩm để lưu xuống database
                    open={reviewOpen}
                    onClose={() => { setReviewOpen(false); setReviewOrder(null); setReviewItem(null); }}
                    onSuccess={() => { loadOrders(page, statusFilter); }}
                />
            )}

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .custom-order-tabs::-webkit-scrollbar { display: none; }
            `}</style>
        </ConfigProvider>
    );
}