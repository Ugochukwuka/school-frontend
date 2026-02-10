"use client";

import { Layout, Menu, Drawer, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DollarOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  HomeOutlined,
  MenuOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useResponsive } from "@/app/lib/responsive";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const { Sider } = Layout;

interface SidebarProps {
  role: "student" | "teacher" | "admin" | "parent";
  isDarkMode?: boolean;
}

export default function Sidebar({ role, isDarkMode = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isMobile: responsiveMobile } = useResponsive();

  useEffect(() => {
    setSelectedKey(pathname);
    
    // Handle submenu open keys
    if (pathname.startsWith("/teachers/results")) {
      setOpenKeys(["results"]);
    }
    if (pathname.startsWith("/teachers/attendance")) {
      setOpenKeys(["attendance-management"]);
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileDrawerVisible(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [pathname]);

  const studentMenuItems = [
    {
      key: "/dashboard/student",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "/dashboard/student/class-members",
      icon: <TeamOutlined />,
      label: "Class Members",
    },
    {
      key: "/dashboard/student/subjects",
      icon: <BookOutlined />,
      label: "Subjects",
    },
    {
      key: "/dashboard/student/timetable",
      icon: <CalendarOutlined />,
      label: "Timetable",
    },
    {
      key: "/dashboard/student/results",
      icon: <TrophyOutlined />,
      label: "Results",
    },
    {
      key: "/dashboard/student/session-details",
      icon: <FileTextOutlined />,
      label: "Session Details",
    },
    {
      key: "/dashboard/student/payment-history",
      icon: <DollarOutlined />,
      label: "Payment History",
    },
    {
      key: "/dashboard/student/fee/obligations",
      icon: <DollarOutlined />,
      label: "Fee Obligations",
    },
    {
      key: "/dashboard/student/profile",
      icon: <SettingOutlined />,
      label: "Profile",
    },
  ];

  const teacherMenuItems = [
    {
      key: "/teachers/dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "attendance-management",
      icon: <UserOutlined />,
      label: "Attendance Management",
      children: [
        {
          key: "/teachers/attendance",
          icon: <UserOutlined />,
          label: "Mark Attendance",
        },
        {
          key: "/teachers/attendance/summary",
          icon: <FileTextOutlined />,
          label: "Attendance Summary",
        },
      ],
    },
    {
      key: "results",
      icon: <TrophyOutlined />,
      label: "Results",
      children: [
        {
          key: "/teachers/results/enter",
          icon: <PlusOutlined />,
          label: "Enter Scores",
        },
        {
          key: "/teachers/results/view",
          icon: <EyeOutlined />,
          label: "View All Results",
        },
        {
          key: "/teachers/results/update",
          icon: <EditOutlined />,
          label: "Update Results",
        },
        {
          key: "/teachers/results/single",
          icon: <EyeOutlined />,
          label: "View Single Result",
        },
      ],
    },
    {
      key: "/teachers/class-subject-management",
      icon: <BookOutlined />,
      label: "Class & Subject Management",
    },
  ];

  const adminMenuItems = [
    {
      key: "/admin/dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "student-management",
      icon: <TeamOutlined />,
      label: "Student Management",
      children: [
        {
          key: "/admin/students/add",
          icon: <PlusOutlined />,
          label: "Add Student",
        },
        {
          key: "/admin/students",
          icon: <EyeOutlined />,
          label: "View All Students",
        },
        {
          key: "/admin/students/view",
          icon: <EyeOutlined />,
          label: "View Students (Filtered)",
        },
        {
          key: "/admin/students/promote",
          icon: <EditOutlined />,
          label: "Promote Students",
        },
      ],
    },
    {
      key: "teacher-management",
      icon: <UserOutlined />,
      label: "Teacher Management",
      children: [
        {
          key: "/admin/teachers/add",
          icon: <PlusOutlined />,
          label: "Add Teacher",
        },
        {
          key: "/admin/teachers",
          icon: <EyeOutlined />,
          label: "View All Teachers",
        },
        {
          key: "/admin/teachers/assign-subject",
          icon: <BookOutlined />,
          label: "Assign Subjects",
        },
        {
          key: "/admin/teachers/assign-class",
          icon: <TeamOutlined />,
          label: "Assign Class",
        },
        {
          key: "/admin/classes/subjects",
          icon: <BookOutlined />,
          label: "Add Subjects to Class",
        },
        {
          key: "/admin/teachers/edit",
          icon: <EditOutlined />,
          label: "Edit Teacher",
        },
      ],
    },
    {
      key: "result-management",
      icon: <TrophyOutlined />,
      label: "Result Management",
      children: [
        {
          key: "/admin/results/enter",
          icon: <PlusOutlined />,
          label: "Enter Results",
        },
        {
          key: "/admin/results/view",
          icon: <EyeOutlined />,
          label: "View All Results",
        },
        {
          key: "/admin/results/update",
          icon: <EditOutlined />,
          label: "Update Results",
        },
        {
          key: "/admin/results/single",
          icon: <EyeOutlined />,
          label: "View Single Result",
        },
      ],
    },
    {
      key: "bookshop-management",
      icon: <BookOutlined />,
      label: "Bookshop Management",
      children: [
        {
          key: "/admin/bookshop/books/add",
          icon: <PlusOutlined />,
          label: "Add Book",
        },
        {
          key: "/admin/bookshop/books",
          icon: <EyeOutlined />,
          label: "View All Books",
        },
        {
          key: "/admin/bookshop/books/edit",
          icon: <EditOutlined />,
          label: "Edit Book",
        },
        {
          key: "/admin/bookshop/books/assign",
          icon: <TeamOutlined />,
          label: "Assign Books to Class",
        },
        {
          key: "/admin/bookshop/books/requirements",
          icon: <FileTextOutlined />,
          label: "View Books Requirements",
        },
        {
          key: "/admin/bookshop/books/status",
          icon: <EyeOutlined />,
          label: "Books Status",
        },
        {
          key: "/admin/bookshop/viewallbooksales",
          icon: <FileTextOutlined />,
          label: "View all Book sold",
        },
      ],
    },
    {
      key: "fees-overview",
      icon: <DollarOutlined />,
      label: "Fees Overview",
      children: [
        {
          key: "/admin/fees/pay",
          icon: <DollarOutlined />,
          label: "Pay Fee (on behalf)",
        },
        {
          key: "/admin/fees/payment/history",
          icon: <FileTextOutlined />,
          label: "Payment History",
        },
        {
          key: "/admin/fees/add",
          icon: <PlusOutlined />,
          label: "Add Fees",
        },
        {
          key: "/admin/fees/paid",
          icon: <EyeOutlined />,
          label: "Completed Payments",
        },
        {
          key: "/admin/fees/part/paid",
          icon: <EyeOutlined />,
          label: "Part Payments",
        },
        {
          key: "/admin/fees/unpaid",
          icon: <EyeOutlined />,
          label: "Unpaid Fees",
        },
        {
          key: "/admin/fees/obligations",
          icon: <FileTextOutlined />,
          label: "Fee Obligations",
        },
      ],
    },
    {
      key: "announcement",
      icon: <BellOutlined />,
      label: "Announcement",
      children: [
        {
          key: "/admin/announcements",
          icon: <EyeOutlined />,
          label: "View Announcements",
        },
        {
          key: "/admin/announcements/add",
          icon: <PlusOutlined />,
          label: "Add Announcement",
        },
      ],
    },
    {
      key: "/admin/profile",
      icon: <SettingOutlined />,
      label: "Profile Settings",
    },
  ];

  const parentMenuItems = [
    {
      key: "/parent/dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "child-overview",
      icon: <TeamOutlined />,
      label: "Child Overview Dashboard",
      children: [
        {
          key: "/parent/children",
          icon: <TeamOutlined />,
          label: "My Children",
        },
      ],
    },
    {
      key: "academic-monitoring",
      icon: <TrophyOutlined />,
      label: "Academic Monitoring",
      children: [
        {
          key: "/parent/academic/results",
          icon: <EyeOutlined />,
          label: "View Results",
        },
      ],
    },
    {
      key: "attendance-tracking",
      icon: <CalendarOutlined />,
      label: "Attendance Tracking",
      children: [
        {
          key: "/parent/attendance",
          icon: <EyeOutlined />,
          label: "Attendance History",
        },
      ],
    },
    {
      key: "fees",
      icon: <DollarOutlined />,
      label: "Fees & Payments",
      children: [
        {
          key: "/parent/fees/pay",
          icon: <DollarOutlined />,
          label: "Pay Fee",
        },
        {
          key: "/parent/fees",
          icon: <EyeOutlined />,
          label: "Payment History",
        },
      ],
    },
    {
      key: "/parent/profile",
      icon: <SettingOutlined />,
      label: "Profile Settings",
    },
  ];

  const getMenuItems = () => {
    switch (role) {
      case "student":
        return studentMenuItems;
      case "teacher":
        return teacherMenuItems;
      case "admin":
        return adminMenuItems;
      case "parent":
        return parentMenuItems;
      default:
        return [];
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const menuContent = (
    <>
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
          padding: collapsed && !isMobile ? "8px" : "12px",
          flexDirection: collapsed && !isMobile ? "column" : "row",
          gap: collapsed && !isMobile ? "4px" : "12px",
        }}
      >
        <Logo
          width={collapsed && !isMobile ? 36 : 40}
          height={collapsed && !isMobile ? 36 : 40}
          showFallback={true}
        />
        {(!collapsed || isMobile) && (
          <span
            style={{
              fontWeight: "bold",
              fontSize: collapsed && !isMobile ? "12px" : "16px",
              color: "#1a1a1a",
              whiteSpace: "nowrap",
            }}
          >
            {collapsed && !isMobile ? "SMS" : "School Management"}
          </span>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        items={getMenuItems()}
        onClick={handleMenuClick}
        style={{ borderRight: 0, marginTop: "8px" }}
      />
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileDrawerVisible(true)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1001,
            width: 40,
            height: 40,
          }}
        />
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          styles={{ body: { padding: 0 } }}
          size={250}
        >
          {menuContent}
        </Drawer>
      </>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      breakpoint="lg"
      collapsedWidth={80}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        background: isDarkMode ? "#141414" : "#fff",
      }}
      theme={isDarkMode ? "dark" : "light"}
    >
      {menuContent}
    </Sider>
  );
}

