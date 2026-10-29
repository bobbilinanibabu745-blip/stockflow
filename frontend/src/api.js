
const API_BASE = "https://stockflow-h9g3.onrender.com/api";

let refreshPromise = null;

// Refresh the access token using the saved refresh token.
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("Session expired. Please log in again.");
  }

  // Prevent multiple simultaneous refresh requests.
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.access) {
          throw new Error("Session expired. Please log in again.");
        }

        // Save the new access token.
        localStorage.setItem("accessToken", data.access);

        // Save a rotated refresh token if the backend provides one.
        if (data.refresh) {
          localStorage.setItem("refreshToken", data.refresh);
        }

        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// Send an API request.
async function sendRequest(path, token, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// Main API function used throughout StockFlow.
export async function apiRequest(path, token, options = {}) {
  let currentToken = token || localStorage.getItem("accessToken");
  let response;

  try {
    // Send the original request.
    response = await sendRequest(path, currentToken, options);

    // If the access token expires, refresh it and retry once.
    if (response.status === 401 && currentToken) {
      currentToken = await refreshAccessToken();

      response = await sendRequest(path, currentToken, options);
    }

    // If retrying still returns 401, the session is no longer usable.
    if (response.status === 401 && currentToken) {
      throw new Error("Session expired. Please log in again.");
    }
  } catch (error) {
    if (
      error.message === "Session expired. Please log in again." ||
      error.message === "No refresh token available."
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.dispatchEvent(new Event("auth-expired"));

      throw new Error("Your session expired. Please log in again.");
    }

    throw error;
  }

  // Read the response.
  const data = await response.json().catch(() => ({}));

  // Handle API errors.
  if (!response.ok) {
    const message =
      data.detail ||
      Object.values(data)
        .flat()
        .filter((value) => typeof value === "string")
        .join(" ") ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}
