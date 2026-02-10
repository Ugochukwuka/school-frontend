"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Select, Table, Space, Tabs, Button, Modal, Form, InputNumber, Checkbox, message } from "antd";
import { DownloadOutlined, DollarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Child {
  uuid: string;
  name: string;
  email: string;
  class_name?: string;
}

interface FeePayment {
  student_fee_id: number;
  fee_id: number;
  fee_name: string | null;
  amount_due: string;
  amount_paid: string;
  status: string;
  payments: string[]; // Array of payment references like ["PAY-MDX3OUKP8W"]
}

interface PaymentHistoryResponse {
  status: boolean;
  type: string;
  student: {
    id: number;
    uuid: string;
    name: string;
  };
  fees: FeePayment[];
  message?: string;
}

interface Payment {
  student_fee_id: number;
  fee_id: number;
  fee_name: string | null;
  fee_type?: string; // For display purposes
  amount_due: string;
  amount_paid: string;
  status: string;
  payments: string[]; // Array of payment references
  reference?: string; // First payment reference for download
  [key: string]: any;
}

interface FeeObligation {
  fee_id: number;
  fee_type: string;
  amount_due: string;
  amount_paid: string;
  status: string;
  balance?: string;
  [key: string]: any;
}

interface FeeObligationsResponse {
  status: boolean;
  type: string;
  student_id: number;
  fees: FeeObligation[];
  message?: string;
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
  id: number;
  name: string;
}

interface Class {
  class_id: number;
  class_name: string;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface TermsResponse {
  status: string;
  session_id: string;
  terms: Term[];
  message?: string;
}

interface ClassResponse {
  status: string;
  student: {
    uuid: string;
    name: string;
  };
  class: {
    class_id: number;
    class_name: string;
  };
  message?: string;
}

interface ApiResponse {
  data: Child[] | Payment[] | FeeObligation[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

interface PaymentAllocation {
  fee_id: number;
  amount: number;
}

interface PaymentRequest {
  parent_uuid: string;
  student_uuid: string;
  payment_method: string;
  allocations: PaymentAllocation[];
}

interface PaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    amount: number;
    paid_at: string;
  };
}

export default function ParentFeesPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [obligations, setObligations] = useState<FeeObligation[]>([]);
  const [selectedChildUuid, setSelectedChildUuid] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("history");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingObligations, setLoadingObligations] = useState(false);
  const [error, setError] = useState("");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedFees, setSelectedFees] = useState<Record<number, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChildren();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchTerms(currentSession.id);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedSessionId && selectedChildUuid) {
      fetchTerms(selectedSessionId);
      fetchClass(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
      setStudentClass(null);
      setClassId(null);
    }
  }, [selectedSessionId, selectedChildUuid]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedChildUuid && selectedSessionId && selectedTermId && classId) {
      if (activeTab === "history") {
        fetchPaymentHistory();
        // Also fetch obligations for payment modal
        fetchFeeObligations();
      } else {
        fetchFeeObligations();
      }
    } else {
      setPayments([]);
      setObligations([]);
    }
  }, [selectedChildUuid, selectedSessionId, selectedTermId, classId, activeTab]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children`,
        getAuthHeaders()
      );

      let childrenData: Child[] = [];
      if (Array.isArray(response.data)) {
        childrenData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        childrenData = response.data.data;
      } else if ((response.data as any).children && Array.isArray((response.data as any).children)) {
        childrenData = (response.data as any).children;
      }

      setChildren(childrenData);
      if (childrenData.length === 1) {
        setSelectedChildUuid(childrenData[0].uuid);
      }
    } catch (err: any) {
      console.error("Error fetching children:", err);
      setError(err.response?.data?.message || "Failed to load children. Please try again.");
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await axios.get<SessionsResponse | Session[]>(
        "http://127.0.0.1:8000/api/viewsessions",
        getAuthHeaders()
      );

      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      } else if (response.data?.status === "error") {
        throw new Error(response.data.message || "Failed to fetch sessions");
      }

      sessionsData.sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        return b.name.localeCompare(a.name);
      });

      setSessions(sessionsData);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.response?.data?.message || "Failed to load sessions. Please try again.");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTerms = async (sessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null);

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        if (response.data.terms.length > 0) {
          setSelectedTermId(response.data.terms[0].id);
        }
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      setError(err.response?.data?.message || "Failed to load terms. Please try again.");
      setTerms([]);
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchClass = async (sessionId: number) => {
    if (!selectedChildUuid) return;

    setLoadingClass(true);
    setError("");

    try {
      const response = await axios.get<ClassResponse>(
        `http://127.0.0.1:8000/api/users/${selectedChildUuid}/class/by/session/${sessionId}`,
        getAuthHeaders()
      );

      console.log("Class response:", response.data);

      if (response.data.status === "success" && response.data.class) {
        setStudentClass({
          class_id: response.data.class.class_id,
          class_name: response.data.class.class_name,
        });
        setClassId(response.data.class.class_id);
      }
    } catch (err: any) {
      console.error("Error fetching class:", err);
      setStudentClass(null);
      setClassId(null);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!selectedChildUuid || !selectedSessionId || !selectedTermId || !classId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<PaymentHistoryResponse>(
        `http://127.0.0.1:8000/api/view/child/payment/history`,
        {
          student_uuid: selectedChildUuid,
          session_id: selectedSessionId,
          term_id: selectedTermId,
          class_id: classId,
        },
        getAuthHeaders()
      );

      console.log("Payment history response:", response.data);

      if (response.data.status && response.data.fees && Array.isArray(response.data.fees)) {
        // Map the fees array to Payment format
        const paymentsData: Payment[] = response.data.fees.map((fee: FeePayment) => {
          // Get the first payment reference from the payments array
          const firstPaymentRef = fee.payments && fee.payments.length > 0 ? fee.payments[0] : null;
          
          return {
            student_fee_id: fee.student_fee_id,
            fee_id: fee.fee_id,
            fee_name: fee.fee_name,
            fee_type: fee.fee_name || `Fee ${fee.fee_id}`, // Use fee_name or fallback
            amount_due: fee.amount_due,
            amount_paid: fee.amount_paid,
            status: fee.status,
            payments: fee.payments || [],
            reference: firstPaymentRef, // First payment reference for download
          };
        });
        setPayments(paymentsData);
      } else {
        setPayments([]);
        setError(response.data.message || "No payment history found.");
      }
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Failed to load payment history. Please try again.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeObligations = async () => {
    if (!selectedChildUuid || !selectedSessionId || !selectedTermId || !classId) return;

    setLoadingObligations(true);
    setError("");

    try {
      const response = await axios.get<FeeObligationsResponse>(
        `http://127.0.0.1:8000/api/view/child/fees/obligations?student_uuid=${selectedChildUuid}&session_id=${selectedSessionId}&term_id=${selectedTermId}&class_id=${classId}`,
        getAuthHeaders()
      );

      console.log("Fee obligations response:", response.data);

      if (response.data.status && response.data.fees && Array.isArray(response.data.fees)) {
        // Map the fees array and calculate balance
        const obligationsData: FeeObligation[] = response.data.fees.map((fee: FeeObligation) => {
          const amountDue = parseFloat(fee.amount_due || "0");
          const amountPaid = parseFloat(fee.amount_paid || "0");
          const balance = amountDue - amountPaid;
          
          return {
            ...fee,
            balance: balance.toFixed(2),
          };
        });
        setObligations(obligationsData);
      } else {
        setObligations([]);
        setError(response.data.message || "No fee obligations found.");
      }
    } catch (err: any) {
      console.error("Error fetching fee obligations:", err);
      // Don't set error for obligations if we're on history tab (it's fetched in background)
      if (activeTab === "obligations") {
        setError(err.response?.data?.message || "Failed to load fee obligations. Please try again.");
      }
      setObligations([]);
    } finally {
      setLoadingObligations(false);
    }
  };

  const getParentUuid = (): string | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.uuid || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const handleOpenPaymentModal = () => {
    if (!selectedChildUuid) {
      message.error("Please select a child first");
      return;
    }
    if (obligations.length === 0) {
      message.error("No fee obligations available. Please select session, term, and ensure obligations are loaded.");
      return;
    }
    // Initialize selected fees with balances
    const initialFees: Record<number, number> = {};
    obligations.forEach((obligation) => {
      if (obligation.fee_id) {
        const balance = parseFloat(obligation.balance || "0");
        if (balance > 0) {
          initialFees[obligation.fee_id] = balance;
        }
      }
    });
    setSelectedFees(initialFees);
    form.resetFields();
    setPaymentModalVisible(true);
  };

  const handlePayment = async () => {
    if (!selectedChildUuid) {
      message.error("Please select a child");
      return;
    }

    const parentUuid = getParentUuid();
    if (!parentUuid) {
      message.error("Parent information not found. Please log in again.");
      return;
    }

    // Build allocations array from selected fees
    const allocations: PaymentAllocation[] = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([feeId, amount]) => ({
        fee_id: parseInt(feeId),
        amount: amount,
      }));

    if (allocations.length === 0) {
      message.error("Please select at least one fee to pay");
      return;
    }

    setPaymentLoading(true);
    try {
      const paymentData: PaymentRequest = {
        parent_uuid: parentUuid,
        student_uuid: selectedChildUuid,
        payment_method: "paystack",
        allocations: allocations,
      };

      const response = await axios.post<PaymentResponse>(
        "http://127.0.0.1:8000/api/fees/pay",
        paymentData,
        getAuthHeaders()
      );

      if (response.data.status && response.data.data?.authorization_url) {
        message.success(response.data.message || "Payment initiated successfully");
        setPaymentModalVisible(false);
        // Redirect to Paystack
        window.location.href = response.data.data.authorization_url;
      } else {
        message.error(response.data.message || "Payment failed");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      message.error(
        err.response?.data?.message || "Failed to process payment. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownloadReceipt = async (reference: string) => {
    if (!reference) {
      setError("Payment reference not available for this record.");
      return;
    }

    try {
      console.log("Downloading receipt with reference:", reference);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/payments/${reference}/downloadReceipt`,
        {
          responseType: "blob",
          ...getAuthHeaders(),
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt_${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading receipt:", err);
      console.error("Reference used:", reference);
      if (err.response?.status === 404) {
        setError(`Receipt not found for reference: ${reference}. Please verify the payment reference is correct.`);
      } else {
        setError(err.response?.data?.message || "Failed to download receipt. Please try again.");
      }
    }
  };

  const paymentColumns = [
    {
      title: "Fee Type",
      key: "fee_type",
      render: (_: any, record: Payment) => record.fee_name || record.fee_type || `Fee ${record.fee_id}`,
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{
          color: status === "paid" ? "green" : status === "part_paid" ? "orange" : "red",
          fontWeight: 500,
          textTransform: "capitalize",
        }}>
          {status?.replace("_", " ") || "N/A"}
        </span>
      ),
    },
    {
      title: "Payment Reference(s)",
      key: "payments",
      render: (_: any, record: Payment) => {
        if (record.payments && record.payments.length > 0) {
          return record.payments.join(", ");
        }
        return "-";
      },
    },
  ];

  const obligationColumns = [
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Balance",
      key: "balance",
      render: (_: any, record: FeeObligation) => {
        const amountDue = parseFloat(record.amount_due || "0");
        const amountPaid = parseFloat(record.amount_paid || "0");
        const balance = amountDue - amountPaid;
        return `₦${balance.toLocaleString()}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{
          color: status === "paid" ? "green" : status === "part_paid" ? "orange" : "red",
          fontWeight: 500,
          textTransform: "capitalize",
        }}>
          {status?.replace("_", " ") || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Fees & Payments</h1>
        
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        <Space orientation="vertical" size="large" style={{ width: "100%", marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Select Child</label>
            <Select
              style={{ width: "100%", maxWidth: 400 }}
              value={selectedChildUuid}
              onChange={setSelectedChildUuid}
              placeholder="Select a child"
              loading={loadingChildren}
              options={children.map((child) => ({
                value: child.uuid,
                label: `${child.name}${child.class_name ? ` (${child.class_name})` : ""}`,
              }))}
            />
          </div>

          {selectedChildUuid && (
            <Space wrap>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Session</label>
                <Select
                  style={{ width: 200 }}
                  value={selectedSessionId}
                  onChange={setSelectedSessionId}
                  placeholder="Select Session"
                  loading={loadingSessions}
                  options={sessions.map((session) => ({
                    value: session.id,
                    label: `${session.name}${session.current ? " (Current)" : ""}`,
                  }))}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Term</label>
                <Select
                  style={{ width: 200 }}
                  value={selectedTermId}
                  onChange={setSelectedTermId}
                  placeholder="Select Term"
                  loading={loadingTerms}
                  disabled={!selectedSessionId || loadingTerms}
                  options={terms.map((term) => ({
                    value: term.id,
                    label: term.name,
                  }))}
                />
              </div>
              {studentClass && (
                <div style={{ padding: "4px 11px", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fafafa", alignSelf: "flex-end" }}>
                  Class: {studentClass.class_name}
                </div>
              )}
            </Space>
          )}
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === "history" && selectedChildUuid && obligations.length > 0 ? (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={handleOpenPaymentModal}
                style={{ marginRight: 8 }}
              >
                Pay Fee
              </Button>
            ) : null
          }
          items={[
            {
              key: "history",
              label: "Payment History",
              children: (
                <>
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                      <Spin size="large" />
                    </div>
                  ) : payments.length > 0 ? (
                    <>
                      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => {
                            // Find the first payment with a valid reference
                            const paymentWithRef = payments.find(p => p.reference);
                            if (paymentWithRef && paymentWithRef.reference) {
                              handleDownloadReceipt(paymentWithRef.reference);
                            } else {
                              setError("No payment reference available for receipt download.");
                            }
                          }}
                          disabled={!payments.some(p => p.reference)}
                        >
                          Download Receipt
                        </Button>
                      </div>
                      <Table
                        dataSource={payments}
                        columns={paymentColumns}
                        rowKey={(record) => `payment-${record.student_fee_id}`}
                        pagination={false}
                      />
                    </>
                  ) : selectedChildUuid && selectedSessionId && selectedTermId && classId ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      No payment history found.
                    </div>
                  ) : null}
                </>
              ),
            },
            {
              key: "obligations",
              label: "Fee Obligations",
              children: (
                <>
                  {loadingObligations ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                      <Spin size="large" />
                    </div>
                  ) : obligations.length > 0 ? (
                    <Table
                      dataSource={obligations}
                      columns={obligationColumns}
                      rowKey={(record) => `obligation-${record.fee_id}`}
                      pagination={false}
                    />
                  ) : selectedChildUuid && selectedSessionId && selectedTermId && classId ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      No fee obligations found.
                    </div>
                  ) : null}
                </>
              ),
            },
          ]}
        />

        {/* Payment Modal */}
        <Modal
          title="Pay Fees"
          open={paymentModalVisible}
          onOk={handlePayment}
          onCancel={() => {
            setPaymentModalVisible(false);
            setSelectedFees({});
            form.resetFields();
          }}
          confirmLoading={paymentLoading}
          width={600}
          okText="Proceed to Payment"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Alert
              message="Select fees and enter amounts to pay"
              description="You can pay multiple fees at once. Enter the amount you want to pay for each selected fee."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />

            {obligations.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {obligations.map((obligation) => {
                  if (!obligation.fee_id) return null;
                  
                  const balance = parseFloat(obligation.balance || "0");
                  const amountDue = parseFloat(obligation.amount_due || "0");
                  
                  if (balance <= 0) return null;

                  return (
                    <Card
                      key={obligation.fee_id}
                      size="small"
                      style={{ marginBottom: 12 }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Checkbox
                            checked={selectedFees[obligation.fee_id] !== undefined && selectedFees[obligation.fee_id] > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFees({
                                  ...selectedFees,
                                  [obligation.fee_id!]: balance,
                                });
                              } else {
                                const newFees = { ...selectedFees };
                                delete newFees[obligation.fee_id!];
                                setSelectedFees(newFees);
                              }
                            }}
                          >
                            <strong>{obligation.fee_type}</strong>
                          </Checkbox>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }}>
                          <span>Amount Due: ₦{amountDue.toLocaleString()}</span>
                          <span>Balance: ₦{balance.toLocaleString()}</span>
                        </div>
                        {selectedFees[obligation.fee_id] !== undefined && selectedFees[obligation.fee_id] > 0 && (
                          <Form.Item
                            label="Amount to Pay"
                            name={`amount_${obligation.fee_id}`}
                            rules={[
                              { required: true, message: "Please enter amount" },
                              {
                                validator: (_, value) => {
                                  if (value <= 0) {
                                    return Promise.reject("Amount must be greater than 0");
                                  }
                                  if (value > balance) {
                                    return Promise.reject(`Amount cannot exceed balance of ₦${balance.toLocaleString()}`);
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            initialValue={balance}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              prefix="₦"
                              min={0}
                              max={balance}
                              step={100}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              parser={(value) => value!.replace(/\₦\s?|(,*)/g, "")}
                              onChange={(value) => {
                                if (value !== null && value > 0) {
                                  setSelectedFees({
                                    ...selectedFees,
                                    [obligation.fee_id!]: value,
                                  });
                                } else {
                                  const newFees = { ...selectedFees };
                                  delete newFees[obligation.fee_id!];
                                  setSelectedFees(newFees);
                                }
                              }}
                            />
                          </Form.Item>
                        )}
                      </Space>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert
                message="No fee obligations available"
                description="Please select a child, session, and term to view fee obligations."
                type="warning"
                showIcon
              />
            )}

            {Object.keys(selectedFees).length > 0 && (
              <div style={{ marginTop: 20, padding: 12, background: "#f0f0f0", borderRadius: 4 }}>
                <strong>Total Amount: ₦{Object.values(selectedFees).reduce((sum, amount) => sum + amount, 0).toLocaleString()}</strong>
              </div>
            )}
          </Form>
        </Modal>
      </Card>
    </DashboardLayout>
  );
}

