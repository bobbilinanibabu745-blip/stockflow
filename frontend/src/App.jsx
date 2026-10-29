
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./index.css";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("accessToken"))
  );

  const [userName, setUserName] = useState(
    () => localStorage.getItem("displayName") || "Store Owner"
  );

  
useEffect(() => {
  function handleAuthExpired() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("displayName");
    setUserName("Store Owner");

    setToken(null);
    setIsLoggedIn(false);
    setProducts([]);
    setError("");
  }

  window.addEventListener("auth-expired", handleAuthExpired);

  return () => {
    window.removeEventListener("auth-expired", handleAuthExpired);
  };
}, []);


  const [activePage, setActivePage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState({
    total_products: 0,
    total_stock: 0,
    low_stock_count: 0,
    low_stock_items: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    quantity: 0,
    cost_price: "",
    selling_price: "",
    low_stock_threshold: "",
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    organization_name: "",
  });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [defaultThreshold, setDefaultThreshold] = useState("5");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [productData, dashboardData, settingsData] =
        await Promise.all([
          apiRequest("/products/", token),
          apiRequest("/dashboard/", token),
          apiRequest("/settings/", token),
        ]);

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData.results ?? []
      );

      setDashboard(dashboardData);

      if (
        settingsData.default_low_stock_threshold !== undefined
      ) {
        setDefaultThreshold(
          String(settingsData.default_low_stock_threshold)
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load your inventory.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoggedIn && token) {
      loadData();
    }
  }, [isLoggedIn, token, loadData]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    try {
      const data = await apiRequest("/auth/login/", null, {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      const enteredName = loginForm.username.trim();
        const displayName = enteredName.includes("@")
          ? enteredName.split("@")[0]
          : enteredName;

        localStorage.setItem("displayName", displayName);
        setUserName(displayName);

      setToken(data.access);
      setIsLoggedIn(true);
      setActivePage("dashboard");
      setLoginForm({ username: "", password: "" });
    } catch (err) {
      setLoginError(
        err.message || "Login failed. Check your credentials."
      );
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setSignupError("");
    setSignupSuccess("");

    try {
      await apiRequest("/auth/signup/", null, {
        method: "POST",
        body: JSON.stringify(signupForm),
      });

      setLoginForm({
        username: signupForm.username,
        password: "",
      });

      setSignupForm({
        username: "",
        email: "",
        password: "",
        organization_name: "",
      });

      setAuthMode("login");
      setSignupSuccess("Account created! Please sign in.");
    } catch (err) {
      setSignupError(
        err.message || "Unable to create your account."
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("displayName");
    setUserName("Store Owner");

    setToken(null);
    setIsLoggedIn(false);
    setProducts([]);
    setDashboard({
      total_products: 0,
      total_stock: 0,
      low_stock_count: 0,
      low_stock_items: [],
    });
    setActivePage("dashboard");
    setShowForm(false);
    setError("");
    setLoginError("");
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function addProduct(event) {
    event.preventDefault();

    try {
      const productPayload = {
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim(),
        quantity: Number(form.quantity),
        cost_price:
          form.cost_price === "" ? null : Number(form.cost_price),
        selling_price:
          form.selling_price === ""
            ? null
            : Number(form.selling_price),
        low_stock_threshold:
          form.low_stock_threshold === ""
            ? null
            : Number(form.low_stock_threshold),
      };

      await apiRequest("/products/", token, {
        method: "POST",
        body: JSON.stringify(productPayload),
      });

      await loadData();

      setForm({
        name: "",
        sku: "",
        description: "",
        quantity: 0,
        cost_price: "",
        selling_price: "",
        low_stock_threshold: "",
      });

      setShowForm(false);
      alert("Product saved successfully!");
    } catch (err) {
      alert("Could not save product: " + err.message);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await apiRequest(`/products/${id}/`, token, {
        method: "DELETE",
      });

      await loadData();
      alert("Product deleted successfully!");
    } catch (err) {
      alert("Could not delete product: " + err.message);
    }
  }

  async function saveSettings() {
    setSavingSettings(true);
    setSettingsMessage("");

    try {
      await apiRequest("/settings/", token, {
        method: "PATCH",
        body: JSON.stringify({
          default_low_stock_threshold: Number(defaultThreshold),
        }),
      });

      await loadData();
      setSettingsMessage("Settings saved successfully.");
    } catch (err) {
      setSettingsMessage(
        "Could not save settings: " + err.message
      );
    } finally {
      setSavingSettings(false);
    }
  }

  function handleAddProduct() {
    setShowForm(true);
    setActivePage("dashboard");
  }

  if (!isLoggedIn) {
    if (authMode === "signup") {
      return (
        <Signup
          signupForm={signupForm}
          setSignupForm={setSignupForm}
          handleSignup={handleSignup}
          signupError={signupError}
          setAuthMode={setAuthMode}
        />
      );
    }

    return (
      <Login
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        loginError={loginError}
        signupSuccess={signupSuccess}
        setAuthMode={setAuthMode}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setShowForm(false);
          setError("");
        }}
        onLogout={handleLogout}
        userName={userName}
      />

      <main className="main-content">
        <Topbar
          activePage={activePage}
          onMenuClick={() =>
            window.alert("Use the navigation menu to change pages.")
          }
          userName={userName}
          lowStockItems={dashboard.low_stock_items}
          onLogout={handleLogout}
        />

        <div className="page-content">
          {error && <div className="app-error">{error}</div>}

          {loading && (
            <p className="loading-message">Loading your inventory...</p>
          )}

          {activePage === "dashboard" && (
            <Dashboard
              products={products}
              dashboard={dashboard}
              onViewProducts={() => setActivePage("products")}
            />
          )}
          

          {activePage === "products" && (
            <Products
              products={products}
              search={search}
              setSearch={setSearch}
              onDeleteProduct={deleteProduct}
            />
          )}

          {activePage === "settings" && (
            <Settings
              defaultThreshold={defaultThreshold}
              setDefaultThreshold={setDefaultThreshold}
              onSaveSettings={saveSettings}
              savingSettings={savingSettings}
              settingsMessage={settingsMessage}
            />
          )}

          {activePage === "dashboard" && showForm && (
            <form className="product-form" onSubmit={addProduct}>
              <div className="form-heading">
                <h2>Add a product</h2>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Product name
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="e.g. Wireless Keyboard"
                    required
                  />
                </label>

                <label>
                  SKU
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={updateForm}
                    placeholder="e.g. SF-KEY-002"
                    required
                  />
                </label>

                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={updateForm}
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
                    onChange={updateForm}
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
                    onChange={updateForm}
                  />
                </label>

                <label>
                  Low-stock threshold (optional)
                  <input
                    name="low_stock_threshold"
                    type="number"
                    min="0"
                    step="1"
                    value={form.low_stock_threshold}
                    onChange={updateForm}
                    placeholder={`Default: ${defaultThreshold}`}
                  />
                </label>

                <label className="product-description-field">
                  Description (optional)
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateForm}
                    placeholder="Product details"
                    rows="3"
                  />
                </label>
              </div>

              <button className="primary-button" type="submit">
                Save product
              </button>
            </form>
          )}

          <footer className="app-footer">
            StockFlow · Inventory management made simple
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
