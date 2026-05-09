import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Descriptions, Typography, theme } from 'antd';
import { HomeOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useToken } = theme;

const PaymentResult = () => {
    // 1. Dùng useSearchParams để lấy param từ URL
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useToken(); // Lấy theme token của AntD để style nếu cần

    // Hứng các giá trị từ URL
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const amount = searchParams.get('amount');
    const txnNo = searchParams.get('txnNo');

    const isSuccess = status === 'success';

    // Hàm format tiền tệ
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Chuyển đổi loại giao dịch
    const getTypeName = (type) => {
        if (type === 'order') return 'Đơn hàng sản phẩm';
        if (type === 'appointment') return 'Đặt cọc lịch hẹn';
        return 'Giao dịch';
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: '#f0f2f5',
            padding: '24px'
        }}>
            <Card 
                style={{ width: '100%', maxWidth: 600, borderRadius: 16, boxShadow: token.boxShadowSecondary }}
                bordered={false}
            >
                {/* Sử dụng Component Result của AntD */}
                <Result
                    status={isSuccess ? 'success' : 'error'}
                    title={isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                    subTitle={isSuccess 
                        ? 'Cảm ơn bạn đã sử dụng dịch vụ của PooGi PetCare. Vui lòng kiểm tra lại thông tin bên dưới.'
                        : 'Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý.'
                    }
                    extra={[
                        // Các nút hành động
                        isSuccess ? (
                            <Button 
                                type="primary" 
                                key="detail" 
                                icon={<FileTextOutlined />}
                                onClick={() => navigate(type === 'order' ? `/orders/${id}` : `/appointments/${id}`)}
                                size="large"
                            >
                                Xem chi tiết
                            </Button>
                        ) : (
                            <Button 
                                type="primary" 
                                danger 
                                key="retry" 
                                icon={<ReloadOutlined />}
                                onClick={() => navigate(-1)} // Quay lại trang trước để thanh toán lại
                                size="large"
                            >
                                Thử lại
                            </Button>
                        ),
                        <Button 
                            key="home" 
                            icon={<HomeOutlined />}
                            onClick={() => navigate('/')}
                            size="large"
                        >
                            Về trang chủ
                        </Button>,
                    ]}
                >
                    {/* Phần hiển thị chi tiết giao dịch */}
                    <div style={{ 
                        backgroundColor: '#fafafa', 
                        padding: '24px', 
                        borderRadius: 8,
                        marginTop: '24px' 
                    }}>
                        <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                            <Descriptions.Item label="Loại giao dịch">
                                <Text strong>{getTypeName(type)}</Text>
                            </Descriptions.Item>
                            
                            {id && (
                                <Descriptions.Item label="Mã tham chiếu">
                                    #{String(id).slice(-8).toUpperCase()}
                                </Descriptions.Item>
                            )}
                            
                            <Descriptions.Item label="Mã giao dịch VNPay">
                                {txnNo || 'Không có'}
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Số tiền thanh toán">
                                <Text strong style={{ 
                                    color: isSuccess ? token.colorSuccess : token.colorText, 
                                    fontSize: 18 
                                }}>
                                    {formatCurrency(amount)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </Result>
            </Card>
        </div>
    );
};

export default PaymentResult;