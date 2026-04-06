import { useState } from "react";
import { Modal, Rate, Input, Button, Typography, message, Avatar } from "antd";
import { StarOutlined } from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";

const { Text, Title } = Typography;
const PRIMARY = "#f97316";

const LABELS = { 1: "Rất tệ", 2: "Tệ", 3: "Bình thường", 4: "Tốt", 5: "Xuất sắc" };

// ── Props ─────────────────────────────────────────────────────────
// type            : 'doctor' | 'product'
// targetName      : tên bác sĩ hoặc tên sản phẩm
// targetImage     : ảnh đại diện (optional)
// appointmentId   : (type=doctor) _id lịch hẹn
// orderId         : (type=product) _id đơn hàng
// productId       : (type=product) _id sản phẩm
// open / onClose / onSuccess
export default function ReviewModal({ type, targetName, targetImage, appointmentId, orderId, productId, open, onClose, onSuccess }) {
    const [rating,     setRating]     = useState(5);
    const [comment,    setComment]    = useState("");
    const [loading,    setLoading]    = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    const handleSubmit = async () => {
        if (!rating) { messageApi.warning("Vui lòng chọn số sao!"); return; }

        setLoading(true);
        const endpoint = type === 'doctor' ? 'reviews/doctor' : 'reviews/product';
        const body     = type === 'doctor'
            ? { appointmentId, rating, comment }
            : { orderId, productId, rating, comment };

        const { res, data } = await fetchApi(endpoint, body, 'POST');
        setLoading(false);

        if (res.ok) {
            messageApi.success('Cảm ơn đánh giá của bạn! ⭐');
            onSuccess?.();
            onClose();
            setRating(5); setComment("");
        } else {
            messageApi.error(data.message || 'Gửi đánh giá thất bại');
        }
    };

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={440}
            title={
                <span style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 700 }}>
                    ⭐ Đánh giá {type === 'doctor' ? 'bác sĩ' : 'sản phẩm'}
                </span>
            }>
            {ctxHolder}

            {/* Target info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #f3f4f6", marginBottom: 20 }}>
                {targetImage
                    ? <img src={targetImage} style={{ width: 48, height: 48, borderRadius: type === 'doctor' ? "50%" : 10, objectFit: "cover" }} />
                    : <Avatar size={48} style={{ background: PRIMARY, fontWeight: 700 }}>{targetName?.charAt(0)}</Avatar>
                }
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Be Vietnam Pro',sans-serif" }}>{targetName}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{type === 'doctor' ? 'Bác sĩ thú y' : 'Sản phẩm đã mua'}</div>
                </div>
            </div>

            {/* Rating stars */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Rate value={rating} onChange={setRating}
                    style={{ fontSize: 36, color: "#f59e0b" }} />
                {rating > 0 && (
                    <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>
                        {LABELS[rating]}
                    </div>
                )}
            </div>

            {/* Comment */}
            <Input.TextArea
                rows={3} value={comment} onChange={e => setComment(e.target.value)}
                placeholder={type === 'doctor'
                    ? "Chia sẻ trải nghiệm của bạn về bác sĩ..."
                    : "Chia sẻ cảm nhận về sản phẩm..."
                }
                style={{ borderRadius: 10, marginBottom: 16 }}
                maxLength={500} showCount
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button onClick={onClose} style={{ borderRadius: 8 }}>Bỏ qua</Button>
                <Button type="primary" loading={loading} onClick={handleSubmit}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                    Gửi đánh giá
                </Button>
            </div>
        </Modal>
    );
}