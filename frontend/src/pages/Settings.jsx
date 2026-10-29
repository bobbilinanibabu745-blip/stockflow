
import { SlidersHorizontal, Save } from "lucide-react";
import "./Settings.css";

function Settings({
  defaultThreshold,
  setDefaultThreshold,
  onSaveSettings,
  savingSettings,
  settingsMessage,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSaveSettings();
  }

  return (
    <section className="settings-page" id="settings">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE PREFERENCES</p>
          <h1>Settings</h1>
          <p className="subtitle">
            Configure the default low-stock threshold for your organization.
          </p>
        </div>
      </div>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <h2>Inventory settings</h2>
            <p>Choose when products should be marked as low stock.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label htmlFor="default-threshold">
            Default low-stock threshold
          </label>

          <p className="settings-help">
            Products with a quantity at or below this number will be
            marked as low stock when they do not have a custom threshold.
          </p>

          <input
            id="default-threshold"
            type="number"
            min="0"
            step="1"
            value={defaultThreshold}
            onChange={(event) =>
              setDefaultThreshold(event.target.value)
            }
            required
          />

          <button
            type="submit"
            className="primary-button"
            disabled={savingSettings}
          >
            <Save size={17} />
            {savingSettings ? "Saving..." : "Save settings"}
          </button>

          {settingsMessage && (
            <p className="settings-message" role="status">
              {settingsMessage}
            </p>
          )}
        </form>
      </section>
    </section>
  );
}

export default Settings;
