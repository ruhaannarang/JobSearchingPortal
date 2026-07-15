import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role;
      const currentPath = location.pathname;

      // Redirect job seekers from recruiter routes
      if (allowedRoles === "recruiter" && userRole !== "recruiter") {
        return;
      }
      // Redirect recruiters from job seeker routes
      if (allowedRoles === "jobseeker" && userRole !== "jobseeker") {
        return;
      }
    }
  }, [user, loading, location.pathname, allowedRoles]);

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles === "recruiter" && user.role !== "recruiter") {
    return <Navigate to="/find-jobs" replace />;
  }

  if (allowedRoles === "jobseeker" && user.role !== "jobseeker") {
    return <Navigate to="/jobs" replace />;
  }

  return children;
};

export default ProtectedRoute;