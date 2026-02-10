"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Select, InputNumber, Alert, Spin, message, Table } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useRouter } from "next/navigation";
  
interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
  id: number;
  name: string;
}

interface ClassLevel {
  id: number;
  name: string;
}

interface Book {
  uuid: string;
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: number | string;
  selling_price: number | string;
  [key: string]: any;
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

interface ClassLevelsResponse {
  status: string;
  class_levels: ClassLevel[];
}

interface BooksResponse {
  data: Book[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}

interface BookEditResponse {
  message: string;
  data: {
    id: number;
    branch_id: number | null;
    uuid: string;
    book_name: string;
    class_level_id: number;
    term_id: number;
    quantity: number;
    initial_quantity: number;
    cost_price: number;
    selling_price: number;
    created_at: string;
    updated_at: string;
  };
}

export default function EditBookPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classLevelId, setClassLevelId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
    }
  }, [terms, termId]);

  useEffect(() => {
    if (classLevelId && termId) {
      fetchBooks();
    } else {
      setBooks([]);
      setSelectedBook(null);
      form.resetFields();
    }
  }, [classLevelId, termId]);

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

  const fetchClassLevels = async () => {
    setLoadingClassLevels(true);
    setError("");

    try {
      const response = await axios.get<ClassLevelsResponse>(
        "http://127.0.0.1:8000/api/class-levels",
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.class_levels)) {
        setClassLevels(response.data.class_levels);
      } else {
        setClassLevels([]);
        setError("No class levels found.");
      }
    } catch (err: any) {
      console.error("Error fetching class levels:", err);
      setError(err.response?.data?.message || "Failed to load class levels. Please try again.");
      setClassLevels([]);
    } finally {
      setLoadingClassLevels(false);
    }
  };

  const fetchBooks = async () => {
    if (!classLevelId || !termId) {
      return;
    }

    setLoadingBooks(true);
    setError("");
    setBooks([]);
    setSelectedBook(null);
    form.resetFields();

    try {
      const response = await axios.get<BooksResponse>(
        `http://127.0.0.1:8000/api/bookshop/books?class_level_id=${classLevelId}&term_id=${termId}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else if (response.data.data) {
        setBooks(response.data.data);
      } else {
        setBooks([]);
      }
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError(err.response?.data?.message || "Failed to load books. Please try again.");
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    form.setFieldsValue({
      cost_price: typeof book.cost_price === "string" ? parseFloat(book.cost_price) : book.cost_price,
      selling_price: typeof book.selling_price === "string" ? parseFloat(book.selling_price) : book.selling_price,
      class_level_id: book.class_level_id,
      term_id: book.term_id,
    });
  };

  const onFinish = async (values: {
    cost_price: number;
    selling_price: number;
    class_level_id: number;
    term_id: number;
  }) => {
    if (!selectedBook) {
      setError("Please select a book to edit");
      message.error("Please select a book to edit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put<BookEditResponse>(
        `http://127.0.0.1:8000/api/bookshop/books/${selectedBook.uuid}/edit`,
        {
          cost_price: values.cost_price,
          selling_price: values.selling_price,
          class_level_id: values.class_level_id,
          term_id: values.term_id,
        },
        getAuthHeaders()
      );

      if (response.data.message === "Book updated successfully") {
        message.success("Book updated successfully!");
        
        // Refresh books list
        fetchBooks();
        
        // Reset form and selection
        setSelectedBook(null);
        form.resetFields();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Error updating book:", err);
      const errorMessage = err.response?.data?.message || "Failed to update book. Please try again.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Book Name",
      dataIndex: "book_name",
      key: "book_name",
    },
    {
      title: "Cost Price",
      dataIndex: "cost_price",
      key: "cost_price",
      render: (price: number | string) => {
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        return `₦${numPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
      },
    },
    {
      title: "Selling Price",
      dataIndex: "selling_price",
      key: "selling_price",
      render: (price: number | string) => {
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        return `₦${numPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Book) => (
        <Button
          type="primary"
          onClick={() => handleBookSelect(record)}
          disabled={selectedBook?.uuid === record.uuid}
        >
          {selectedBook?.uuid === record.uuid ? "Selected" : "Select"}
        </Button>
      ),
    },
  ];

  if (loadingSessions || loadingClassLevels) {
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
        <h1 style={{ marginBottom: "24px" }}>Edit Book</h1>

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

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <Select
              value={sessionId}
              onChange={(value) => {
                setSessionId(value);
                setTermId(null);
                setBooks([]);
                setSelectedBook(null);
                form.resetFields();
              }}
              style={{ width: 200 }}
              placeholder="Select Session"
              loading={loadingSessions}
              options={sessions.map((session) => ({
                label: `${session.name}${session.current ? " (Current)" : ""}`,
                value: session.id,
              }))}
            />
            <Select
              value={termId}
              onChange={(value) => {
                setTermId(value);
                setBooks([]);
                setSelectedBook(null);
                form.resetFields();
              }}
              style={{ width: 200 }}
              placeholder="Select Term"
              loading={loadingTerms}
              disabled={!sessionId || terms.length === 0}
              options={terms.map((term) => ({
                label: term.name,
                value: term.id,
              }))}
            />
            <Select
              value={classLevelId}
              onChange={(value) => {
                setClassLevelId(value);
                setBooks([]);
                setSelectedBook(null);
                form.resetFields();
              }}
              style={{ width: 200 }}
              placeholder="Select Class Level"
              loading={loadingClassLevels}
              options={classLevels.map((level) => ({
                label: level.name,
                value: level.id,
              }))}
            />
          </div>

          {loadingBooks ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : books.length > 0 ? (
            <div style={{ marginBottom: "24px" }}>
              <h3>Select a book to edit:</h3>
              <Table
                dataSource={books}
                columns={columns}
                rowKey="uuid"
                pagination={false}
                rowClassName={(record) =>
                  selectedBook?.uuid === record.uuid ? "selected-row" : ""
                }
                style={{ marginTop: "16px" }}
                onRow={(record) => ({
                  onClick: () => handleBookSelect(record),
                  style: {
                    backgroundColor: selectedBook?.uuid === record.uuid ? "#e6f7ff" : undefined,
                    cursor: "pointer",
                  },
                })}
              />
            </div>
          ) : classLevelId && termId ? (
            <Alert
              title="No books found for the selected filters"
              type="info"
              style={{ marginBottom: "20px" }}
            />
          ) : null}
        </div>

        <Card 
          title={selectedBook ? `Edit: ${selectedBook.book_name}` : "Edit Book"}
          style={{ marginTop: "24px", display: selectedBook ? "block" : "none" }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
          >
              <Form.Item
                label="Class Level"
                name="class_level_id"
                rules={[{ required: true, message: "Please select a class level" }]}
              >
                <Select
                  placeholder="Select Class Level"
                  loading={loadingClassLevels}
                  options={classLevels.map((level) => ({
                    value: level.id,
                    label: level.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Term"
                name="term_id"
                rules={[{ required: true, message: "Please select a term" }]}
              >
                <Select
                  placeholder="Select Term"
                  loading={loadingTerms}
                  disabled={!sessionId || terms.length === 0}
                  options={terms.map((term) => ({
                    value: term.id,
                    label: term.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Cost Price"
                name="cost_price"
                rules={[
                  { required: true, message: "Please enter cost price" },
                  { type: "number", min: 0, message: "Cost price must be 0 or greater" },
                ]}
              >
                <InputNumber
                  placeholder="Enter cost price"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Selling Price"
                name="selling_price"
                rules={[
                  { required: true, message: "Please enter selling price" },
                  { type: "number", min: 0, message: "Selling price must be 0 or greater" },
                ]}
              >
                <InputNumber
                  placeholder="Enter selling price"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  Update Book
                </Button>
                <Button
                  style={{ marginLeft: "10px" }}
                  onClick={() => {
                    setSelectedBook(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Card>
      </Card>
    </DashboardLayout>
  );
}
