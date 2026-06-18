import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const VendorSidebar = ({ open }) => {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const [tplOpen, setTplOpen] = useState(false)

  const vendorName = localStorage.getItem("vendorName") || "Vendor"

  const handleLogout = () => {
    localStorage.removeItem("vendorToken")
    localStorage.removeItem("vendorId")
    localStorage.removeItem("vendorName")
    navigate("/vendorlogin")
  }

  const NavItem = ({ to, icon, label }) => {
    const active = pathname === to || pathname.startsWith(to + "/")
    return (
      <Link
        to={to}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all"
        style={{
          background: active ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "transparent",
          color:      active ? "#fff" : "rgba(255,255,255,0.55)",
        }}>
        <span className="text-base">{icon}</span>
        <span>{label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />}
      </Link>
    )
  }

  const DropBtn = ({ icon, label, isOpen, onToggle }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: isOpen ? "rgba(168,85,247,0.1)" : "transparent",
        color:  "rgba(255,255,255,0.65)",
        border: "none",
        cursor: "pointer",
      }}>
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span style={{
        fontSize: "10px",
        display: "inline-block",
        transition: "transform 0.3s",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        color: "rgba(255,255,255,0.4)",
      }}>▼</span>
    </button>
  )

  const SubLink = ({ to, label }) => (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs no-underline transition-all"
      style={{
        color:      pathname === to ? "#d8b4fe" : "rgba(255,255,255,0.5)",
        fontWeight: pathname === to ? 700 : 400,
        background: pathname === to ? "rgba(168,85,247,0.2)" : "transparent",
      }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: pathname === to ? "#d8b4fe" : "rgba(255,255,255,0.3)" }} />
      {label}
    </Link>
  )

  return (
    <>
      {/* ✅ hide scrollbar */}
      <style>{`
        .vendor-nav::-webkit-scrollbar { display: none; }
        .vendor-nav { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 h-full"
        style={{
          background: "linear-gradient(180deg,#3b0764 0%,#4c1d95 50%,#1e1b4b 100%)",
          width:    open ? "256px" : "0px",
          overflow: open ? "visible" : "hidden",
        }}>
        <div className="flex flex-col h-full" style={{ width: "256px" }}>

          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>TM</div>
            <div>
              <p className="text-white font-black text-sm">
                Theme<span style={{ color: "#c084fc" }}>Matrix</span>
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Vendor Panel</p>
            </div>
          </div>

          {/* Vendor chip */}
          <div className="mx-4 my-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl flex-shrink-0"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
              {vendorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{vendorName}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Template Developer</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>

          {/* ✅ Nav — scrollbar hidden */}
          <nav className="vendor-nav flex-1 px-3 pb-4"
            style={{ overflowY: "auto", overflowX: "hidden" }}>

            <p className="text-xs font-bold px-4 py-2 mt-1 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Main</p>

            <NavItem to="/vendor/dashboard" icon="🏠" label="Dashboard" />

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Templates</p>

            <DropBtn icon="🎨" label="Templates" isOpen={tplOpen} onToggle={() => setTplOpen(p => !p)} />
            {tplOpen && (
              <div className="ml-3 mt-0.5 mb-1 pl-3 flex flex-col gap-0.5"
                style={{ borderLeft: "1px solid rgba(168,85,247,0.3)" }}>
                <SubLink to="/vendor/upload"       label="Upload Template" />
                <SubLink to="/vendor/my-templates" label="My Templates" />
              </div>
            )}

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Categories</p>

            <NavItem to="/vendor/categories" icon="🏷️" label="Categories" />
            <NavItem to="/vendor/orders"     icon="📋" label="Orders" />

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Account</p>

            <NavItem to="/vendor/cart-products" icon="🛒" label="Cart Products" />
            <NavItem to="/vendor/edit-profile"  icon="✏️" label="Edit Profile" />
            <NavItem to="/vendor/bank-details"  icon="🏦" label="Bank Details" />
            <NavItem to="/vendor/payments"      icon="💰" label="Payments" />
            <NavItem to="/vendor/feedback"      icon="⭐" label="Feedback" />

          </nav>

          {/* Logout */}
          <div className="p-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "transparent",
                color:  "rgba(255,100,100,0.7)",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}

export default VendorSidebar