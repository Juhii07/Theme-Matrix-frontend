import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const AdminSidebar = ({ open }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [vendorOpen,   setVendorOpen]   = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)

  const adminName = localStorage.getItem("adminName") || "Administrator"
  const isActive  = (p) => pathname === p

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("adminId")
    localStorage.removeItem("adminName")
    navigate("/adminlogin")
  }

  const NavItem = ({ to, icon, label }) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all"
      style={{
        background: isActive(to) ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "transparent",
        color:      isActive(to) ? "#fff" : "rgba(255,255,255,0.55)",
      }}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />}
    </Link>
  )

  const DropBtn = ({ icon, label, isOpen, onToggle }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: isOpen ? "rgba(168,85,247,0.1)" : "transparent",
        color:  "rgba(255,255,255,0.65)",
        border: "none",
        cursor: "pointer"
      }}>
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span style={{
        fontSize: "10px",
        display: "inline-block",
        transition: "transform 0.3s",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        color: "rgba(255,255,255,0.4)"
      }}>▼</span>
    </button>
  )

  const SubLink = ({ to, label }) => (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs no-underline transition-all"
      style={{
        color:      isActive(to) ? "#d8b4fe" : "rgba(255,255,255,0.5)",
        fontWeight: isActive(to) ? 700 : 400,
        background: isActive(to) ? "rgba(168,85,247,0.2)" : "transparent"
      }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: isActive(to) ? "#d8b4fe" : "rgba(255,255,255,0.3)" }} />
      {label}
    </Link>
  )

  return (
    <>
      {/* ✅ hide scrollbar globally for sidebar */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar { display: none; }
        .sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 h-full"
        style={{
          background: "linear-gradient(180deg,#3b0764 0%,#4c1d95 50%,#1e1b4b 100%)",
          width:    open ? "256px" : "0px",
          overflow: open ? "visible" : "hidden"
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
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Admin Panel</p>
            </div>
          </div>

          {/* Admin chip */}
          <div className="mx-4 my-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl flex-shrink-0"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{adminName}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Super Admin</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>

          {/* ✅ Nav — scrollbar hidden */}
          <nav className="sidebar-nav flex-1 px-3 pb-4"
            style={{ overflowY: "auto", overflowX: "hidden" }}>

            <p className="text-xs font-bold px-4 py-2 mt-1 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Main</p>

            <NavItem to="/admin/dashboard" icon="🏠" label="Dashboard" />

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Management</p>

            {/* Vendors dropdown */}
            <DropBtn icon="👥" label="Vendors" isOpen={vendorOpen} onToggle={() => setVendorOpen(p => !p)} />
            {vendorOpen && (
              <div className="ml-3 mt-0.5 mb-1 pl-3 flex flex-col gap-0.5"
                style={{ borderLeft: "1px solid rgba(168,85,247,0.3)" }}>
                <SubLink to="/admin/vendors" label="View All Vendors" />
              </div>
            )}

            <NavItem to="/admin/users" icon="👤" label="Users" />

            {/* Categories dropdown */}
            <DropBtn icon="🏷️" label="Categories" isOpen={categoryOpen} onToggle={() => setCategoryOpen(p => !p)} />
            {categoryOpen && (
              <div className="ml-3 mt-0.5 mb-1 pl-3 flex flex-col gap-0.5"
                style={{ borderLeft: "1px solid rgba(168,85,247,0.3)" }}>
                <SubLink to="/admin/add-category"    label="Add Category" />
                <SubLink to="/admin/view-categories" label="View Categories" />
              </div>
            )}

            {/* Templates dropdown */}
            <DropBtn icon="🎨" label="Templates" isOpen={templateOpen} onToggle={() => setTemplateOpen(p => !p)} />
            {templateOpen && (
              <div className="ml-3 mt-0.5 mb-1 pl-3 flex flex-col gap-0.5"
                style={{ borderLeft: "1px solid rgba(168,85,247,0.3)" }}>
                <SubLink to="/admin/all-templates" label="All Templates" />
              </div>
            )}

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Sales</p>

            <NavItem to="/admin/discounts" icon="🏷️" label="Discounts" />
            <NavItem to="/admin/orders"    icon="📋" label="Orders" />
            <NavItem to="/admin/payments"  icon="💰" label="Payments" />

            <p className="text-xs font-bold px-4 py-2 mt-3 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>Account</p>

            <NavItem to="/admin/edit-profile" icon="✏️" label="Edit Profile" />
            <NavItem to="/admin/feedback"     icon="⭐" label="Feedback" />

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
                cursor: "pointer"
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

export default AdminSidebar