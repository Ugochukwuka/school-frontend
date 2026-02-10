"use client";

import { Layout, Breadcrumb, ConfigProvider, theme, App } from "antd";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import BackToTop from "./BackToTop";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeOutlined } from "@ant-design/icons";
import { useDarkMode } from "@/app/lib/useDarkMode";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "teacher" | "admin" | "parent";
}

// Breadcrumb path mappings
const breadcrumbMap: { [key: string]: string } = {
  // Student routes
  "/dashboard/student": "Dashboard",
  "/dashboard/student/class-members": "Class Members",
  "/dashboard/student/subjects": "Subjects",
  "/dashboard/student/timetable": "Timetable",
  "/dashboard/student/results": "Results",
  "/dashboard/student/prev-results": "Previous Results",
  "/dashboard/student/session-details": "Session Details",
  "/dashboard/student/payment-history": "Payment History",
  "/dashboard/student/fee/obligations": "Fee Obligations",
  "/dashboard/student/profile": "Profile",
  
  // Teacher routes
  "/teachers/attendance": "Mark Attendance",
  "/teachers/attendance/summary": "Attendance Summary",
  "/teachers/results": "Results",
  "/teachers/results/enter": "Enter Scores",
  "/teachers/results/view": "View All Results",
  "/teachers/results/update": "Update Results",
  "/teachers/results/single": "View Single Result",
  "/teachers/class-subject-management": "Class & Subject Management",
  
  // Admin routes - Dashboard
  "/admin/dashboard": "Dashboard",
  // Admin routes - Student Management
  "/admin/students/add": "Add Student",
  "/admin/students": "View All Students",
  "/admin/students/view": "View Students (Filtered)",
  "/admin/students/promote": "Promote Students",
  // Admin routes - Teacher Management
  "/admin/teachers/add": "Add Teacher",
  "/admin/teachers": "View All Teachers",
  "/admin/teachers/assign-subject": "Assign Subjects to Teacher",
  "/admin/teachers/assign-class": "Assign Class to Teacher",
  "/admin/classes/subjects": "Add Subjects to Class",
  "/admin/teachers/edit": "Edit Teacher",
  // Admin routes - Result Management
  "/admin/results/enter": "Enter Results",
  "/admin/results/view": "View All Results",
  "/admin/results/update": "Update Results",
  "/admin/results/single": "View Single Result",
  // Admin routes - Bookshop Management
  "/admin/bookshop/books/add": "Add Book",
  "/admin/bookshop/books": "View All Books",
  "/admin/bookshop/books/edit": "Edit Book",
  "/admin/bookshop/books/assign": "Assign Books to Class",
  "/admin/bookshop/books/requirements": "View Books Requirements",
  "/admin/bookshop/books/status": "Books Status",
  "/admin/bookshop/viewallbooksales": "View all Book sold",
  // Admin routes - Fees Overview
  "/admin/fees/pay": "Pay Fee (on behalf)",
  "/admin/fees/payment/history": "Payment History",
  "/admin/fees/add": "Add Fees",
  "/admin/fees/paid": "Completed Payments",
  "/admin/fees/part/paid": "Part Payments",
  "/admin/fees/unpaid": "Unpaid Fees",
  "/admin/fees/obligations": "Fee Obligations",
  // Admin routes - Announcement
  "/admin/announcements": "View Announcements",
  "/admin/announcements/add": "Add Announcement",
  // Admin routes - Profile
  "/admin/profile": "Profile Settings",
  
  // Parent routes
  "/parent/children": "My Children",
  "/parent/profile": "Profile Settings",
  "/parent/academic/results": "Academic Monitoring - Results",
  "/parent/attendance": "Attendance Tracking",
  "/parent/fees/pay": "Pay Fee",
  "/parent/fees": "Payment History",
  "/parent/fees/obligations": "Fee Obligations",
  "/parent/children/[uuid]": "Child Details",
  "/parent/children/[uuid]/attendance": "Child Attendance",
  "/parent/children/[uuid]/fees": "Child Fees",
  "/parent/children/[uuid]/results": "Child Results",
};

// Get breadcrumb items from pathname
const getBreadcrumbItems = (pathname: string, role: string) => {
  const items: Array<{ title: ReactNode }> = [];
  
  // Home/Dashboard link based on role
  const homePath = role === "student" 
    ? "/dashboard/student" 
    : role === "teacher" 
    ? "/teachers/dashboard"
    : role === "admin"
    ? "/admin/dashboard"
    : "/parent/children";
  
  items.push({
    title: (
      <Link href={homePath}>
        <HomeOutlined /> Home
      </Link>
    ),
  });
  
  // Split pathname and build breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip if it's the home path
    if (currentPath === homePath && index === pathSegments.length - 1) {
      return;
    }
    
    // Handle dynamic routes (UUIDs)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // For parent/children/[uuid] routes
      if (pathSegments[index - 1] === "children") {
        // Check if there's a next segment (like attendance, fees, results)
        const nextSegment = pathSegments[index + 1];
        if (nextSegment) {
          // Build path with [uuid] placeholder for matching
          const pathWithPlaceholder = currentPath.replace(segment, "[uuid]");
          if (breadcrumbMap[pathWithPlaceholder]) {
            // Skip adding UUID as breadcrumb, will be handled by next segment
            return;
          }
        } else {
          items.push({
            title: <span>Child Details</span>,
          });
        }
      } else {
        items.push({
          title: <span>Details</span>,
        });
      }
    } else {
      // Check if current path matches a mapped route (with [uuid] placeholder)
      const pathWithPlaceholder = currentPath.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "/[uuid]");
      const mappedPath = breadcrumbMap[currentPath] || breadcrumbMap[pathWithPlaceholder];
      
      if (mappedPath) {
        // Only add link if it's not the last item
        if (index === pathSegments.length - 1) {
          items.push({
            title: <span>{mappedPath}</span>,
          });
        } else {
          items.push({
            title: <Link href={currentPath}>{mappedPath}</Link>,
          });
        }
      } else if (index === pathSegments.length - 1) {
        // Last segment without mapping - capitalize and format
        const formatted = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        items.push({
          title: <span>{formatted}</span>,
        });
      }
    }
  });
  
  return items;
};

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    setMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const breadcrumbItems = getBreadcrumbItems(pathname, role);
  
  // Always apply dark mode for teacher and admin dashboards, or for student when toggle is enabled
  const shouldUseDarkMode = role === "teacher" || role === "admin" || (role === "student" && isDarkMode);
  const bgColor = shouldUseDarkMode ? "#141414" : "#f0f2f5";
  const contentBgColor = shouldUseDarkMode ? "#1f1f1f" : "#fff";
  const textColor = shouldUseDarkMode ? "#ffffff" : undefined;

  // Ant Design theme configuration
  const antdTheme = {
    algorithm: shouldUseDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorBgContainer: contentBgColor,
      colorBgElevated: shouldUseDarkMode ? "#262626" : "#fff",
      colorText: textColor,
      colorBorder: shouldUseDarkMode ? "#303030" : undefined,
    },
  };

  // Use consistent values for SSR - default to desktop view
  const marginLeft = isMobile ? 0 : 250;
  const margin = isMobile ? "8px" : "16px";
  const padding = isMobile ? 16 : 24;

  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <Layout suppressHydrationWarning style={{ minHeight: "100vh", background: bgColor }}>
          <Sidebar role={role} isDarkMode={shouldUseDarkMode} />
          <Layout 
            suppressHydrationWarning
            style={{ 
              marginLeft, 
              minHeight: "100vh",
              transition: mounted ? "margin-left 0.2s" : "none",
              background: bgColor,
            }}
          >
            <Content
              suppressHydrationWarning
              style={{
                margin,
                padding: 0,
                background: bgColor,
                minHeight: 280,
              }}
            >
              <div
                suppressHydrationWarning
                style={{
                  background: contentBgColor,
                  borderRadius: "8px",
                  padding,
                  minHeight: "calc(100vh - 32px)",
                  ...(textColor && { color: textColor }),
                  transition: "background-color 0.3s ease, color 0.3s ease",
                }}
              >
                <DashboardHeader 
                  role={role} 
                  isDarkMode={shouldUseDarkMode}
                  onDarkModeToggle={toggleDarkMode}
                />
                <Breadcrumb
                  items={breadcrumbItems}
                  style={{ 
                    marginBottom: 24,
                    ...(textColor && { color: textColor }),
                  }}
                />
                {children}
              </div>
            </Content>
          </Layout>
          <BackToTop />
        </Layout>
      </App>
    </ConfigProvider>
  );
}

