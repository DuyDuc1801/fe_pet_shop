import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Card, Modal, Form,
    InputNumber, Typography, Row, Col, Tooltip, ConfigProvider,
    message, Popconfirm, Divider, Avatar, Statistic, DatePicker,
    AutoComplete,
} from "antd";
import {
    PlusOutlined, DeleteOutlined, SearchOutlined,
    ReloadOutlined, EyeOutlined, DollarOutlined, InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;
const PRIMARY = "#f97316";

const PAYMENT_STATUS = {
    unpaid:  { color: "red",    label: "Chưa TT"       },
    partial: { color: "orange", label: "TT một phần"   },
    paid:    { color: "green",  label: "Đã thanh toán" },
};

// ── Import Form Modal ─────────────────────────────────────────────
function ImportModal({ open, onClose, onSuccess }) {
    const [form]      = Form.useForm();
    const [items,     setItems]     = useState([{ product: "", productName: "", quantity: 1, costPrice: 0, note: "" }]);
    const [products,  setProducts]  = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [messageApi, ctxHolder]   = message.useMessage();

    useEffect(() => {
        if (!open) return;
        const fetchProducts = async () => {
            form.resetFields();
            setItems([{ product: "", productName: "", quantity: 1, costPrice: 0, note: "" }]);
            fetchApi("products?limit=200", null, "GET").then(({ res, data }) => {
                if (res.ok) setProducts(data.products || []);
            });
        };
        fetchProducts();
        
    }, [open]);

    const addItem = () => setItems(prev => [...prev, { product: "", productName: "", quantity: 1, costPrice: 0, note: "" }]);
    const removeItem = i => setItems(prev => prev.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
    const selectProduct = (i, prod) => {
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, product: prod._id, productName: prod.name } : item));
    };

    const totalAmount = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.costPrice)), 0);

    const handleSubmit = async (values) => {
        const validItems = items.filter(i => i.product && i.quantity > 0 && i.costPrice >= 0);
        if (!validItems.length) { messageApi.error("Thêm ít nhất 1 sản phẩm hợp lệ!"); return; }

        setLoading(true);
        const { res, data } = await fetchApi("admin/inventory", {
            ...values,
            items:       validItems,
            importDate:  values.importDate?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
            paidAmount:  values.paidAmount || 0,
        }, "POST");
        setLoading(false);

        if (res.ok) { messageApi.success(data.message); onSuccess(); onClose(); }
        else messageApi.error(data.message || "Tạo phiếu nhập thất bại");
    };

    return (
        <Modal title={<span style={{ fontWeight: 700 }}>📦 Tạo phiếu nhập hàng</span>}
            open={open} onCancel={onClose} footer={null} width={800} destroyOnClose>
            {ctxHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} style={{ marginTop: 12 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="supplier" label={<b>Nhà cung cấp <span style={{ color: "#ef4444" }}>*</span></b>}
                            rules={[{ required: true, message: "Nhập tên nhà cung cấp" }]}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="VD: Công ty ABC" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="supplierPhone" label={<b>SĐT nhà cung cấp</b>}>
                            <Input size="large" style={{ borderRadius: 10 }} placeholder="0912..." />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="importDate" label={<b>Ngày nhập <span style={{ color: "#ef4444" }}>*</span></b>} initialValue={dayjs()}>
                            <DatePicker size="large" style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Danh sách sản phẩm nhập */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <Text style={{ fontWeight: 700 }}>Danh sách sản phẩm <span style={{ color: "#ef4444" }}>*</span></Text>
                        <Button size="small" icon={<PlusOutlined />} onClick={addItem} style={{ borderRadius: 8, borderColor: PRIMARY, color: PRIMARY }}>Thêm dòng</Button>
                    </div>

                    {/* Header */}
                    <Row gutter={8} style={{ marginBottom: 6, padding: "0 4px" }}>
                        {["Sản phẩm", "SL", "Giá nhập (₫)", "Thành tiền", "Ghi chú", ""].map(h => (
                            <Col key={h} span={h === "Sản phẩm" ? 8 : h === "" ? 1 : 3}>
                                <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{h}</Text>
                            </Col>
                        ))}
                    </Row>

                    {items.map((item, i) => (
                        <Row key={i} gutter={8} style={{ marginBottom: 8, alignItems: "center" }}>
                            <Col span={8}>
                                <Select showSearch placeholder="Tìm sản phẩm..." style={{ width: "100%" }} size="small"
                                    optionFilterProp="label"
                                    value={item.product || undefined}
                                    onChange={(val, opt) => selectProduct(i, { _id: val, name: opt.label })}>
                                    {products.map(p => (
                                        <Option key={p._id} value={p._id} label={p.name}>
                                            {p.images?.[0] && <img src={p.images[0]} style={{ width: 18, height: 18, borderRadius: 4, objectFit: "cover", marginRight: 6 }} />}
                                            {p.name} — Tồn: {p.stock}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={3}>
                                <InputNumber size="small" min={1} value={item.quantity} style={{ width: "100%" }}
                                    onChange={v => updateItem(i, "quantity", v || 1)} />
                            </Col>
                            <Col span={3}>
                                <InputNumber size="small" min={0} value={item.costPrice} style={{ width: "100%" }}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={v => v.replace(/,/g, "")}
                                    onChange={v => updateItem(i, "costPrice", v || 0)} />
                            </Col>
                            <Col span={3}>
                                <Text style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>
                                    {(item.quantity * item.costPrice).toLocaleString("vi-VN")}₫
                                </Text>
                            </Col>
                            <Col span={5}>
                                <Input size="small" placeholder="Ghi chú..." value={item.note}
                                    onChange={e => updateItem(i, "note", e.target.value)} style={{ borderRadius: 6 }} />
                            </Col>
                            <Col span={1}>
                                {items.length > 1 && (
                                    <Button size="small" danger type="text" onClick={() => removeItem(i)}>✕</Button>
                                )}
                            </Col>
                        </Row>
                    ))}

                    <div style={{ textAlign: "right", padding: "10px 4px 0", borderTop: "1px solid #f3f4f6", marginTop: 8 }}>
                        <Text style={{ fontWeight: 700, fontSize: 15 }}>Tổng tiền: </Text>
                        <Text style={{ fontWeight: 800, fontSize: 18, color: PRIMARY }}>{totalAmount.toLocaleString("vi-VN")}₫</Text>
                    </div>
                </div>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="paidAmount" label={<b>Đã thanh toán (₫)</b>} initialValue={0}>
                            <InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0}
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={v => v.replace(/,/g, "")} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="paymentMethod" label={<b>Phương thức TT</b>} initialValue="cash">
                            <Select size="large">
                                <Option value="cash">💵 Tiền mặt</Option>
                                <Option value="transfer">🏦 Chuyển khoản</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="note" label={<b>Ghi chú phiếu nhập</b>}>
                            <TextArea rows={2} style={{ borderRadius: 10 }} placeholder="Ghi chú thêm..." />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button onClick={onClose} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600 }}>
                        Tạo phiếu nhập
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────
function DetailModal({ imp, open, onClose, onPayment }) {
    const [paid,    setPaid]    = useState(imp?.paidAmount || 0);
    const [saving,  setSaving]  = useState(false);
    const [messageApi, ctxHolder] = message.useMessage();

    useEffect(() => {
        const handleSet = () => {setPaid(imp.paidAmount); }; 
        if (imp) {
            handleSet();
        }
    }, [imp]);

    const handlePayment = async () => {
        setSaving(true);
        const { res, data } = await fetchApi(`admin/inventory/${imp._id}/payment`, { paidAmount: paid }, "PUT");
        setSaving(false);
        if (res.ok) { messageApi.success("Cập nhật thanh toán thành công!"); onPayment(data.import); }
        else messageApi.error(data.message || "Thất bại");
    };

    if (!imp) return null;

    return (
        <Modal title={<span style={{ fontWeight: 700 }}>📄 {imp.importCode}</span>}
            open={open} onCancel={onClose} footer={null} width={620}>
            {ctxHolder}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                    ["Nhà cung cấp",  imp.supplier],
                    ["SĐT",           imp.supplierPhone || "—"],
                    ["Ngày nhập",     dayjs(imp.importDate).format("DD/MM/YYYY")],
                    ["Người nhập",    imp.createdBy?.fullName],
                ].map(([k, v]) => (
                    <div key={k} style={{ flex: "0 0 calc(50% - 10px)" }}>
                        <Text style={{ fontSize: 12, color: "#9ca3af", display: "block" }}>{k}</Text>
                        <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>Sản phẩm nhập</Text>
                {imp.items?.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{item.productName}</div>
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>x{item.quantity} × {item.costPrice?.toLocaleString("vi-VN")}₫</div>
                        </div>
                        <Text style={{ fontWeight: 700, color: PRIMARY }}>{item.totalCost?.toLocaleString("vi-VN")}₫</Text>
                    </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0 0", fontWeight: 700, fontSize: 15 }}>
                    Tổng: <span style={{ color: PRIMARY, marginLeft: 8 }}>{imp.totalAmount?.toLocaleString("vi-VN")}₫</span>
                </div>
            </div>

            <Divider />
            <Text style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>Cập nhật thanh toán</Text>
            <Row gutter={12} align="middle">
                <Col flex="1">
                    <InputNumber value={paid} onChange={setPaid} min={0} max={imp.totalAmount}
                        style={{ width: "100%" }} size="large"
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={v => v.replace(/,/g, "")} addonAfter="₫" />
                </Col>
                <Col>
                    <Button type="primary" loading={saving} onClick={handlePayment}
                        style={{ background: "#22c55e", borderColor: "#22c55e", borderRadius: 8, fontWeight: 600 }}>
                        Lưu TT
                    </Button>
                </Col>
            </Row>
        </Modal>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AdminInventory() {
    const [imports,    setImports]    = useState([]);
    const [stats,      setStats]      = useState({ totalAmount: 0, totalPaid: 0 });
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [page,       setPage]       = useState(1);
    const [search,     setSearch]     = useState("");
    const [pymStatus,  setPymStatus]  = useState("");
    const [modalOpen,  setModalOpen]  = useState(false);
    const [detailImp,  setDetailImp]  = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    const PAGE_SIZE = 15;

    const load = useCallback(async (pg, s, pym) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (s)   params.append("search",        s);
        if (pym) params.append("paymentStatus", pym);
        const { res, data } = await fetchApi(`admin/inventory?${params}`, null, "GET");
        if (res.ok) { setImports(data.imports || []); setTotal(data.total || 0); setStats(data.stats || {}); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(1, "", ""); })();
    }, [load]);

    const handleDelete = async (id) => {
        const { res, data } = await fetchApi(`admin/inventory/${id}`, null, "DELETE");
        if (res.ok) { messageApi.success(data.message); load(page, search, pymStatus); }
        else messageApi.error("Xóa thất bại");
    };

    const columns = [
        {
            title: "Mã phiếu", dataIndex: "importCode",
            render: v => <Text style={{ fontWeight: 700, color: PRIMARY, fontFamily: "monospace", fontSize: 13 }}>{v}</Text>,
        },
        {
            title: "Nhà cung cấp", dataIndex: "supplier",
            render: v => <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text>,
        },
        {
            title: "Ngày nhập", dataIndex: "importDate",
            render: v => <Text style={{ fontSize: 13 }}>{dayjs(v).format("DD/MM/YYYY")}</Text>,
            sorter: (a, b) => a.importDate.localeCompare(b.importDate),
        },
        {
            title: "SP", key: "items",
            render: (_, r) => <Text style={{ fontSize: 13 }}>{r.items?.length} sp</Text>,
        },
        {
            title: "Tổng tiền", dataIndex: "totalAmount",
            render: v => <Text style={{ fontWeight: 700, fontSize: 13 }}>{v?.toLocaleString("vi-VN")}₫</Text>,
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: "Thanh toán", key: "payment",
            render: (_, r) => (
                <div>
                    <Tag color={PAYMENT_STATUS[r.paymentStatus]?.color} style={{ borderRadius: 6, fontWeight: 600 }}>
                        {PAYMENT_STATUS[r.paymentStatus]?.label}
                    </Tag>
                    {r.paymentStatus !== "paid" && (
                        <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>
                            Còn: {(r.totalAmount - r.paidAmount).toLocaleString("vi-VN")}₫
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Người nhập", dataIndex: "createdBy",
            render: v => <Text style={{ fontSize: 12, color: "#6b7280" }}>{v?.fullName}</Text>,
        },
        {
            title: "Thao tác", key: "actions", width: 110,
            render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Tooltip title="Xem chi tiết">
                        <Button size="small" icon={<EyeOutlined />} style={{ borderRadius: 8 }}
                            onClick={() => { setDetailImp(r); setDetailOpen(true); }} />
                    </Tooltip>
                    <Popconfirm title="Xóa phiếu nhập & hoàn lại tồn kho?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
                        <Button size="small" icon={<DeleteOutlined />} danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>📦 Nhập hàng</Title>
                    <Text style={{ color: "#9ca3af" }}>Quản lý phiếu nhập và tồn kho sản phẩm</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600 }}>
                    Tạo phiếu nhập
                </Button>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[
                    { label: "Tổng tiền nhập", val: stats.totalAmount, color: PRIMARY,   bg: "#fff7ed", icon: <InboxOutlined />   },
                    { label: "Đã thanh toán",  val: stats.totalPaid,   color: "#22c55e", bg: "#f0fdf4", icon: <DollarOutlined /> },
                    { label: "Còn nợ",  val: (stats.totalAmount - stats.totalPaid), color: "#ef4444", bg: "#fff1f2", icon: <DollarOutlined /> },
                ].map(s => (
                    <Col xs={24} sm={8} key={s.label}>
                        <Card bordered={false} style={{ borderRadius: 14, border: "1.5px solid #f3f4f6" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Text style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>{s.label}</Text>
                                    <Text style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val?.toLocaleString("vi-VN")}₫</Text>
                                </div>
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10}>
                        <Input prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="Tìm mã phiếu, nhà cung cấp..." value={search} allowClear size="large"
                            style={{ borderRadius: 10 }}
                            onChange={e => { setSearch(e.target.value); load(1, e.target.value, pymStatus); }} />
                    </Col>
                    <Col xs={24} sm={7}>
                        <Select placeholder="Trạng thái TT" value={pymStatus || undefined} allowClear
                            onChange={v => { setPymStatus(v || ""); load(1, search, v || ""); }}
                            style={{ width: "100%" }} size="large">
                            {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setPymStatus(""); load(1, "", ""); }} size="large" style={{ borderRadius: 10 }}>Đặt lại</Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={imports} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); load(p, search, pymStatus); }, showTotal: t => `Tổng ${t} phiếu nhập` }}
                    scroll={{ x: 900 }} />
            </Card>

            <ImportModal open={modalOpen} onClose={() => setModalOpen(false)}
                onSuccess={() => { load(page, search, pymStatus); }} />

            <DetailModal imp={detailImp} open={detailOpen}
                onClose={() => { setDetailOpen(false); setDetailImp(null); }}
                onPayment={updated => { setImports(prev => prev.map(i => i._id === updated._id ? { ...i, ...updated } : i)); }} />
        </ConfigProvider>
    );
}