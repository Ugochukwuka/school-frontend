"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Spin,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  App,
  DatePicker,
} from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { parseBackendUtcToLocal, localToUtcIso } from "@/app/lib/dateUtils";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  cbtTeacher,
  cbtTeacherListQuestionBank,
  cbtTeacherListExams,
} from "@/app/lib/cbtApi";

export default function TeacherCBTExamDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [editExamVisible, setEditExamVisible] = useState(false);
  const [addQuestionVisible, setAddQuestionVisible] = useState(false);
  const [importBankVisible, setImportBankVisible] = useState(false);
  const [editQuestionVisible, setEditQuestionVisible] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<number | null>(null);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [optionModalQuestionId, setOptionModalQuestionId] = useState<number | null>(null);

  const [editExamForm] = Form.useForm();
  const [addQuestionForm] = Form.useForm();
  const [editQuestionForm] = Form.useForm();
  const [optionForm] = Form.useForm();

  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const loadExam = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await cbtTeacher.getExam(id);
      const data = res.data?.data ?? (res.data as any)?.data ?? res.data;
      setExam(data ?? null);
      setQuestions(data?.questions ?? []);
    } catch (err: any) {
      const is404 = err.response?.status === 404;
      if (is404) {
        try {
          const listRes = await cbtTeacherListExams({ per_page: 500 });
          const payload = (listRes.data as any)?.data ?? listRes.data;
          const list = payload?.data ?? [];
          const found = Array.isArray(list) ? list.find((e: any) => Number(e.id) === id) : null;
          if (found) {
            setExam(found);
            setQuestions([]);
          } else {
            setError(err.response?.data?.message || "Exam not found.");
          }
        } catch {
          setError(err.response?.data?.message || "Failed to load exam.");
        }
      } else {
        setError(err.response?.data?.message || "Failed to load exam.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    if (!id) return;
    try {
      const res = await cbtTeacher.getExamAttempts(id);
      const data = (res.data as any)?.data ?? res.data;
      setAttempts(Array.isArray(data) ? data : data?.attempts ?? []);
    } catch (_) {
      setAttempts([]);
    }
  };

  useEffect(() => {
    const validId = id && Number.isFinite(id);
    if (!validId) {
      setLoading(false);
      setError("Invalid exam ID");
      return;
    }
    loadExam();
    loadAttempts();
  }, [id]);

  const cloneExam = async () => {
    if (!id) return;
    setCloneLoading(true);
    setError("");
    try {
      const res = await cbtTeacher.cloneExam(id);
      const payload = res.data as { status?: boolean; message?: string; data?: { id?: number } };
      const data = payload?.data ?? (res.data as any);
      const newId = data?.id ?? (data as any)?.exam_id;
      const successMessage = payload?.message ?? "Exam cloned successfully. The new exam is in draft status.";
      if (newId) {
        message.success(successMessage);
        router.push(`/teachers/cbt/exams/${newId}`);
      } else {
        message.success(successMessage);
        loadExam();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Clone failed.");
    } finally {
      setCloneLoading(false);
    }
  };

  const deleteExam = async () => {
    try {
      await cbtTeacher.deleteExam(id);
      message.success("Exam deleted.");
      router.push("/teachers/cbt/exams");
    } catch (e: any) {
      setError(e.response?.data?.message || "Delete failed.");
    }
  };

  const openEditExam = async () => {
    if (!id) return;
    setEditExamVisible(true);
    setEditFormLoading(true);
    editExamForm.resetFields();
    try {
      const res = await cbtTeacher.previewExam(id);
      const data = (res.data as any)?.data ?? res.data;
      const examData = data?.exam ?? data;
      if (examData) {
        editExamForm.setFieldsValue({
          title: examData.title ?? "",
          description: examData.description ?? "",
          instructions: examData.instructions ?? "",
          duration_minutes: examData.duration_minutes,
          total_marks: examData.total_marks,
          start_time: parseBackendUtcToLocal(examData.start_time),
          end_time: parseBackendUtcToLocal(examData.end_time),
        });
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to load exam preview.");
      setEditExamVisible(false);
    } finally {
      setEditFormLoading(false);
    }
  };

  const saveEditExam = async (values: any) => {
    setActionLoading(true);
    try {
      await cbtTeacher.updateExam(id, {
        title: values.title,
        description: values.description,
        instructions: values.instructions,
        duration_minutes: values.duration_minutes,
        total_marks: values.total_marks,
        start_time: localToUtcIso(values.start_time),
        end_time: localToUtcIso(values.end_time),
      });
      message.success("Exam updated.");
      setEditExamVisible(false);
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const openAddQuestion = () => {
    addQuestionForm.resetFields();
    setAddQuestionVisible(true);
  };

  const saveAddQuestion = async (values: any) => {
    setActionLoading(true);
    try {
      const question: Record<string, unknown> = {
        question_type: values.question_type || "mcq",
        question_text: values.question_text,
        marks: values.marks,
      };
      if (question.question_type === "mcq" && values.options?.length) {
        question.options = values.options.map((o: any) => ({
          option_label: o.option_label || "A",
          option_text: o.option_text || "",
          is_correct: !!o.is_correct,
        }));
      }
      await cbtTeacher.addQuestions(id, { questions: [question] });
      message.success("Question added.");
      setAddQuestionVisible(false);
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Add question failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const openImportBank = async () => {
    setImportBankVisible(true);
    setBankLoading(true);
    setSelectedBankIds([]);
    try {
      const res = await cbtTeacherListQuestionBank({
        subject_id: exam?.subject_id ?? undefined,
      });
      const raw = (res.data as any)?.data ?? (res.data as any)?.questions ?? res.data;
      const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.questions ?? [];
      setBankQuestions(Array.isArray(list) ? list : []);
    } catch (_) {
      setBankQuestions([]);
    } finally {
      setBankLoading(false);
    }
  };

  const doImportBank = async () => {
    if (!selectedBankIds.length) {
      message.warning("Select at least one question.");
      return;
    }
    setActionLoading(true);
    try {
      await cbtTeacher.importQuestions(id, { bank_question_ids: selectedBankIds });
      message.success("Questions imported.");
      setImportBankVisible(false);
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Import failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditQuestion = (q: any) => {
    setEditQuestionId(q.id);
    editQuestionForm.setFieldsValue({
      question_text: q.question_text,
      marks: q.marks,
    });
    setEditQuestionVisible(true);
  };

  const saveEditQuestion = async (values: any) => {
    if (!editQuestionId) return;
    setActionLoading(true);
    try {
      await cbtTeacher.updateQuestion(editQuestionId, {
        question_text: values.question_text,
        marks: values.marks,
      });
      message.success("Question updated.");
      setEditQuestionVisible(false);
      setEditQuestionId(null);
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      await cbtTeacher.deleteQuestion(questionId);
      message.success("Question removed.");
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Delete failed.");
    }
  };

  const openOptionModal = (questionId: number) => {
    setOptionModalQuestionId(questionId);
    const q = questions.find((x) => x.id === questionId);
    const opts = q?.options ?? [];
    const nextLabel = String.fromCharCode(65 + opts.length);
    optionForm.resetFields();
    optionForm.setFieldsValue({ option_label: nextLabel });
    setOptionModalVisible(true);
  };

  const addOption = async (values: any) => {
    if (!optionModalQuestionId) return;
    setActionLoading(true);
    try {
      await cbtTeacher.addOption(optionModalQuestionId, {
        option_label: values.option_label || "A",
        option_text: values.option_text,
        is_correct: !!values.is_correct,
      });
      message.success("Option added.");
      const q = questions.find((x) => x.id === optionModalQuestionId);
      const opts = q?.options ?? [];
      optionForm.resetFields();
      optionForm.setFieldsValue({ option_label: String.fromCharCode(65 + opts.length + 1) });
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Add option failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateOption = async (optionId: number, body: { option_text?: string; is_correct?: boolean }) => {
    try {
      await cbtTeacher.updateOption(optionId, body);
      message.success("Option updated.");
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Update failed.");
    }
  };

  const deleteOption = async (optionId: number) => {
    try {
      await cbtTeacher.deleteOption(optionId);
      message.success("Option removed.");
      loadExam();
    } catch (e: any) {
      message.error(e.response?.data?.message || "Delete failed.");
    }
  };

  const invalidId = !id || !Number.isFinite(id);

  if (invalidId) {
    return (
      <DashboardLayout role="teacher">
        <Card title="Exam">
          <Alert type="error" message="Invalid exam ID" />
          <Link href="/teachers/cbt/exams" style={{ display: "inline-block", marginTop: 16 }}>
            <Button>Back to exams</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const tabItems = [
    {
      key: "questions",
      label: "Questions",
      children: (
        <>
          <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            <Button type="primary" onClick={openAddQuestion}>
              Add question
            </Button>
            <Button onClick={openImportBank}>Import from question bank</Button>
          </div>
          <Table
            dataSource={questions}
            rowKey="id"
            columns={[
              { title: "ID", dataIndex: "id", width: 60 },
              { title: "Type", dataIndex: "question_type", width: 80 },
              { title: "Text", dataIndex: "question_text", ellipsis: true },
              { title: "Marks", dataIndex: "marks", width: 70 },
              {
                title: "Options",
                key: "options",
                width: 100,
                render: (_: any, r: any) =>
                  r.question_type === "mcq" ? (
                    <Button size="small" onClick={() => openOptionModal(r.id)}>
                      Manage options
                    </Button>
                  ) : (
                    "—"
                  ),
              },
              {
                title: "Actions",
                key: "actions",
                width: 180,
                render: (_: any, r: any) => (
                  <>
                    <Button size="small" onClick={() => openEditQuestion(r)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Remove this question?"
                      onConfirm={() => deleteQuestion(r.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </>
                ),
              },
            ]}
            pagination={false}
          />
        </>
      ),
    },
    {
      key: "attempts",
      label: "Attempts / Grading",
      children: (
        <Table
          dataSource={attempts}
          rowKey="id"
          columns={[
            { title: "ID", dataIndex: "id", width: 70 },
            { title: "Student", dataIndex: "student_name", key: "student_name" },
            {
              title: "Actions",
              key: "actions",
              render: (_: any, r: any) => (
                <Link href={`/teachers/cbt/grading/${r.id}`}>
                  <Button size="small">View script / Mark theory</Button>
                </Link>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <DashboardLayout role="teacher">
      <Card
        title={exam?.title ?? `Exam #${id}`}
        extra={
          <>
            <Button onClick={() => router.push(`/teachers/cbt/exams/${id}/preview`)}>Preview</Button>
            <Button onClick={openEditExam} style={{ marginLeft: 8 }}>
              Edit Settings
            </Button>
            <Button onClick={cloneExam} loading={cloneLoading} style={{ marginLeft: 8 }}>
              Clone
            </Button>
            <Popconfirm
              title="Delete this exam?"
              description="This will remove the exam and related data. This cannot be undone."
              onConfirm={deleteExam}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button danger style={{ marginLeft: 8 }}>
                Delete exam
              </Button>
            </Popconfirm>
          </>
        }
      >
        {error && (
          <Alert
            type="error"
            title={error}
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 16 }}
          />
        )}
        <Tabs items={tabItems} />
      </Card>

      <Modal
        title="Edit Settings"
        open={editExamVisible}
        onCancel={() => setEditExamVisible(false)}
        footer={null}
        width={560}
      >
        <Spin spinning={editFormLoading} tip="Loading exam...">
          <Form
            form={editExamForm}
            layout="vertical"
            onFinish={saveEditExam}
          >
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="instructions" label="Instructions">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="duration_minutes" label="Duration (minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="total_marks" label="Total marks" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="start_time" label="Start time">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="end_time" label="End time">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Save
              </Button>
              <Button onClick={() => setEditExamVisible(false)} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Add question"
        open={addQuestionVisible}
        onCancel={() => setAddQuestionVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={addQuestionForm} layout="vertical" onFinish={saveAddQuestion}>
          <Form.Item name="question_type" label="Type" initialValue="mcq">
            <Select options={[{ value: "mcq", label: "MCQ" }, { value: "theory", label: "Theory" }]} />
          </Form.Item>
          <Form.Item name="question_text" label="Question text" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.question_type !== curr.question_type}>
            {({ getFieldValue }) =>
              getFieldValue("question_type") === "mcq" ? (
                <Form.List name="options">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          <Form.Item {...rest} name={[name, "option_label"]} initialValue="A" style={{ width: 60 }}>
                            <Input placeholder="A" />
                          </Form.Item>
                          <Form.Item {...rest} name={[name, "option_text"]} rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input placeholder="Option text" />
                          </Form.Item>
                          <Form.Item {...rest} name={[name, "is_correct"]} initialValue={false}>
                            <Select style={{ width: 100 }} options={[{ value: true, label: "Correct" }, { value: false, label: "Wrong" }]} />
                          </Form.Item>
                          <Button type="link" danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() =>
                          add({
                            option_label: String.fromCharCode(65 + fields.length),
                            option_text: "",
                            is_correct: false,
                          })
                        }
                        block
                      >
                        + Add option
                      </Button>
                    </>
                  )}
                </Form.List>
              ) : null
            }
          </Form.Item>
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Add question
            </Button>
            <Button onClick={() => setAddQuestionVisible(false)} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import from question bank"
        open={importBankVisible}
        onCancel={() => setImportBankVisible(false)}
        onOk={doImportBank}
        confirmLoading={actionLoading}
        okText="Import selected"
        width={640}
      >
        {bankLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <Table
            rowSelection={{
              selectedRowKeys: selectedBankIds,
              onChange: (keys) => setSelectedBankIds(keys as number[]),
            }}
            rowKey="id"
            dataSource={bankQuestions}
            columns={[
              { title: "ID", dataIndex: "id", width: 60 },
              { title: "Type", dataIndex: "question_type", width: 80 },
              { title: "Text", dataIndex: "question_text", ellipsis: true },
              { title: "Marks", dataIndex: "marks", width: 70 },
            ]}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Modal>

      <Modal
        title="Edit question"
        open={editQuestionVisible}
        onCancel={() => { setEditQuestionVisible(false); setEditQuestionId(null); }}
        footer={null}
        width={520}
      >
        <Form form={editQuestionForm} layout="vertical" onFinish={saveEditQuestion}>
          <Form.Item name="question_text" label="Question text" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Save
            </Button>
            <Button onClick={() => { setEditQuestionVisible(false); setEditQuestionId(null); }} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Manage MCQ options"
        open={optionModalVisible}
        onCancel={() => { setOptionModalVisible(false); setOptionModalQuestionId(null); }}
        footer={null}
        width={640}
      >
        {optionModalQuestionId && (() => {
          const q = questions.find((x) => x.id === optionModalQuestionId);
          const opts = q?.options ?? [];
          return (
            <>
              <p><strong>Question:</strong> {(q?.question_text ?? "").slice(0, 100)}...</p>
              <Form form={optionForm} layout="vertical" onFinish={addOption}>
                <Form.Item name="option_label" label="Label" initialValue="A">
                  <Input placeholder="A" style={{ width: 80 }} />
                </Form.Item>
                <Form.Item name="option_text" label="Option text" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="is_correct" initialValue={false}>
                  <Select options={[{ value: true, label: "Correct" }, { value: false, label: "Wrong" }]} style={{ width: 120 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={actionLoading}>
                  Add option
                </Button>
              </Form>
              <Table
                dataSource={opts}
                rowKey="id"
                size="small"
                columns={[
                  { title: "Label", dataIndex: "option_label", width: 70 },
                  { title: "Text", dataIndex: "option_text" },
                  {
                    title: "Correct",
                    width: 80,
                    render: (_: any, o: any) => (o.is_correct ? "Yes" : "No"),
                  },
                  {
                    title: "Actions",
                    width: 140,
                    render: (_: any, o: any) => (
                      <>
                        <Button
                          size="small"
                          onClick={() => {
                            const text = prompt("New option text:", o.option_text);
                            if (text != null) updateOption(o.id, { option_text: text });
                          }}
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Remove this option?"
                          onConfirm={() => deleteOption(o.id)}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <Button size="small" danger>Delete</Button>
                        </Popconfirm>
                      </>
                    ),
                  },
                ]}
                pagination={false}
              />
            </>
          );
        })()}
      </Modal>
    </DashboardLayout>
  );
}
