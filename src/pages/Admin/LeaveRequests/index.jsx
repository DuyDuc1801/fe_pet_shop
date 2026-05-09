import { useState, useEffect, useCallback } from "react";
import {
    Table, Tag, Button, Select, Card, Typography, Row, Col,
    ConfigProvider, message, Modal, Input, Statistic, Avatar, Tooltip,
} from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import fetchApi from "../../../../utils/fetchApi";

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;
const PRIMARY = "#f97316";

const STATUS_CONFIG = {
    pending:  { color: "orange", label: "Chờ duyệt"    },
    approved: { color: "green",  label: "Đã duyệt"     },
    rejected: { color: "red",    label: "Đã từ chối"   },
};

export default function AdminLeaveRequests() {
    const [requests,   setRequests]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [total,      setTotal]      = useState(0);
    const [page,       setPage]       = useState(1);
    const [status,     setStatus]     = useState("pending");
    const [reviewId,   setReviewId]   = useState(null);
    const [reviewAct,  setReviewAct]  = useState(""); // "approved" | "rejected"
    const [adminNote,  setAdminNote]  = useState("");
    const [reviewing,  setReviewing]  = useState(false);
    const [messageApi, ctxHolder]     = message.useMessage();

    const PAGE_SIZE = 15;

    const load = useCallback(async (pg, st) => {
        setLoading(true);
        const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
        if (st) params.append("status", st);
        const { res, data } = await fetchApi(`leave-requests/admin?${params}`, null, "GET");
        if (res.ok) { setRequests(data.requests || []); setTotal(data.total || 0); }
        setLoading(false);
    }, []);

    useEffect(() => {
        (async () => { await load(1, "pending"); })();
    }, [load]);

    const openReview = (id, action) => { setReviewId(id); setReviewAct(action); setAdminNote(""); };

    const handleReview = async () => {
        setReviewing(true);
        const { res, data } = await fetchApi(
            `leave-requests/admin/${reviewId}/review`,
            { status: reviewAct, adminNote }, "PUT"
        );
        setReviewing(false);
        if (res.ok) {
            messageApi.success(data.message);
            setReviewId(null);
            load(page, status);
        } else {
            messageApi.error(data.message || "Thao tác thất bại");
        }
    };

    const columns = [
        {
            title: "Bác sĩ", key: "doctor",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {r.doctor?.user?.avatar
                        ? <img src={r.doctor.user.avatar} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        : <Avatar size={36} style={{ background: PRIMARY, fontWeight: 700 }}>{r.doctor?.user?.fullName?.charAt(0)}</Avatar>
                    }
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>BS. {r.doctor?.user?.fullName}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.doctor?.specialty}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Ngày nghỉ", key: "date",
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{dayjs(r.date).format("DD/MM/YYYY")}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{dayjs(r.date).format("dddd")}</div>
                </div>
            ),
            sorter: (a, b) => a.date.localeCompare(b.date),
        },
        {
            title: "Loại nghỉ", key: "type",
            render: (_, r) => (
                <div>
                    <Tag color={r.type === "full_day" ? "red" : "orange"} style={{ borderRadius: 6 }}>
                        {r.type === "full_day" ? "🚫 Cả ngày" : "⏰ Một số ca"}
                    </Tag>
                    {r.type === "partial" && r.slots?.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                            {r.slots.map(s => <Tag key={s} style={{ borderRadius: 6, fontSize: 11 }}>{s}</Tag>)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Lý do", dataIndex: "reason",
            render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
        },
        {
            title: "Ngày gửi", dataIndex: "createdAt",
            render: v => <Text style={{ fontSize: 12, color: "#9ca3af" }}>{dayjs(v).format("DD/MM/YYYY HH:mm")}</Text>,
        },
        {
            title: "Trạng thái", dataIndex: "status",
            render: s => { const c = STATUS_CONFIG[s]; return <Tag color={c.color} style={{ borderRadius: 6, fontWeight: 600 }}>{c.label}</Tag>; },
        },
        {
            title: "Thao tác", key: "actions", width: 120,
            render: (_, r) => r.status === "pending" ? (
                <div style={{ display: "flex", gap: 6 }}>
                    <Tooltip title="Duyệt">
                        <Button size="small" type="primary" icon={<CheckOutlined />}
                            onClick={() => openReview(r._id, "approved")}
                            style={{ background: "#22c55e", borderColor: "#22c55e", borderRadius: 8 }} />
                    </Tooltip>
                    <Tooltip title="Từ chối">
                        <Button size="small" danger icon={<CloseOutlined />}
                            onClick={() => openReview(r._id, "rejected")}
                            style={{ borderRadius: 8 }} />
                    </Tooltip>
                </div>
            ) : <Tag color={STATUS_CONFIG[r.status].color} style={{ borderRadius: 6 }}>{STATUS_CONFIG[r.status].label}</Tag>,
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            {ctxHolder}

            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>📋 Duyệt yêu cầu nghỉ phép</Title>
                <Text style={{ color: "#9ca3af" }}>Xem xét và phê duyệt yêu cầu nghỉ của bác sĩ</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", marginBottom: 20 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Select value={status} onChange={v => { setStatus(v); setPage(1); load(1, v); }} style={{ width: "100%" }} size="large">
                            <Option value="">Tất cả</Option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <Option key={k} value={k}>{v.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={() => load(page, status)} size="large" style={{ borderRadius: 10 }}>Làm mới</Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                <Table dataSource={requests} columns={columns} rowKey="_id" loading={loading}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: p => { setPage(p); load(p, status); }, showTotal: t => `Tổng ${t} yêu cầu` }}
                    scroll={{ x: 800 }}
                    rowClassName={r => r.status === "pending" ? "row-pending" : ""}
                />
            </Card>

            {/* Modal duyệt / từ chối */}
            <Modal
                title={reviewAct === "approved" ? "✅ Duyệt yêu cầu nghỉ" : "❌ Từ chối yêu cầu nghỉ"}
                open={!!reviewId} onCancel={() => setReviewId(null)}
                footer={[
                    <Button key="c" onClick={() => setReviewId(null)} style={{ borderRadius: 8 }}>Hủy</Button>,
                    <Button key="ok" type="primary" loading={reviewing} onClick={handleReview}
                        style={{ background: reviewAct === "approved" ? "#22c55e" : "#ef4444", borderColor: reviewAct === "approved" ? "#22c55e" : "#ef4444", borderRadius: 8 }}>
                        {reviewAct === "approved" ? "✅ Xác nhận duyệt" : "❌ Xác nhận từ chối"}
                    </Button>,
                ]}>
                <Text style={{ display: "block", marginBottom: 12, color: "#6b7280" }}>Ghi chú cho bác sĩ (tùy chọn):</Text>
                <TextArea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                    placeholder={reviewAct === "approved" ? "VD: Đã duyệt. Chúc nghỉ ngơi vui vẻ!" : "VD: Ngày này có nhiều lịch hẹn, vui lòng sắp xếp lại."}
                    style={{ borderRadius: 10 }} />
            </Modal>

            <style>{`.row-pending { background: #fffbf0 !important; }.row-pending:hover > td { background: #fff7ed !important; }`}</style>
        </ConfigProvider>
    );
}