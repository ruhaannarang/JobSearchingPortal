import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const RecruiterProfile = () => {
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== "recruiter") {
        navigate("/login");
        return;
      }
      // Use user from AuthContext directly if it has all needed data
      if (user.name && user.email) {
        setProfile(user);
        setLoading(false);
        return;
      }
      // Fallback: fetch if user data is incomplete
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/getuser", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate, setUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (authLoading || loading) {
    return <div className="page-loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="page-loading">Profile not found. <button onClick={() => navigate("/login")} style={{ marginLeft: "10px", padding: "8px 16px", background: "gold", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}>Login</button></div>;
  }

  return (
    <div className="profile-container">
      <style>{`
        .profile-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
        }
        .profile-logo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid gold;
          background: white;
        }
        .profile-logo-fallback {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,215,0,0.15);
          color: gold;
          font-weight: 700;
          font-size: 2.5rem;
          border: 3px solid gold;
        }
        .profile-info h1 {
          color: gold;
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .profile-info .username {
          color: #aaa;
          font-size: 1.1rem;
        }
        .profile-info .role-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: gold;
          color: black;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .profile-sections {
          display: grid;
          gap: 24px;
        }
        .profile-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
        }
        .profile-section h2 {
          color: gold;
          margin-bottom: 16px;
          font-size: 1.3rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 12px;
        }
        .profile-field {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .profile-field:last-child {
          border-bottom: none;
        }
        .profile-field-label {
          color: #aaa;
          font-size: 0.95rem;
        }
        .profile-field-value {
          color: #fff;
          font-weight: 500;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }
        .profile-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 24px;
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
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        .btn-danger {
          background: transparent;
          color: #f44336;
          border: 1px solid #f44336;
        }
        .btn-danger:hover {
          background: rgba(244, 67, 54, 0.1);
        }
        .error-msg {
          text-align: center;
          color: #f44336;
          padding: 20px;
          background: rgba(211, 47, 47, 0.1);
          border: 1px solid rgba(211, 47, 47, 0.3);
          border-radius: 8px;
          margin-bottom: 24px;
        }
      `}</style>

      {error && <div className="error-msg">{error}</div>}

      <div className="profile-header">
        <div className="profile-logo-wrapper">
          {profile.companylogourl ? (
            <img src={profile.companylogourl} alt="Company logo" className="profile-logo" />
          ) : (
            <div className="profile-logo-fallback">{(profile.companyname || profile.name || 'C').charAt(0)}</div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.companyname || profile.name}</h1>
          <div className="username">@{profile.username}</div>
          <span className="role-badge">Recruiter</span>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h2>Contact Information</h2>
          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">{profile.email}</span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Phone</span>
            <span className="profile-field-value">{profile.phone || 'Not provided'}</span>
          </div>
        </div>

        <div className="profile-section">
          <h2>Company Details</h2>
          <div className="profile-field">
            <span className="profile-field-label">Company Name</span>
            <span className="profile-field-value">{profile.companyname || 'Not specified'}</span>
          </div>
        </div>

        {profile.companylogourl && (
          <div className="profile-section">
            <h2>Company Logo</h2>
            <div className="profile-field">
              <span className="profile-field-label">Logo</span>
              <span className="profile-field-value">
                <img src={profile.companylogourl} alt="Company logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid gold' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <Link to="/recruiter-edit-profile" className="btn btn-primary">Edit Profile</Link>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default RecruiterProfile;