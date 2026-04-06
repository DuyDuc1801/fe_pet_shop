import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Row, Col, Card, Form, Input, Select, Button,
    Typography, Divider, Tag, Steps, ConfigProvider, message, Radio,
    Badge,
} from "antd";
import {
    EnvironmentOutlined, PhoneOutlined, UserOutlined,
    CreditCardOutlined, CarOutlined, CheckCircleFilled,
    ShoppingOutlined, ArrowLeftOutlined,
} from "@ant-design/icons";
import { useCart } from "../../../../contexts/useCart";
import { useAuth } from "../../../../contexts/useAuth";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";

const CITIES = [
    'Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ',
    'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bắc Ninh',
    'Bến Tre','Bình Định','Bình Dương','Bình Phước','Bình Thuận',
    'Cà Mau','Cao Bằng','Đắk Lắk','Đắk Nông','Điện Biên',
    'Đồng Nai','Đồng Tháp','Gia Lai','Hà Giang','Hà Nam',
    'Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình','Hưng Yên',
    'Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng',
    'Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An',
    'Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình',
    'Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng',
    'Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa',
    'Thừa Thiên Huế','Tiền Giang','Trà Vinh','Tuyên Quang',
    'Vĩnh Long','Vĩnh Phúc','Yên Bái',
];

const PAYMENT_METHODS = [
    { value: 'cod',           label: '💵 Thanh toán khi nhận hàng (COD)',        desc: 'Trả tiền mặt khi nhận được hàng'        },
    { value: 'bank_transfer', label: '🏦 Chuyển khoản ngân hàng',               desc: 'Chuyển khoản trước, xử lý sau khi nhận'  },
];

// ── Order Summary sidebar ────────────────────────────────────────
function OrderSummary({ cart, shippingFee }) {
    const items = cart?.items || [];
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const grandTotal = total + shippingFee;

    return (
        <Card bordered={false} style={{ borderRadius: 16, border: '1.5px solid #f3f4f6'}}>
            <Title level={5} style={{margin: "0 0 16px" }}>Đơn hàng ({items.length} sản phẩm)</Title>

            <div style={{ maxHeight: 280, overflowY: 'auto'}}>
                {items.map(item => (
                    <div key={item.product._id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={item.product.images?.[0]} alt={item.product.name}
                                    style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: '1.5px solid #f3f4f6' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.product.name} x {item.quantity}
                            </div>
                            <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 700 }}>
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#6b7280' }}>Tạm tính</Text>
                <Text style={{ fontWeight: 600 }}>{total.toLocaleString('vi-VN')}₫</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: '#6b7280' }}>Phí vận chuyển</Text>
                <Text style={{ fontWeight: 600, color: shippingFee === 0 ? '#22c55e' : '#1c1c1c' }}>
                    {shippingFee === 0 ? 'Miễn phí 🎉' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                </Text>
            </div>

            <Divider style={{ margin: '0 0 12px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng</Text>
                <Text style={{ fontWeight: 800, fontSize: 20, color: PRIMARY }}>{grandTotal.toLocaleString('vi-VN')}₫</Text>
            </div>
        </Card>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const [form]          = Form.useForm();
    const [loading,    setLoading]    = useState(false);
    const [step,       setStep]       = useState(0);  // 0: form, 1: success
    const [orderId,    setOrderId]    = useState('');
    const [messageApi, ctxHolder]     = message.useMessage();
    const { cart, totalPrice, clearCart } = useCart();
    const { user }  = useAuth();
    const navigate  = useNavigate();

    const SHIPPING_THRESHOLD = 500000;
    const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : 30000;

    // Pre-fill từ thông tin user
    const initialValues = {
        fullName: user?.fullName || '',
        phone:    user?.phoneNumber || '',
        paymentMethod: 'cod',
    };

    const handleSubmit = async (values) => {
        if (!cart?.items?.length) {
            messageApi.error('Giỏ hàng trống!');
            return;
        }
        setLoading(true);
        const { res, data } = await fetchApi('orders', {
            shippingInfo: {
                fullName: values.fullName,
                phone:    values.phone,
                address:  values.address,
                city:     values.city,
                note:     values.note || '',
            },
            paymentMethod: values.paymentMethod,
        }, 'POST');
        setLoading(false);

        if (res.ok) {
            setOrderId(data.order._id);
            setStep(1);
            clearCart();
        } else {
            messageApi.error(data.message || 'Đặt hàng thất bại, vui lòng thử lại.');
        }
    };

    // ── Success screen ────────────────────────────────────────────
    if (step === 1) {
        return (
            <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
                <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 520, margin: '0 auto' }}>
                    <CheckCircleFilled style={{ fontSize: 80, color: '#22c55e', marginBottom: 24 }} />
                    <Title level={2} style={{ fontFamily: "'Be Vietnam Pro',sans-serif", marginBottom: 8 }}>
                        Đặt hàng thành công! 🎉
                    </Title>
                    <Text style={{ color: '#6b7280', fontSize: 15, display: 'block', marginBottom: 8 }}>
                        Cảm ơn bạn đã mua hàng tại PooGi!
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 13, display: 'block', marginBottom: 32 }}>
                        Mã đơn hàng: <b style={{ color: PRIMARY }}>#{orderId.slice(-8).toUpperCase()}</b>
                    </Text>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button type="primary" icon={<ShoppingOutlined />}
                            onClick={() => navigate('/don-hang-cua-toi')}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 44, fontWeight: 600, paddingInline: 24 }}>
                            Xem đơn hàng
                        </Button>
                        <Button onClick={() => navigate('/san-pham')}
                            style={{ borderRadius: 10, height: 44, borderColor: PRIMARY, color: PRIMARY, fontWeight: 600, paddingInline: 24 }}>
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ marginBottom: 12 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/gio-hang')}
                    variant="text" color="danger" style={{ margin: "4px 18px"}}>
                    Quay lại giỏ hàng
                </Button>
                <Title level={3} style={{ margin: '6px 32px 0', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
                    Thanh toán 💳 
                </Title>
            </div>

            <Row gutter={[24, 24]} style={{marginInline: 12, margin: "0 24px 48px"}}>
                {/* ── Form ── */}
                <Col xs={24} lg={15}>
                    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit} requiredMark={false}>

                        {/* Thông tin giao hàng */}
                        <Card bordered={false} style={{ borderRadius: 16, border: '1.5px solid #f3f4f6', marginBottom: 20 }}>
                            <Title level={5} style={{ margin: "0 0 16px" }}>
                                <EnvironmentOutlined style={{ color: PRIMARY, marginRight: 8 }} />
                                Thông tin giao hàng
                            </Title>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="fullName"
                                        style={{ marginBottom: 12 }}
                                        label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                        <Input prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                                            size="middle" style={{ borderRadius: 10 }} placeholder="Nguyễn Văn A" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="phone"
                                        style={{ marginBottom: 12 }}
                                        label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                                        ]}>
                                        <Input prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                                            size="middle" style={{ borderRadius: 10 }} placeholder="0901 234 567" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={16}>
                                    <Form.Item name="address"
                                        style={{ marginBottom: 12 }}
                                        label={<span style={{ fontWeight: 600 }}>Địa chỉ</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                                        <Input prefix={<EnvironmentOutlined style={{ color: '#9ca3af' }} />}
                                            size="middle" style={{ borderRadius: 10 }} placeholder="Số nhà, tên đường, phường/xã" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item name="city"
                                        style={{ marginBottom: 12 }}
                                        label={<span style={{ fontWeight: 600 }}>Tỉnh / Thành phố</span>}
                                        rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành' }]}>
                                        <Select size="middle" style={{ borderRadius: 10 }} placeholder="Chọn tỉnh/thành"
                                            showSearch filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}>
                                            {CITIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="note" label={<span style={{ fontWeight: 600 }} >Ghi chú (tuỳ chọn)</span>}>
                                <Input.TextArea rows={2} style={{ borderRadius: 10 }}
                                    placeholder="Ghi chú cho người giao hàng, thời gian giao phù hợp..." />
                            </Form.Item>
                        </Card>

                        {/* Phương thức thanh toán */}
                        <Card bordered={false} style={{ borderRadius: 16, border: '1.5px solid #f3f4f6', marginBottom: 20 }}>
                            <Title level={5} style={{ margin: "0 0 16px" }}>
                                <CreditCardOutlined style={{ color: PRIMARY, marginRight: 8 }} />
                                Phương thức thanh toán
                            </Title>
                            <Form.Item name="paymentMethod">
                                <Radio.Group style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {PAYMENT_METHODS.map(pm => (
                                        <Radio key={pm.value} value={pm.value}
                                            style={{ padding: '14px 16px', border: '1.5px solid #f3f4f6', borderRadius: 12, margin: 0, display: 'flex', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{pm.label}</div>
                                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{pm.desc}</div>
                                            </div>
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                        </Card>

                        {/* Nút đặt hàng */}
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}
                            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, height: 52, fontWeight: 700, fontSize: 16 }}>
                            {loading ? 'Đang xử lý...' : `Đặt hàng • ${(totalPrice + shippingFee).toLocaleString('vi-VN')}₫`}
                        </Button>
                    </Form>
                </Col>

                {/* ── Summary ── */}
                <Col xs={24} lg={9}>
                    <OrderSummary cart={cart} shippingFee={shippingFee} />
                </Col>
            </Row>
        </ConfigProvider>
    );
}