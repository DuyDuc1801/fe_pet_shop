import { useState, useEffect, useCallback } from "react";
import {
    Card, Button, Input, Typography, Spin, ConfigProvider,
    message, Form, Avatar, Row, Col, Tag, Divider, Upload,
    Modal,
} from "antd";
import {
    EditOutlined, SaveOutlined, LockOutlined, CameraOutlined,
    StarFilled, CheckCircleOutlined,
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";
import { useAuth } from "../../../../contexts/useAuth";

const { Title, Text } = Typography;
const { TextArea, Password } = Input;
const DOCTOR_COLOR = "#0ea5e9";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function DoctorProfilePage() {
    const [doctor,   setDoctor]   = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [editing,  setEditing]  = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [uploading,setUploading]= useState(false);
    const [messageApi, ctxHolder] = message.useMessage();
    const { updateUser }          = useAuth();

    const [form]   = Form.useForm();
    const [pwForm] = Form.useForm();
    const [pwModal, setPwModal]   = useState(false);
    const [pwSaving,setPwSaving]  = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const { res, data } = await fetchApi("doctor/profile", null, "GET");
        if (res.ok) setDoctor(data.doctor);
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(); })();
    }, [load]);

    const startEdit = () => {
        form.setFieldsValue({
            phoneNumber: doctor.user?.phoneNumber,
            bio:         doctor.bio,
        });
        setEditing(true);
    };

    const handleSave = async (values) => {
        setSaving(true);
        const { res, data } = await fetchApi("doctor/profile", values, "PUT");
        setSaving(false);
        if (res.ok) {
            setDoctor(data.doctor);
            setEditing(false);
            messageApi.success("Cập nhật hồ sơ thành công!");
            updateUser?.({ phoneNumber: values.phoneNumber });
        } else {
            messageApi.error(data.message || "Cập nhật thất bại");
        }
    };

    const handleChangePw = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            messageApi.error("Mật khẩu xác nhận không khớp!"); return;
        }
        setPwSaving(true);
        const { res, data } = await fetchApi("doctor/profile/change-password", {
            currentPassword: values.currentPassword,
            newPassword:     values.newPassword,
        }, "PUT");
        setPwSaving(false);
        if (res.ok) { messageApi.success("Đổi mật khẩu thành công!"); pwForm.resetFields(); setPwModal(false); }
        else messageApi.error(data.message || "Đổi mật khẩu thất bại");
    };

    // Upload avatar
    const handleAvatarUpload = async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);
        fd.append("folder", "poogi/doctors");
        setUploading(true);
        try {
            const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
            const data = await res.json();
            const url  = data.secure_url;
            await fetchApi("doctor/profile", { photo: url }, "PUT");
            setDoctor(prev => ({ ...prev, photo: url, user: { ...prev.user, avatar: url } }));
            messageApi.success("Cập nhật ảnh thành công!");
        } catch {
            messageApi.error("Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
        return false;
    };

    if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;
    if (!doctor) return null;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: DOCTOR_COLOR, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <Title level={3} style={{ margin: "0 0 24px" }}>👨‍⚕️ Hồ sơ của tôi</Title>

            <Row gutter={[24, 24]}>
                {/* Cột trái — Avatar + thông tin cố định */}
                <Col xs={24} lg={8}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #e0f2fe", textAlign: "center" }}>
                        {/* Avatar upload */}
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                            {doctor.photo || doctor.user?.avatar
                                ? <img src={doctor.photo || doctor.user?.avatar} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `3px solid ${DOCTOR_COLOR}` }} />
                                : <Avatar size={100} style={{ background: DOCTOR_COLOR, fontSize: 40, fontWeight: 700 }}>{doctor.user?.fullName?.charAt(0)}</Avatar>
                            }
                            <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept=".jpg,.jpeg,.png,.webp">
                                <div style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, background: DOCTOR_COLOR, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                                    {uploading ? <Spin size="small" /> : <CameraOutlined style={{ color: "#fff", fontSize: 14 }} />}
                                </div>
                            </Upload>
                        </div>

                        <Title level={4} style={{ margin: "0 0 4px" }}>BS. {doctor.user?.fullName}</Title>
                        <Tag color="blue" style={{ borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{doctor.specialty}</Tag>

                        {/* Rating */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <StarFilled style={{ color: "#f59e0b", fontSize: 18 }} />
                            <Text style={{ fontSize: 18, fontWeight: 800, color: "#1c1c1c" }}>{doctor.rating?.toFixed(1) || "—"}</Text>
                            <Text style={{ color: "#9ca3af" }}>({doctor.reviewCount || 0} đánh giá)</Text>
                        </div>

                        <Divider />

                        {/* Thông tin chỉ đọc (do admin quản lý) */}
                        {[
                            { label: "Email",     val: doctor.user?.email    },
                            { label: "Bằng cấp",  val: doctor.degree         },
                            { label: "Tham gia",  val: doctor.user?.createdAt ? new Date(doctor.user.createdAt).toLocaleDateString("vi-VN") : "—" },
                        ].map(({ label, val }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                                <Text style={{ color: "#9ca3af", fontSize: 13 }}>{label}</Text>
                                <Text style={{ fontWeight: 600, fontSize: 13 }}>{val}</Text>
                            </div>
                        ))}

                        <div style={{ marginTop: 12, padding: "8px 12px", background: "#f0f9ff", borderRadius: 10, fontSize: 12, color: "#0369a1" }}>
                            🔒 Email và bằng cấp do Admin quản lý
                        </div>

                        {/* Dịch vụ thực hiện */}
                        {doctor.services?.length > 0 && (
                            <>
                                <Divider />
                                <Text style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 10 }}>Dịch vụ thực hiện</Text>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                                    {doctor.services.map(s => (
                                        <Tag key={s._id} style={{ borderRadius: 8, fontSize: 12 }}>{s.icon} {s.name}</Tag>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </Col>

                {/* Cột phải — Form sửa thông tin */}
                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #e0f2fe", marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <Title level={5} style={{ margin: 0 }}>📝 Thông tin cá nhân</Title>
                            {!editing
                                ? <Button icon={<EditOutlined />} onClick={startEdit} style={{ borderRadius: 8, borderColor: DOCTOR_COLOR, color: DOCTOR_COLOR }}>Chỉnh sửa</Button>
                                : <Button danger onClick={() => setEditing(false)} style={{ borderRadius: 8 }}>Hủy</Button>
                            }
                        </div>

                        {editing ? (
                            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
                                <Form.Item name="phoneNumber" label={<b>Số điện thoại</b>}>
                                    <Input size="large" style={{ borderRadius: 10 }} placeholder="0912345678" />
                                </Form.Item>
                                <Form.Item name="bio" label={<b>Giới thiệu bản thân</b>}>
                                    <TextArea rows={5} style={{ borderRadius: 10 }}
                                        placeholder="Mô tả kinh nghiệm, chuyên môn của bạn..." maxLength={1000} showCount />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}
                                    style={{ background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, borderRadius: 10, height: 44, fontWeight: 600, width: "100%" }}>
                                    Lưu thay đổi
                                </Button>
                            </Form>
                        ) : (
                            <div>
                                {[
                                    { label: "Họ và tên",   val: `BS. ${doctor.user?.fullName}` },
                                    { label: "Điện thoại",  val: doctor.user?.phoneNumber || "Chưa cập nhật" },
                                    { label: "Chuyên khoa", val: doctor.specialty },
                                ].map(({ label, val }) => (
                                    <div key={label} style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                                        <Text style={{ color: "#9ca3af", width: 130, fontSize: 13, flexShrink: 0 }}>{label}</Text>
                                        <Text style={{ fontWeight: 600, fontSize: 13 }}>{val}</Text>
                                    </div>
                                ))}
                                <div style={{ padding: "12px 0" }}>
                                    <Text style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 6 }}>Giới thiệu</Text>
                                    <Text style={{ fontSize: 14, lineHeight: 1.8, color: doctor.bio ? "#374151" : "#9ca3af" }}>
                                        {doctor.bio || "Chưa có giới thiệu. Nhấn Chỉnh sửa để thêm."}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Đổi mật khẩu */}
                    <Card bordered={false} style={{ borderRadius: 18, border: "1.5px solid #e0f2fe" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <Title level={5} style={{ margin: "0 0 4px" }}>🔒 Bảo mật tài khoản</Title>
                                <Text style={{ color: "#9ca3af", fontSize: 13 }}>Đổi mật khẩu định kỳ để bảo vệ tài khoản</Text>
                            </div>
                            <Button icon={<LockOutlined />} onClick={() => setPwModal(true)}
                                style={{ borderRadius: 8, borderColor: DOCTOR_COLOR, color: DOCTOR_COLOR }}>
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Modal đổi mật khẩu */}
            <Modal title="🔑 Đổi mật khẩu" open={pwModal} onCancel={() => { setPwModal(false); pwForm.resetFields(); }}
                footer={null} destroyOnClose width={440}>
                <Form form={pwForm} layout="vertical" onFinish={handleChangePw} requiredMark={false} style={{ marginTop: 16 }}>
                    <Form.Item name="currentPassword" label={<b>Mật khẩu hiện tại</b>}
                        rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}>
                        <Password size="large" style={{ borderRadius: 10 }} placeholder="••••••" />
                    </Form.Item>
                    <Form.Item name="newPassword" label={<b>Mật khẩu mới</b>}
                        rules={[{ required: true, message: "Nhập mật khẩu mới" }, { min: 6, message: "Ít nhất 6 ký tự" }]}>
                        <Password size="large" style={{ borderRadius: 10 }} placeholder="Ít nhất 6 ký tự" />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label={<b>Xác nhận mật khẩu mới</b>}
                        rules={[{ required: true, message: "Xác nhận mật khẩu" }]}>
                        <Password size="large" style={{ borderRadius: 10 }} placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Button onClick={() => { setPwModal(false); pwForm.resetFields(); }} style={{ borderRadius: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={pwSaving}
                            style={{ background: DOCTOR_COLOR, borderColor: DOCTOR_COLOR, borderRadius: 8, fontWeight: 600 }}>
                            Xác nhận đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </ConfigProvider>
    );
}