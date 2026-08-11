import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ResumeAtsTester = () => {
  const { user } = useAuth();

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeUrl, setSelectedResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeSourceType, setResumeSourceType] = useState(user?.resumeUrl ? "saved" : "new");
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const resumeSource = useMemo(() => {
    return selectedResumeUrl || uploadedResumeUrl;
  }, [selectedResumeUrl, uploadedResumeUrl]);

  const handleCloudinaryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      event.target.value = "";
      return;
    }

    setUploadingResume(true);
    setError("");

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

      setUploadedResumeUrl(uploadedUrl);
      setSelectedResumeUrl(uploadedUrl);
      setResult(null);
      setError("");
    } catch (err) {
      console.error("Cloudinary resume upload failed", err);
      setError(err.message || "Failed to upload resume, please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCheckAts = async () => {
    if (!resumeSource) {
      setError("Please select or upload a resume before running ATS analysis.");
      return;
    }

    setTesting(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/resume/ats-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeUrl: resumeSource,
          jobDescription,
          jobTitle,
          jobId: null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ATS score generation failed');
      }

      setResult({
        atsScore: data.ats,
        fitLevel: data.fitLevel,
        summary: data.summary,
        recommendations: data.recommendations || [],
        parsedResumeWords: data.parsedResumeWords || 0,
        cached: data.cached || false,
      });
    } catch (err) {
      console.error('ATS check failed:', err);
      setError(err.message || 'Failed to calculate ATS score');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="resume-ats-page">
      <style>{`
        .resume-ats-page {
          padding: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .resume-ats-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 24px;
          margin-bottom: 24px;
        }
        .resume-ats-header h1 {
          margin: 0;
          color: gold;
          font-size: clamp(2rem, 4vw, 2.8rem);
        }
        .resume-ats-header p {
          margin: 8px 0 0;
          color: #aaa;
        }
        .resume-ats-layout {
          display: grid;
          grid-template-columns: minmax(340px, 0.92fr) minmax(420px, 1.08fr);
          gap: 24px;
        }
        .resume-ats-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 24px;
          min-height: 560px;
        }
        .resume-ats-panel h2 {
          margin-top: 0;
          color: gold;
          font-size: 1.35rem;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          color: gold;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: white;
          padding: 12px 14px;
          font-size: 0.95rem;
        }
        .form-group textarea {
          min-height: 160px;
          resize: vertical;
        }
        .resume-option-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: nowrap;
        }
        .resume-option-row label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #ddd;
          cursor: pointer;
          flex: 1;
          min-height: 46px;
          justify-content: center;
          font-weight: 700;
        }
        .resume-option-row input[type="radio"] {
          accent-color: gold;
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }
        .resume-preview {
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          color: #ccc;
          margin-bottom: 16px;
          word-break: break-all;
        }
        .btn-ats {
          background: gold;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          color: #111;
          font-weight: 900;
          cursor: pointer;
        }
        .btn-ats:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .ats-result-card {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.10), rgba(255,255,255,0.03));
          border-radius: 14px;
          border: 1px solid rgba(255,215,0,0.32);
          padding: 20px;
          min-height: 520px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ats-result-card h2 {
          margin-bottom: 12px;
        }
        .ats-score-strip {
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          margin-bottom: 14px;
          color: #fff;
        }
        .ats-score-strip .score {
          color: gold;
          font-weight: 900;
          font-size: 1.4rem;
        }
        .ats-score-strip .fit {
          color: #fff;
          font-weight: 700;
          margin-top: 10px;
        }
        .ats-detail-block {
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 12px;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ats-detail-block::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        .ats-detail-block h3 {
          margin: 0 0 8px;
          color: gold;
          font-size: 0.95rem;
        }
        .ats-detail-block p, .ats-detail-block li {
          color: #ddd;
          line-height: 1.55;
          margin: 0;
        }
        .ats-detail-block ul {
          padding-left: 20px;
          margin: 0;
        }
        .error-box {
          color: #fca5a5;
          background: rgba(239,68,68,0.10);
          border: 1px solid rgba(239,68,68,0.45);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="resume-ats-header">
        <div>
          <h1>Resume ATS Tester</h1>
          <p>Check your resume against a job description before applying.</p>
        </div>
      </div>

      <div className="resume-ats-layout">
        <section className="resume-ats-panel">
          <h2>Resume Source</h2>
          <div className="resume-option-row">
            <label>
              <input
                type="radio"
                name="resumeSource"
                checked={resumeSourceType === "saved"}
                onChange={() => {
                  setResumeSourceType("saved");
                  setSelectedResumeUrl(user?.resumeUrl || "");
                  setUploadedResumeUrl("");
                  setResult(null);
                }}
              />
              <span>Use already uploaded resume</span>
            </label>
            <label>
              <input
                type="radio"
                name="resumeSource"
                checked={resumeSourceType === "new"}
                onChange={() => {
                  setResumeSourceType("new");
                  setSelectedResumeUrl(uploadedResumeUrl);
                  setResult(null);
                }}
              />
              <span>Use new PDF upload</span>
            </label>
          </div>

          {resumeSourceType === "saved" && user?.resumeUrl && (
            <div className="resume-preview">
              <div style={{ color: "gold", fontWeight: "700", marginBottom: "6px" }}>Saved job-seeker resume</div>
              <a href={user.resumeUrl} target="_blank" rel="noreferrer" style={{ color: "gold", wordBreak: "break-all" }}>{user.resumeUrl}</a>
            </div>
          )}

          {resumeSourceType === "new" && (
            <div className="form-group">
              <label htmlFor="resume-upload">Upload a new resume for ATS testing (PDF)</label>
              <input type="file" id="resume-upload" accept=".pdf" onChange={handleCloudinaryUpload} disabled={uploadingResume} />
              {uploadingResume && <div className="upload-hint" style={{ marginTop: "8px", color: "#aaa" }}>Uploading to Cloudinary...</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="jobTitle">Target Job Title</label>
            <input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Frontend Developer" />
          </div>

          <div className="form-group">
            <label htmlFor="jobDescription">Job Description</label>
            <textarea id="jobDescription" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn-ats" onClick={handleCheckAts} disabled={testing || !resumeSource}>
            {testing ? 'Checking ATS...' : 'Check ATS Score'}
          </button>
        </section>

        <section className="ats-result-card">
          <h2>ATS Analysis</h2>
          {!result ? (
            <div style={{ color: "#aaa", paddingTop: "12px" }}>No ATS result yet. Select a resume and run the check.</div>
          ) : (
            <>
              <div className="ats-score-strip">
                <div className="score">ATS Score: {result.atsScore ?? 0}/100</div>
                <div className="fit">Fit Level: {result.fitLevel || 'Not available'}</div>
              </div>

              <div className="ats-detail-block">
                <h3>Summary</h3>
                <p>{result.summary || 'No summary available'}</p>
              </div>

              <div className="ats-detail-block">
                <h3>Recommendations</h3>
                <ul>
                  {(result.recommendations || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="ats-detail-block">
                <h3>Resume Statistics</h3>
                <p>Parsed words: {result.parsedResumeWords || 0}</p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResumeAtsTester;
