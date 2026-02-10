"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Spin, Alert, Card, Select } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Book {
  uuid: string;
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: number;
  selling_price: number;
  term?: {
    id: number;
    name: string;
    academic_session_id: number;
    academic_session?: {
      id: number;
      name: string;
    };
  };
  [key: string]: any;
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

interface ClassLevel {
  id: number;
  name: string;
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

interface ApiResponse {
  data: Book[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
  from?: number;
  to?: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classLevelId, setClassLevelId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch terms when session is selected
  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
    }
  }, [sessionId]);

  // Auto-select first term when terms are loaded (only if termId is not set)
  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
    }
  }, [terms, termId]);

  const fetchBooks = useCallback(async () => {
    if (!classLevelId || !termId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/bookshop/books?class_level_id=${classLevelId}&term_id=${termId}&page=${currentPage}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setBooks(response.data);
        setTotal(response.data.length);
        setTotalPages(1);
      } else if (response.data.data) {
        setBooks(response.data.data);
        // Don't update currentPage from API - we manage it via state
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
        setPageSize(response.data.per_page || 20);
      } else {
        setBooks([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError(
        err.response?.data?.message || "Failed to load books. Please try again."
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [classLevelId, termId, currentPage]);

  // Fetch books when both classLevelId and termId are selected, or when page changes
  useEffect(() => {
    if (classLevelId && termId) {
      fetchBooks();
    } else {
      setBooks([]);
      setTotal(0);
    }
  }, [fetchBooks]);

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
      setError(
        err.response?.data?.message || "Failed to load sessions. Please try again."
      );
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
      setError(
        err.response?.data?.message || "Failed to load class levels. Please try again."
      );
      setClassLevels([]);
    } finally {
      setLoadingClassLevels(false);
    }
  };


  const columns = [
    {
      title: "Book Name",
      dataIndex: "book_name",
      key: "book_name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Initial Quantity",
      dataIndex: "initial_quantity",
      key: "initial_quantity",
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
  ];

  const handleSessionChange = (value: number) => {
    setSessionId(value);
    setTermId(null);
    setBooks([]);
    setCurrentPage(1);
  };

  const handleTermChange = (value: number) => {
    setTermId(value);
    setCurrentPage(1);
  };

  const handleClassLevelChange = (value: number) => {
    setClassLevelId(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0 }}>Books</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Select
              value={sessionId}
              onChange={handleSessionChange}
              style={{ width: 200 }}
              placeholder="Select Session"
              loading={loadingSessions}
              options={sessions.map((session) => ({
                label: session.name,
                value: session.id,
              }))}
            />
            <Select
              value={termId}
              onChange={handleTermChange}
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
              onChange={handleClassLevelChange}
              style={{ width: 200 }}
              placeholder="Select Class Level"
              loading={loadingClassLevels}
              options={classLevels.map((level) => ({
                label: level.name,
                value: level.id,
              }))}
            />
          </div>
        </div>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={books}
            columns={columns}
            rowKey="uuid"
            pagination={
              total > 0
                ? {
                    current: currentPage,
                    total: total,
                    pageSize: pageSize,
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} books`,
                    onChange: handlePageChange,
                  }
                : false
            }
            locale={{
              emptyText: classLevelId && termId 
                ? "No books found for the selected filters" 
                : "Please select a session, term, and class level to view books",
            }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}

