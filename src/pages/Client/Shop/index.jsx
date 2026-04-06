import { useState, useEffect, useCallback } from "react";
import {
    Row, Col, Card, Tag, Button, Select, Input, Pagination,
    Typography, Badge, Spin, Empty, ConfigProvider, message, Space, Divider
} from "antd";
import {
    ShoppingCartOutlined, SearchOutlined, FilterOutlined, 
    StarFilled, FireOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../utils/fetchApi";
import { useCart } from "../../../../contexts/useCart";
import { useAuth } from "../../../../contexts/useAuth";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PRIMARY = "#f97316";
const BG_COLOR = "#f8fafc";

const CATEGORIES = ['Tất cả', 'Thức ăn', 'Phụ kiện', 'Thuốc & Vitamin', 'Vệ sinh', 'Đồ chơi', 'Khác'];
const PET_TYPES  = ['Tất cả', 'Chó', 'Mèo'];

// ── Component: ProductCard Nâng Cấp ──────────────────────────
function ProductCard({ product, onAddToCart }) {
    const [adding, setAdding] = useState(false);
    const navigate = useNavigate();

    const hasSale = product.salePrice && product.salePrice < product.price;
    const discount = hasSale ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    const finalPrice = hasSale ? product.salePrice : product.price;

    const handleAdd = async (e) => {
        e.stopPropagation();
        setAdding(true);
        await onAddToCart(product._id);
        setAdding(false);
    };

    return (
        <Card
            hoverable
            bordered={false}
            onClick={() => navigate(`/san-pham/${product._id}`)}
            style={{ borderRadius: 20, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'}
        >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, height: 180, marginBottom: 12 }}>
                <img
                    src={product.images?.[0] || `https://placehold.co/400x400/FFB347/fff?text=🐾`}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                {hasSale && (
                    <div style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>
                        -{discount}%
                    </div>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 6, fontSize: 10, color: '#ef4444', fontWeight: 700 }}>
                        Chỉ còn {product.stock}
                    </div>
                )}
            </div>

            <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{product.category}</Text>
                <Title level={5} style={{ margin: '4px 0 8px', fontSize: 15, fontWeight: 700, lineHeight: 1.4, height: 42, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                </Title>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ background: '#fff7ed', padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <StarFilled style={{ color: '#f59e0b', fontSize: 10 }} />
                        <Text style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{product.rating.toFixed(1)}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>· Đã bán {product.sold || 0}</Text>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div>
                    <Text style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>
                        {finalPrice.toLocaleString('vi-VN')}₫
                    </Text>
                    {hasSale && (
                        <Text delete type="secondary" style={{ fontSize: 12, display: 'block' }}>
                            {product.price.toLocaleString('vi-VN')}₫
                        </Text>
                    )}
                </div>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<ShoppingCartOutlined />}
                    loading={adding}
                    disabled={product.stock === 0}
                    onClick={handleAdd}
                    style={{ background: DARK_NAVY, borderColor: DARK_NAVY, width: 40, height: 40, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                />
            </div>
        </Card>
    );
}

const DARK_NAVY = "#0f172a";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ category: '', petType: '', search: '', sort: 'newest' });
    const [messageApi, ctxHolder] = message.useMessage();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const PAGE_SIZE = 12;

    const loadProducts = useCallback(async (pg, f) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE, sort: f.sort });
        if (f.category) params.append('category', f.category);
        if (f.petType) params.append('petType', f.petType);
        if (f.search) params.append('search', f.search);
        
        const { res, data } = await fetchApi(`products?${params}`, null, 'GET');
        if (res.ok) { setProducts(data.products); setTotal(data.total); }
        setLoading(false);
    }, []);

    // Thay vì gọi trực tiếp loadServices();
    useEffect(() => {
        let isMounted = true; // Biến cờ để tránh leak memory

        const fetchData = async () => {
            if (isMounted) {
                await loadProducts(1, { category: '', petType: '', search: '', sort: 'newest' });
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Cleanup khi component unmount
        };
    }, [loadProducts]);

    const handleFilter = (key, val) => {
        const nf = { ...filters, [key]: val };
        setFilters(nf);
        setPage(1);
        loadProducts(1, nf);
    };

    const handleAddToCart = async (productId) => {
        if (!user) { navigate('/login'); return; }
        const { ok, message: msg } = await addToCart(productId, 1);
        if (ok) messageApi.success({ content: '🛒 Đã thêm vào giỏ hàng!', duration: 2 });
        else messageApi.error(msg || 'Thêm thất bại');
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', sans-serif" } }}>
            {ctxHolder}
            <div style={{ background: BG_COLOR, minHeight: '100vh', paddingBottom: 60 }}>
                
                {/* Hero Banner Section */}
                <div style={{ 
                    position: 'relative', 
                    height: '250px', 
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    // Thay link ảnh banner của bạn tại đây
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('https://urbanpetshop.vn/upload/hinh_banner_slider/1758353627_Urbanpetshop9.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed' // Hiệu ứng Parallax nhẹ
                }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', width: '100%', position: 'relative' }}>
                        <div style={{ maxWidth: 700 }}>
                            <Tag color="orange" style={{ borderRadius: 20, fontWeight: 700, marginBottom: 16, border: 'none', padding: '4px 16px' }}>
                                POOGI PREMIUM STORE
                            </Tag>
                            <Title level={1} style={{ margin: '0 0 12px 0', fontWeight: 800, color: '#fff', fontSize: '48px', letterSpacing: '-1px' }}>
                                Cửa hàng thú cưng
                            </Title>
                            <Text style={{ fontSize: 18, color: '#cbd5e1', display: 'block', maxWidth: '500px', lineHeight: 1.6 }}>
                                Khám phá thế giới phụ kiện & dinh dưỡng cao cấp nhất dành riêng cho người bạn bốn chân của bạn.
                            </Text>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
                    <Row gutter={[32, 32]}>
                        
                        {/* Sidebar */}
                        <Col xs={24} lg={6} xl={5}>
                            <div style={{ position: 'sticky', top: 20 }}>
                                <Title level={5} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FilterOutlined style={{ fontSize: 14 }} /> BỘ LỌC TÌM KIẾM
                                </Title>

                                <div style={{ background: '#fff', padding: '24px', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                    <div style={{ marginBottom: 28 }}>
                                        <Text strong style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 16, letterSpacing: 1 }}>DANH MỤC</Text>
                                        {CATEGORIES.map(cat => (
                                            <div key={cat} onClick={() => handleFilter('category', cat === 'Tất cả' ? '' : cat)}
                                                style={{ 
                                                    padding: '8px 0', cursor: 'pointer', transition: '0.2s', fontSize: 14,
                                                    color: (filters.category || 'Tất cả') === cat ? PRIMARY : '#475569',
                                                    fontWeight: (filters.category || 'Tất cả') === cat ? 700 : 500,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                {cat}
                                                {(filters.category || 'Tất cả') === cat && <ArrowRightOutlined style={{ fontSize: 10 }} />}
                                            </div>
                                        ))}
                                    </div>

                                    <Divider style={{ margin: '20px 0' }} />

                                    <div>
                                        <Text strong style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 16, letterSpacing: 1 }}>LOÀI</Text>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {PET_TYPES.map(pt => (
                                                <Button key={pt} block onClick={() => handleFilter('petType', pt === 'Tất cả' ? '' : pt)}
                                                    style={{ 
                                                        textAlign: 'left', borderRadius: 10, height: 40,
                                                        background: (filters.petType || 'Tất cả') === pt ? '#fff7ed' : 'transparent',
                                                        borderColor: (filters.petType || 'Tất cả') === pt ? PRIMARY : '#e2e8f0',
                                                        color: (filters.petType || 'Tất cả') === pt ? PRIMARY : '#475569',
                                                        fontWeight: (filters.petType || 'Tất cả') === pt ? 700 : 400
                                                    }}>
                                                    {pt === 'Tất cả' ? '🐾 Tất cả' : pt === 'Chó' ? '🐕 Cho Chó' : '🐈 Cho Mèo'}
                                                </Button>
                                            ))}
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Product Area */}
                        <Col xs={24} lg={18} xl={19}>
                            
                            {/* Toolbar */}
                            <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <Input
                                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                                    placeholder="Tìm tên sản phẩm..."
                                    variant="borderless"
                                    value={filters.search}
                                    onChange={e => handleFilter('search', e.target.value)}
                                    style={{ flex: 1, fontSize: 15 }}
                                    allowClear
                                />
                                <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
                                <Select value={filters.sort} onChange={v => handleFilter('sort', v)} variant="borderless" style={{ width: 160 }} dropdownStyle={{ borderRadius: 12 }}>
                                    <Option value="newest">🕒 Mới nhất</Option>
                                    <Option value="popular">🔥 Bán chạy</Option>
                                    <Option value="rating">⭐ Đánh giá</Option>
                                    <Option value="price_asc">💰 Giá tăng</Option>
                                    <Option value="price_desc">💰 Giá giảm</Option>
                                </Select>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
                            ) : products.length === 0 ? (
                                <Card bordered={false} style={{ borderRadius: 24, textAlign: 'center', padding: 60 }}>
                                    <Empty description="Rất tiếc, PooGi không tìm thấy sản phẩm này" />
                                </Card>
                            ) : (
                                <>
                                    <Row gutter={[20, 24]}>
                                        {products.map(p => (
                                            <Col key={p._id} xs={12} sm={12} md={8} xl={6}>
                                                <ProductCard product={p} onAddToCart={handleAddToCart} />
                                            </Col>
                                        ))}
                                    </Row>
                                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                                        <Pagination
                                            current={page} pageSize={PAGE_SIZE} total={total}
                                            onChange={p => { setPage(p); loadProducts(p, filters); window.scrollTo(0,0); }} 
                                            showSizeChanger={false}
                                            style={{ background: '#fff', padding: '12px 24px', borderRadius: 50, display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                                        />
                                    </div>
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider>
    );
}