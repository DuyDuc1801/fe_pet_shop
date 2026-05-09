import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card, Row, Col, Button, Form, Input, Select,
    DatePicker, Typography, message, Result,
    ConfigProvider, Spin, Avatar, Divider, Space, Alert
} from "antd";
import {
    CalendarOutlined, UserOutlined, ClockCircleOutlined, 
    MedicineBoxOutlined, HeartOutlined, SafetyCertificateOutlined,
    CreditCardOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi"; //

const { Title, Text } = Typography;
const { Option } = Select;
const PRIMARY = "#f97316";

export default function BookingPage() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailSlots] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [done, setDone] = useState(false); // Đã sử dụng
    const [bookingCode, setBookingCode] = useState("");

    const [selService, setSelService] = useState(null);
    const [selDoctor, setSelDoctor] = useState(null);
    const [selDate, setSelDate] = useState(null);
    const [selTime, setSelTime] = useState(null);

    useEffect(() => {
        (async () => {
            const { res, data } = await fetchApi('services', null, 'GET');
            if (res.ok) setServices(data.services || []);
        })();
    }, []);

    useEffect(() => {
        if (!selService) return;
        (async () => {
            setDoctors([]); setSelDoctor(null); setSelDate(null); setSelTime(null);
            setLoadingDoctors(true);
            const { res, data } = await fetchApi(`doctors?serviceId=${selService._id}`, null, 'GET');
            if (res.ok) setDoctors(data.doctors || []);
            setLoadingDoctors(false);
        })();
    }, [selService?._id]);

    useEffect(() => {
        if (!selDoctor || !selDate) return;
        (async () => {
            setSelTime(null); setLoadingSlots(true);
            const dateStr = selDate.format('YYYY-MM-DD');
            const { res, data } = await fetchApi(`appointments/available-slots?doctorId=${selDoctor._id}&date=${dateStr}`, null, 'GET');
            if (res.ok) setAvailSlots(data.availableSlots || []);
            setLoadingSlots(false);
        })();
    }, [selDoctor?._id, selDate]);

    const handleSubmit = async () => {
        // 1. Kiểm tra lựa chọn đầy đủ
        if (!selService || !selDoctor || !selDate || !selTime) {
            return messageApi.warning("Vui lòng chọn đầy đủ thông tin!");
        }

        try {
            // 2. Validate form thông tin thú cưng
            const values = await form.validateFields();
            setLoadingSubmit(true);

            // 3. Tạo lịch hẹn trước (Lưu vào DB với trạng thái Pending/Chờ thanh toán)
            const { res: aptRes, data: aptData } = await fetchApi('appointments', {
                doctorId: selDoctor._id,
                serviceId: selService._id,
                date: selDate.format('YYYY-MM-DD'),
                time: selTime,
                ...values,
            }, 'POST');

            if (aptRes.ok) {
                // 4. Gọi API lấy URL thanh toán VNPay từ Backend
                // Lưu ý: Đường dẫn phải khớp với router.post('/create-appointment', ...)
                const { res: payRes, data: payData } = await fetchApi('payment/create-appointment', {
                    appointmentId: aptData.appointment._id, // Gửi ID vừa tạo
                }, 'POST');

                if (payRes.ok && payData.paymentUrl) {
                    // Chuyển hướng sang VNPay
                    window.location.href = payData.paymentUrl;
                } else {
                    // Nếu không tạo được URL thanh toán, thông báo cho user xem lại trong lịch sử
                    setBookingCode(`BK${aptData.appointment._id.slice(-4).toUpperCase()}`);
                    setDone(true);
                    messageApi.info("Lịch hẹn đã ghi nhận, nhưng không thể kết nối cổng thanh toán lúc này.");
                }
            } else {
                messageApi.error(aptData.message || 'Đặt lịch thất bại');
            }
        } catch (e) {
            console.error("Booking Error:", e);
            // messageApi.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    // UI hiển thị khi đặt lịch thành công
    if (done) {
        return (
            <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
                <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                    <Card bordered={false} style={{ borderRadius: 24, maxWidth: 500, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                        <Result
                            status="success"
                            title="Đã ghi nhận yêu cầu đặt lịch!"
                            subTitle={`Mã lịch hẹn: #${bookingCode}. Vui lòng kiểm tra email hoặc mục 'Lịch của tôi' để hoàn tất thanh toán nếu chưa thực hiện.`}
                            extra={[
                                <Button type="primary" size="large" key="my" onClick={() => navigate('/lich-cua-toi')} style={{ borderRadius: 10, background: PRIMARY }}>Xem lịch của tôi</Button>,
                                <Button size="large" key="home" onClick={() => navigate('/')} style={{ borderRadius: 10 }}>Trang chủ</Button>
                            ]}
                        />
                    </Card>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Inter', sans-serif" } }}>
            {contextHolder}
            <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "40px 20px" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 40 }}>
                        <Title level={2} style={{ fontWeight: 800 }}>Đặt Lịch & Đặt Cọc</Title>
                        <Text type="secondary">Bắt buộc đặt cọc 30% để xác nhận giữ chỗ</Text>
                    </div>

                    <Space direction="vertical" size={24} style={{ width: "100%" }}>
                        {/* 1. Dịch vụ */}
                        <Card title={<><MedicineBoxOutlined /> 1. Chọn dịch vụ</>} bordered={false} style={{ borderRadius: 16 }}>
                            <Row gutter={[12, 12]}>
                                {services.map(svc => (
                                    <Col xs={12} sm={8} key={svc._id}>
                                        <div onClick={() => setSelService(svc)} style={{
                                            padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                                            border: `2px solid ${selService?._id === svc._id ? PRIMARY : "#f1f5f9"}`,
                                            background: selService?._id === svc._id ? "#fff7ed" : "#fff",
                                            transition: "all 0.2s"
                                        }}>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>{svc.icon || '🩺'}</div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{svc.name}</div>
                                            <Text strong style={{ color: PRIMARY }}>{svc.price?.toLocaleString()}đ</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>

                        {/* 2. Bác sĩ & Thời gian */}
                        {selService && (
                            <Card title={<><CalendarOutlined /> 2. Bác sĩ và Thời gian</>} bordered={false} style={{ borderRadius: 16 }}>
                                <Text strong style={{ fontSize: 13, display: "block", marginBottom: 12 }}>Bác sĩ phụ trách:</Text>
                                {loadingDoctors ? <Spin /> : (
                                    <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                                        {doctors.map(doc => (
                                            <Col xs={24} sm={12} key={doc._id}>
                                                <div onClick={() => setSelDoctor(doc)} style={{
                                                    display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 12, cursor: "pointer",
                                                    border: `2px solid ${selDoctor?._id === doc._id ? PRIMARY : "#f1f5f9"}`,
                                                    background: selDoctor?._id === doc._id ? "#fff7ed" : "#fff"
                                                }}>
                                                    <Avatar size={40} src={doc.user?.avatar} icon={<UserOutlined />} />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 14 }}>BS. {doc.user?.fullName}</div>
                                                        <div style={{ fontSize: 12, color: "#64748b" }}>{doc.specialty}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                )}

                                {selDoctor && (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Ngày khám:</Text>
                                            <DatePicker style={{ width: "100%", borderRadius: 8 }} 
                                                disabledDate={c => c && c < dayjs().startOf('day')}
                                                onChange={d => setSelDate(d)} format="DD/MM/YYYY" />
                                        </Col>
                                        <Col span={12}>
                                            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Giờ khám:</Text>
                                            <Select style={{ width: "100%" }} placeholder="Chọn giờ" loading={loadingSlots}
                                                onChange={setSelTime} value={selTime}>
                                                {availableSlots.map(t => <Option key={t} value={t}>{t}</Option>)}
                                            </Select>
                                        </Col>
                                    </Row>
                                )}
                            </Card>
                        )}

                        {/* 3. Thông tin thú cưng & Đặt cọc */}
                        {selTime && (
                            <Card title={<><HeartOutlined /> 3. Thông tin thú cưng</>} bordered={false} style={{ borderRadius: 16 }}>
                                <Form form={form} layout="vertical">
                                    <Row gutter={16}>
                                        <Col span={12}><Form.Item name="petName" label="Tên thú cưng" rules={[{required: true}]}><Input placeholder="Milo, Lu..." /></Form.Item></Col>
                                        <Col span={12}><Form.Item name="petType" label="Loài" initialValue="Chó"><Select><Option value="Chó">Chó</Option><Option value="Mèo">Mèo</Option><Option value="Khác">Khác</Option></Select></Form.Item></Col>
                                        <Col span={24}><Form.Item name="note" label="Ghi chú triệu chứng"><Input.TextArea placeholder="Bé có biểu hiện gì lạ không?" /></Form.Item></Col>
                                    </Row>

                                    <Divider />

                                    <Alert
                                        message="Thông tin đặt cọc trực tuyến"
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text>Giá dịch vụ: <b>{selService.price.toLocaleString()}đ</b></Text>
                                                <Text type="danger">Số tiền cọc (30%): <b>{Math.round(selService.price * 0.3).toLocaleString()}đ</b></Text>
                                                <Text size="small" italic>* Hệ thống sẽ chuyển bạn đến cổng VNPay để thanh toán cọc.</Text>
                                            </Space>
                                        }
                                        type="warning"
                                        showIcon
                                        icon={<CreditCardOutlined />}
                                        style={{ borderRadius: 12, marginBottom: 24 }}
                                    />

                                    <div style={{ textAlign: "right" }}>
                                        <Button type="primary" size="large" loading={loadingSubmit} onClick={handleSubmit}
                                            icon={<CreditCardOutlined />}
                                            style={{ borderRadius: 10, height: 50, paddingInline: 40, fontWeight: 700, background: PRIMARY, border: "none" }}>
                                            THANH TOÁN CỌC & ĐẶT LỊCH
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        )}
                    </Space>

                    <div style={{ textAlign: "center", marginTop: 32, color: "#94a3b8", fontSize: 12 }}>
                        <SafetyCertificateOutlined /> Thanh toán an toàn qua cổng VNPay
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}