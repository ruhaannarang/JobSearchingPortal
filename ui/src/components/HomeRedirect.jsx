import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "jobseeker") {
        navigate("/find-jobs", { replace: true });
      } else if (user.role === "recruiter") {
        navigate("/jobs", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

export default HomeRedirect;