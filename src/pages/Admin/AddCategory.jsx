import { useState } from "react"
import axios from "axios"

const AddCategory = () => {
  const [name,    setName]    = useState("")
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState("")
  const [error,   setError]   = useState("")
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const addCategory = async () => {
    if (!name.trim()) return setError("Category name is required")
    setLoading(true); setMsg(""); setError("")
    try {
      await axios.post("http://localhost:5000/adminapi/category", { name }, { headers: H })
      setMsg("✅ Category added successfully!"); setName("")
    } catch (e) { setError("Failed to add category") }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">🏷️ Add Category</h2>
        <p className="text-sm text-gray-400 mt-1">Create a new template category</p>
      </div>
      <div className="max-w-md">
        <div className="bg-white rounded-2xl p-6 border border-violet-100" style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          {msg   && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{msg}</div>}
          {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">⚠️ {error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🏷️ Category Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. E-Commerce, Portfolio, SaaS..." onKeyDown={e => e.key === "Enter" && addCategory()}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                style={{ fontFamily: "inherit" }} />
            </div>
            <button onClick={addCategory} disabled={loading}
              className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}>
              {loading ? "⏳ Adding..." : "➕ Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCategory