
import {
  Package,
  Boxes,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import "./Dashboard.css";

function Dashboard({
  products = [],
  dashboard,
  onViewProducts,
}) {
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const lowStock = products
    .filter((product) => {
      const threshold = Number(
        product.effective_low_stock_threshold ??
          product.low_stock_threshold ??
          5
      );

      return Number(product.quantity || 0) <= threshold;
    })
    .sort(
      (a, b) =>
        Number(a.quantity || 0) - Number(b.quantity || 0)
    );

  const stockValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 0) *
        Number(product.selling_price ?? product.price ?? 0),
    0
  );

  const formatNumber = (value) =>
    Number(value).toLocaleString("en-IN");

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const stats = [
    {
      label: "Total products",
      value: formatNumber(totalProducts),
      description: "Products in your catalog",
      icon: Package,
      tone: "blue",
    },
    {
      label: "Units in stock",
      value: formatNumber(totalStock),
      description: "Total quantity across products",
      icon: Boxes,
      tone: "purple",
    },
    {
      label: "Low-stock items",
      value: formatNumber(lowStock.length),
      description:
        lowStock.length > 0
          ? "Products needing attention"
          : "Your stock levels look good",
      icon: AlertTriangle,
      tone: "orange",
    },
    {
      label: "Stock value",
      value: formatCurrency(stockValue),
      description: "Estimated selling value",
      icon: DollarSign,
      tone: "green",
    },
  ];

  function handleViewProducts() {
    if (onViewProducts) {
      onViewProducts();
    }
  }

  return (
    <main className="dashboard-page" id="dashboard">
      {/* Page heading */}
      <header className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">INVENTORY OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor your inventory, track stock levels, and identify
            products that need attention.
          </p>
        </div>

        <div className="dashboard-live-indicator">
          <span className="dashboard-live-dot" />
          Inventory overview
        </div>
      
      </header>

      {/* Welcome banner */}
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <span className="dashboard-welcome-label">
            YOUR WORKSPACE
          </span>
          <h2>Welcome to StockFlow!</h2>
          <p>
            Keep your inventory organized, monitor stock levels,
            and stay ahead of low-stock items.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-welcome-button"
          onClick={handleViewProducts}
        >
          Manage products
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Summary cards */}
      <section
        className="dashboard-stats-grid"

        aria-label="Inventory summary"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="dashboard-stat-card"
              key={stat.label}
            >
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-label">
                  {stat.label}
                </span>

                <span
                  className={`dashboard-stat-icon ${stat.tone}`}
                >
                  <Icon size={21} strokeWidth={2} />
                </span>
              </div>

              <h2 className="dashboard-stat-value">
                {stat.value}
              </h2>

              <div className="dashboard-stat-description">
                {stat.label === "Low-stock items" &&
                lowStock.length > 0 ? (
                  <AlertTriangle size={14} />
                ) : stat.label === "Low-stock items" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <TrendingUp size={14} />
                )}

                <span>{stat.description}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Low-stock section */}
      <section
        className="dashboard-panel"
        aria-labelledby="low-stock-heading"
      >
        <div className="dashboard-panel-header">
          <div className="dashboard-panel-title-group">
            <span className="dashboard-panel-icon">
              <AlertTriangle size={19} />
            </span>

            <div>
              <h2 id="low-stock-heading">Low-stock alerts</h2>
              <p>
                Products at or below their stock threshold.
              </p>
            </div>
          </div>

          <span
            className={`dashboard-alert-count ${
              lowStock.length === 0 ? "is-clear" : ""
            }`}
          >
            {lowStock.length}{" "}
            {lowStock.length === 1 ? "item" : "items"}
          </span>
        </div>

        {lowStock.length === 0 ? (
          <div className="dashboard-empty-state">
            <span className="dashboard-empty-icon">
              <CheckCircle2 size={27} />
            </span>

            <h3>Everything looks good!</h3>
            <p>
              No products are currently at or below their stock
              thresholds.
            </p>

            {totalProducts === 0 && (
              <button
                type="button"
                className="dashboard-text-button"
                onClick={handleViewProducts}
              >
                Open product inventory
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="dashboard-alert-list">
              {lowStock.map((product) => {
                const threshold = Number(
                  product.effective_low_stock_threshold ??
                    product.low_stock_threshold ??
                    5
                );

                const quantity = Number(product.quantity || 0);
                const progress =
                  threshold > 0
                    ? Math.min((quantity / threshold) * 100, 100)
                    : 0;

                return (
                  <article
                    className="dashboard-alert-row"
                    key={product.id}
                  >
                    <span className="dashboard-alert-product-icon">
                      <Package size={19} />
                    </span>

                    <div className="dashboard-alert-product">
                      <strong>{product.name}</strong>
                      <span>SKU: {product.sku}</span>
                    </div>

                    <div className="dashboard-alert-stock">
                      <div className="dashboard-stock-numbers">
                        <strong>{formatNumber(quantity)} left</strong>
                        <span>
                          Threshold: {formatNumber(threshold)}
                        </span>
                      </div>

                      <div
                        className="dashboard-stock-track"
                        role="progressbar"
                        aria-label={`${product.name} stock level`}
                        aria-valuemin={0}
                        aria-valuemax={Math.max(threshold, quantity, 1)}
                        aria-valuenow={quantity}
                      >
                        <span
                          className="dashboard-stock-progress"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="dashboard-low-badge">
                      <span />
                      Low stock
                    </span>
                  </article>
                );
              })}
            </div>

            <footer className="dashboard-panel-footer">
              <p>
                Review low-stock products and replenish them when
                necessary.
              </p>

              <button
                type="button"
                className="dashboard-view-button"
                onClick={handleViewProducts}
              >
                View all products
                <ArrowRight size={16} />
              </button>
            </footer>
          </>
        )}
      </section>

      <footer className="dashboard-bottom-note">
        <Package size={15} />
        <span>
          Inventory totals are calculated from your current product
          records.
        </span>
      </footer>
    </main>
  );
}

export default Dashboard;
