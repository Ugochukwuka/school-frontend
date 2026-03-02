"use client";

import { useEffect, useState } from "react";
import { Card, Select, Spin, Alert, Typography, Flex, Tag } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import api from "@/app/lib/api";
import { cbtParent } from "@/app/lib/cbtApi";

export default function ParentCBTHistoryPage() {
  const [children, setChildren] = useState<{ uuid: string; name: string }[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const allList: any[] = [];
        let page = 1;
        let lastPage = 1;
        do {
          const res = await api.get(`/parent/children?page=${page}`);
          const raw = res.data as any;
          const data = raw?.data ?? raw?.children ?? res.data;
          const list = Array.isArray(data) ? data : [];
          if (raw?.last_page != null) lastPage = raw.last_page;
          allList.push(...list);
          page++;
        } while (page <= lastPage);
        setChildren(allList.map((c: any) => ({ uuid: c.uuid, name: c.name || c.email || c.uuid })));
        if (allList.length && !selectedUuid) setSelectedUuid(allList[0].uuid);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load children.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedUuid) {
      setHistory([]);
      return;
    }
    (async () => {
      setLoadingHistory(true);
      setError("");
      try {
        const res = await cbtParent.getChildHistory(selectedUuid);
        const data = (res.data as any)?.data ?? res.data;
        setHistory(Array.isArray(data) ? data : data?.history ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load history.");
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [selectedUuid]);

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Card title="Child exam history">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Select
          placeholder="Select child"
          style={{ width: 260, marginBottom: 16 }}
          value={selectedUuid || undefined}
          onChange={setSelectedUuid}
          options={children.map((c) => ({ value: c.uuid, label: c.name }))}
        />
        {loadingHistory ? <Spin /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {history.length === 0 ? (
              <Typography.Text type="secondary">No exam history for this child yet.</Typography.Text>
            ) : (
              history.map((item: any, idx: number) => {
                const title = item.exam?.title ?? item.exam_title ?? item.title ?? `Exam #${item.exam_id ?? item.id}`;
                const subject = item.exam?.subject?.name ?? item.exam?.subject_name;
                const score = item.total_score != null ? Number(item.total_score) : item.score;
                const totalMarks = item.total_marks != null ? Number(item.total_marks) : null;
                const percentage = item.percentage != null ? Number(item.percentage) : null;
                const grade = item.grade;
                const date = item.created_at
                  ? new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                  : null;
                const duration = item.exam?.duration_minutes;
                return (
                  <div
                    key={item.id ?? item.exam_id ?? idx}
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography.Text strong style={{ display: "block", marginBottom: 6, fontSize: 15 }}>
                      {title}
                    </Typography.Text>
                    <Flex wrap="wrap" gap={8} align="center">
                      {subject && (
                        <Tag color="blue">{subject}</Tag>
                      )}
                      {score != null && (
                        <Typography.Text type="secondary">
                          Score: {totalMarks != null ? `${score} / ${totalMarks}` : String(score)}
                        </Typography.Text>
                      )}
                      {percentage != null && (
                        <Typography.Text type="secondary">
                          {percentage.toFixed(1)}%
                        </Typography.Text>
                      )}
                      {grade && (
                        <Tag color="green">{grade}</Tag>
                      )}
                      {duration != null && (
                        <Typography.Text type="secondary">{duration} min</Typography.Text>
                      )}
                      {date && (
                        <Typography.Text type="secondary">{date}</Typography.Text>
                      )}
                    </Flex>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
