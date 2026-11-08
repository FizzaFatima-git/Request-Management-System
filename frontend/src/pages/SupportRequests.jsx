

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function SupportRequests() {
  const { user, logout } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/requests/support/assigned");
      setRequests(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load assigned requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setError("");
      setMessage("");

      await api.patch(`/requests/${requestId}/status`, {
        status,
        comment: comments[requestId] || "",
      });

      setMessage(`Request updated to ${status}.`);

      setComments((previous) => ({
        ...previous,
        [requestId]: "",
      }));

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update request status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">R</div>
          RequestFlow
        </div>

        <nav>
          <Link to="/dashboard" className="nav-link">
            ▦ Dashboard
          </Link>

          <Link to="/support-requests" className="nav-link active">
            ▤ Assigned Requests
          </Link>

          <Link to="/profile" className="nav-link">
            ♙ My Profile
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          ↪ Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h2>Assigned Requests</h2>
            <p>Review and process requests assigned to you.</p>
          </div>

          <div className="user-info">
            <div className="avatar">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.full_name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
        </header>

        <section className="overview-grid">
          <div className="overview-card">
            <p>Total Assigned</p>
            <h3>{requests.length}</h3>
          </div>

          <div className="overview-card">
            <p>Assigned</p>
            <h3>
              {requests.filter((r) => r.status === "Assigned").length}
            </h3>
          </div>

          <div className="overview-card">
            <p>In Progress</p>
            <h3>
              {requests.filter((r) => r.status === "In Progress").length}
            </h3>
          </div>

          <div className="overview-card">
            <p>Resolved</p>
            <h3>
              {requests.filter((r) => r.status === "Resolved").length}
            </h3>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}
        {message && <p>{message}</p>}

        <section className="overview-card">
          <h3>My Assigned Requests</h3>

          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p>No requests have been assigned to you.</p>
          ) : (
            <div className="table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.request_code}</td>
                      <td>{request.category}</td>
                      <td>{request.priority}</td>
                      <td>{request.description}</td>
                      <td>{request.status}</td>

                      <td>
                        {["Assigned", "In Progress"].includes(
                          request.status
                        ) ? (
                          <div style={{ minWidth: "180px" }}>
                            <textarea
                              rows="2"
                              placeholder="Add a comment (optional)"
                              value={comments[request.id] || ""}
                              onChange={(e) =>
                                setComments((previous) => ({
                                  ...previous,
                                  [request.id]: e.target.value,
                                }))
                              }
                            />

                            {request.status === "Assigned" && (
                              <button
                                disabled={updatingId === request.id}
                                onClick={() =>
                                  updateStatus(request.id, "In Progress")
                                }
                              >
                                Start Work
                              </button>
                            )}

                            <button
                              disabled={updatingId === request.id}
                              onClick={() =>
                                updateStatus(request.id, "Resolved")
                              }
                            >
                              Mark Resolved
                            </button>
                          </div>
                        ) : (
                          <span>
                            {request.status === "Approved"
                              ? "Approved by Admin"
                              : request.status === "Rejected"
                              ? "Rejected by Admin"
                              : request.status === "Resolved"
                              ? "Awaiting Admin Decision"
                              : request.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SupportRequests;
