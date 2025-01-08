import { Link, useLocation } from "react-router-dom";

export const DashboardHeader = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/dashboard"
                  ? "border-b-2 border-primary text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/metrics"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === "/dashboard/metrics"
                  ? "border-b-2 border-primary text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Metrics
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};