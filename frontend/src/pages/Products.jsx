
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Search,
  Trash2,
  Plus,
  Pencil,
  X,
  Save,
  RefreshCw,
  AlertTriangle,
  Download,
} from "lucide-react";
import { apiRequest } from "../api";
import "./Products.css";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantity: "0",
  cost_price: "",
  selling_price: "",
  low_stock_threshold: "",
};

function Products({ products = [], search, setSearch, onDeleteProduct }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = () => localStorage.getItem("accessToken");

  const refreshPageData = async () => {
    // Refresh the existing application data without losing the login.
    window.dispatchEvent(new Event("stockflow-refresh"));
    window.location.reload();
  };

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setLoading(true);
      try {
        const data = await apiRequest("/settings/", token());
        if (active) {
          setDefaultThreshold(
            Number(data.default_low_stock_threshold ?? 5)
          );
        }
      } catch {
        if (active) setDefaultThreshold(5);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = (search ?? "").trim().toLowerCase();

    return products.filter((product) =>
      `${product.name} ${product.sku}`.toLowerCase().includes(query)
    );
  }, [products, search]);

  const lowStockCount = products.filter((product) => {
    const threshold = Number(
      product.effective_low_stock_threshold ??
        product.low_stock_threshold ??
        defaultThreshold
    );

    return Number(product.quantity) <= threshold;
  }).length;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      sku: product.sku ?? "",
      description: product.description ?? "",
      quantity: String(product.quantity ?? 0),
      cost_price: product.cost_price ?? "",
      selling_price: product.selling_price ?? "",
      low_stock_threshold:
        product.low_stock_threshold == null
          ? ""
          : String(product.low_stock_threshold),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.sku.trim()) {
      setError("Product name and SKU are required.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Quantity must be a whole number of 0 or more.");
      return;
    }

    const optionalNumber = (value) =>
      value.trim() === "" ? null : Number(value);

    const cost = optionalNumber(form.cost_price);
    const selling = optionalNumber(form.selling_price);
    const threshold = optionalNumber(form.low_stock_threshold);

    if (
      [cost, selling, threshold].some(
        (value) => value !== null && (!Number.isFinite(value) || value < 0)
      )
    ) {
      setError("Prices and threshold must be valid non-negative numbers.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      quantity,
      cost_price: cost,
      selling_price: selling,
      low_stock_threshold: threshold,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await apiRequest(`/products/${editingId}/`, token(), {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSuccess("Product updated successfully.");
      } else {
        await apiRequest("/products/", token(), {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Product added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await refreshPageData();
    } catch (err) {
      setError(err.message || "Unable to save the product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await onDeleteProduct(product.id);
      setSuccess(`${product.name} deleted successfully.`);
    } catch (err) {
      setError(err.message || "Unable to delete the product.");
    }
  }

  function getThreshold(product) {
    return Number(
      product.effective_low_stock_threshold ??
        product.low_stock_threshold ??
        defaultThreshold
    );
  }

  function handleExportCSV() {
  if (products.length === 0) {
    setError("There are no products to export.");
    return;
  }

  const headers = [
    "Product Name",
    "SKU",
    "Description",
    "Quantity",
    "Cost Price",
    "Selling Price",
    "Low Stock Threshold",
    "Effective Threshold",
    "Low Stock Status",
    "Created At",
    "Updated At",
  ];

  const escapeCSV = (value) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = products.map((product) => {
    const threshold = getThreshold(product);

    return [
      product.name,
      product.sku,
      product.description,
      product.quantity,
      product.cost_price,
      product.selling_price,
      product.low_stock_threshold,
      threshold,
      Number(product.quantity) <= threshold
        ? "Low Stock"
        : "In Stock",
      product.created_at,
      product.updated_at,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `stockflow-products-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setError("");
  setSuccess("Product inventory exported successfully.");
}

  return (
    <section className="products-page" id="products">
      <div className="products-page-heading">
        <div>
          <p className="products-eyebrow">INVENTORY MANAGEMENT</p>
          <h1>Products</h1>
          <p className="products-subtitle">
            Add, search, edit, and manage your inventory in one place.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="products-secondary-btn"
            onClick={handleExportCSV}
            disabled={products.length === 0}
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            type="button"
            className="products-primary-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add product
          </button>
        </div>
      </div>

      {error && (
        <div className="products-message products-error" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="products-message products-success" role="status">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss message">
            <X size={17} />
          </button>
        </div>
      )}

      {showForm && (
        <section className="products-form-panel">
          <div className="products-form-heading">
            <div>
              <h2>{editingId !== null ? "Edit product" : "Add a product"}</h2>
              <p>
                Fields marked with * are required. Leave the custom threshold
                empty to use your organization default of {defaultThreshold}.
              </p>
            </div>
            <button
              type="button"
              className="products-icon-btn"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              aria-label="Close product form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="products-form-grid">
              <label>
                Product name *
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Wireless Keyboard"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                SKU *
                <input
                  name="sku"
                  value={form.sku}
                  onChange={updateField}
                  placeholder="e.g. KEY-001"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Quantity *
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Cost price (₹)
                <input
                  name="cost_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost_price}
                  onChange={updateField}
                  placeholder="Optional"
                />
              </label>

              <label>
                Selling price (₹)
                <input
                  name="selling_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.selling_price}
                  onChange={updateField}
                  placeholder="Optional"
                />
              </label>

              <label>
                Custom low-stock threshold
                <input
                  name="low_stock_threshold"
                  type="number"
                  min="0"
                  step="1"
                  value={form.low_stock_threshold}
                  onChange={updateField}
                  placeholder={`Default: ${defaultThreshold}`}
                />
              </label>

              <label className="products-description-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows="3"
                  placeholder="Optional product details"
                />
              </label>
            </div>

            <div className="products-form-actions">
              <button
                type="button"
                className="products-secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="products-primary-btn"
                disabled={saving}
              >
                <Save size={17} />
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save changes"
                    : "Save product"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="products-summary-grid">
        <div className="products-summary-card">
          <span className="products-summary-icon">
            <Package size={19} />
          </span>
          <div>
            <p>Total products</p>
            <strong>{products.length}</strong>
          </div>
        </div>

        <div className="products-summary-card">
          <span className="products-summary-icon products-warning-icon">
            <AlertTriangle size={19} />
          </span>
          <div>
            <p>Low-stock products</p>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className="products-summary-card">
          <span className="products-summary-icon">
            <RefreshCw size={19} />
          </span>
          <div>
            <p>Total units</p>
            <strong>
              {products.reduce(
                (total, product) => total + Number(product.quantity || 0),
                0
              )}
            </strong>
          </div>
        </div>
      </section>

      <section className="products-panel">
        <div className="products-panel-heading">
          <div>
            <h2>Product inventory</h2>
            <p>{products.length} products in your catalog</p>
          </div>

          <label className="products-search-box">
            <Search size={17} />
            <input
              type="search"
              value={search ?? ""}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or SKU..."
              aria-label="Search products by name or SKU"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>

        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>QUANTITY</th>
                <th>SELLING PRICE</th>
                <th>THRESHOLD</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const threshold = getThreshold(product);
                const isLow = Number(product.quantity) <= threshold;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="products-name-cell">
                        <div className="products-package-icon">
                          <Package size={19} />
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          {product.description && (
                            <small>{product.description}</small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="products-sku">{product.sku}</td>
                    <td>
                      <strong>{product.quantity}</strong>
                      <span className="products-units"> units</span>
                    </td>

                    <td>
                      {product.selling_price == null
                        ? "—"
                        : `₹${Number(product.selling_price).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          )}`}
                    </td>

                    <td>{threshold}</td>

                    <td>
                      <span
                        className={`products-status ${
                          isLow ? "is-low" : "is-healthy"
                        }`}
                      >
                        <span className="products-status-dot" />
                        {isLow ? "Low stock" : "In stock"}
                      </span>
                    </td>

                    <td>
                      <div className="products-row-actions">
                        <button
                          type="button"
                          className="products-edit-btn"
                          onClick={() => openEditForm(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="products-delete-btn"
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="products-empty-state">
                    <Package size={28} />
                    <strong>
                      {search ? "No matching products" : "No products yet"}
                    </strong>
                    <span>
                      {search
                        ? "Try another product name or SKU."
                        : "Add your first product to start managing inventory."}
                    </span>
                    {!search && (
                      <button
                        type="button"
                        className="products-primary-btn"
                        onClick={openAddForm}
                      >
                        <Plus size={17} />
                        Add your first product
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="products-panel-footer">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </section>
    </section>
  );
}

export default Products;
