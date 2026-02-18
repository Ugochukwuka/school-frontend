"use client";

import { Avatar, Dropdown, Badge, Button, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  MailOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useResponsive } from "@/app/lib/responsive";
import { useDarkMode } from "@/app/lib/useDarkMode";

const { Text } = Typography;

interface DashboardHeaderProps {
  role: "student" | "teacher" | "admin" | "parent";
  isDarkMode?: boolean;
  onDarkModeToggle?: () => void;
}

export default function DashboardHeader({ role, isDarkMode = false, onDarkModeToggle }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useResponsive();
  const { isDarkMode: hookDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    uuid?: string;
  } | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Use prop if provided, otherwise use hook
  const darkMode = isDarkMode !== undefined ? isDarkMode : hookDarkMode;
  const handleToggle = onDarkModeToggle || toggleDarkMode;

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }

    // TODO: Fetch notification count from API
    // For now, set a mock count
    setNotificationCount(3);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getProfilePath = () => {
    switch (role) {
      case "student":
        return "/dashboard/student/profile";
      case "teacher":
        // Teachers might not have a dedicated profile page, use dashboard
        return "/teachers/attendance";
      case "admin":
        return "/admin/profile";
      case "parent":
        return "/parent/profile";
      default:
        return "/dashboard/student/profile";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push(getProfilePath()),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push(getProfilePath()),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const notificationMenuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div
          style={{
            padding: "8px 0",
            borderBottom: darkMode ? "1px solid #303030" : "1px solid #f0f0f0",
            marginBottom: "4px",
          }}
        >
          <Text strong style={{ fontSize: "14px" }}>
            Notifications
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
      style: { margin: "4px 0" },
    },
    {
      key: "1",
      label: (
        <div
          style={{
            padding: "8px 0",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: "4px" }}>
            New assignment posted
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            2 hours ago
          </Text>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          style={{
            padding: "8px 0",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: "4px" }}>
            Payment reminder
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            5 hours ago
          </Text>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          style={{
            padding: "8px 0",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: "4px" }}>
            Class schedule updated
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            1 day ago
          </Text>
        </div>
      ),
    },
    {
      type: "divider",
      style: { margin: "8px 0" },
    },
    {
      key: "view-all",
      label: (
        <div
          style={{
            textAlign: "center",
            padding: "8px 0",
            cursor: "pointer",
          }}
          onClick={() => {
            // TODO: Navigate to notifications page
            console.log("View all notifications");
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            View all notifications
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div
      suppressHydrationWarning
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "16px",
        marginBottom: "16px",
        borderBottom: darkMode ? "1px solid #303030" : "1px solid #f0f0f0",
      }}
    >
      {/* Left side - empty for now, can add search or other elements */}
      <div style={{ flex: 1 }}></div>

      {/* Right side - Notifications and Profile */}
      <Space size={isMobile ? 8 : 16} align="center" wrap>
        {/* Dark Mode Toggle - Available for all dashboards */}
        <Button
          type="text"
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={handleToggle}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isMobile ? "32px" : "40px",
            height: isMobile ? "32px" : "40px",
            minWidth: isMobile ? "32px" : "40px",
            padding: 0,
            color: darkMode ? "#faad14" : "#666",
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        />
        
        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
          dropdownStyle={{ 
            width: isMobile ? "calc(100vw - 32px)" : "320px", 
            maxWidth: "90vw",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
          suppressHydrationWarning
        >
          <Button
            type="text"
            icon={
              <Badge count={notificationCount} size="small" offset={isMobile ? [-3, 3] : [-5, 5]}>
                <BellOutlined
                  style={{
                    fontSize: isMobile ? "16px" : "20px",
                    color: darkMode ? "#d9d9d9" : "#666",
                  }}
                />
              </Badge>
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? "32px" : "40px",
              height: isMobile ? "32px" : "40px",
              minWidth: isMobile ? "32px" : "40px",
              padding: 0,
            }}
          />
        </Dropdown>

        {/* Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
          suppressHydrationWarning
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? "#303030" : "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div
              style={{
                display: isMobile ? "none" : "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                marginRight: "4px",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "14px",
                  lineHeight: "1.2",
                  color: darkMode ? "#ffffff" : "#1a1a1a",
                }}
              >
                {user?.name || "User"}
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  lineHeight: "1.2",
                  textTransform: "capitalize",
                }}
              >
                {user?.role || role}
              </Text>
            </div>
            <Avatar
              size={isMobile ? 32 : 40}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                cursor: "pointer",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
              icon={<UserOutlined />}
            >
              {user?.name ? getInitials(user.name) : "U"}
            </Avatar>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
}

