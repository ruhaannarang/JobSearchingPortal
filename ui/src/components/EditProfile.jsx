import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditProfile = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      e.target.value = "";
      return;
    }

    setUploadingResume(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "s+ve_posts");
    data.append("cloud_name", "danmv4rdq");
    data.append("resource_type", "raw");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/danmv4rdq/raw/upload",
        {
          method: "post",
          body: data,
        }
      );
      const fileData = await res.json();

      if (!res.ok) {
        throw new Error(fileData.error?.message || "Resume upload failed");
      }

      const uploadedUrl = fileData.secure_url || fileData.url;
      if (!uploadedUrl) {
        throw new Error("Cloudinary did not return a resume URL");
      }

      setValue("resumeUrl", uploadedUrl, { shouldValidate: true });
      setSuccess("Resume uploaded successfully!");
    } catch (err) {
      console.error("Cloudinary resume upload failed", err);
      setError("Failed to upload resume, please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const onSubmit = async (formData) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/jobseeker/profile",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.user) {
        updateUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        jobField: user.jobField || "",
        resumeUrl: user.resumeUrl || "",
      });
    }
  }, [user, authLoading, reset]);

  if (authLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user || user.role !== "jobseeker") {
    return (
      <div className="page-loading">
        Access denied. <button onClick={() => navigate("/login")} style={{ marginLeft: "10px", padding: "8px 16px", background: "gold", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}>Login</button>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <style>{`
        .edit-profile-container {
          padding: 24px;
          max-width: 700px;
          margin: 0 auto;
        }
        .edit-profile-header {
          margin-bottom: 32px;
        }
        .edit-profile-header h1 {
          color: gold;
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .edit-profile-header p {
          color: #ccc;
        }
        .edit-profile-form {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
        }
        .form-section {
          margin-bottom: 24px;
        }
        .form-section h3 {
          color: gold;
          margin-bottom: 16px;
          font-size: 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 8px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          color: gold;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          box-sizing: border-box;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: gold;
          box-shadow: 0 0 0 3px rgba(255,215,0,0.2);
        }
        .form-group input::placeholder {
          color: #888;
        }
        .error-text {
          color: #f44336;
          font-size: 0.85rem;
          margin-top: 6px;
        }
        .success-text {
          color: #4caf50;
          font-size: 0.85rem;
          margin-top: 6px;
        }
        .upload-hint {
          color: #888;
          font-size: 0.85rem;
          margin-top: 6px;
        }
        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary {
          background: gold;
          color: black;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: transparent;
          color: gold;
          border: 1px solid gold;
        }
        .btn-secondary:hover {
          background: rgba(255, 215, 0, 0.1);
        }
        .msg-box {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .msg-box.success {
          background: rgba(46, 125, 50, 0.15);
          color: #4caf50;
          border: 1px solid rgba(46, 125, 50, 0.3);
        }
        .msg-box.error {
          background: rgba(211, 47, 47, 0.15);
          color: #f44336;
          border: 1px solid rgba(211, 47, 47, 0.3);
        }
        .current-resume {
          margin-top: 8px;
        }
        .current-resume a {
          color: gold;
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>

      <div className="edit-profile-header">
        <h1>Edit Profile</h1>
        <p>Update your personal and professional information</p>
      </div>

      {success && <div className="msg-box success">{success}</div>}
      {error && <div className="msg-box error">{error}</div>}

      <form className="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-text">Name is required</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
              type="email"
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">Valid email is required</span>}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              {...register("phone", { required: true })}
              type="tel"
              placeholder="Enter your phone number"
            />
            {errors.phone && <span className="error-text">Phone is required</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Details</h3>
          <div className="form-group">
            <label>Job Field</label>
            <select
              {...register("jobField", { required: true })}
            >
              <option value="">-- Select a field --</option>
              <option value="Information Technology (IT)">Information Technology (IT)</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Others">Others</option>
            </select>
            {errors.jobField && <span className="error-text">Job field is required</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Resume</h3>
          <div className="form-group">
            <label>Upload Resume (PDF)</label>
            <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} />
            {uploadingResume && <span className="upload-hint">Uploading resume...</span>}
            {errors.resumeUrl && <span className="error-text">Resume is required</span>}
            <input type="hidden" {...register("resumeUrl")} />
            {user.resumeUrl && (
              <div className="current-resume">
                Current resume: <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;