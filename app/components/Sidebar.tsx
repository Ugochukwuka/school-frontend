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
  ClockCircleOutlined,
  GlobalOutlined,
  BankOutlined,
  CommentOutlined,
  CrownOutlined,
  BuildOutlined,
  FormOutlined,
  BarChartOutlined,
  UnlockOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useResponsive } from "@/app/lib/responsive";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

const { Sider } = Layout;

interface SidebarProps {
  role: "student" | "teacher" | "admin" | "parent";
  isDarkMode?: boolean;
}

export default function Sidebar({ role, isDarkMode = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  // Initialize state based on pathname to ensure consistent SSR
  const getInitialOpenKeys = () => {
    if (!pathname) return [];
    if (pathname.startsWith("/teachers/results")) return ["results"];
    if (pathname.startsWith("/teachers/attendance")) return ["attendance-management"];
    if (pathname.startsWith("/admin/timetable") || pathname.startsWith("/admin/students/timetable") || pathname.startsWith("/admin/exam/timetable") || pathname.startsWith("/admin/viewexam/timetable")) return ["contents-management", "timetable-management"];
    if (pathname.startsWith("/admin/blog") || pathname.startsWith("/admin/createBlog") || pathname.startsWith("/admin/viewAllBlogs") || pathname.startsWith("/admin/viewSingleBlog") || pathname.startsWith("/admin/updateBlog")) return ["contents-management", "blog-management"];
    if (pathname.startsWith("/admin/tuitionfee") || pathname.startsWith("/admin/updateTuitionFee") || pathname.startsWith("/admin/viewSingleTuitionFee")) return ["contents-management", "tuition-fee-management"];
    if (pathname.startsWith("/admin/session")) return ["academic-session-management"];
    if (pathname.startsWith("/admin/testimonial") || pathname.startsWith("/admin/addTestimonial") || pathname.startsWith("/admin/viewAllTestimonials")) return ["contents-management", "testimonial-management"];
    if (pathname.startsWith("/admin/leadership") || pathname.startsWith("/admin/addLeader") || pathname.startsWith("/admin/viewAllLeaders") || pathname.startsWith("/admin/viewSingleLeader")) return ["contents-management", "leadership-management"];
    if (pathname.startsWith("/admin/schoolprofile")) return ["contents-management", "school-profile-management"];
    if (pathname.startsWith("/admin/cbt")) {
      if (pathname.startsWith("/admin/cbt/settings") || pathname.startsWith("/admin/cbt/sync")) return ["cbt-admin", "cbt-admin-settings"];
      if (pathname.startsWith("/admin/cbt/exams")) return ["cbt-admin", "cbt-admin-exam-control"];
      if (pathname.startsWith("/admin/cbt/analytics") || pathname.startsWith("/admin/cbt/reports") || pathname.startsWith("/admin/cbt/export")) return ["cbt-admin", "cbt-admin-analytics"];
      if (pathname.startsWith("/admin/cbt/question-bank")) return ["cbt-admin", "cbt-admin-question-bank"];
      return ["cbt-admin"];
    }
    if (pathname.startsWith("/dashboard/student/cbt")) return ["cbt-student"];
    if (pathname.startsWith("/teachers/cbt")) return ["cbt-teacher"];
    if (pathname.startsWith("/parent/cbt")) return ["cbt-parent"];
    return [];
  };
  
  const [selectedKey, setSelectedKey] = useState(pathname || "");
  const [openKeys, setOpenKeys] = useState<string[]>(getInitialOpenKeys());
  // Initialize lastSelectedMenuKey from sessionStorage if available
  const [lastSelectedMenuKey, setLastSelectedMenuKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lastSelectedMenuKey") || "";
    }
    return "";
  });
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isMobile: responsiveMobile } = useResponsive();
  const { schoolName, logoPath } = useSchoolProfile();
  
  // Helper to update lastSelectedMenuKey and persist to sessionStorage
  const updateLastSelectedMenuKey = (key: string) => {
    setLastSelectedMenuKey(key);
    if (typeof window !== "undefined" && key) {
      sessionStorage.setItem("lastSelectedMenuKey", key);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (pathname) {
      // Get the best matching menu state for the current pathname
      const menuState = getMenuStateForPath(pathname);
      
      // PRIORITY 1: If pathname is an exact menu item match, use it and update lastSelectedMenuKey
      if (menuState.selectedKey === pathname && menuState.selectedKey.startsWith("/")) {
        setSelectedKey(menuState.selectedKey);
        setOpenKeys(menuState.openKeys);
        updateLastSelectedMenuKey(menuState.selectedKey);
        return;
      }
      
      // PRIORITY 2: If we have a lastSelectedMenuKey, keep it selected (for detail pages, etc.)
      // This ensures the last clicked menu item stays selected when navigating to related pages
      if (lastSelectedMenuKey) {
        const lastSelectedState = getMenuStateForPath(lastSelectedMenuKey);
        setSelectedKey(lastSelectedMenuKey);
        setOpenKeys(lastSelectedState.openKeys);
        
        // Only update lastSelectedMenuKey if we found a better exact match
        if (menuState.selectedKey.startsWith("/") && menuState.selectedKey === pathname) {
          updateLastSelectedMenuKey(menuState.selectedKey);
        }
        return;
      }
      
      // PRIORITY 3: No lastSelectedMenuKey - use best match from pathname
      setSelectedKey(menuState.selectedKey);
      setOpenKeys(menuState.openKeys);
      
      // Update last selected if we found a menu item match
      if (menuState.selectedKey.startsWith("/")) {
        updateLastSelectedMenuKey(menuState.selectedKey);
      }
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
      key: "cbt-student",
      icon: <FormOutlined />,
      label: "CBT",
      children: [
        { key: "/dashboard/student/cbt/exams", icon: <EyeOutlined />, label: "Available Exams" },
        { key: "/dashboard/student/cbt/results", icon: <TrophyOutlined />, label: "My Results" },
      ],
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
    {
      key: "cbt-teacher",
      icon: <FormOutlined />,
      label: "CBT",
      children: [
        { key: "/teachers/cbt/exams", icon: <FileTextOutlined />, label: "My Exams" },
        { key: "/teachers/cbt/grading", icon: <EditOutlined />, label: "Grading & Review" },
      ],
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
key: "academic-session-management",
          icon: <CalendarOutlined />,
          label: "Academic Session Management",
          children: [
            {
              key: "/admin/session/add",
              icon: <PlusOutlined />,
              label: "Add Session",
            },
            {
              key: "/admin/session/view-all",
              icon: <EyeOutlined />,
              label: "View All Sessions",
            },
          ],
    },
    {
      key: "contents-management",
      icon: <FileTextOutlined />,
      label: "Contents",
      children: [
        {
          key: "timetable-management",
          icon: <ClockCircleOutlined />,
          label: "Timetable Management",
          children: [
            {
              key: "/admin/students/timetable",
              icon: <PlusOutlined />,
              label: "Add Weekly Timetable",
            },
            {
              key: "/admin/students/viewtimetable",
              icon: <EyeOutlined />,
              label: "View Weekly Timetable",
            },
            {
              key: "/admin/exam/timetable/add",
              icon: <PlusOutlined />,
              label: "Add Exam Timetable",
            },
            {
              key: "/admin/viewexam/timetable",
              icon: <EyeOutlined />,
              label: "View Exam Timetable",
            },
          ],
        },
        {
          key: "blog-management",
          icon: <FileTextOutlined />,
          label: "Blog Management",
          children: [
            {
              key: "/admin/createBlog",
              icon: <PlusOutlined />,
              label: "Create Blog",
            },
            {
              key: "/admin/viewAllBlogs",
              icon: <EyeOutlined />,
              label: "View All Blogs",
            },
          ],
        },
        {
          key: "tuition-fee-management",
          icon: <BankOutlined />,
          label: "FrontEnd Tuition Fee Management",
          children: [
            {
              key: "/admin/tuitionfee/add",
              icon: <PlusOutlined />,
              label: "Add Tuition Fee",
            },
            {
              key: "/admin/tuitionfee/viewall",
              icon: <EyeOutlined />,
              label: "View All Tuition Fees",
            },
          ],
        },
        {
          key: "testimonial-management",
          icon: <CommentOutlined />,
          label: "Testimonial Management",
          children: [
            {
              key: "/admin/addTestimonial",
              icon: <PlusOutlined />,
              label: "Add Testimonial",
            },
            {
              key: "/admin/viewAllTestimonials",
              icon: <EyeOutlined />,
              label: "View All Testimonials",
            },
          ],
        },
        {
          key: "leadership-management",
          icon: <CrownOutlined />,
          label: "Front End Leadership Management",
          children: [
            {
              key: "/admin/addLeader",
              icon: <PlusOutlined />,
              label: "Add Leader",
            },
            {
              key: "/admin/leadership/viewall",
              icon: <EyeOutlined />,
              label: "View All Leaders",
            },
          ],
        },
        {
          key: "school-profile-management",
          icon: <BuildOutlined />,
          label: "School Profile Management",
          children: [
            {
              key: "/admin/schoolprofile/add",
              icon: <PlusOutlined />,
              label: "Add School Profile",
            },
            {
              key: "/admin/schoolprofile/view",
              icon: <EyeOutlined />,
              label: "View School Profile",
            },
          ],
        },
      ],
    },
    {
      key: "cbt-admin",
      icon: <FormOutlined />,
      label: "CBT",
      children: [
        {
          key: "cbt-admin-settings",
          icon: <SettingOutlined />,
          label: "Settings & Configuration",
          children: [
            { key: "/admin/cbt/settings", icon: <SettingOutlined />, label: "Get settings" },
            { key: "/admin/cbt/settings/save", icon: <EditOutlined />, label: "Save settings" },
            { key: "/admin/cbt/sync", icon: <GlobalOutlined />, label: "Sync" },
          ],
        },
        {
          key: "cbt-admin-exam-control",
          icon: <UnlockOutlined />,
          label: "Exam Control",
          children: [
            { key: "/admin/cbt/exams", icon: <FileTextOutlined />, label: "Lock / Unlock exam" },
          ],
        },
        {
          key: "cbt-admin-analytics",
          icon: <BarChartOutlined />,
          label: "Analytics & Reports",
          children: [
            { key: "/admin/cbt/analytics", icon: <BarChartOutlined />, label: "Analytics" },
            { key: "/admin/cbt/reports", icon: <FileTextOutlined />, label: "Reports" },
            { key: "/admin/cbt/export", icon: <FileTextOutlined />, label: "Export (results / summary)" },
          ],
        },
        {
          key: "cbt-admin-question-bank",
          icon: <DatabaseOutlined />,
          label: "Question Bank",
          children: [
            { key: "/admin/cbt/question-bank", icon: <EyeOutlined />, label: "Question bank - List" },
            { key: "/admin/cbt/question-bank/create", icon: <PlusOutlined />, label: "Question bank - Create" },
          ],
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
      key: "cbt-parent",
      icon: <FormOutlined />,
      label: "CBT",
      children: [
        { key: "/parent/cbt", icon: <TrophyOutlined />, label: "Child exam history" },
        { key: "/parent/cbt/upcoming", icon: <CalendarOutlined />, label: "Child upcoming exams" },
        { key: "/parent/cbt/live-status", icon: <EyeOutlined />, label: "Child live status" },
        { key: "/parent/cbt/notifications", icon: <BellOutlined />, label: "Child notifications" },
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

  // Helper function to find parent menu keys for a given menu item key
  const findParentKeys = (items: any[], targetKey: string, parentKeys: string[] = []): string[] | null => {
    for (const item of items) {
      if (item.key === targetKey) {
        return parentKeys;
      }
      if (item.children) {
        const result = findParentKeys(item.children, targetKey, [...parentKeys, item.key]);
        if (result !== null) {
          return result;
        }
      }
    }
    return null;
  };

  // Helper function to find the best matching menu item for a pathname
  // This handles cases where the pathname might not be an exact menu item (e.g., detail pages)
  const findBestMatchingMenuKey = (items: any[], pathname: string, parentKeys: string[] = [], bestMatch: { key: string; parentKeys: string[]; score: number } | null = null): { key: string; parentKeys: string[] } | null => {
    for (const item of items) {
      // Check if this is a menu item with a route (starts with /)
      if (item.key.startsWith("/")) {
        // Exact match - return immediately
        if (item.key === pathname) {
          return { key: item.key, parentKeys };
        }
        
        // Calculate similarity score
        const pathParts = pathname.split("/").filter(Boolean);
        const keyParts = item.key.split("/").filter(Boolean);
        let score = 0;
        
        // Check how many path segments match from the beginning
        const minLength = Math.min(pathParts.length, keyParts.length);
        for (let i = 0; i < minLength; i++) {
          if (pathParts[i] === keyParts[i]) {
            score += 1;
          } else {
            break;
          }
        }
        
        // Prefer matches where pathname starts with menu key or they share significant base path
        if (pathname.startsWith(item.key + "/") || pathname.startsWith(item.key + "?")) {
          score = keyParts.length + 10; // High score for sub-paths
        } else if (score >= 2 && pathname.includes(keyParts.slice(0, -1).join("/"))) {
          // Good match if they share base path (e.g., /admin/students/viewtimetable and /admin/students/viewsingletimetable)
          score = score + 5;
        }
        
        // Update best match if this is better
        if (score >= 2 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { key: item.key, parentKeys, score };
        }
      }
      
      // Recursively check children
      if (item.children) {
        const childMatch = findBestMatchingMenuKey(item.children, pathname, [...parentKeys, item.key], bestMatch);
        if (childMatch && (!bestMatch || (childMatch as any).score > bestMatch.score)) {
          bestMatch = childMatch as any;
        }
      }
    }
    return bestMatch ? { key: bestMatch.key, parentKeys: bestMatch.parentKeys } : null;
  };

  // Helper function to get open keys and selected key based on the pathname
  const getMenuStateForPath = (pathname: string): { selectedKey: string; openKeys: string[] } => {
    const menuItems = getMenuItems();
    
    // First, try to find exact match
    const exactParentKeys = findParentKeys(menuItems, pathname);
    if (exactParentKeys !== null) {
      return { selectedKey: pathname, openKeys: exactParentKeys };
    }
    
    // If no exact match, find the best matching menu item
    const bestMatch = findBestMatchingMenuKey(menuItems, pathname);
    if (bestMatch) {
      return { selectedKey: bestMatch.key, openKeys: bestMatch.parentKeys };
    }
    
    // Fallback to initial open keys logic
    const initialKeys = getInitialOpenKeys();
    return { selectedKey: pathname, openKeys: initialKeys };
  };

  // Helper function to get open keys based on the clicked key
  const getOpenKeysForPath = (key: string): string[] => {
    const menuItems = getMenuItems();
    const parentKeys = findParentKeys(menuItems, key);
    return parentKeys || [];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    // Only navigate if it's a valid route (starts with /)
    if (key.startsWith("/")) {
      // Store this as the last selected menu key (persists to sessionStorage)
      updateLastSelectedMenuKey(key);
      
      // Update selected key immediately
      setSelectedKey(key);
      
      // Find and open parent menu items
      const parentKeys = getOpenKeysForPath(key);
      if (parentKeys.length > 0) {
        setOpenKeys(parentKeys);
      }
      
      // Navigate to the route
      router.push(key);
      
      if (isMobile) {
        setMobileDrawerVisible(false);
      }
    }
  };

  const menuContent = (
    <>
      <div
        suppressHydrationWarning
        style={{
          height: "56px",
          minHeight: "56px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          borderBottom: isDarkMode ? "1px solid #303030" : "1px solid #f0f0f0",
          padding: collapsed && !isMobile ? "6px" : "10px 12px",
          flexDirection: collapsed && !isMobile ? "column" : "row",
          gap: collapsed && !isMobile ? "4px" : "10px",
          overflow: "hidden",
        }}
      >
        <div style={{ flexShrink: 0, width: collapsed && !isMobile ? 28 : 32, height: collapsed && !isMobile ? 28 : 32 }}>
          <Logo
            width={collapsed && !isMobile ? 28 : 32}
            height={collapsed && !isMobile ? 28 : 32}
            showFallback={true}
            logoPath={logoPath}
          />
        </div>
        {(!collapsed || isMobile) && (
          <span
            suppressHydrationWarning
            style={{
              fontWeight: "bold",
              fontSize: collapsed && !isMobile ? "12px" : "14px",
              color: isDarkMode ? "#fafafa" : "#1a1a1a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              flex: 1,
            }}
          >
            {collapsed && !isMobile ? "SMS" : schoolName}
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
        suppressHydrationWarning
      />
    </>
  );

  // Only render after component is mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Only render mobile drawer after component is mounted to prevent hydration mismatch
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
          suppressHydrationWarning
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
      suppressHydrationWarning
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: "0px",
        top: "0px",
        bottom: "0px",
        zIndex: 1000,
        background: isDarkMode ? "#141414" : "#fff",
      }}
      theme={isDarkMode ? "dark" : "light"}
    >
      {menuContent}
    </Sider>
  );
}

