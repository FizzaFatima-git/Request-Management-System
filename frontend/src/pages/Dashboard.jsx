
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

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
            <span className="welcome-label">EMPLOYEE PORTAL</span>
            <h1>Hello, {user?.full_name?.split(" ")[0]}!</h1>
            <p>
              Welcome to your employee portal. Create service
              requests and track their progress from one place.
            </p>

            <Link to="/create-request" className="welcome-btn">
              Create New Request
            </Link>
          </div>

          <div className="welcome-art">R</div>
        </section>

        <h3 className="section-heading">Account Overview</h3>

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

        <h3 className="section-heading">Request Management</h3>

        <section className="overview-grid">
          <div className="overview-card">
            <span className="overview-icon">＋</span>
            <p>Submit a new issue</p>
            <h3>Create Request</h3>
            <Link to="/create-request" className="welcome-btn">
              Submit Request
            </Link>
          </div>

          <div className="overview-card">
            <span className="overview-icon">▤</span>
            <p>Check your submissions</p>
            <h3>My Requests</h3>
            <Link to="/my-requests" className="welcome-btn">
              View Requests
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
