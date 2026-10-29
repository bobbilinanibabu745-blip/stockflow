
import { Boxes } from "lucide-react";
import "./Login.css";

function Login({
  loginForm,
  setLoginForm,
  handleLogin,
  loginError,
  signupSuccess,
  setAuthMode,
}) {
  return (
    <div className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Boxes size={28} />
          </div>
          <span>StockFlow</span>
        </div>

        <div className="auth-hero">
          <span className="auth-eyebrow">INVENTORY, SIMPLIFIED</span>
          <h1>
            Every product.
            <br />
            Every detail.
            <br />
            <span>Under control.</span>
          </h1>
          <p>
            A smarter way to manage your inventory, monitor stock levels,
            and keep your business moving forward.
          </p>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Real-time inventory</strong>
              <small>Keep your product data organized.</small>
            </div>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Low-stock alerts</strong>
              <small>Know when products need attention.</small>
            </div>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Your own workspace</strong>
              <small>Keep your store's data private.</small>
            </div>
          </div>
        </div>

        <p className="auth-copyright">
          © 2026 StockFlow · Inventory management platform
        </p>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <Boxes size={25} /> StockFlow
          </div>

          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Sign in to access your inventory workspace.</p>
          </div>

          {signupSuccess && (
            <div className="auth-success">{signupSuccess}</div>
          )}

          {loginError && (
            <div className="auth-error">{loginError}</div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Username/Email
              <input
                type="text"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    username: event.target.value,
                  })
                }
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    password: event.target.value,
                  })
                }
                autoComplete="current-password"
                required
              />
            </label>

            <button className="auth-submit" type="submit">
              Sign in to StockFlow <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            New to StockFlow?{" "}
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
            >
              Create an account
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
