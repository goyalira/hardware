import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/");
  }

  const navLinks = (
    <>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileNavOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-orange-500 text-neutral-950"
                : "text-neutral-300 hover:bg-neutral-800"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-neutral-100 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-bold text-neutral-950">
            AE
          </span>
          <span className="font-bold">Arvind Enterprises Admin</span>
        </Link>
        <button onClick={() => setMobileNavOpen((v) => !v)} aria-label="Toggle menu">
          {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {mobileNavOpen && (
        <nav className="flex flex-col gap-1 border-b border-neutral-800 bg-neutral-950 px-3 py-3 md:hidden">
          {navLinks}
          <div className="mt-2 border-t border-neutral-800 pt-3">
            <div className="mb-2 px-3 text-xs text-neutral-400">{user?.email}</div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-neutral-950 text-neutral-100 md:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-bold text-neutral-950">
            AE
          </span>
          <span className="font-bold">Arvind Enterprises Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">{navLinks}</nav>
        <div className="border-t border-neutral-800 px-3 py-4">
          <div className="mb-2 px-3 text-xs text-neutral-400">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}