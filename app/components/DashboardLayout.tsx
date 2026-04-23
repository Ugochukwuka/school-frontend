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
  "/admin/users/reset-password": "Reset User Password",
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
  // Admin routes - Timetable Management
  "/admin/timetable/weekly/add": "Add Weekly Timetable",
  "/admin/students/viewtimetable": "View Weekly Timetable",
  "/admin/timetable/weekly/edit": "Edit Weekly Timetable",
  "/admin/timetable/weekly/update": "Update Weekly Timetable",
  "/admin/timetable/weekly/single": "View Single Timetable",
  "/admin/exam/timetable/add": "Add Exam Timetable",
  "/admin/viewexam/timetable": "View Exam Timetable",
  "/admin/exam/timetable/edit": "Edit Exam Timetable",
  "/admin/exam/timetable/update": "Update Exam Timetable",
  "/admin/students/viewsingleexamtimetable": "View Single Exam Timetable",
  // Admin routes - Blog Management
  "/admin/blog/create": "Create Blog",
  "/admin/blog/view-all": "View All Blogs",
  "/admin/blog/view-single": "View Single Blog",
  "/admin/blog/edit": "Edit Blog",
  "/admin/blog/update": "Update Blog",
  // Admin routes - FrontEnd Tuition Fee Management
  "/admin/tuitionfee/add": "Add Tuition Fee",
  "/admin/tuitionfee/viewall": "View All Tuition Fees",
  "/admin/tuition-fee/view-single": "View Single Tuition Fee",
  "/admin/viewSingleTuitionFee": "View Single Tuition Fee",
  "/admin/tuition-fee/update": "Update Tuition Fee",
  "/admin/updateTuitionFee": "Update Tuition Fee",
  "/admin/tuition-fee/edit": "Edit Tuition Fee",
  // Admin routes - Academic Session Management
  "/admin/session/add": "Add Session",
  "/admin/session/view-all": "View All Sessions",
  "/admin/session/view-single": "View Single Session",
  "/admin/session/edit": "Edit Session",
  "/admin/session/update": "Update Session",
  // Admin routes - Testimonial Management
  "/admin/addTestimonial": "Add Testimonial",
  "/admin/viewAllTestimonials": "View All Testimonials",
  "/admin/editTestimonial": "Edit Testimonial",
  "/admin/testimonial/add": "Add Testimonial",
  "/admin/testimonial/view-all": "View All Testimonials",
  "/admin/testimonial/view-single": "View Single Testimonial",
  "/admin/testimonial/update": "Update Testimonial",
  "/admin/testimonial/edit": "Edit Testimonial",
  // Admin routes - Front End Leadership Management
  "/admin/leadership/add": "Add Leader",
  "/admin/leadership/viewall": "View All Leaders",
  "/admin/leadership/view-single": "View Single Leader",
  "/admin/leadership/update": "Update Leader",
  "/admin/leadership/edit": "Edit Leader",
  // Admin routes - School Profile Management
  "/admin/schoolprofile/add": "Add School Profile",
  "/admin/schoolprofile/view": "View School Profile",
  "/admin/schoolprofile/edit": "Edit School Profile",
  "/admin/schoolprofile/update": "Update School Profile",
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
  // CBT - Admin
  "/admin/cbt/settings": "CBT Settings",
  "/admin/cbt/settings/save": "CBT Save Settings",
  "/admin/cbt/sync": "CBT Sync",
  "/admin/cbt/exams": "CBT Exam Control",
  "/admin/cbt/analytics": "CBT Analytics",
  "/admin/cbt/reports": "CBT Reports",
  "/admin/cbt/export": "CBT Export",
  "/admin/cbt/question-bank": "CBT Question Bank",
  "/admin/cbt/question-bank/create": "CBT Question Bank - Create",
  // CBT - Student
  "/dashboard/student/cbt/exams": "CBT Available Exams",
  "/dashboard/student/cbt/results": "CBT My Results",
  "/dashboard/student/cbt/results/[examId]": "CBT Result",
  "/dashboard/student/cbt/attempt/[attemptId]": "CBT Take Exam",
  // CBT - Teacher
  "/teachers/cbt/exams": "CBT My Exams",
  "/teachers/cbt/exams/[id]": "CBT Exam",
  "/teachers/cbt/exams/[id]/preview": "CBT Preview",
  "/teachers/cbt/grading": "CBT Grading & Review",
  "/teachers/cbt/grading/[attemptId]": "CBT Script / Mark theory",
  "/teachers/cbt/exams/new": "CBT Create Exam",
  // CBT - Parent
  "/parent/cbt": "CBT Child Exam History",
  "/parent/cbt/upcoming": "CBT Child Upcoming Exams",
  "/parent/cbt/live-status": "CBT Child Live Status",
  "/parent/cbt/notifications": "CBT Child Notifications",
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
      // Check if current path matches a mapped route (with [uuid] or numeric placeholder)
      const pathWithPlaceholder = currentPath.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "/[uuid]");
      let mappedPath = breadcrumbMap[currentPath] || breadcrumbMap[pathWithPlaceholder];
      if (!mappedPath && /^\d+$/.test(segment)) {
        mappedPath = breadcrumbMap[currentPath.replace(/\/\d+$/, "/[attemptId]")] ||
          breadcrumbMap[currentPath.replace(/\/\d+$/, "/[examId]")] ||
          breadcrumbMap[currentPath.replace(/\/\d+$/, "/[id]")];
      }
      
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

// Sidebar width: mobile = drawer (0), tablet = collapsed 80px (lg breakpoint 992), desktop = 250px
const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_LG_BREAKPOINT = 992;

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const updateLayout = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      setIsMobile(w < MOBILE_BREAKPOINT);
      // Match Sidebar: mobile = 0 (drawer), < lg = collapsed 80, >= lg = 250
      setSidebarWidth(w < MOBILE_BREAKPOINT ? 0 : w < SIDEBAR_LG_BREAKPOINT ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH);
    };
    updateLayout();
    setMounted(true);
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const breadcrumbItems = getBreadcrumbItems(pathname, role);
  
  // Apply dark mode based on user preference for all dashboards
  const shouldUseDarkMode = isDarkMode;
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

  // Responsive: match sidebar width so content is never clipped; safe padding
  const marginLeft = sidebarWidth;
  const margin = isMobile ? 8 : 12;
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
              minWidth: 0,
              flex: 1,
              width: "100%",
              maxWidth: "100%",
              overflowX: isMobile ? "hidden" : "visible",
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
                minWidth: 0,
                overflow: "visible",
              }}
            >
              <div
                suppressHydrationWarning
                style={{
                  background: contentBgColor,
                  borderRadius: "8px",
                  padding: isMobile ? 12 : padding,
                  paddingLeft: isMobile ? 56 : Math.max(padding, 20),
                  paddingRight: isMobile ? 12 : Math.max(padding, 20),
                  minHeight: "calc(100vh - 32px)",
                  minWidth: 0,
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflowX: isMobile ? "hidden" : "visible",
                  overflowY: "visible",
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
                    marginBottom: isMobile ? 16 : 24,
                    ...(textColor && { color: textColor }),
                    overflow: "hidden",
                    maxWidth: "100%",
                    fontSize: isMobile ? 12 : undefined,
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

