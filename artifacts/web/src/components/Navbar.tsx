import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(query ? `/catalog?search=${encodeURIComponent(query)}` : "/catalog");
    setMenuOpen(false);
  }

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-orange-500 font-bold text-neutral-950">
            IP
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            IronPoint
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-2 md:flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, materials, brands..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link to="/catalog" className="hover:text-orange-400">
            Shop
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-orange-400">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/orders" className="hover:text-orange-400">
                Orders
              </Link>
              <Link to="/profile" className="flex items-center gap-1 hover:text-orange-400">
                <User className="h-4 w-4" /> {user.name.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="hover:text-orange-400">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-orange-400">
              Sign in
            </Link>
          )}
          <Link to="/cart" className="relative flex items-center hover:text-orange-400">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-800 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link to="/catalog" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart ({cartCount})
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-left">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
