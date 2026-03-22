"use client";

import { useEffect, useState } from "react";
import { Card, Select, Alert, Spin, App, Table, Button, InputNumber, Checkbox, Form, Space, Modal } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

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

interface Student {
  student_id: number;
  student_uuid: string;
  student_name: string;
  student_email: string;
  parent_id: number;
  parent_uuid: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
}

interface Fee {
  id: number;
  class_id: number;
  session_id: number;
  fee_type: string;
  amount_due: string;
  term_id: string;
  created_at: string;
  updated_at: string;
  class: {
    id: number;
    name: string;
    arm: string;
    class_level_id: number;
    class_teacher_id: number;
    created_at: string;
    updated_at: string;
  };
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

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

interface StudentsResponse {
  status: boolean;
  class_id: string;
  session_id: string | null;
  students: Student[];
}

interface FeesResponse {
  status: boolean;
  session_id: string;
  term: string | null;
  data: Fee[];
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

export default function PayFeePage() {
  const { message } = App.useApp();
  const { schoolName } = useSchoolProfile();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFees, setSelectedFees] = useState<Record<number, number>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [studentUuid, setStudentUuid] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("paystack");
  const [pendingPaymentReference, setPendingPaymentReference] = useState<string | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchSessions();
    
    // Check for pending payment verification on mount
    const storedReference = localStorage.getItem("pending_payment_reference");
    if (storedReference) {
      setPendingPaymentReference(storedReference);
      // Don't auto-verify on mount, let user trigger it manually if needed
      localStorage.removeItem("pending_payment_reference");
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
      }
    }
  }, [sessions, sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
      fetchClasses(sessionId);
    } else {
      setTerms([]);
      setClasses([]);
      setTermId(null);
      setClassId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
    }
  }, [terms, termId]);

  useEffect(() => {
    if (classId) {
      fetchStudents(classId);
    } else {
      setStudents([]);
      setStudentUuid(null);
      setSelectedStudent(null);
    }
  }, [classId]);

  useEffect(() => {
    if (sessionId && termId && studentUuid) {
      fetchFees();
    } else {
      setFees([]);
      setSelectedFees({});
    }
  }, [sessionId, termId, studentUuid]);

  // Redirect to admin dashboard after 5 seconds on successful payment
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        router.push("/admin/dashboard");
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, router]);

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
      
      let errorMessage = "Failed to load sessions. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      let errorMessage = "Failed to load terms. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No terms found for this session.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTerms([]);
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setClassId(null);

    try {
      const response = await axios.get<ClassesResponse>(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/classes`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else {
        setClasses([]);
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    setLoadingStudents(true);
    setError("");
    setStudents([]);
    setStudentUuid(null);
    setSelectedStudent(null);

    try {
      const response = await axios.get<StudentsResponse>(
        `http://127.0.0.1:8000/api/classes/${classId}/students`,
        getAuthHeaders()
      );

      if (response.data.status === true && Array.isArray(response.data.students)) {
        setStudents(response.data.students);
      } else {
        setStudents([]);
        setError("No students found for this class.");
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchFees = async () => {
    if (!sessionId || !termId) return;

    setLoadingFees(true);
    setError("");
    setFees([]);
    setSelectedFees({});

    try {
      const response = await axios.get<FeesResponse>(
        `http://127.0.0.1:8000/api/admin/fees/view?session_id=${sessionId}&term_id=${termId}`,
        getAuthHeaders()
      );

      if (response.data.status === true && Array.isArray(response.data.data)) {
        setFees(response.data.data);
      } else {
        setFees([]);
        setError("No fees found for the selected session and term.");
      }
    } catch (err: any) {
      console.error("Error fetching fees:", err);
      setError(err.response?.data?.message || "Failed to load fees. Please try again.");
      setFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const handleStudentChange = (value: string) => {
    const student = students.find((s) => s.student_uuid === value);
    setStudentUuid(value);
    setSelectedStudent(student || null);
    setSelectedFees({});
    setPaymentSuccess(false);
  };

  const handleFeeCheckboxChange = (feeId: number, checked: boolean) => {
    const fee = fees.find((f) => f.id === feeId);
    if (!fee) return;

    if (checked) {
      setSelectedFees((prev) => ({
        ...prev,
        [feeId]: parseFloat(fee.amount_due),
      }));
    } else {
      setSelectedFees((prev) => {
        const newFees = { ...prev };
        delete newFees[feeId];
        return newFees;
      });
    }
  };

  const handleAmountChange = (feeId: number, amount: number | null) => {
    if (amount === null || amount < 0) {
      setSelectedFees((prev) => {
        const newFees = { ...prev };
        delete newFees[feeId];
        return newFees;
      });
    } else {
      const fee = fees.find((f) => f.id === feeId);
      const maxAmount = fee ? parseFloat(fee.amount_due) : 0;
      const finalAmount = Math.min(amount, maxAmount);
      
      setSelectedFees((prev) => ({
        ...prev,
        [feeId]: finalAmount,
      }));
    }
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      // Select all fees with their full amount_due
      const allFees: Record<number, number> = {};
      fees.forEach((fee) => {
        allFees[fee.id] = parseFloat(fee.amount_due);
      });
      setSelectedFees(allFees);
    } else {
      // Deselect all fees
      setSelectedFees({});
    }
  };

  const allFeesSelected = fees.length > 0 && fees.every((fee) => selectedFees[fee.id] !== undefined);
  const someFeesSelected = fees.some((fee) => selectedFees[fee.id] !== undefined) && !allFeesSelected;

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
          
          setPaymentSuccess(true);
          setPendingPaymentReference(null);
          
          // Reset form
          setSelectedFees({});
          setSelectedStudent(null);
          setStudentUuid(null);
          setPaymentMethod("paystack");
          form.resetFields();
          
          // Refresh fees
          if (sessionId && termId) {
            fetchFees();
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

  const handlePayment = async () => {
    // Prevent double submission
    if (processingPayment || verifyingPayment) {
      return;
    }
    if (!selectedStudent || !studentUuid) {
      message.error("Please select a student first");
      return;
    }

    const allocations = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([feeId, amount]) => ({
        fee_id: parseInt(feeId),
        amount: amount,
      }));

    if (allocations.length === 0) {
      message.error("Please select at least one fee to pay");
      return;
    }

    // Show payment method selection modal
    setShowPaymentMethodModal(true);
  };

  const handlePaymentMethodSelected = async (method: string) => {
    setPaymentMethod(method);
    setShowPaymentMethodModal(false);
    
    // Now proceed with the payment
    await processPaymentWithMethod(method);
  };

  const processPaymentWithMethod = async (method: string) => {
    if (processingPayment || verifyingPayment) {
      return;
    }

    const allocations = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([feeId, amount]) => ({
        fee_id: parseInt(feeId),
        amount: amount,
      }));

    if (allocations.length === 0) {
      message.error("Please select at least one fee to pay");
      return;
    }

    setProcessingPayment(true);
    setError("");

    // Validate request data
    if (!selectedStudent?.parent_uuid) {
      message.error("Parent UUID is missing. Please select a student.");
      setProcessingPayment(false);
      return;
    }

    const requestPayload = {
      parent_uuid: selectedStudent.parent_uuid,
      student_uuid: studentUuid,
      payment_method: method,
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
        if (method === "paystack" && response.data.data?.authorization_url && response.data.data?.reference) {
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
            setProcessingPayment(false);
            return;
          }

          message.info("Please complete the payment in the popup window.");
          
          // Set processing to false after popup opens (verification will handle button state)
          setProcessingPayment(false);

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
          setPaymentSuccess(true);
          
          // Reset form
          setSelectedFees({});
          setSelectedStudent(null);
          setStudentUuid(null);
          setPaymentMethod("paystack");
          form.resetFields();
          
          // Refresh fees
          if (sessionId && termId) {
            fetchFees();
          }
          
          setProcessingPayment(false);
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
    } finally {
      setProcessingPayment(false);
    }
  };

  const totalAmount = Object.values(selectedFees).reduce((sum, amount) => sum + amount, 0);

  const feeColumns = [
    {
      title: (
        <Checkbox
          checked={allFeesSelected}
          indeterminate={someFeesSelected}
          onChange={(e) => handleCheckAll(e.target.checked)}
        >
          Select All
        </Checkbox>
      ),
      key: "select",
      width: 120,
      render: (_: any, record: Fee) => (
        <Checkbox
          checked={!!selectedFees[record.id]}
          onChange={(e) => handleFeeCheckboxChange(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
      width: 150,
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      width: 150,
      align: "right" as const,
      render: (amount: string) => {
        const numAmount = parseFloat(amount);
        return `₦${numAmount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
      },
    },
    {
      title: "Amount to Pay",
      key: "amount_to_pay",
      width: 200,
      render: (_: any, record: Fee) => (
        <InputNumber<number>
          value={selectedFees[record.id] || undefined}
          min={0}
          max={parseFloat(record.amount_due)}
          precision={2}
          style={{ width: "100%" }}
          placeholder="Enter amount"
          disabled={!selectedFees[record.id]}
          onChange={(value) => handleAmountChange(record.id, value)}
          formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => {
            const raw = (value ?? "").replace(/₦\s?|(,*)/g, "");
            const n = Number(raw);
            return Number.isFinite(n) ? n : 0;
          }}
        />
      ),
    },
  ];

  if (loadingSessions) {
    return (
      <DashboardLayout role="admin">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Pay Fee (on behalf)</h1>

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

        {paymentSuccess && (
          <Alert
            title="Payment processed successfully! Redirecting to dashboard in 5 seconds..."
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form form={form} layout="vertical">
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
              <Form.Item label="Session" style={{ marginBottom: 0, minWidth: 200 }}>
                <Select
                  value={sessionId}
                  onChange={(value) => {
                    setSessionId(value);
                    setTermId(null);
                    setClassId(null);
                    setStudentUuid(null);
                    setSelectedStudent(null);
                    setFees([]);
                    setSelectedFees({});
                    setPaymentSuccess(false);
                  }}
                  placeholder="Select Session"
                  loading={loadingSessions}
                  style={{ width: "100%" }}
                >
                  {sessions.map((session) => (
                    <Select.Option key={session.id} value={session.id}>
                      {session.name}{session.current ? " (Current)" : ""}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Term" style={{ marginBottom: 0, minWidth: 200 }}>
                <Select
                  value={termId}
                  onChange={(value) => {
                    setTermId(value);
                    setFees([]);
                    setSelectedFees({});
                    setPaymentSuccess(false);
                  }}
                  placeholder="Select Term"
                  loading={loadingTerms}
                  disabled={!sessionId || terms.length === 0}
                  style={{ width: "100%" }}
                >
                  {terms.map((term) => (
                    <Select.Option key={term.id} value={term.id}>
                      {term.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Class" style={{ marginBottom: 0, minWidth: 200 }}>
                <Select
                  value={classId}
                  onChange={(value) => {
                    setClassId(value);
                    setStudentUuid(null);
                    setSelectedStudent(null);
                    setFees([]);
                    setSelectedFees({});
                    setPaymentSuccess(false);
                  }}
                  placeholder="Select Class"
                  loading={loadingClasses}
                  disabled={!sessionId || classes.length === 0}
                  style={{ width: "100%" }}
                >
                  {classes.map((cls) => (
                    <Select.Option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Student" style={{ marginBottom: 0, minWidth: 250 }}>
                <Select
                  value={studentUuid}
                  onChange={handleStudentChange}
                  placeholder="Select Student"
                  loading={loadingStudents}
                  disabled={!classId || students.length === 0}
                  style={{ width: "100%" }}
                  showSearch
                  filterOption={(input, option) => {
                    const candidate =
                      (option as any)?.label ??
                      (option as any)?.children ??
                      (option as any)?.title;
                    return String(candidate ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {students.map((student) => (
                    <Select.Option key={student.student_uuid} value={student.student_uuid}>
                      {student.student_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedStudent && (
                <Form.Item label="Parent" style={{ marginBottom: 0, minWidth: 250 }}>
                  <Select
                    value={selectedStudent.parent_uuid}
                    disabled
                    style={{ width: "100%" }}
                  >
                    <Select.Option value={selectedStudent.parent_uuid}>
                      {selectedStudent.parent_name}
                    </Select.Option>
                  </Select>
                </Form.Item>
              )}

              {/* Removed Payment Method Dropdown - now in Modal */}
            </div>
          </div>

          {loadingFees && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          )}

          {!loadingFees && fees.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ marginBottom: "16px" }}>Available Fees</h3>
              <Table
                dataSource={fees}
                rowKey="id"
                columns={feeColumns}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </div>
          )}

          {!loadingFees && fees.length === 0 && sessionId && termId && (
            <Alert
              title="No fees found for the selected session and term"
              type="info"
              showIcon
              style={{ marginTop: "20px" }}
            />
          )}

          {Object.keys(selectedFees).length > 0 && (
            <div style={{ marginTop: "24px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Total Amount to Pay:</strong>
                  <span style={{ fontSize: "20px", marginLeft: "12px", color: "#1890ff" }}>
                    ₦{totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  size="large"
                  loading={processingPayment || verifyingPayment}
                  onClick={handlePayment}
                  disabled={totalAmount <= 0 || processingPayment || verifyingPayment}
                >
                  Process Payment
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Card>

      {/* Enhanced Payment Method Selection Modal */}
      <Modal
        title="Select Payment Method"
        open={showPaymentMethodModal}
        onCancel={() => setShowPaymentMethodModal(false)}
        footer={null}
        width={800}
        centered
        styles={{ body: { padding: "30px" } }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {/* Paystack Option */}
          <div
            onClick={() => handlePaymentMethodSelected("paystack")}
            style={{
              cursor: "pointer",
              border: "2px solid #e8e8e8",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              transition: "all 0.3s ease",
              backgroundColor: "#fafafa",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1890ff";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(24, 144, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e8e8";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src="/FrontEndImages/paystack.png"
              alt="Paystack"
              style={{ width: "100%", height: "140px", objectFit: "contain", marginBottom: "16px" }}
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23E0E0E0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='%23666'%3EPaystack%3C/text%3E%3C/svg%3E";
              }}
            />
            <div style={{ fontWeight: "600", fontSize: "16px", marginTop: "8px", color: "#262626" }}>Paystack</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px" }}>Instant Online Payment</div>
          </div>

          {/* Transfer Option */}
          <div
            onClick={() => handlePaymentMethodSelected("transfer")}
            style={{
              cursor: "pointer",
              border: "2px solid #e8e8e8",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              transition: "all 0.3s ease",
              backgroundColor: "#fafafa",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#faad14";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(250, 173, 20, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e8e8";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src="/FrontEndImages/transferpic.png"
              alt="Transfer"
              style={{ width: "100%", height: "140px", objectFit: "contain", marginBottom: "16px" }}
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23E0E0E0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='%23666'%3ETransfer%3C/text%3E%3C/svg%3E";
              }}
            />
            <div style={{ fontWeight: "600", fontSize: "16px", marginTop: "8px", color: "#262626" }}>Bank Transfer</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px" }}>Direct Account Transfer</div>
          </div>

          {/* Cash Option */}
          <div
            onClick={() => handlePaymentMethodSelected("cash")}
            style={{
              cursor: "pointer",
              border: "2px solid #e8e8e8",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              transition: "all 0.3s ease",
              backgroundColor: "#fafafa",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#52c41a";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(82, 196, 26, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e8e8";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src="/FrontEndImages/cashpic.png"
              alt="Cash"
              style={{ width: "100%", height: "140px", objectFit: "contain", marginBottom: "16px" }}
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23E0E0E0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='%23666'%3ECash%3C/text%3E%3C/svg%3E";
              }}
            />
            <div style={{ fontWeight: "600", fontSize: "16px", marginTop: "8px", color: "#262626" }}>Pay by Cash</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px" }}>In-Person Payment</div>
          </div>
        </div>

        {/* Bank Transfer Account Details */}
        {paymentMethod === "transfer" && (
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f6f8fb", borderRadius: "8px", border: "1px solid #d9e8f7" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", color: "#262626" }}>
              📋 Bank Transfer Details
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ paddingBottom: "12px", borderBottom: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Bank Name</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#262626" }}>First Bank Nigeria</div>
              </div>
              <div style={{ paddingBottom: "12px", borderBottom: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Account Number</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#262626", fontFamily: "monospace" }}>2000123456789</div>
              </div>
              <div style={{ paddingBottom: "12px", borderBottom: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Account Name</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#262626" }}>{schoolName}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Reference</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#262626", fontFamily: "monospace" }}>Use the payment reference when transferring</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
