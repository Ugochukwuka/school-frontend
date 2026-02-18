"use client";

import { useEffect, useState } from "react";
import api from "./api";

interface SchoolProfile {
  school_name: string;
  motto?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  mission?: string;
  vision?: string;
  about_us?: string;
  established_year?: number;
  logo_path?: string | null;
}

interface SchoolProfileResponse {
  status: boolean;
  data: SchoolProfile;
}

export function useSchoolProfile() {
  // Initialize with default values so schoolName is available immediately
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
    school_name: "School Management System",
    motto: "Empowering students to achieve excellence",
    address: "123 Education Street, City, State 12345",
    email: "info@school.edu",
    phone: "(123) 456-7890",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      const response = await api.get<SchoolProfileResponse>("/school/viewprofile");
      if (response.data.status && response.data.data) {
        setSchoolProfile(response.data.data);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      // Handle errors gracefully for public pages - use default values silently
      // This includes 401 (Unauthorized), 500 (Server Error), network errors, etc.
      const statusCode = err.response?.status;
      
      // For public pages, silently use default values for any error
      // Only log in development mode for debugging
      if (process.env.NODE_ENV === "development") {
        if (statusCode === 401) {
          // 401 is expected for public pages, so just warn
          console.warn("School profile: User not authenticated (expected for public pages)");
        } else if (statusCode === 500) {
          console.warn("School profile: Server error (500) - using default values");
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          console.warn("School profile: Request timeout - using default values");
        } else if (err.request) {
          console.warn("School profile: Network error - using default values");
        } else {
          console.warn("School profile: Error fetching profile - using default values", err.message);
        }
      }
      
      // Always use default values on error - don't set error state for public pages
      // This ensures the UI always works even if the API fails
      setSchoolProfile({
        school_name: "School Management System",
        motto: "Empowering students to achieve excellence",
        address: "123 Education Street, City, State 12345",
        email: "info@school.edu",
        phone: "(123) 456-7890",
        website: "",
      });
      setError(null); // Don't show errors to users on public pages
    } finally {
      setLoading(false);
    }
  };

  const schoolName = schoolProfile?.school_name || "School Management System";
  const motto = schoolProfile?.motto || "Empowering students to achieve excellence through quality education and holistic development.";
  const address = schoolProfile?.address || "123 Education Street";
  const email = schoolProfile?.email || "info@school.edu";
  const phone = schoolProfile?.phone || "(123) 456-7890";
  const website = schoolProfile?.website || "";
  const mission = schoolProfile?.mission || "";
  const vision = schoolProfile?.vision || "";
  const aboutUs = schoolProfile?.about_us || "";
  const establishedYear = schoolProfile?.established_year;
  const logoPath = schoolProfile?.logo_path || null;

  return {
    schoolProfile,
    schoolName,
    motto,
    address,
    email,
    phone,
    website,
    mission,
    vision,
    aboutUs,
    establishedYear,
    logoPath,
    loading,
    error,
    refetch: fetchSchoolProfile,
  };
}
