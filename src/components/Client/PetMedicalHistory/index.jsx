import { useState, useEffect } from "react";
import { Timeline, Card, Typography, Spin, Empty, Tag, Divider, Space } from "antd";
import { ClockCircleOutlined, MedicineBoxOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Text, Title, Paragraph } = Typography;
const PRIMARY = "#f97316";

export default function PetMedicalHistory({ petName, customerId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!petName) {
            return;
        }
        const fetchHistory = async () => {
            setLoading(true);
            
            // Nếu có truyền customerId (tức là bác sĩ đang xem), gắn thêm vào query
            const query = customerId ? `?customerId=${customerId}` : '';
            
            const { res, data } = await fetchApi(`medical-records/pet/${encodeURIComponent(petName)}${query}`, null, 'GET');
            
            if (res.ok) setHistory(data.history || []);
            setLoading(false);
        };
        fetchHistory();
    }, [petName, customerId]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin tip="Đang tải bệnh án..." /></div>;

    if (history.length === 0) {
        return (
            <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0', background: '#f8fafc', borderRadius: 20 }}>
                <Empty description={<Text type="secondary">Bé chưa có lịch sử khám bệnh nào tại PooGi.</Text>} />
            </Card>
        );
    }

    return (
        <div style={{ padding: '10px 20px' }}>
            <Timeline
                mode="left"
                items={history.map((record) => ({
                    dot: <ClockCircleOutlined style={{ fontSize: '18px', color: PRIMARY }} />,
                    color: PRIMARY,
                    children: (
                        <Card 
                            bordered={false} 
                            style={{ 
                                marginBottom: 24, 
                                borderRadius: 16, 
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
                                        Ngày khám: {dayjs(record.createdAt).format('DD/MM/YYYY')}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Bác sĩ phụ trách: 
                                        <span style={{ fontWeight: 600, color: '#334155' }}>
                                            {/* Dùng 2 dấu ?. liên tiếp như thế này */}
                                            Bs. {record.doctor?.user?.fullName || "Chưa cập nhật"}
                                        </span>
                                    </Text>
                                </div>
                                <Space size={8} align="start">
                                    <Tag color="blue">{record.weight} kg</Tag>
                                    {record.temperature && <Tag color="orange">{record.temperature}°C</Tag>}
                                </Space>
                            </div>

                            <div style={{ background: '#fff1f2', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                                <Text strong style={{ color: '#e11d48', display: 'block', marginBottom: 4 }}>Chẩn đoán:</Text>
                                <Text style={{ color: '#be123c', fontSize: 15 }}>{record.diagnosis}</Text>
                            </div>

                            <Paragraph style={{ margin: 0, color: '#475569' }}>
                                <Text strong><InfoCircleOutlined /> Triệu chứng:</Text> {record.symptoms}
                            </Paragraph>

                            {record.treatment && (
                                <Paragraph style={{ marginTop: 8, color: '#475569' }}>
                                    <Text strong><MedicineBoxOutlined /> Điều trị tại chỗ:</Text> {record.treatment}
                                </Paragraph>
                            )}

                            {record.prescription && record.prescription.length > 0 && (
                                <>
                                    <Divider style={{ margin: '16px 0' }} dashed />
                                    <Text strong style={{ display: 'block', marginBottom: 8, color: PRIMARY }}>Đơn thuốc (Mang về):</Text>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {record.prescription.map((med, idx) => (
                                            <div key={idx} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                                                <Text strong style={{ display: 'block' }}>• {med.medicineName}</Text>
                                                <Text type="secondary" style={{ fontSize: 13 }}>{med.dosage} | {med.duration}</Text>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {record.notes && (
                                <div style={{ marginTop: 16, borderLeft: `3px solid ${PRIMARY}`, paddingLeft: 12 }}>
                                    <Text type="secondary" italic>Lời dặn: {record.notes}</Text>
                                </div>
                            )}
                        </Card>
                    )
                }))}
            />
        </div>
    );
}