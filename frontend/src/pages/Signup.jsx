
import { useState } from "react";
import { Boxes } from "lucide-react";
import "./Signup.css";

function Signup({
  signupForm,
  setSignupForm,
  handleSignup,
  signupError,
  setAuthMode,
}) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setPasswordError("");

    if (signupForm.password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please try again.");
      return;
    }

    if (signupForm.password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      return;
    }

    handleSignup(event);
  };

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
          <span className="auth-eyebrow">GET STARTED TODAY</span>
          <h1>
            Your business.
            <br />
            Your inventory.
            <br />
            <span>One workspace.</span>
          </h1>
          <p>
            Create your workspace and manage your products,
            stock quantities, and low-stock items in one place.
          </p>
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
            <h2>Create your workspace</h2>
            <p>Set up your account to start managing stock.</p>
          </div>

          {signupError && (
            <div className="auth-error">{signupError}</div>
          )}

          {passwordError && (
            <div className="auth-error" role="alert">
              {passwordError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                type="text"
                placeholder="Choose a username"
                value={signupForm.username}
                onChange={(event) =>
                  setSignupForm({
                    ...signupForm,
                    username: event.target.value,
                  })
                }
                autoComplete="username"
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={signupForm.email}
                onChange={(event) =>
                  setSignupForm({
                    ...signupForm,
                    email: event.target.value,
                  })
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              Store / Organization name
              <input
                type="text"
                placeholder="Your business name"
                value={signupForm.organization_name}
                onChange={(event) =>
                  setSignupForm({
                    ...signupForm,
                    organization_name: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="At least 8 characters"
                value={signupForm.password}
                onChange={(event) => {
                  setSignupForm({
                    ...signupForm,
                    password: event.target.value,
                  });
                  setPasswordError("");
                }}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError("");
                }}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button className="auth-submit" type="submit">
              Create your account <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Signup;
