"use client";

import { useEffect, useState, useRef } from "react";
import ReportHeader from "./ReportHeader";
import StudentInfoSection from "./StudentInfoSection";
import MarksTable from "./MarksTable";
import TraitsTable from "./TraitsTable";
import CommentsSection from "./CommentsSection";
import Footer from "./Footer";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import { useReactToPrint } from "react-to-print";

interface Result {
  subject: string;
  subject_code: string;
  teacher_name: string;
  ca1: number;
  ca2: number;
  exam_score: number;
  total: number;
  grade: string;
  teacher_comment: string;
}

interface StudentProfile {
  name?: string;
  sex?: string;
  age?: string;
  class?: string;
  admission_number?: string;
  [key: string]: any;
}

interface ResultReportViewProps {
  studentUuid: string;
  sessionId: number;
  termId: number;
  termName: string;
  sessionName: string;
  className: string;
  results: Result[];
  onBack?: () => void;
}

export default function ResultReportView({
  studentUuid,
  sessionId,
  termId,
  termName,
  sessionName,
  className,
  results,
  onBack,
}: ResultReportViewProps) {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${termName} Assessment Report`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0.5in;
      }
      @media print {
        body {
          background: white !important;
          color: #000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * {
          color: #000 !important;
          border-color: #000 !important;
        }
      }
    `,
  });

  const handleSaveAsPDF = () => {
    if (componentRef.current) {
      handlePrint();
    } else {
      console.error("Print content not ready");
      // Retry after a short delay
      setTimeout(() => {
        if (componentRef.current) {
          handlePrint();
        }
      }, 500);
    }
  };

  // Expose handlePrint to parent component via props or remove auto-trigger
  // No auto-print - user will click button manually

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/me?uuid=${studentUuid}`,
          getAuthHeaders()
        );
        if (response.data.status && response.data.data) {
          setStudentProfile(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (studentUuid) {
      fetchStudentProfile();
    }
  }, [studentUuid]);

  // Transform results to match the table format
  const transformedResults = results.map((result) => ({
    subject: result.subject,
    test1: result.ca1,
    test2: result.ca2,
    testTotal: (result.ca1 || 0) + (result.ca2 || 0),
    exam: result.exam_score,
    total: result.total,
    classAverage: null, // Not available in API, will show N/A
    position: null, // Not available in API, will show N/A
    teacherRemark: result.teacher_comment || "N/A",
  }));

  // Calculate totals
  const totalScore = results.reduce((sum, result) => sum + (result.total || 0), 0);
  const learnerAverage = results.length > 0 ? totalScore / results.length : 0;

  // Format term name - ensure it's uppercase
  const formattedTermName = termName.toUpperCase();

  return (
    <div 
      className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white" 
      style={{ color: '#000' }}
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5in;
          }
          body {
            background: white !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-hide {
            display: none !important;
          }
          * {
            color: #000 !important;
            border-color: #000 !important;
          }
        }
      `}</style>
      {/* Action Buttons - Hidden in Print */}
      {onBack && (
        <div className="print-hide mb-4 flex gap-2 justify-end">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-black font-medium"
          >
            ← Back to Results Table
          </button>
          <button
            onClick={handleSaveAsPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
          >
            Save as PDF
          </button>
        </div>
      )}
      <div 
        ref={componentRef}
        className="max-w-4xl mx-auto bg-white shadow-lg p-8 print:shadow-none print:p-6" 
        style={{ 
          color: '#000',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <ReportHeader termName={`${formattedTermName} ASSESSMENT REPORT`} />
        
        <StudentInfoSection
          studentName={studentProfile?.name?.toUpperCase() || "N/A"}
          sex={studentProfile?.sex?.toUpperCase() || "N/A"}
          className={className || "N/A"}
          age={studentProfile?.age ? `${studentProfile.age} YEARS` : "N/A"}
          classAttendance="122 Out of 126" // Placeholder - not available in API
          classTeacher="MRS EKIYOR E. E" // Placeholder - not available in API
          academicSession={sessionName || "N/A"}
          classPosition="1st Out of 8" // Placeholder - not available in API
          admissionNumber={studentProfile?.admission_number || "SSDS/SS1/0080/2021"}
        />

        <MarksTable 
          results={transformedResults}
          totalScore={totalScore}
          learnerAverage={parseFloat(learnerAverage.toFixed(1))}
        />

        <TraitsTable />

        <CommentsSection />

        <Footer />
      </div>
    </div>
  );
}
