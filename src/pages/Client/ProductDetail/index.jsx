import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Button, Tag, Typography, Spin,
    InputNumber, ConfigProvider, message, Breadcrumb,
    Tabs, Rate, Avatar, Divider, Space, Tooltip,
    Card, Empty
} from "antd";
import {
    ShoppingCartOutlined, CheckOutlined,
    SafetyCertificateOutlined, CarOutlined, ReloadOutlined,
    HeartOutlined, ArrowLeftOutlined,
    HeartFilled, FireOutlined
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";
import { useCart } from "../../../../contexts/useCart";
import { useAuth } from "../../../../contexts/useAuth";

const { Title, Text, Paragraph } = Typography;
const PRIMARY = "#f97316";
const DARK_NAVY = "#0f172a";

// ── Component: Review Item (Hiển thị từng đánh giá) ─────────────
function ReviewItem({ review }) {
    return (
        <div style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: 16 }}>
                <Avatar 
                    src={review.user?.avatar} 
                    style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}
                >
                    {review.user?.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text strong>{review.user?.fullName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </div>
                    <Rate disabled value={review.rating} style={{ fontSize: 12, color: '#f59e0b', display: 'block', marginBottom: 8 }} />
                    <Paragraph style={{ color: '#475569', margin: 0 }}>{review.comment}</Paragraph>
                </div>
            </div>
        </div>
    );
}

// ── Component: Gallery Hình Ảnh ────────────────────────────────
function ImageGallery({ images, name }) {
    const [active, setActive] = useState(0);
    const imgs = images?.length > 0 ? images : ['https://placehold.co/600x600/FFB347/fff?text=🐾'];
    
    return (
        <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ 
                borderRadius: 24, overflow: 'hidden', background: '#fff', 
                aspectRatio: '1', border: '1px solid #f1f5f9', marginBottom: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
                <img src={imgs[active]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }}>
                {imgs.map((img, i) => (
                    <div key={i} onClick={() => setActive(i)}
                        style={{ 
                            minWidth: 70, height: 70, borderRadius: 12, overflow: 'hidden', 
                            cursor: 'pointer', border: `2px solid ${active === i ? PRIMARY : 'transparent'}`,
                            boxShadow: active === i ? `0 0 0 2px ${PRIMARY}30` : 'none',
                            transition: 'all 0.2s'
                        }}>
                        <img src={img} alt={`${name} ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── COMPONENT CHÍNH ─────────────────────────────────────────────
export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    // Review states
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // 1. Fetch thông tin sản phẩm
    useEffect(() => {
        (async () => {
            setLoading(true);
            const { res, data } = await fetchApi(`products/${id}`, null, 'GET');
            if (res.ok) setProduct(data.product);
            else navigate('/san-pham');
            setLoading(false);
        })();
    }, [id, navigate]);

    // 2. Fetch danh sách đánh giá từ API
    useEffect(() => {
        if (product?._id) {
            (async () => {
                setLoadingReviews(true);
                const { res, data } = await fetchApi(`reviews/product/${id}`, null, 'GET');
                if (res.ok) setReviews(data.reviews || []);
                setLoadingReviews(false);
            })();
        }
    }, [product?._id, id]);

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        setAdding(true);
        const { ok, message: msg } = await addToCart(product._id, quantity);
        setAdding(false);
        if (ok) {
            setAdded(true);
            messageApi.success('🛒 Đã thêm vào giỏ hàng!');
            setTimeout(() => setAdded(false), 2500);
        } else messageApi.error(msg || 'Thêm thất bại');
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '150px 0' }}><Spin size="large" /></div>;
    if (!product) return null;

    const hasSale = product.salePrice && product.salePrice < product.price;
    const finalPrice = hasSale ? product.salePrice : product.price;
    const discount = hasSale ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    const inStock = product.stock > 0;

    const tabItems = [
        {
            key: 'desc',
            label: <span style={{ padding: '0 20px' }}>Chi tiết & Thông số</span>,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <Title level={5} style={{ marginBottom: 16 }}>📋 Mô tả chi tiết</Title>
                    <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', marginBottom: 32 }}>
                        {product.description || "Sản phẩm cao cấp được phân phối chính hãng bởi PooGi Clinic."}
                    </Paragraph>

                    <div style={{ background: '#f8fafc', borderRadius: 20, padding: '24px', border: '1px solid #f1f5f9' }}>
                        <Title level={5} style={{ marginBottom: 20, fontSize: 16 }}>🛠️ Thông số kỹ thuật</Title>
                        {[
                            { label: 'Danh mục',      value: product.category },
                            { label: 'Loại thú cưng',  value: product.petType },
                            { label: 'Tình trạng',    value: product.stock > 0 ? 'Còn hàng' : 'Hết hàng' },
                            { label: 'Số lượng kho',   value: `${product.stock} sản phẩm` },
                            { label: 'Đã bán',        value: `${product.sold || 0} sản phẩm` },
                            { label: 'Mã sản phẩm',    value: product._id?.toUpperCase().slice(-8) },
                        ].map((item, index) => (
                            <div key={index} style={{ display: 'flex', padding: '12px 0', borderBottom: index === 5 ? 'none' : '1px solid #e2e8f0' }}>
                                <Text style={{ width: 160, color: '#94a3b8', fontSize: 14 }}>{item.label}</Text>
                                <Text strong style={{ color: '#334155', fontSize: 14 }}>{item.value}</Text>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            key: 'reviews',
            label: <span style={{ padding: '0 20px' }}>Đánh giá ({product.reviewCount || 0})</span>,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <Row gutter={[40, 40]}>
                        <Col xs={24} md={8}>
                            <div style={{ textAlign: 'center', padding: '32px', background: '#fff7ed', borderRadius: 24, border: `1px solid ${PRIMARY}20` }}>
                                <Title level={2} style={{ margin: 0, color: PRIMARY, fontSize: 48 }}>{product.rating?.toFixed(1)}</Title>
                                <Rate disabled allowHalf value={product.rating} style={{ color: '#f59e0b', margin: '12px 0' }} />
                                <div style={{ color: '#94a3b8', fontWeight: 500 }}>Dựa trên {product.reviewCount || 0} đánh giá</div>
                            </div>
                        </Col>
                        <Col xs={24} md={16}>
                            {loadingReviews ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}><Spin tip="Đang tải đánh giá..." /></div>
                            ) : reviews.length > 0 ? (
                                reviews.map((r) => <ReviewItem key={r._id} review={r} />)
                            ) : (
                                <Empty description="Chưa có đánh giá nào cho sản phẩm này" style={{ padding: '40px 0' }} />
                            )}
                        </Col>
                    </Row>
                </div>
            )
        }
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif" } }}>
            {ctxHolder}
            <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
                
                <div style={{ padding: '20px 40px', background: '#fff', borderBottom: '1px solid #f1f5f9', marginBottom: 32 }}>
                    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
                        <Breadcrumb items={[
                            { title: <a href="/">Trang chủ</a> },
                            { title: <a href="/san-pham">Cửa hàng</a> },
                            { title: <span style={{ fontWeight: 600, color: PRIMARY }}>{product.name}</span> },
                        ]} />
                    </div>
                </div>

                <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={10} lg={9}>
                            <ImageGallery images={product.images} name={product.name} />
                        </Col>

                        <Col xs={24} md={14} lg={15}>
                            <div style={{ background: '#fff', padding: 32, borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <Space size={8} style={{ marginBottom: 16 }}>
                                    <Tag color="orange" style={{ borderRadius: 6, fontWeight: 700, border: 'none' }}>{product.category?.toUpperCase()}</Tag>
                                    <Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>Dành cho {product.petType}</Tag>
                                    {hasSale && <Tag color="red" style={{ borderRadius: 6, border: 'none' }}><FireOutlined /> HOT SALE</Tag>}
                                </Space>

                                <Title level={1} style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: DARK_NAVY }}>
                                    {product.name}
                                </Title>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                    <Space size={4}>
                                        <Rate disabled value={product.rating} allowHalf style={{ fontSize: 14, color: '#f59e0b' }} />
                                        <Text strong style={{ color: '#f59e0b', fontSize: 16 }}>{product.rating?.toFixed(1)}</Text>
                                    </Space>
                                    <Divider type="vertical" />
                                    <Text type="secondary">{product.reviewCount || 0} Đánh giá</Text>
                                    <Divider type="vertical" />
                                    <Text type="secondary">Đã bán {product.sold || 0}</Text>
                                </div>

                                <div style={{ background: '#fff7ed', borderRadius: 24, padding: '24px 32px', marginBottom: 32, border: `1px solid ${PRIMARY}20` }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                                        <Text style={{ fontSize: 40, fontWeight: 900, color: PRIMARY }}>{finalPrice.toLocaleString('vi-VN')}₫</Text>
                                        {hasSale && (
                                            <>
                                                <Text delete style={{ fontSize: 20, color: '#94a3b8' }}>{product.price.toLocaleString('vi-VN')}₫</Text>
                                                <Tag color="red" style={{ borderRadius: 8, fontWeight: 800 }}>GIẢM {discount}%</Tag>
                                            </>
                                        )}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>* Giá đã bao gồm thuế VAT và bảo hành PooGi</Text>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                                    {[
                                        { icon: <CarOutlined />, title: 'Vận chuyển nhanh', desc: 'Miễn phí đơn từ 500k' },
                                        { icon: <ReloadOutlined />, title: 'Đổi trả 7 ngày', desc: 'Hỗ trợ đổi size/mẫu' },
                                        { icon: <SafetyCertificateOutlined />, title: 'Chính hãng', desc: 'Phát hiện giả đền x2' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ fontSize: 24, color: PRIMARY }}>{item.icon}</div>
                                            <div><Text strong style={{ display: 'block', fontSize: 13 }}>{item.title}</Text><Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text></div>
                                        </div>
                                    ))}
                                </div>

                                <Divider />

                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                                    <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: 14, display: 'flex', alignItems: 'center' }}>
                                        <Button type="text" disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)} style={{ width: 40, height: 40, fontWeight: 800 }}>–</Button>
                                        <InputNumber controls={false} variant="borderless" value={quantity} style={{ width: 50, textAlign: 'center', fontWeight: 700 }} readOnly />
                                        <Button type="text" disabled={quantity >= product.stock} onClick={() => setQuantity(q => q + 1)} style={{ width: 40, height: 40, fontWeight: 800 }}>+</Button>
                                    </div>

                                    <Button 
                                        type="primary" size="large" loading={adding} disabled={!inStock} 
                                        icon={added ? <CheckOutlined /> : <ShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        style={{ height: 54, borderRadius: 16, padding: '0 40px', fontWeight: 800, background: added ? '#10b981' : DARK_NAVY, border: 'none' }}
                                    >
                                        {!inStock ? 'HẾT HÀNG' : added ? 'ĐÃ THÊM' : 'THÊM VÀO GIỎ'}
                                    </Button>

                                    <Button 
                                        size="large" onClick={() => { setWishlisted(!wishlisted); messageApi.success(wishlisted ? 'Đã bỏ thích' : 'Đã thích! ❤️'); }}
                                        icon={wishlisted ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                                        style={{ width: 54, height: 54, borderRadius: 16 }} 
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 48 }}>
                        <Card bordered={false} style={{ borderRadius: 32, padding: 20 }}>
                            <Tabs size="large" items={tabItems} />
                        </Card>
                    </div>
                </div>
            </div>

            <style>{`
                .ant-tabs-ink-bar { background: ${PRIMARY} !important; height: 3px !important; }
                .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${PRIMARY} !important; font-weight: 700 !important; }
            `}</style>
        </ConfigProvider>
    );
}