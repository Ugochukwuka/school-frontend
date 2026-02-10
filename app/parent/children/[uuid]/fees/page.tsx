"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Button, Tabs, Modal, Form, InputNumber, Checkbox, message } from "antd";
import { DownloadOutlined, DollarOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Payment {
  id: number;
  reference: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  fee_type?: string;
  [key: string]: any;
}

interface FeeObligation {
  id: number;
  fee_id?: number;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: string;
  due_date?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Payment[] | FeeObligation[];
  current_page?: number;
  last_page?: number;
  total?: number;
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

interface PaymentAllocation {
  fee_id: number;
  amount: number;
}

interface PaymentFormData {
  allocations: Record<number, number>; // fee_id -> amount
}

interface PaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url?: string;
    reference: string;
    amount: number;
    paid_at?: string;
  };
}

interface WebhookResponse {
  status: boolean;
}

export default function ChildFeesPage() {
  const params = useParams();
  const childUuid = params.uuid as string;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [obligations, setObligations] = useState<FeeObligation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("paystack");
  const [pendingPaymentReference, setPendingPaymentReference] = useState<string | null>(null);
  const [paymentForm] = Form.useForm();
  const [selectedFees, setSelectedFees] = useState<Record<number, boolean>>({});

  // Get parent UUID from localStorage
  const getParentUuid = () => {
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

  const parentUuid = getParentUuid();

  useEffect(() => {
    // Check for pending payment verification on mount
    const storedReference = localStorage.getItem("pending_payment_reference");
    if (storedReference) {
      setPendingPaymentReference(storedReference);
      // Don't auto-verify on mount, let user trigger it manually if needed
      localStorage.removeItem("pending_payment_reference");
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    if (childUuid) {
      fetchSessions();
    }
  }, [childUuid]);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
        fetchTerms(currentSession.id);
        fetchClass(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch terms and class when session changes
  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
      fetchClass(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
      setStudentClass(null);
      setClassId(null);
    }
  }, [sessionId]);

  // Auto-select first term when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms]);

  // Fetch data when all required fields are selected
  useEffect(() => {
    if (childUuid && sessionId && termId && classId) {
      if (activeTab === "history") {
        fetchPaymentHistory();
      } else {
        fetchFeeObligations();
      }
    }
  }, [childUuid, activeTab, sessionId, termId, classId]);

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
    setTermId(null);

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        if (response.data.terms.length > 0) {
          setTermId(response.data.terms[0].id);
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

  const fetchClass = async (sessionId?: number) => {
    if (!childUuid) return;

    setLoadingClass(true);
    setError("");

    try {
      // Try with session_id if available, otherwise use base endpoint
      const url = sessionId 
        ? `http://127.0.0.1:8000/api/users/${childUuid}/class/by/session/${sessionId}`
        : `http://127.0.0.1:8000/api/users/${childUuid}/class`;
      
      const response = await axios.get<ClassResponse>(
        url,
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
      // Don't set error here as it's not critical - class might not be available
      setStudentClass(null);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!childUuid || !sessionId || !termId || !classId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<ApiResponse>(
        `http://127.0.0.1:8000/api/view/child/payment/history`,
        {
          student_uuid: childUuid,
          session_id: sessionId,
          term_id: termId,
          class_id: classId,
        },
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setPayments(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setPayments(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setPayments([]);
      }
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      setError(
        err.response?.data?.message || "Failed to load payment history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeObligations = async () => {
    if (!childUuid || !sessionId || !termId || !classId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/view/child/fees/obligations?student_uuid=${childUuid}&session_id=${sessionId}&term_id=${termId}&class_id=${classId}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setObligations(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setObligations(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setObligations([]);
      }
    } catch (err: any) {
      console.error("Error fetching fee obligations:", err);
      setError(
        err.response?.data?.message || "Failed to load fee obligations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (reference: string) => {
    try {
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
      setError(err.response?.data?.message || "Failed to download receipt. Please try again.");
    }
  };

  const handleOpenPaymentModal = () => {
    if (!parentUuid) {
      message.error("Unable to get parent information. Please log in again.");
      return;
    }
    if (obligations.length === 0) {
      message.warning("No fee obligations available to pay.");
      return;
    }
    // Initialize form with default amounts (balance for each fee)
    const initialValues: Record<string, number> = {};
    const initialSelected: Record<number, boolean> = {};
    
    obligations.forEach((obligation) => {
      const feeId = getFeeId(obligation);
      if (obligation.balance > 0) {
        initialValues[`amount_${feeId}`] = obligation.balance;
        initialSelected[feeId] = true;
      }
    });
    
    paymentForm.setFieldsValue(initialValues);
    setSelectedFees(initialSelected);
    setIsPaymentModalVisible(true);
  };

  // Helper to get fee_id from obligation
  const getFeeId = (obligation: FeeObligation): number => {
    return obligation.fee_id || obligation.id;
  };

  const verifyPayment = async (reference: string) => {
    // Guard against double calls
    if (verifyingPayment) {
      return;
    }

    setVerifyingPayment(true);
    setError("");
    
    // Remove from localStorage to prevent re-verification
    localStorage.removeItem("pending_payment_reference");

    let tries = 0;
    const maxTries = 5;

    const checkPaymentStatus = async () => {
      try {
        console.log(`Checking payment status for reference: ${reference} (attempt ${tries + 1}/${maxTries})`);
        
        const statusResponse = await axios.get(
          `http://127.0.0.1:8000/api/payments/status/${reference}`,
          getAuthHeaders()
        );

        console.log("Payment status response:", statusResponse.data);

        if (statusResponse.data.payment_status === "paid") {
          // Payment confirmed
          message.success("Payment verified and fees settled successfully!");
          
          setPendingPaymentReference(null);
          setIsPaymentModalVisible(false);
          paymentForm.resetFields();
          setSelectedFees({});
          
          // Refresh payment history and obligations
          if (activeTab === "history") {
            fetchPaymentHistory();
          } else {
            fetchFeeObligations();
          }
          
          setVerifyingPayment(false);
        } else {
          // Payment not confirmed yet
          tries++;
          
          if (tries < maxTries) {
            console.log(`Payment not confirmed yet. Retrying in 2 seconds...`);
            setTimeout(checkPaymentStatus, 2000);
          } else {
            // Max retries reached
            message.warning("Payment processing, please refresh the page to check the status.");
            setError("Payment is being processed. Please refresh the page to verify.");
            setVerifyingPayment(false);
          }
        }
      } catch (statusErr: any) {
        console.error("Error checking payment status:", statusErr);
        
        let errorMessage = "Failed to verify payment. Please try again.";
        
        if (statusErr.code === "ERR_NETWORK" || statusErr.message === "Network Error") {
          errorMessage = "Network Error: Please check if the backend server is running.";
        } else if (statusErr.response?.data?.message) {
          errorMessage = statusErr.response.data.message;
        } else if (statusErr.response?.status === 404) {
          errorMessage = "Payment reference not found. Please contact support.";
        } else if (statusErr.message) {
          errorMessage = statusErr.message;
        }
        
        message.error(errorMessage);
        setError(errorMessage);
        setVerifyingPayment(false);
      }
    };

    // Start polling
    checkPaymentStatus();
  };

  const handlePaymentSubmit = async (values: any) => {
    // Prevent double submission
    if (paymentLoading || verifyingPayment) {
      return;
    }

    if (!paymentMethod) {
      message.error("Please select a payment method");
      return;
    }
    if (!parentUuid || !childUuid) {
      message.error("Missing required information. Please try again.");
      return;
    }

    // Build allocations array from form values
    const allocations: PaymentAllocation[] = [];
    
    Object.keys(values).forEach((key) => {
      if (key.startsWith("amount_")) {
        const feeId = parseInt(key.replace("amount_", ""));
        const amount = parseFloat(values[key]);
        
        if (selectedFees[feeId] && amount > 0) {
          allocations.push({
            fee_id: feeId,
            amount: amount,
          });
        }
      }
    });

    if (allocations.length === 0) {
      message.warning("Please select at least one fee and enter an amount.");
      return;
    }

    setPaymentLoading(true);
    setError("");

    // Validate request data
    if (!parentUuid) {
      message.error("Parent UUID is missing. Please log in again.");
      setPaymentLoading(false);
      return;
    }

    const requestPayload = {
      parent_uuid: parentUuid,
      student_uuid: childUuid,
      payment_method: paymentMethod,
      allocations: allocations,
    };

    console.log("Payment request payload:", requestPayload);

    try {
      const response = await axios.post<PaymentResponse>(
        "http://127.0.0.1:8000/api/fees/pay",
        requestPayload,
        getAuthHeaders()
      );

      if (response.data.status === true) {
        // If payment method is paystack, open the payment page in a popup
        if (paymentMethod === "paystack" && response.data.data?.authorization_url && response.data.data?.reference) {
          const authUrl = response.data.data.authorization_url;
          const reference = response.data.data.reference;
          
          // Store reference to prevent re-verification on refresh
          localStorage.setItem("pending_payment_reference", reference);
          setPendingPaymentReference(reference);
          
          // Open Paystack payment page in a popup
          const popup = window.open(
            authUrl,
            "Paystack Payment",
            "width=600,height=700,scrollbars=yes,resizable=yes"
          );

          if (!popup) {
            message.error("Popup blocked. Please allow popups for this site and try again.");
            localStorage.removeItem("pending_payment_reference");
            setPendingPaymentReference(null);
            setPaymentLoading(false);
            return;
          }

          message.info("Please complete the payment in the popup window.");
          
          // Set processing to false after popup opens (verification will handle button state)
          setPaymentLoading(false);

          // Poll to check if popup is closed, then verify once
          let verificationCalled = false;
          const checkPopupInterval = setInterval(() => {
            try {
              // Check if popup is closed
              if (popup.closed && !verificationCalled) {
                verificationCalled = true;
                clearInterval(checkPopupInterval);
                
                // Call verify endpoint only once
                verifyPayment(reference);
              }
            } catch (err) {
              console.error("Error checking popup status:", err);
            }
          }, 1000); // Check every 1 second

          // Safety timeout - verify after 2 minutes even if popup still open
          setTimeout(() => {
            if (!verificationCalled) {
              verificationCalled = true;
              clearInterval(checkPopupInterval);
              
              // Close popup if still open
              if (popup && !popup.closed) {
                popup.close();
              }
              
              // Call verify endpoint only once
              verifyPayment(reference);
            }
          }, 120000); // 2 minutes timeout
        } else {
          // For other payment methods (transfer, cash)
          message.success(response.data.message || "Payment processed successfully!");
          setIsPaymentModalVisible(false);
          paymentForm.resetFields();
          setSelectedFees({});
          setPaymentMethod("paystack");
          
          // Refresh payment history and obligations
          if (activeTab === "history") {
            fetchPaymentHistory();
          } else {
            fetchFeeObligations();
          }
          
          setPaymentLoading(false);
        }
      } else {
        throw new Error("Payment failed");
      }
    } catch (err: any) {
      console.error("Error processing payment:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Failed to process payment. Please try again.";
      
      if (err.response?.data) {
        // Try to get detailed error message
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Add status code info for 500 errors
      if (err.response?.status === 500) {
        errorMessage = `Server error: ${errorMessage}. Please contact support if the issue persists.`;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
      setPaymentLoading(false);
    }
  };

  const handleFeeToggle = (feeId: number, checked: boolean) => {
    setSelectedFees((prev) => ({
      ...prev,
      [feeId]: checked,
    }));
    
    if (!checked) {
      // Clear amount when unchecking
      paymentForm.setFieldValue(`amount_${feeId}`, undefined);
    } else {
      // Set default amount to balance when checking
      const obligation = obligations.find((o) => getFeeId(o) === feeId);
      if (obligation && obligation.balance > 0) {
        paymentForm.setFieldValue(`amount_${feeId}`, obligation.balance);
      }
    }
  };

  const paymentColumns = [
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Payment) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadReceipt(record.reference)}
        >
          Download Receipt
        </Button>
      ),
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
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => `₦${balance?.toLocaleString() || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Child Fees</h1>
        
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Select
            value={sessionId}
            onChange={setSessionId}
            style={{ width: 200 }}
            placeholder="Select Session"
            loading={loadingSessions}
            options={sessions.map((session) => ({
              value: session.id,
              label: `${session.name}${session.current ? " (Current)" : ""}`,
            }))}
          />
          <Select
            value={termId}
            onChange={setTermId}
            style={{ width: 200 }}
            placeholder="Select Term"
            loading={loadingTerms}
            disabled={!sessionId || loadingTerms}
            options={terms.map((term) => ({
              value: term.id,
              label: term.name,
            }))}
          />
          {studentClass && (
            <div style={{ padding: "4px 11px", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fafafa" }}>
              Class: {studentClass.class_name}
            </div>
          )}
        </div>

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

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "history",
              label: "Payment History",
              children: (
                <Table
                  dataSource={payments}
                  columns={paymentColumns}
                  rowKey="id"
                  pagination={
                    totalPages > 1
                      ? {
                          current: currentPage,
                          total: total,
                          pageSize: 10,
                          showSizeChanger: false,
                          showTotal: (total) => `Total ${total} payments`,
                        }
                      : false
                  }
                />
              ),
            },
            {
              key: "obligations",
              label: "Fee Obligations",
              children: (
                <>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      icon={<DollarOutlined />}
                      onClick={handleOpenPaymentModal}
                      disabled={obligations.length === 0 || !parentUuid}
                      size="large"
                    >
                      Pay Fee
                    </Button>
                  </div>
                  <Table
                    dataSource={obligations}
                    columns={obligationColumns}
                    rowKey="id"
                    pagination={
                      totalPages > 1
                        ? {
                            current: currentPage,
                            total: total,
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Total ${total} obligations`,
                          }
                        : false
                    }
                  />
                </>
              ),
            },
          ]}
        />

        {/* Payment Modal */}
        <Modal
          title="Pay Fee"
          open={isPaymentModalVisible}
          onCancel={() => {
            setIsPaymentModalVisible(false);
            paymentForm.resetFields();
            setSelectedFees({});
            setPaymentMethod("paystack");
          }}
          footer={null}
          width={600}
        >
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handlePaymentSubmit}
          >
            <Alert
              message="Select fees to pay and enter the amount for each fee"
              type="info"
              style={{ marginBottom: 20 }}
            />

            <Form.Item
              label="Payment Method"
              required
              style={{ marginBottom: 20 }}
            >
              <Select
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value)}
                placeholder="Select Payment Method"
                style={{ width: "100%" }}
              >
                <Select.Option value="transfer">Transfer</Select.Option>
                <Select.Option value="paystack">Paystack</Select.Option>
                <Select.Option value="cash">Pay By Cash</Select.Option>
              </Select>
            </Form.Item>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {obligations
                .filter((obligation) => obligation.balance > 0)
                .map((obligation) => {
                  const feeId = getFeeId(obligation);
                  return (
                    <Card
                      key={feeId}
                      size="small"
                      style={{ marginBottom: 12 }}
                    >
                      <Form.Item
                        style={{ marginBottom: 8 }}
                      >
                        <Checkbox
                          checked={selectedFees[feeId] || false}
                          onChange={(e) => handleFeeToggle(feeId, e.target.checked)}
                        >
                          <strong>{obligation.fee_type}</strong>
                          <div style={{ marginLeft: 24, fontSize: 12, color: "#666" }}>
                            Balance: ₦{obligation.balance?.toLocaleString() || 0}
                          </div>
                        </Checkbox>
                      </Form.Item>
                      
                      {selectedFees[feeId] && (
                        <Form.Item
                          name={`amount_${feeId}`}
                          label="Amount to Pay"
                          rules={[
                            { required: true, message: "Please enter amount" },
                            {
                              type: "number",
                              min: 0.01,
                              message: "Amount must be greater than 0",
                            },
                            {
                              validator: (_: any, value: number) => {
                                if (value > obligation.balance) {
                                  return Promise.reject(
                                    new Error(`Amount cannot exceed balance of ₦${obligation.balance.toLocaleString()}`)
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            prefix="₦"
                            min={0.01}
                            max={obligation.balance}
                            step={0.01}
                            precision={2}
                            placeholder="Enter amount"
                          />
                        </Form.Item>
                      )}
                    </Card>
                  );
                })}
            </div>

            {obligations.filter((o) => o.balance > 0).length === 0 && (
              <Alert
                message="No fees with outstanding balance"
                type="warning"
                style={{ marginTop: 20 }}
              />
            )}

            <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button
                  onClick={() => {
                    setIsPaymentModalVisible(false);
                    paymentForm.resetFields();
                    setSelectedFees({});
                    setPaymentMethod("paystack");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={paymentLoading || verifyingPayment}
                  disabled={obligations.filter((o) => o.balance > 0).length === 0 || paymentLoading || verifyingPayment}
                >
                  {verifyingPayment ? "Verifying Payment..." : "Proceed to Payment"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </DashboardLayout>
  );
}

