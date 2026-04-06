import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Space, Card,
    Modal, Form, InputNumber, Typography, Row, Col,
    Tooltip, ConfigProvider, message, Popconfirm,
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import fetchApi from "../../../../utils/fetchApi";
import ProductImageUpload from "../../../components/common/ProductImageUpload";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const PRIMARY    = "#f97316";
const CATEGORIES = ["Thức ăn", "Phụ kiện", "Thuốc & Vitamin", "Vệ sinh", "Đồ chơi", "Khác"];
const PET_TYPES  = ["Chó", "Mèo", "Cả hai", "Khác"];

function ProductModal({ open, onClose, onSuccess, editProduct }) {
    const [form]    = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    useEffect(() => {
        if (!open) return;
        if (editProduct) {
            form.setFieldsValue({
                ...editProduct,
                images: editProduct.images || [],
                tags:   Array.isArray(editProduct.tags)
                    ? editProduct.tags.join(", ")
                    : editProduct.tags || "",
            });
        } else {
            form.resetFields();
        }
    }, [open, editProduct]);

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            tags:   values.tags
                ? String(values.tags).split(",").map(t => t.trim()).filter(Boolean)
                : [],
            images: values.images || [],
        };
        setLoading(true);
        const endpoint = editProduct ? `products/${editProduct._id}` : "products";
        const method   = editProduct ? "PUT" : "POST";
        const { res, data } = await fetchApi(endpoint, payload, method);
        setLoading(false);
        if (res.ok) {
            messageApi.success(editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
            onSuccess();
            onClose();
        } else {
            messageApi.error(data.message || "Thao tác thất bại");
        }
    };

    return (
        <Modal
            title={
                <span style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontWeight: 700, fontSize: 16 }}>
                    {editProduct ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
                </span>
            }
            open={open} onCancel={onClose} footer={null} width={700} destroyOnClose
        >
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit}
                requiredMark={false} style={{ marginTop: 16 }}>

                {/* ── Ảnh — dùng ProductImageUpload ── */}
                <Form.Item name="images" label={<b>Ảnh sản phẩm</b>} valuePropName="value">
                    <ProductImageUpload max={5} />
                </Form.Item>

                <Form.Item name="name" label={<b>Tên sản phẩm</b>}
                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                    <Input size="large" style={{ borderRadius: 10 }} placeholder="VD: Royal Canin Mini Adult 2kg" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="category" label={<b>Danh mục</b>}
                            rules={[{ required: true, message: "Chọn danh mục" }]}>
                            <Select size="large" placeholder="Chọn danh mục">
                                {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="petType" label={<b>Loại thú cưng</b>}>
                            <Select size="large" placeholder="Chọn loại">
                                {PET_TYPES.map(p => <Option key={p} value={p}>{p}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="price" label={<b>Giá gốc (₫)</b>}
                            rules={[{ required: true, message: "Nhập giá" }]}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0}
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={v => v.replace(/,/g, "")} placeholder="285000" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="salePrice" label={<b>Giá khuyến mãi (₫)</b>}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0}
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={v => v.replace(/,/g, "")} placeholder="259000" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="stock" label={<b>Tồn kho</b>}
                            rules={[{ required: true, message: "Nhập tồn kho" }]}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0} placeholder="50" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label={<b>Mô tả</b>}>
                    <TextArea rows={3} style={{ borderRadius: 10 }} placeholder="Mô tả chi tiết sản phẩm..." />
                </Form.Item>

                <Form.Item name="tags" label={<b>Tags <span style={{ color: "#9ca3af", fontWeight: 400 }}>(cách nhau bằng dấu phẩy)</span></b>}>
                    <Input size="large" style={{ borderRadius: 10 }} placeholder="hạt khô, royal canin, chó nhỏ..." />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        {editProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default function AdminProducts() {
    const [products,   setProducts]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [page,       setPage]       = useState(1);
    const [search,     setSearch]     = useState("");
    const [category,   setCategory]   = useState("");
    const [modalOpen,  setModalOpen]  = useState(false);
    const [editProd,   setEditProd]   = useState(null);
    const [messageApi, ctxHolder]     = message.useMessage();

    const PAGE_SIZE = 10;

    const loadProducts = useCallback(async (pg, s, cat) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (s)   params.append("search",   s);
        if (cat) params.append("category", cat);
        const { res, data } = await fetchApi(`products?${params}`, null, "GET");
        if (res.ok) { setProducts(data.products || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await loadProducts(1, "", ""); })();
    }, [loadProducts]);

    const handleDelete = async (id) => {
        const { res } = await fetchApi(`products/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success("Đã xóa sản phẩm"); loadProducts(page, search, category); }
        else messageApi.error("Xóa thất bại");
    };

    const columns = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={r.images?.[0] || "https://placehold.co/48x48/FFB347/fff?text=🐾"}
                        style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} alt={r.name} />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.category} · {r.petType}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Ảnh",
            key: "images",
            render: (_, r) => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{r.images?.length || 0} ảnh</Text>,
        },
        {
            title: "Giá",
            key: "price",
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{(r.salePrice || r.price)?.toLocaleString("vi-VN")}₫</div>
                    {r.salePrice && <div style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>{r.price?.toLocaleString("vi-VN")}₫</div>}
                </div>
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            render: v => <Tag color={v > 10 ? "green" : v > 0 ? "orange" : "red"} style={{ borderRadius: 6, fontWeight: 600 }}>{v}</Tag>,
        },
        {
            title: "Đã bán", dataIndex: "sold",
            render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
        },
        {
            title: "Đánh giá", dataIndex: "rating",
            render: (v, r) => <Text style={{ fontSize: 13 }}>⭐ {v?.toFixed(1)} ({r.reviewCount})</Text>,
        },
        {
            title: "Trạng thái", dataIndex: "isActive",
            render: v => <Tag color={v ? "green" : "red"} style={{ borderRadius: 6 }}>{v ? "Đang bán" : "Đã ẩn"}</Tag>,
        },
        {
            title: "Thao tác", key: "actions", width: 100,
            render: (_, r) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => { setEditProd(r); setModalOpen(true); }} />
                    </Tooltip>
                    <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
                        <Button size="small" icon={<DeleteOutlined />} danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>📦 Quản lý sản phẩm</Title>
                    <Text style={{ color: "#9ca3af" }}>Tổng {total} sản phẩm</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditProd(null); setModalOpen(true); }}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm sản phẩm..." value={search} allowClear size="large"
                            onChange={e => { setSearch(e.target.value); loadProducts(1, e.target.value, category); }}
                            style={{ borderRadius: 10 }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select placeholder="Lọc theo danh mục" value={category || undefined} allowClear
                            onChange={v => { setCategory(v || ""); loadProducts(1, search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} size="large" style={{ borderRadius: 10 }}
                            onClick={() => { setSearch(""); setCategory(""); loadProducts(1, "", ""); }}>
                            Đặt lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={products} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); loadProducts(p, search, category); }, showTotal: t => `Tổng ${t} sản phẩm` }}
                    scroll={{ x: 900 }} />
            </Card>

            <ProductModal open={modalOpen} onClose={() => setModalOpen(false)}
                onSuccess={() => loadProducts(page, search, category)} editProduct={editProd} />
        </ConfigProvider>
    );
}