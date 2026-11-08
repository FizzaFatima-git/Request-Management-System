
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  const { user, logout } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = isAdmin
          ? "/requests/admin/all"
          : "/requests/";

        const response = await api.get(endpoint);
        setRequests(response.data);
      } catch (err) {
        const detail = err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const countStatus = (status) =>
    requests.filter(
      (request) =>
        request.status?.toLowerCase() === status.toLowerCase()
    ).length;

  const priorities = ["Low", "Medium", "High", "Critical"];

  const categories = [
    "Technical Issue",
    "Hardware",
    "Software",
    "Account Access",
    "Other",
  ];

  // Chart data
  const priorityData = priorities.map((priority) => ({
    name: priority,
    count: requests.filter(
      (r) => r.priority?.toLowerCase() === priority.toLowerCase()
    ).length,
  }));

  const categoryData = categories
    .map((category) => ({
      name: category,
      count: requests.filter(
        (r) => r.category?.toLowerCase() === category.toLowerCase()
      ).length,
    }))
    .filter((item) => item.count > 0);

  const statusData = [
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Approved",
    "Rejected",
  ]
    .map((status) => ({
      name: status,
      count: countStatus(status),
    }))
    .filter((item) => item.count > 0);

  const chartColors = [
    "#6366f1",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">R</div>
          RequestFlow
        </div>

        <nav>
          <Link to="/dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </Link>

          <Link to="/create-request" className="nav-link">
            <span>＋</span> Create Request
          </Link>

          <Link to="/my-requests" className="nav-link">
            <span>▤</span> My Requests
          </Link>

          <Link to="/profile" className="nav-link">
            <span>♙</span> My Profile
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          ↪ Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome to your Request Management System.</p>
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

        <section className="welcome-card">
          <div>
            <span className="welcome-label">
              {isAdmin ? "ADMIN PORTAL" : "EMPLOYEE PORTAL"}
            </span>

            <h1>Hello, {user?.full_name?.split(" ")[0]}!</h1>

            <p>
              {isAdmin
                ? "Monitor requests, track processing and review service performance."
                : "Create service requests and track their progress from one place."}
            </p>

            <Link to="/create-request" className="welcome-btn">
              Create New Request
            </Link>
          </div>

          <div className="welcome-art">R</div>
        </section>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading dashboard data...</p>
        ) : (
          <>
            {/* Request Statistics */}
            <h3 className="section-heading">
              {isAdmin ? "Request Analytics" : "My Request Overview"}
            </h3>

            <section className="overview-grid">
              <div className="overview-card">
                <span className="overview-icon">▤</span>
                <p>Total Requests</p>
                <h3>{requests.length}</h3>
              </div>

              <div className="overview-card">
                <span className="overview-icon">◷</span>
                <p>Pending</p>
                <h3>{countStatus("Pending")}</h3>
              </div>

              <div className="overview-card">
                <span className="overview-icon">⚙</span>
                <p>In Progress</p>
                <h3>{countStatus("In Progress")}</h3>
              </div>

              <div className="overview-card">
                <span className="overview-icon">✓</span>
                <p>Resolved</p>
                <h3>{countStatus("Resolved")}</h3>
              </div>

              <div className="overview-card">
                <span className="overview-icon">✔</span>
                <p>Approved</p>
                <h3>{countStatus("Approved")}</h3>
              </div>

              <div className="overview-card">
                <span className="overview-icon">↗</span>
                <p>Assigned</p>
                <h3>{countStatus("Assigned")}</h3>
              </div>
            </section>

            {/* Admin Analytics */}
            {isAdmin && (
              <>
                <h3 className="section-heading">
                  Priority Breakdown
                </h3>

                <section className="overview-grid">
                  {priorities.map((priority) => (
                    <div className="overview-card" key={priority}>
                      <p>{priority} Priority</p>
                      <h3>
                        {priorityData.find(
                          (item) => item.name === priority
                        )?.count || 0}
                      </h3>
                    </div>
                  ))}
                </section>

                <h3 className="section-heading">
                  Category Breakdown
                </h3>

                <section className="overview-grid">
                  {categories.map((category) => (
                    <div className="overview-card" key={category}>
                      <p>{category}</p>
                      <h3>
                        {categoryData.find(
                          (item) => item.name === category
                        )?.count || 0}
                      </h3>
                    </div>
                  ))}
                </section>

                {/* Visual Analytics */}
                <h3 className="section-heading">
                  Visual Analytics
                </h3>

                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {/* Priority Bar Chart */}
                  <div className="overview-card">
                    <h3>Requests by Priority</h3>
                    <p>Distribution across priority levels</p>

                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />

                        <Bar
                          dataKey="count"
                          name="Requests"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Pie Chart */}
                  <div className="overview-card">
                    <h3>Requests by Category</h3>
                    <p>Category-wise distribution</p>

                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={85}
                          label
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                chartColors[
                                  index % chartColors.length
                                ]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Donut Chart */}
                  <div className="overview-card">
                    <h3>Requests by Status</h3>
                    <p>Current processing status</p>

                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={48}
                          outerRadius={85}
                          label
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                chartColors[
                                  index % chartColors.length
                                ]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Recent Requests */}
                <h3 className="section-heading">
                  Recent Requests
                </h3>

                <section className="overview-card">
                  {requests.length === 0 ? (
                    <p>No requests found.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="requests-table">
                        <thead>
                          <tr>
                            <th>Request ID</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {requests.slice(0, 5).map((request) => (
                            <tr key={request.id}>
                              <td>
                                <strong>{request.request_code}</strong>
                              </td>
                              <td>{request.category}</td>
                              <td>{request.priority}</td>
                              <td>{request.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* Account Overview */}
        <h3 className="section-heading">
          Account Overview
        </h3>

        <section className="overview-grid">
          <div className="overview-card">
            <span className="overview-icon">♙</span>
            <p>Account Name</p>
            <h3>{user?.full_name}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-icon">✉</span>
            <p>Email Address</p>
            <h3>{user?.email}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-icon">✓</span>
            <p>Account Role</p>
            <h3>{user?.role}</h3>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
