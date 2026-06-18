const AdminHeader = ({ open, setOpen, title }) => {
  const adminName = localStorage.getItem("adminName") || "Admin"

  return (
    <header
      className="flex items-center justify-between px-6 h-16 flex-shrink-0 bg-white border-b border-violet-100"
      style={{ boxShadow: "0 1px 12px rgba(109,40,217,0.07)" }}>

      <div className="flex items-center gap-4">
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
          {open ? "✕" : "☰"}
        </button>

        <div>
          <h1 className="font-black text-gray-800 text-lg leading-tight">{title}</h1>
          <p className="text-xs text-violet-400">ThemeMatrix Admin</p>
        </div>
      </div>

      {/* Right — admin info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-700">{adminName}</p>
          <p className="text-xs text-violet-500">Super Admin</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
          {adminName.charAt(0).toUpperCase()}
        </div>
      </div>

    </header>
  )
}

export default AdminHeader