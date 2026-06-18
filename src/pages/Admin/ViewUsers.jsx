import { useState, useEffect } from "react"
import axios from "axios"

const itemsPerPage = 5

const ViewUsers = () => {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState(null)
  const [search,      setSearch]      = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/adminapi/users", { headers: H })
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const toggleUserStatus = async (user) => {
    setToggling(user._id)
    try {
      await axios.post(
        "http://localhost:5000/adminapi/toggleUser",
        { id: user._id },
        { headers: H }
      )
      setUsers(prev => prev.map(u =>
        u._id === user._id
          ? { ...u, status: u.status === "enable" ? "disable" : "enable" }
          : u
      ))
    } catch (e) { console.log(e) }
    setToggling(null)
  }

  useEffect(() => { getUsers() }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const ToggleSwitch = ({ user }) => {
    const isOn = user.status === "enable"
    return (
      <button
        onClick={() => toggleUserStatus(user)}
        disabled={toggling === user._id}
        title={isOn ? "Click to disable" : "Click to enable"}
        className="relative inline-flex items-center gap-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}>
        <div
          className="w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
          style={{ background: isOn ? "linear-gradient(135deg,#10b981,#059669)" : "#d1d5db" }}>
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
            style={{ left: isOn ? "22px" : "2px" }} />
        </div>
        {toggling === user._id
          ? <span className="w-3 h-3 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin" />
          : <span className="text-xs font-semibold"
              style={{ color: isOn ? "#15803d" : "#9ca3af" }}>
              {isOn ? "On" : "Off"}
            </span>}
      </button>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">👤 Users</h2>
        <p className="text-sm text-gray-400 mt-1">{users.length} registered users</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="🔍 Search by user name or email..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white border-2 border-violet-100 focus:border-violet-400"
          style={{ fontFamily: "inherit" }}
        />
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <table className="w-full text-sm">
          <thead className="bg-violet-50/60">
            <tr>
              {["No.", "User", "Email", "Mobile", "Status", "Enable / Disable"].map(h => (
                <th key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-14 text-gray-300">
                  No users found
                </td>
              </tr>
            ) : (
              paginated.map((u, i) => {
                const isEnabled = u.status === "enable"
                const mobile    = u.mobile && u.mobile.trim() !== "" ? u.mobile : "—"

                return (
                  <tr key={u._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    {/* # */}
                    <td className="px-5 py-3.5 text-gray-300 text-xs">
                      {startIndex + i + 1}
                    </td>

                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)" }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>

                    {/* Mobile — now works since schema has the field */}
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{mobile}</td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: isEnabled ? "#dcfce7" : "#fee2e2",
                          color:      isEnabled ? "#15803d"  : "#dc2626",
                        }}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-5 py-3.5">
                      <ToggleSwitch user={u} />
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color:      currentPage === page ? "#fff"     : "#4b5563",
                  }}>
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewUsers