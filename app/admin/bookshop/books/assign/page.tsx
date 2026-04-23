"use client";

import { useEffect, useState } from "react";
import { Select, Alert, Card, Space, Button, App, Spin } from "antd";
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

interface Book {
  id: number;
  uuid: string;
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: string;
  selling_price: string;
  term?: {
    id: number;
    name: string;
    academic_session_id: number;
    academic_session?: {
      id: number;
      name: string;
    };
  };
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

interface BooksResponse {
  current_page: number;
  data: Book[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface ClassLevelsResponse {
  status: string;
  class_levels: ClassLevel[];
}

export default function AssignBooksPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedBookUuid, setSelectedBookUuid] = useState<string | null>(null);
  const [selectedClassLevelId, setSelectedClassLevelId] = useState<number | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [debouncedBookSearch, setDebouncedBookSearch] = useState("");
  const [classLevelSearch, setClassLevelSearch] = useState("");
  const [debouncedClassLevelSearch, setDebouncedClassLevelSearch] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBookSearch(bookSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [bookSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedClassLevelSearch(classLevelSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [classLevelSearch]);

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
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedSessionId && selectedTermId) {
      fetchBooks();
    } else {
      setBooks([]);
      setSelectedBookUuid(null);
    }
  }, [selectedSessionId, selectedTermId, debouncedBookSearch]);

  useEffect(() => {
    fetchClassLevels();
  }, [debouncedClassLevelSearch]);

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

  const fetchBooks = async () => {
    if (!selectedSessionId || !selectedTermId) {
      return;
    }

    setLoadingBooks(true);
    setError("");
    setBooks([]);
    setSelectedBookUuid(null);

    try {
      const params = new URLSearchParams({
        term_id: String(selectedTermId),
      });
      if (debouncedBookSearch) {
        params.set("search", debouncedBookSearch);
      }
      const response = await axios.get<BooksResponse>(
        `http://127.0.0.1:8000/api/bookshop/books?${params.toString()}`,
        getAuthHeaders()
      );

      let booksData: Book[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        booksData = response.data;
      }

      setBooks(booksData);
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError(err.response?.data?.message || "Failed to load books. Please try again.");
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchClassLevels = async () => {
    setLoadingClassLevels(true);
    setError("");

    try {
      const query = debouncedClassLevelSearch
        ? `?search=${encodeURIComponent(debouncedClassLevelSearch)}`
        : "";
      const response = await axios.get<ClassLevelsResponse>(
        `http://127.0.0.1:8000/api/class-levels${query}`,
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

  const handleAssign = async () => {
    if (!selectedBookUuid || !selectedClassLevelId) {
      setError("Please select both a book and a class level");
      message.warning("Please select both a book and a class level");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/bookshop/books/${selectedBookUuid}/assign`,
        {
          class_level_id: Number(selectedClassLevelId),
        },
        getAuthHeaders()
      );

      message.success("Book assigned to class level successfully!");
      
      // Reset selections
      setSelectedBookUuid(null);
      setSelectedClassLevelId(null);
      
      // Redirect to admin dashboard after 10 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 10000);
    } catch (err: any) {
      console.error("Error assigning book:", err);
      let errorMessage = "Failed to assign book. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Assign Books to Class Level</h1>
        
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
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Book</label>
              <Select
                style={{ width: 250 }}
                value={selectedBookUuid}
                onChange={setSelectedBookUuid}
                onSearch={setBookSearch}
                showSearch
                filterOption={false}
                placeholder="Select Book"
                loading={loadingBooks}
                disabled={!selectedSessionId || !selectedTermId || loadingBooks}
                options={books.map((book) => ({
                  value: book.uuid,
                  label: book.book_name,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Class Level</label>
              <Select
                style={{ width: 200 }}
                value={selectedClassLevelId}
                onChange={setSelectedClassLevelId}
                onSearch={setClassLevelSearch}
                showSearch
                filterOption={false}
                placeholder="Select Class Level"
                loading={loadingClassLevels}
                disabled={!selectedBookUuid || loadingClassLevels}
                options={classLevels.map((level) => ({
                  value: level.id,
                  label: level.name,
                }))}
              />
            </div>
          </Space>
        </Space>

        {selectedBookUuid && selectedClassLevelId && (
          <Button
            type="primary"
            onClick={handleAssign}
            loading={submitting}
            size="large"
          >
            Assign Book to Class Level
          </Button>
        )}

        {!selectedSessionId || !selectedTermId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Please select a session and term to view books
          </div>
        ) : loadingBooks ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Spin size="large" />
          </div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            No books found for the selected session and term
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
