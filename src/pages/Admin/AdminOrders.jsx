import { useState, useEffect } from "react"
import axios from "axios"

const itemsPerPage = 5 // ✅ pagination size

const AdminOrders = () => {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [filter,  setFilter]  = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/adminapi/all-orders", { headers: H })
      const list = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.orders) ? res.data.orders : []
      setOrders(list)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getOrders() }, [])

  // ✅ FILTER
  const filtered = orders.filter(o => {
    const matchSearch =
      String(o._id).toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.paymentId?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" ? true : o.status?.toLowerCase() === filter
    return matchSearch && matchFilter
  })

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage)

  // reset page on search/filter
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const totalRevenue = filtered.reduce((s, o) => s + (o.finalTotal || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">All Orders</h2>
        <p className="text-gray-400 mt-1">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Orders",    orders.length,  "from-violet-500 to-purple-700"],
          ["Filtered Orders", filtered.length,"from-blue-500 to-cyan-600"],
          ["Total Items",     filtered.reduce((s,o) => s + (o.items?.length||0), 0), "from-fuchsia-500 to-pink-600"],
          ["Revenue",         "Rs." + totalRevenue.toLocaleString("en-IN"), "from-emerald-500 to-green-600"],
        ].map(([label, value, bg]) => (
          <div key={label}
            className={"rounded-2xl p-4 text-white bg-gradient-to-br " + bg}
            style={{ boxShadow: "0 4px 16px rgba(109,40,217,0.2)" }}>
            <p className="font-black text-2xl">{value}</p>
            <p className="text-xs text-white/70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-violet-100 flex-1 max-w-sm"
          style={{ boxShadow: "0 2px 8px rgba(109,40,217,0.06)" }}>
          <span className="text-gray-400 text-sm">Search</span>
          <input
            type="text"
            placeholder="Order ID, user, payment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-violet-100 outline-none bg-white"
          style={{ color: "#7c3aed", cursor: "pointer" }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-violet-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f5f3ff" }}>
              <tr>
                {["No.","Order ID","User","Templates","Date","Payment ID","Discount","Total","Status"].map(h => (
                  <th key={h}
                    className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: "#7c3aed" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-3">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-300 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginated.map((o, i) => (
                  <tr key={o._id}
                    className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                    <td className="px-4 py-3.5 text-xs font-bold"
                      style={{ color: "#c4b5fd" }}>
                      {startIndex + i + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-gray-600">
                        #{String(o._id).slice(-8).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {o.userId?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">{o.userId?.email || ""}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {o.items?.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-600 truncate">
                            {item.templateId?.designName || "Template"}
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {o.paymentId || "—"}
                    </td>

                    <td className="px-4 py-3.5 text-xs">
                      {o.discountAmount > 0 ? "-Rs."+o.discountAmount : "—"}
                    </td>

                    <td className="px-4 py-3.5 font-black text-violet-600">
                      {"Rs."+(o.finalTotal || 0)}
                    </td>

                    <td className="px-4 py-3.5">{o.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ PAGINATION (same style as your category page) */}
        {filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Orders
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40">
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color: currentPage === page ? "#fff" : "#4b5563"
                  }}>
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders