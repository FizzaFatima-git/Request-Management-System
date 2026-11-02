
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

function RequestForm() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    category: "",
    priority: "Medium",
    description: "",
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category || !form.description.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (attachment && attachment.size > 5 * 1024 * 1024) {
      setError("Attachment must be 5 MB or smaller.");
      return;
    }

    const data = new FormData();
    data.append("category", form.category);
    data.append("priority", form.priority);
    data.append("description", form.description.trim());

    if (attachment) {
      data.append("attachment", attachment);
    }

    try {
      setLoading(true);

      const response = await api.post("/requests/", data);

      setSuccess(
        `Request submitted successfully! Your Request ID is ${response.data.request_code}`
      );

      setForm({
        category: "",
        priority: "Medium",
        description: "",
      });

      setAttachment(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(". "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Request submission failed. Please try again.");
      }

      console.error("Request submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Create New Request"
      subtitle="Submit a service request for processing."
      active="create"
    >
      <section className="page-intro">
        <div>
          <span className="page-eyebrow">REQUEST MANAGEMENT</span>
          <h1>Submit a New Request</h1>
          <p>
            Provide the details below so our support team can
            review and process your request.
          </p>
        </div>
        <div className="page-intro-icon">＋</div>
      </section>

      <section className="content-card request-card">
        <div className="content-card-heading">
          <div>
            <h3>Request Information</h3>
            <p>Fields marked with * are required.</p>
          </div>
          <span className="form-step">NEW REQUEST</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success && (
          <div className="success-message">
            <strong>{success}</strong>
            <p>Your request has been saved successfully.</p>
            <Link to="/my-requests">View My Requests</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-field">
            <label>Request Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Account Access">Account Access</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>Priority Level *</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-field full-field">
            <label>Request Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your issue or request in detail..."
              rows="6"
              required
            />
            <small>
              Include relevant details to help the support team understand your request.
            </small>
          </div>

          <div className="form-field full-field">
            <label>Supporting Attachment</label>
            <div className="upload-area">
              <div className="upload-icon">↑</div>
              <div>
                <strong>Choose a file to upload</strong>
                <p>PDF, PNG, JPG or DOC/DOCX · Maximum 5 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) =>
                  setAttachment(e.target.files[0] || null)
                }
              />
            </div>

            {attachment && (
              <div className="selected-file">
                <span>📎 {attachment.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions full-field">
            <button
              type="submit"
              className="primary-btn submit-request-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request →"}
            </button>

            <Link to="/dashboard" className="cancel-link">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}

export default RequestForm;
