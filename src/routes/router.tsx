import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { LandingPage } from "../pages/LandingPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminHomePage } from "../pages/admin/AdminHomePage";
import { AdminIngestionPage } from "../pages/admin/AdminIngestionPage";
import { AdminPhPricesPage } from "../pages/admin/AdminPhPricesPage";
import { AdminCompanyPricesPage } from "../pages/admin/AdminCompanyPricesPage";
import { AdminInsightsPage } from "../pages/admin/AdminInsightsPage";
import { AdminAlertsPage } from "../pages/admin/AdminAlertsPage";
import { AdminLogsPage } from "../pages/admin/AdminLogsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "login", element: <AdminLoginPage /> },
      { index: true, element: <AdminHomePage /> },
      { path: "ingestion", element: <AdminIngestionPage /> },
      { path: "ph-prices", element: <AdminPhPricesPage /> },
      { path: "company-prices", element: <AdminCompanyPricesPage /> },
      { path: "insights", element: <AdminInsightsPage /> },
      { path: "alerts", element: <AdminAlertsPage /> },
      { path: "logs", element: <AdminLogsPage /> },
    ],
  },
]);

