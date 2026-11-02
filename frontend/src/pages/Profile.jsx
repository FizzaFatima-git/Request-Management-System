
import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (fullName.trim().length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    setLoading(true);

    try {
      await updateProfile(fullName.trim());
      setMessage("Profile updated successfully!");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="My Profile"
      subtitle="Manage your personal information and account details."
      active="profile"
    >
      <section className="page-intro">
        <div>
          <span className="page-eyebrow">ACCOUNT SETTINGS</span>
          <h1>Personal Information</h1>
          <p>
            View your account details and update your personal information.
          </p>
        </div>

        <div className="page-intro-icon">♙</div>
      </section>

      <section className="content-card profile-content-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{user?.full_name}</h2>
            <p>{user?.role} Account</p>
          </div>
        </div>

        <div className="content-card-heading">
          <div>
            <h3>Edit Personal Information</h3>
            <p>Update your name and review your account details.</p>
          </div>
        </div>

        {message && (
          <div className="success-message">{message}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setMessage("");
                setError("");
              }}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
            />
            <small>Email address cannot be changed here.</small>
          </div>

          <div className="form-field">
            <label>Account Role</label>
            <input
              type="text"
              value={user?.role || ""}
              disabled
            />
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="primary-btn profile-save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}

export default Profile;
