import { useState, useEffect } from "react"
import axios from "axios"

const itemsPerPage = 5  // ✅ fixed from 1 → 5

const ViewCategories = () => {
  const [categories,  setCategories]  = useState([])
  const [editModal,   setEditModal]   = useState(null)
  const [editName,    setEditName]    = useState("")
  const [editStatus,  setEditStatus]  = useState("enable")
  const [saving,      setSaving]      = useState(false)
  const [toggling,    setToggling]    = useState(null)
  const [search,      setSearch]      = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  // GET http://localhost:5000/adminapi/category
  const getCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/adminapi/category", { headers: H })
      setCategories(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (e) { console.log(e) }
  }

  // POST http://localhost:5000/adminapi/category/:id  { name, status }
  const updateCategory = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await axios.post(
        `http://localhost:5000/adminapi/category/${editModal._id}`,
        { name: editName, status: editStatus },
        { headers: H }
      )
      setEditModal(null)
      getCategories()
    } catch (e) { console.log(e) }
    setSaving(false)
  }

  // GET http://localhost:5000/adminapi/category/:id  (delete)
  const deleteCategory = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await axios.get(`http://localhost:5000/adminapi/category/${id}`, { headers: H })
      getCategories()
    } catch (e) { console.log(e) }
  }

  // Toggle — reuses POST /adminapi/category/:id with toggled status
  const toggleCategory = async (cat) => {
    setToggling(cat._id)
    try {
      const newStatus = cat.status === "enable" ? "disable" : "enable"
      await axios.post(
        `http://localhost:5000/adminapi/category/${cat._id}`,
        { name: cat.name, status: newStatus },
        { headers: H }
      )
      setCategories(prev => prev.map(c =>
        c._id === cat._id ? { ...c, status: newStatus } : c
      ))
    } catch (e) { console.log(e) }
    setToggling(null)
  }

  useEffect(() => { getCategories() }, [])

  // Search Filter
  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const ToggleSwitch = ({ cat }) => {
    const isOn = cat.status === "enable"
    return (
      <button
        onClick={() => toggleCategory(cat)}
        disabled={toggling === cat._id}
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
        {toggling === cat._id
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
        <h2 className="text-xl font-black text-gray-900">🏷️ Categories</h2>
        <p className="text-sm text-gray-400 mt-1">{categories.length} categories</p>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-1.5"
              style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)" }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-50">
              <h3 className="font-black text-gray-900">✏️ Edit Category</h3>
              <button onClick={() => setEditModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-amber-50 border-2 border-transparent focus:border-amber-400"
                  style={{ fontFamily: "inherit" }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-amber-50 border-2 border-transparent"
                  style={{ fontFamily: "inherit" }}>
                  <option value="enable">Enable</option>
                  <option value="disable">Disable</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={updateCategory} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", cursor: "pointer" }}>
                  {saving ? "Saving..." : "💾 Save"}
                </button>
                <button onClick={() => setEditModal(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-amber-50 text-amber-700"
                  style={{ border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={handleSearch}
          placeholder="🔍 Search by category name..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white border-2 border-violet-100 focus:border-violet-400"
          style={{ fontFamily: "inherit" }} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <table className="w-full text-sm">
          <thead className="bg-violet-50/60">
            <tr>
              {["No.","Name","Status","Enable / Disable","Actions"].map(h => (
                <th key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-gray-300">No categories found</td>
              </tr>
            ) : (
              paginated.map((cat, i) => {
                const isEnabled = cat.status === "enable"
                return (
                  <tr key={cat._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    <td className="px-5 py-3.5 text-gray-300 text-xs">{startIndex + i + 1}</td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏷️</span>
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: isEnabled ? "#dcfce7" : "#fee2e2",
                          color:      isEnabled ? "#15803d"  : "#dc2626"
                        }}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <ToggleSwitch cat={cat} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditModal(cat)
                            setEditName(cat.name)
                            setEditStatus(cat.status || "enable")
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", cursor: "pointer" }}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat._id, cat.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", cursor: "pointer" }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Categories
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color:      currentPage === page ? "#fff"     : "#4b5563"
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

export default ViewCategories