import { Link } from "react-router-dom"

const UserFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-950 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>TM</div>
              <span className="text-white font-black text-lg">ThemeMatrix</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Premium UI kits &amp; templates marketplace for modern
              developers and designers worldwide.
            </p>
            <div className="flex gap-3">
              {["Facebook","Instagram","Twitter","LinkedIn"].map(s => (
                <span key={s}
                  className="text-xs cursor-pointer hover:text-violet-400 transition-colors text-gray-500">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Marketplace
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/"           className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">Browse Templates</Link>
              <Link to="/"           className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">Latest Arrivals</Link>
              <Link to="/"           className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">Top Rated</Link>
              <Link to="/"           className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">Free Templates</Link>
            </div>
          </div>

          {/* ✅ Vendor — fixed links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Vendor
            </h4>
            <div className="flex flex-col gap-2">
              {/* ✅ Become a Vendor → vendor register page */}
              <Link to="/vendorregister"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Become a Vendor
              </Link>
              {/* ✅ Upload Templates → vendor login */}
              <Link to="/vendorlogin"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Upload Templates
              </Link>
              {/* ✅ Vendor Dashboard → vendor login */}
              <Link to="/vendorlogin"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Vendor Dashboard
              </Link>
              {/* ✅ Earnings → vendor login */}
              <Link to="/vendorlogin"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Earnings
              </Link>
            </div>
          </div>

          {/* ✅ Support — fixed links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Support
            </h4>
            <div className="flex flex-col gap-2">
              {/* ✅ Learn More → become-vendor page */}
              <Link to="/become-vendor"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Help Center
              </Link>
              <Link to="/contact"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Contact Us
              </Link>
              <Link to="/privacy-policy"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms"
                className="text-sm text-gray-400 no-underline hover:text-violet-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © 2026 ThemeMatrix. Designed and Developed by Survivor Infotech.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link to="/privacy-policy"
                className="no-underline hover:text-violet-400 cursor-pointer transition-colors text-gray-500">
                Privacy Policy
              </Link>
              <Link to="/terms"
                className="no-underline hover:text-violet-400 cursor-pointer transition-colors text-gray-500">
                Terms of Service
              </Link>
              <Link to="/contact"
                className="no-underline hover:text-violet-400 cursor-pointer transition-colors text-gray-500">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default UserFooter