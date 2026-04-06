import { useState } from 'react';
import { Upload, Button, message, Image, Popconfirm, Spin, Typography } from 'antd';
import {
    PlusOutlined, DeleteOutlined, LoadingOutlined,
    CameraOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import fetchApi from '../../../../utils/fetchApi';

const { Text } = Typography;
const PRIMARY = '#f97316';

// ─────────────────────────────────────────────────────────────────
// Props:
//   mode       : 'single' | 'multiple'   (single = avatar/doctor, multiple = product)
//   uploadUrl  : string   endpoint để POST, VD: 'upload/avatar' | 'upload/product/123'
//   deleteUrl  : string   endpoint để DELETE ảnh (chỉ dùng khi mode='multiple')
//   fieldName  : string   tên field form ('avatar' | 'photo' | 'images')
//   currentImages: string | string[]   ảnh hiện tại
//   onSuccess  : (newImages) => void   callback khi upload/xóa xong
//   shape      : 'circle' | 'square'   (circle = avatar, square = product)
//   label      : string   nhãn hiển thị
// ─────────────────────────────────────────────────────────────────
export default function ImageUpload({
    mode = 'single',
    uploadUrl,
    deleteUrl,
    fieldName = 'images',
    currentImages = [],
    onSuccess,
    shape = 'square',
    label = 'Tải ảnh lên',
}) {
    const [uploading, setUploading] = useState(false);
    const [deleting,  setDeleting] = useState(''); // url đang xóa
    const [messageApi, ctxHolder] = message.useMessage();

    // Chuẩn hóa: luôn là mảng
    const images = Array.isArray(currentImages)
        ? currentImages
        : currentImages ? [currentImages] : [];

    // Upload
    const handleUpload = async (file) => {
        // Validate client-side
        const isImage = file.type.startsWith('image/');
        const isLt5M  = file.size / 1024 / 1024 < 5;
        if (!isImage) { messageApi.error('Chỉ được upload file ảnh!'); return false; }
        if (!isLt5M)  { messageApi.error('Ảnh phải nhỏ hơn 5MB!');    return false; }

        setUploading(true);
        const formData = new FormData();
        formData.append(fieldName, file);

        // fetchApi thường gửi JSON — dùng fetch trực tiếp cho FormData
        const token = localStorage.getItem('token');
        try {
            const res  = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/${uploadUrl}`, {
                method:  'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                messageApi.success('Upload thành công!');
                // Trả về URL mới: single → string, multiple → mảng
                const newImages = mode === 'single'
                    ? data.avatarUrl || data.photoUrl || data.images?.[0]
                    : data.images || [];
                onSuccess?.(newImages, data);
            } else {
                messageApi.error(data.message || 'Upload thất bại');
            }
        } catch {
            messageApi.error('Lỗi kết nối server');
        } finally {
            setUploading(false);
        }

        return false; // ngăn antd tự upload
    };

    // Xóa ảnh (chỉ mode multiple)
    const handleDelete = async (imageUrl) => {
        if (!deleteUrl) return;
        setDeleting(imageUrl);
        const { res, data } = await fetchApi(deleteUrl, { imageUrl }, 'DELETE');
        setDeleting('');
        if (res.ok) {
            messageApi.success('Đã xóa ảnh');
            onSuccess?.(data.product?.images || [], data);
        } else {
            messageApi.error(data.message || 'Xóa thất bại');
        }
    };

    // Render: SINGLE (avatar / doctor)
    if (mode === 'single') {
        const currentUrl = images[0];
        return (
            <div style={{ display: 'inline-block' }}>
                {ctxHolder}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    {/* Ảnh hiện tại */}
                    {currentUrl ? (
                        <img
                            src={currentUrl}
                            alt="avatar"
                            style={{
                                width: shape === 'circle' ? 96 : 120,
                                height: shape === 'circle' ? 96 : 120,
                                borderRadius: shape === 'circle' ? '50%' : 12,
                                objectFit: 'cover',
                                border: '3px solid #f3f4f6',
                                display: 'block',
                            }}
                        />
                    ) : (
                        <div style={{
                            width: shape === 'circle' ? 96 : 120,
                            height: shape === 'circle' ? 96 : 120,
                            borderRadius: shape === 'circle' ? '50%' : 12,
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:'center',
                            fontSize: 36,
                            border: '2px dashed #d1d5db',
                        }}>
                            {shape === 'circle' ? '👤' : '🖼️'}
                        </div>
                    )}

                    {/* Nút camera overlay */}
                    <Upload showUploadList={false} beforeUpload={handleUpload} accept="image/*">
                        <div style={{
                            position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: uploading ? '#e5e7eb' : PRIMARY,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',  border: '2px solid #fff',
                        }}>
                            {uploading
                                ? <LoadingOutlined style={{ color: '#6b7280', fontSize: 13 }} />
                                : <CameraOutlined  style={{ color: '#fff', fontSize: 13 }} />
                            }
                        </div>
                    </Upload>
                </div>

                <div style={{ marginTop: 6, textAlign: 'center' }}>
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>JPG/PNG/WebP · tối đa 5MB</Text>
                </div>
            </div>
        );
    }

    // Render: MULTIPLE (product images)
    return (
        <div>
            {ctxHolder}
            <Text style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>{label}</Text>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {/* Ảnh hiện có */}
                {images.map((url) => (
                    <div key={url} style={{ position: 'relative', width: 96, height: 96 }}>
                        <Image
                            src={url}
                            width={96}
                            height={96}
                            style={{ borderRadius: 10, objectFit: 'cover', border: '1.5px solid #f3f4f6' }}
                            preview={{ mask: '🔍 Xem' }}
                        />
                        {/* Nút xóa */}
                        {deleteUrl && (
                            <Popconfirm
                                title="Xóa ảnh này?"
                                onConfirm={() => handleDelete(url)}
                                okText="Xóa" cancelText="Không"
                                okButtonProps={{ danger: true }}
                            >
                                <div style={{
                                    position: 'absolute', top: 4, right: 4,  width: 22,  height: 22,  borderRadius: '50%',
                                    background: deleting === url ? '#e5e7eb' : '#ef4444', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                }}>
                                    {deleting === url
                                        ? <LoadingOutlined style={{ color: '#6b7280', fontSize: 10 }} />
                                        : <DeleteOutlined  style={{ color: '#fff',    fontSize: 10 }} />
                                    }
                                </div>
                            </Popconfirm>
                        )}
                    </div>
                ))}

                {/* Nút thêm ảnh — ẩn nếu đã đủ 5 ảnh */}
                {images.length < 5 && (
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        accept="image/*"
                        multiple
                        disabled={uploading}
                    >
                        <div style={{
                            width: 96, height: 96, borderRadius: 10, border: `2px dashed ${uploading ? '#d1d5db' : PRIMARY}`, display: 'flex',
                            flexDirection:  'column', alignItems: 'center', justifyContent: 'center',  cursor: uploading ? 'not-allowed' : 'pointer',
                            background: uploading ? '#fafafa' : '#fff7ed', transition: 'all 0.2s', gap:  4,
                        }}>
                            {uploading
                                ? <Spin size="small" />
                                : <>
                                    <PlusOutlined style={{ fontSize: 18, color: PRIMARY }} />
                                    <Text style={{ fontSize: 11, color: PRIMARY }}>Thêm ảnh</Text>
                                  </>
                            }
                        </div>
                    </Upload>
                )}
            </div>

            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, display: 'block' }}>
                Tối đa 5 ảnh · JPG/PNG/WebP · mỗi ảnh &lt; 5MB
            </Text>
        </div>
    );
}