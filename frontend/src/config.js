const runtimeCfg = (window as any).__APP_CONFIG__ || {};
export const API_BASE_URL =
  runtimeCfg.API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "/api";
