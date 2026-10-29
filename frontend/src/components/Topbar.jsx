
import { useState } from "react";
import { Bell, Menu, UserRound, LogOut, X, Package } from "lucide-react";
import "./Topbar.css";

function Topbar({
  activePage,
  onMenuClick,
  userName = "Store Owner",
  lowStockItems = [],
  onLogout,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const pageTitles = {
    dashboard: "Dashboard",
    products: "Products",
    settings: "Settings",
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="app-topbar">
      <button
        type="button"
        className="topbar-menu-button"
        aria-label="Toggle navigation"
        onClick={onMenuClick}
      >
        <Menu size={21} />
      </button>

      <div className="topbar-breadcrumb">
        Workspace <span>/</span>{" "}
        <strong>{pageTitles[activePage] || "Dashboard"}</strong>
      </div>

      <div className="topbar-actions">
        <span className="topbar-demo-status">
          <span className="topbar-status-dot" />
          Local demo
        </span>

        <div className="topbar-dropdown-wrapper">
          <button
            type="button"
            className="topbar-icon-button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >
            <Bell size={19} />
            {lowStockItems.length > 0 && (
              <span className="topbar-notification-count">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="topbar-dropdown topbar-notifications">
              <div className="topbar-dropdown-heading">
                <strong>Low-stock alerts</strong>
                <button
                  type="button"
                  className="topbar-close-button"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <p className="topbar-empty-message">
                  <Package size={18} />
                  All good! No low-stock products.
                </p>
              ) : (
                <div className="topbar-notification-list">
                  {lowStockItems.map((product) => (
                    <div
                      className="topbar-notification-item"
                      key={product.id}
                    >
                      <Package size={17} />
                      <div>
                        <strong>{product.name}</strong>
                        <p>
                          SKU: {product.sku} · Quantity: {product.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-dropdown-wrapper">
          <button
            type="button"
            className="topbar-avatar"
            title={userName}
            aria-label="Open profile menu"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            {initial}
          </button>

          {showProfile && (
            <div className="topbar-dropdown topbar-profile-menu">
              <div className="topbar-profile-details">
                <div className="topbar-profile-icon">
                  <UserRound size={20} />
                </div>
                <div>
                  <strong>{userName}</strong>
                  <p>Inventory Admin</p>
                </div>
              </div>

              <button
                type="button"
                className="topbar-profile-logout"
                onClick={() => {
                  setShowProfile(false);
                  onLogout?.();
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
