import { useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Space, Divider, message, Typography, Card } from "antd";
import { PlusOutlined, MinusCircleOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Text, Title } = Typography;
const PRIMARY = "#f97316";

export default function CreateRecordModal({ open, onClose, appointmentId, petName, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    const handleFinish = async (values) => {
        setLoading(true);
        // Gắn thêm appointmentId vào body
        const payload = { ...values, appointmentId };
        
        const { res, data } = await fetchApi('medical-records', payload, 'POST');
        setLoading(false);

        if (res.ok) {
            messageApi.success('Đã lưu hồ sơ bệnh án thành công!');
            form.resetFields();
            onSuccess?.(); // Load lại danh sách lịch hẹn
            onClose();
        } else {
            messageApi.error(data.message || 'Lưu hồ sơ thất bại');
        }
    };

    return (
        <Modal 
            title={<Title level={4} style={{ margin: 0, color: '#0f172a' }}>🩺 Khám bệnh cho bé: <span style={{ color: PRIMARY }}>{petName}</span></Title>}
            open={open} 
            onCancel={onClose} 
            footer={null} 
            width={700}
            centered
            maskClosable={false}
        >
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
                
                {/* DẤU HIỆU SINH TỒN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true, message: 'Nhập cân nặng' }]}>
                        <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} placeholder="VD: 4.5" />
                    </Form.Item>
                    <Form.Item name="temperature" label="Nhiệt độ (°C)">
                        <InputNumber style={{ width: '100%' }} min={30} max={45} step={0.1} placeholder="VD: 38.5" />
                    </Form.Item>
                </div>

                {/* KHÁM LÂM SÀNG */}
                <Form.Item name="symptoms" label="Triệu chứng lâm sàng" rules={[{ required: true, message: 'Mô tả triệu chứng' }]}>
                    <Input.TextArea rows={3} placeholder="VD: Bỏ ăn 2 ngày, nôn mửa, lờ đờ..." />
                </Form.Item>

                <Form.Item name="diagnosis" label="Chẩn đoán bệnh" rules={[{ required: true, message: 'Nhập chẩn đoán' }]}>
                    <Input placeholder="VD: Viêm dạ dày ruột cấp" style={{ fontWeight: 600, color: '#ef4444' }} />
                </Form.Item>

                <Form.Item name="treatment" label="Phương pháp điều trị (Tại phòng khám)">
                    <Input.TextArea rows={2} placeholder="VD: Tiêm truyền dịch sinh lý, tiêm thuốc chống nôn..." />
                </Form.Item>

                <Divider style={{ borderColor: '#e2e8f0' }}><Text type="secondary"><MedicineBoxOutlined /> KÊ ĐƠN THUỐC (VỀ NHÀ)</Text></Divider>

                {/* KÊ ĐƠN THUỐC ĐỘNG (Dynamic Form) */}
                <Form.List name="prescription">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <Space style={{ display: 'flex', marginBottom: 0 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'medicineName']} rules={[{ required: true, message: 'Nhập tên thuốc' }]} style={{ width: 250 }}>
                                            <Input placeholder="Tên thuốc" />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'dosage']} rules={[{ required: true, message: 'Nhập liều' }]} style={{ width: 150 }}>
                                            <Input placeholder="Liều lượng (VD: 2 viên/ngày)" />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'duration']} style={{ width: 120 }}>
                                            <Input placeholder="TG (VD: 5 ngày)" />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444', fontSize: 18 }} />
                                    </Space>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: PRIMARY, borderColor: PRIMARY }}>
                                    Thêm thuốc vào toa
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item name="notes" label="Ghi chú thêm (Lời dặn dò)">
                    <Input.TextArea rows={2} placeholder="VD: Kiêng ăn đồ mặn, theo dõi thêm nếu nôn tiếp thì tái khám..." />
                </Form.Item>

                {/* SUBMIT */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <Button onClick={onClose}>Hủy bỏ</Button>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ background: PRIMARY, border: 'none', fontWeight: 600 }}>
                        Hoàn tất khám & Lưu bệnh án
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}