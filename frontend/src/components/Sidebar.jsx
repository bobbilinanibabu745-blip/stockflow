
import {
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar({
  activePage,
  setActivePage,
  onLogout,
  userName,
}) {
  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const username = userName || "Store Owner";

  const initial = username.charAt(0).toUpperCase();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Boxes size={23} />
        </div>

        <div>
          <h2>StockFlow</h2>
          <span>INVENTORY PLATFORM</span>
        </div>
      </div>

      <p className="sidebar-section-label">WORKSPACE</p>

      <nav className="sidebar-navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={
                activePage === item.id
                  ? "sidebar-nav-item active"
                  : "sidebar-nav-item"
              }
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-avatar">
          {initial}
        </div>

        <div className="sidebar-user-info">
          <strong>{username}</strong>
          <span>Inventory Admin</span>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
