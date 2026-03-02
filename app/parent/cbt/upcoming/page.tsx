"use client";

import { useEffect, useState } from "react";
import { Card, Select, Spin, Alert, Typography, Flex, Tag } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import api from "@/app/lib/api";
import { cbtParent } from "@/app/lib/cbtApi";

const LAGOS_TZ = "Africa/Lagos";

function formatInLagos(isoString: string | null | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("en-NG", {
      timeZone: LAGOS_TZ,
      dateStyle: "medium",
      timeStyle: "short",
      ...options,
    });
  } catch {
    return isoString;
  }
}

export default function ParentCBTUpcomingPage() {
  const [children, setChildren] = useState<{ uuid: string; name: string }[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState("");
  const [exams, setExams] = useState<any[]>([]);

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
      setExams([]);
      return;
    }
    (async () => {
      setLoadingExams(true);
      setError("");
      try {
        const res = await cbtParent.getChildUpcomingExams(selectedUuid);
        const data = (res.data as any)?.data ?? res.data;
        setExams(Array.isArray(data) ? data : data?.exams ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load upcoming exams.");
        setExams([]);
      } finally {
        setLoadingExams(false);
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
      <Card title="Child upcoming exams">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Select
          placeholder="Select child"
          style={{ width: 260, marginBottom: 16 }}
          value={selectedUuid || undefined}
          onChange={setSelectedUuid}
          options={children.map((c) => ({ value: c.uuid, label: c.name }))}
        />
        {loadingExams ? <Spin /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {exams.length === 0 ? (
              <Typography.Text type="secondary">No upcoming exams for this child.</Typography.Text>
            ) : (
              exams.map((item: any, idx: number) => {
                const title = item.title ?? item.name ?? `Exam #${item.id}`;
                const subject = item.subject?.name ?? item.subject_name;
                const startLagos = formatInLagos(item.start_time);
                const endLagos = formatInLagos(item.end_time);
                const duration = item.duration_minutes;
                return (
                  <div
                    key={item.id ?? idx}
                    style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}
                  >
                    <Typography.Text strong style={{ display: "block", marginBottom: 6, fontSize: 15 }}>
                      {title}
                    </Typography.Text>
                    <Flex wrap="wrap" gap={8} align="center">
                      {subject && <Tag color="blue">{subject}</Tag>}
                      {startLagos && (
                        <Typography.Text type="secondary">
                          Start: {startLagos}
                        </Typography.Text>
                      )}
                      {endLagos && (
                        <Typography.Text type="secondary">
                          End: {endLagos}
                        </Typography.Text>
                      )}
                      {duration != null && (
                        <Typography.Text type="secondary">{duration} min</Typography.Text>
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
