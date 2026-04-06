import { useState } from "react";
import {
    Row, Col, Card, Button, Typography, InputNumber,
    Empty, Divider, Spin, ConfigProvider, message, Popconfirm, Tag,
    Badge,
} from "antd";
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../contexts/useCart";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";

function CartItem({ item, onUpdate, onRemove }) {
    const [qty, setQty] = useState(item.quantity);
    const [loading, setLoading] = useState(false);

    const product  = item.product;
    const hasSale  = product.salePrice && product.salePrice < product.price;
    const subTotal = item.price * item.quantity;

    const handleQtyChange = async (val) => {
        if (!val || val === item.quantity) return;
        setLoading(true);
        setQty(val);
        await onUpdate(product._id, val);
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
            {/* Ảnh */}
            <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#fafafa' }}>
                <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Be Vietnam Pro',sans-serif", marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                </div>
                <Tag color="orange" style={{ borderRadius: 6, fontSize: 11, marginBottom: 8 }}>{product.category}</Tag>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: PRIMARY, fontWeight: 700, fontSize: 14 }}>{item.price.toLocaleString('vi-VN')}₫</Text>
                    {hasSale && <Text style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: 12 }}>{product.price.toLocaleString('vi-VN')}₫</Text>}
                </div>
            </div>

            {/* Qty + Subtotal + Delete */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <InputNumber
                    min={1} max={product.stock} value={qty}
                    onChange={handleQtyChange}
                    disabled={loading}
                    size="small"
                    style={{ width: 80, borderRadius: 8 }}
                />
                <Text style={{ fontWeight: 800, color: '#1c1c1c', fontSize: 14 }}>{subTotal.toLocaleString('vi-VN')}₫</Text>
                <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => onRemove(product._id)} okText="Xóa" cancelText="Không"
                    okButtonProps={{ danger: true }}>
                    <Button type="text" icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
            </div>
        </div>
    );
}

export default function CartPage() {
    const { cart, loading, totalItems, totalPrice, updateItem, removeItem, clearCart } = useCart();
    const [messageApi, ctxHolder] = message.useMessage();
    const navigate = useNavigate();

    const SHIPPING_THRESHOLD = 500000;
    const shippingFee        = totalPrice >= SHIPPING_THRESHOLD ? 0 : 30000;
    const grandTotal         = totalPrice + shippingFee;

    const handleUpdate = async (productId, quantity) => {
        const { ok, message: msg } = await updateItem(productId, quantity);
        if (!ok) messageApi.error(msg || 'Cập nhật thất bại');
    };

    const handleRemove = async (productId) => {
        await removeItem(productId);
        messageApi.success('Đã xóa khỏi giỏ hàng');
    };

    const handleClear = async () => {
        await clearCart();
        messageApi.success('Đã xóa toàn bộ giỏ hàng');
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

    const items = cart?.items || [];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <ShoppingCartOutlined style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>Giỏ hàng trống</div>
                    <Text style={{ color: '#9ca3af' }}>Thêm sản phẩm từ cửa hàng nhé!</Text>
                    <br /><br />
                    <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/san-pham')}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, fontWeight: 600 }}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            ) : (
                <Row gutter={[24, 24]} justify='center' style={{margin: "32px 0"}}>
                    {/* Danh sách sản phẩm */}
                    <Col xs={24} lg={12}>
                        <Card bordered={false} style={{ borderRadius: 16, border: '1.5px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #f3f4f6', paddingBottom: 18 }}>
                                <Title level={3} style={{ margin: 0, fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 500 }}>
                                    Giỏ hàng {totalItems > 0 && <Badge count={totalItems} color={"orange"} size="small"><ShoppingCartOutlined style={{fontSize: "22px"}}/></Badge>}
                                </Title>
                                {items.length > 0 && (
                                    <Popconfirm title="Xóa toàn bộ giỏ hàng?" onConfirm={handleClear} okText="Xóa hết" cancelText="Không" okButtonProps={{ danger: true }}>
                                        <Button danger type="text" icon={<DeleteOutlined />}>Xóa tất cả</Button>
                                    </Popconfirm>
                                )}
                            </div>
                            {items.map(item => (
                                <CartItem key={item.product._id} item={item} onUpdate={handleUpdate} onRemove={handleRemove} />
                            ))}
                            <div style={{ marginTop: 16 }}>
                                <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/san-pham')}
                                    style={{ color: PRIMARY, paddingLeft: 0, fontWeight: 600 }}>
                                    Tiếp tục mua sắm
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    {/* Tóm tắt đơn hàng */}
                    <Col xs={24} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 16, border: '1.5px solid #f3f4f6', position: 'sticky', top: 80 }}>
                            <Title level={5} style={{ marginBottom: 16, fontFamily: "'Be Vietnam Pro',sans-serif" }}>Tóm tắt đơn hàng</Title>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ color: '#6b7280' }}>Tạm tính ({totalItems} sản phẩm)</Text>
                                <Text style={{ fontWeight: 600 }}>{totalPrice.toLocaleString('vi-VN')}₫</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ color: '#6b7280' }}>Phí vận chuyển</Text>
                                <Text style={{ fontWeight: 600, color: shippingFee === 0 ? '#22c55e' : '#1c1c1c' }}>
                                    {shippingFee === 0 ? 'Miễn phí 🎉' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                                </Text>
                            </div>

                            {totalPrice < SHIPPING_THRESHOLD && (
                                <div style={{ background: '#fff7ed', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                                    🚚 Mua thêm <b>{(SHIPPING_THRESHOLD - totalPrice).toLocaleString('vi-VN')}₫</b> để miễn phí ship!
                                </div>
                            )}

                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng</Text>
                                <Text style={{ fontWeight: 800, fontSize: 18, color: PRIMARY }}>{grandTotal.toLocaleString('vi-VN')}₫</Text>
                            </div>

                            <Button type="primary" size="large" block icon={<ArrowRightOutlined />}
                                onClick={() => navigate('/thanh-toan')}
                                style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, height: 48, fontWeight: 700, fontSize: 15 }}>
                                Tiến hành thanh toán
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}
        </ConfigProvider>
    );
}