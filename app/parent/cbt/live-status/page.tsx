"use client";

import { useEffect, useState } from "react";
import { Card, Select, Spin, Alert, Tag, Typography } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import api from "@/app/lib/api";
import { cbtParent } from "@/app/lib/cbtApi";

export default function ParentCBTLiveStatusPage() {
  const [children, setChildren] = useState<{ uuid: string; name: string }[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<any>(null);

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
      setStatus(null);
      return;
    }
    (async () => {
      setLoadingStatus(true);
      setError("");
      try {
        const res = await cbtParent.getChildLiveStatus(selectedUuid);
        const data = (res.data as any)?.data ?? res.data;
        setStatus(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load live status.");
        setStatus(null);
      } finally {
        setLoadingStatus(false);
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

  const isWriting = status && (status.writing === true || status.is_writing === true || status.active === true);

  return (
    <DashboardLayout role="parent">
      <Card title="Child live status">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Select
          placeholder="Select child"
          style={{ width: 260, marginBottom: 16 }}
          value={selectedUuid || undefined}
          onChange={setSelectedUuid}
          options={children.map((c) => ({ value: c.uuid, label: c.name }))}
        />
        {loadingStatus ? <Spin /> : (
          <div>
            {status == null ? (
              <Typography.Text type="secondary">Select a child to see their live status.</Typography.Text>
            ) : (
              <>
                {isWriting ? (
                  <Tag color="orange" style={{ fontSize: 16 }}>Currently writing an exam</Tag>
                ) : (
                  <Tag color="default">Not writing an exam now</Tag>
                )}
                <div style={{ marginTop: 12 }}>
                  <Typography.Text>
                    {status.message ?? (isWriting ? "Your child is currently writing an exam." : "Your child is not currently writing an exam.")}
                  </Typography.Text>
                </div>
                {isWriting && status.exam_title && (
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary">Exam: {status.exam_title}</Typography.Text>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
