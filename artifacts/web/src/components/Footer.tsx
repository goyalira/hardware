import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-bold text-neutral-950">
                AE
              </span>
              <span className="text-lg font-bold text-neutral-100">Arvind Enterprises</span>
            </div>
            <p className="text-sm">
              Hardware and construction supplies for contractors and builders.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-orange-400">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/catalog?sort=newest" className="hover:text-orange-400">
                  New arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="hover:text-orange-400">
                  Order history
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-orange-400">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Dadabari, Kota, Rajasthan</li>
              <li>+917877535782</li>
              
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-800 pt-6 text-xs">
          &copy; {new Date().getFullYear()} Arvind Enterprises. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
