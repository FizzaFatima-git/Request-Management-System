
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppLayout({ title, subtitle, active, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">R</div>
          RequestFlow
        </div>

        <nav>
          <Link
            to="/dashboard"
            className={`nav-link ${active === "dashboard" ? "active" : ""}`}
          >
            Dashboard
          </Link>

          <Link
            to="/create-request"
            className={`nav-link ${active === "create" ? "active" : ""}`}
          >
            Create Request
          </Link>

          <Link
            to="/my-requests"
            className={`nav-link ${active === "requests" ? "active" : ""}`}
          >
            My Requests
          </Link>

          <Link
            to="/profile"
            className={`nav-link ${active === "profile" ? "active" : ""}`}
          >
            My Profile
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main app-main">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
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

        {children}
      </main>
    </div>
  );
}

export default AppLayout;
