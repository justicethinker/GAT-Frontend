import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function Header() {
  const [location] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const { data: userInfo } = useQuery<{ email: string }>({
    queryKey: ["/auth/user-info"],
    retry: false,
  });

  const { data: notifications = [] } = useQuery<Array<{
    id: number;
    action: string;
    details: string | null;
    created_at: string;
  }>>({
    queryKey: ["/dash/notification"],
    retry: false,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setNotifMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    window.location.href = "/login";
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/arbitrage", label: "Arbitrage", icon: "ri-exchange-line" },
    { path: "/futures", label: "Futures", icon: "ri-line-chart-line" },
    { path: "/forex", label: "Forex", icon: "ri-currency-line" },
    { path: "/wallet", label: "Wallet", icon: "ri-wallet-3-line" },
  ];

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center lg:hidden">
            <button
              data-testid="button-mobile-menu"
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>

          <Link href="/dashboard" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <i className="ri-dashboard-line text-white text-lg sm:text-xl"></i>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
              TradePro
            </span>
          </Link>

          <nav className="hidden lg:flex space-x-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                href={path}
                data-testid={`link-${label.toLowerCase()}`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  location === path
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <i className={`${icon} text-base`}></i>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={notifMenuRef}>
              <button
                data-testid="button-notifications"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md relative"
              >
                <i className="ri-notification-3-line text-lg sm:text-xl"></i>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400" data-testid="text-no-notifications">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          data-testid={`notification-${notif.id}`}
                          className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-white font-medium">{notif.action}</p>
                          {notif.details && (
                            <p className="text-gray-400 text-sm mt-1">{notif.details}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                data-testid="button-user-menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative flex items-center space-x-2 p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md focus:outline-none transition-transform"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {getInitials(userInfo?.email)}
                </div>
                <span className="text-white text-sm hidden sm:block" data-testid="text-user-email">
                  {userInfo?.email || "User"}
                </span>
                <i
                  className={`ri-arrow-down-s-line text-white text-sm hidden sm:block transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 transform transition-all origin-top-right">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      data-testid="link-profile"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                      <i className="ri-user-line"></i>
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      data-testid="link-settings"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                      <i className="ri-settings-3-line"></i>
                      <span>Settings</span>
                    </Link>

                    <button
                      data-testid="button-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                      <i className="ri-logout-box-line"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
