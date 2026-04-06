import { useState } from "react";
import { Upload, Typography, message, Spin, Popconfirm, Image } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;
const PRIMARY = "#f97316";

// ── Lấy từ .env frontend ─────────────────────────────────────────
// VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
// VITE_CLOUDINARY_UPLOAD_PRESET=poogi_uploads   (unsigned preset)
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME    || "your-cloud-name";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "poogi_uploads";

// ─────────────────────────────────────────────────────────────────
// Props:
//   value     : string[]   mảng URL hiện tại (controlled bởi Form.Item)
//   onChange  : (urls) => void  callback cập nhật Form value
//   max       : number    tối đa bao nhiêu ảnh (default 5)
// ─────────────────────────────────────────────────────────────────
export default function ProductImageUpload({ value = [], onChange, max = 5 }) {
    const [uploading,  setUploading]  = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    // Upload 1 file lên Cloudinary unsigned
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file",           file);
        formData.append("upload_preset",  UPLOAD_PRESET);
        formData.append("folder",         "poogi/products");

        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body:   formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");
        return data.secure_url;
    };

    // beforeUpload — xử lý từng file
    const handleBeforeUpload = async (file) => {
        // Validate
        const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
        if (!ALLOWED.includes(file.type)) {
            messageApi.error("Chỉ chấp nhận JPG, PNG hoặc WebP!");
            return false;
        }
        if (file.size / 1024 / 1024 > 5) {
            messageApi.error("Ảnh phải nhỏ hơn 5MB!");
            return false;
        }
        if ((value?.length || 0) >= max) {
            messageApi.warning(`Tối đa ${max} ảnh!`);
            return false;
        }

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            const newUrls = [...(value || []), url];
            onChange?.(newUrls);
            messageApi.success("Upload thành công!");
        } catch (err) {
            messageApi.error(err.message || "Upload thất bại");
        } finally {
            setUploading(false);
        }

        return false; // ngăn antd tự upload
    };

    // Xóa ảnh — chỉ xóa khỏi mảng (không xóa trên Cloudinary)
    const handleDelete = (url) => {
        const newUrls = (value || []).filter(u => u !== url);
        onChange?.(newUrls);
        messageApi.success("Đã xóa ảnh");
    };

    const images = value || [];

    return (
        <div>
            {ctxHolder}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {/* Ảnh đã có */}
                {images.map((url, i) => (
                    <div key={url} style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                        <Image
                            src={url} width={90} height={90}
                            style={{ borderRadius: 10, objectFit: "cover", border: "1.5px solid #f3f4f6" }}
                            preview={{ mask: "🔍 Xem" }}
                        />
                        {/* Badge thứ tự */}
                        {i === 0 && (
                            <div style={{ position: "absolute", top: 4, left: 4, background: PRIMARY, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4 }}>
                                CHÍNH
                            </div>
                        )}
                        {/* Nút xóa */}
                        <Popconfirm title="Xóa ảnh này?" onConfirm={() => handleDelete(url)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
                            <div style={{
                                position: "absolute", top: 4, right: 4,
                                width: 22, height: 22, borderRadius: "50%",
                                background: "#ef4444", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                            }}>
                                <DeleteOutlined style={{ color: "#fff", fontSize: 10 }} />
                            </div>
                        </Popconfirm>
                    </div>
                ))}

                {/* Nút thêm ảnh */}
                {images.length < max && (
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleBeforeUpload}
                        accept=".jpg,.jpeg,.png,.webp"
                        multiple disabled={uploading}
                    >
                        <div style={{
                            width: 90, height: 90, borderRadius: 10,
                            border: `2px dashed ${uploading ? "#d1d5db" : PRIMARY}`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            cursor: uploading ? "not-allowed" : "pointer",
                            background: uploading ? "#fafafa" : "#fff7ed",
                            transition: "all 0.2s", gap: 4,
                        }}>
                            {uploading
                                ? <Spin indicator={<LoadingOutlined style={{ color: PRIMARY }} />} />
                                : <>
                                    <PlusOutlined style={{ fontSize: 20, color: PRIMARY }} />
                                    <Text style={{ fontSize: 11, color: PRIMARY }}>Thêm ảnh</Text>
                                  </>
                            }
                        </div>
                    </Upload>
                )}
            </div>

            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, display: "block" }}>
                Tối đa {max} ảnh · JPG/PNG/WebP · mỗi ảnh &lt; 5MB · Ảnh đầu tiên là ảnh chính
            </Text>
        </div>
    );
}