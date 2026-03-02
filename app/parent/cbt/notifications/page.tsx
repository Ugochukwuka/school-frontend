"use client";

import { useEffect, useState } from "react";
import { Card, Select, Spin, Alert } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import api from "@/app/lib/api";
import { cbtParent } from "@/app/lib/cbtApi";

export default function ParentCBTNotificationsPage() {
  const [children, setChildren] = useState<{ uuid: string; name: string }[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);

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
      setNotifications([]);
      return;
    }
    (async () => {
      setLoadingNotif(true);
      setError("");
      try {
        const res = await cbtParent.getChildNotifications(selectedUuid);
        const data = (res.data as any)?.data ?? res.data;
        setNotifications(Array.isArray(data) ? data : data?.notifications ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load notifications.");
        setNotifications([]);
      } finally {
        setLoadingNotif(false);
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
      <Card title="Child CBT notifications">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Select
          placeholder="Select child"
          style={{ width: 260, marginBottom: 16 }}
          value={selectedUuid || undefined}
          onChange={setSelectedUuid}
          options={children.map((c) => ({ value: c.uuid, label: c.name }))}
        />
        {loadingNotif ? <Spin /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((item: any, idx: number) => (
              <div
                key={item.id ?? idx}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  background: "#fafafa",
                }}
              >
                {item.message ?? item.title ?? JSON.stringify(item)}
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
