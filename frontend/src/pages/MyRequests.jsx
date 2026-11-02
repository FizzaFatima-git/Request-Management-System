
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/requests/");
        setRequests(response.data);
      } catch (err) {
        const detail = err.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load your requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusClass = (status) => {
    return status?.toLowerCase().replace(/\s+/g, "-") || "pending";
  };

  return (
    <AppLayout
      title="My Requests"
      subtitle="View and track all your submitted service requests."
      active="requests"
    >
      <section className="page-intro requests-intro">
        <div>
          <span className="page-eyebrow">REQUEST MANAGEMENT</span>
          <h1>My Submitted Requests</h1>
          <p>
            Keep track of your requests and monitor their current status.
          </p>
        </div>

        <Link to="/create-request" className="primary-btn new-request-btn">
          ＋ Create Request
        </Link>
      </section>

      <section className="request-stats">
        <div className="stat-card">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pending Requests</span>
          <strong>
            {requests.filter((r) => r.status === "Pending").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Resolved Requests</span>
          <strong>
            {requests.filter((r) => r.status === "Resolved").length}
          </strong>
        </div>
      </section>

      <section className="content-card requests-table-card">
        <div className="content-card-heading">
          <div>
            <h3>Request History</h3>
            <p>All requests submitted through your account.</p>
          </div>
          <span className="request-count">
            {requests.length} Records
          </span>
        </div>

        {loading && (
          <div className="table-message">Loading your requests...</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No requests yet</h3>
            <p>You haven't submitted any service requests.</p>
            <Link to="/create-request" className="primary-btn new-request-btn">
              Create Your First Request
            </Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong className="request-code">
                        {request.request_code}
                      </strong>
                    </td>
                    <td>{request.category}</td>
                    <td>
                      <span className={`priority-badge ${request.priority?.toLowerCase()}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.created_at
                        ? new Date(request.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default MyRequests;
