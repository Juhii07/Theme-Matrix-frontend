import { useState, useEffect } from "react"
import axios from "axios"

const UPLOADS = "http://localhost:5000/uploads/"

const VendorPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [filter,   setFilter]   = useState("all")

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getPayments = async () => {
    try {
      // ✅ fixed URL from my-payments → payments
      const res = await axios.get("http://localhost:5000/vendorapi/payments", { headers: H })
      let data = []
      if (Array.isArray(res.data))               data = res.data
      else if (Array.isArray(res.data.data))     data = res.data.data
      else if (Array.isArray(res.data.payments)) data = res.data.payments
      setPayments(data)
    } catch (e) { console.log("Payments error:", e) }
    setLoading(false)
  }

  useEffect(() => { getPayments() }, [])

  const filtered = payments.filter(p => {
    const matchFilter = filter === "all" ? true : p.status === filter
    const matchSearch =
      p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(p._id).includes(search)
    return matchFilter && matchSearch
  })

  const totalEarned  = payments.filter(p => p.status === "paid").reduce((s, p) => s + (p.vendorShare || 0), 0)
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.vendorShare || 0), 0)
  const paidCount    = payments.filter(p => p.status === "paid").length

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">My Payments</h2>
        <p className="text-sm text-gray-400 mt-1">Payment receipts sent by Admin after revenue split</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ["Total Earned",  `Rs.${totalEarned.toLocaleString("en-IN")}`,  "from-emerald-500 to-green-600"],
          ["Pending",       `Rs.${totalPending.toLocaleString("en-IN")}`, "from-amber-400 to-orange-500"],
          ["Paid Orders",   paidCount,                                    "from-violet-500 to-purple-600"],
        ].map(([label, value, bg]) => (
          <div key={label} className={`rounded-2xl p-5 bg-gradient-to-br ${bg} text-white`}
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            <p className="font-black text-3xl leading-none mb-1">{value}</p>
            <p className="text-sm font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
        style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
        <p className="text-sm text-emerald-700 font-semibold">
          Receipts are generated when a user purchases your template. Admin sends your 70% share.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input type="text" placeholder="Search customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none border-2 border-violet-100 focus:border-violet-400 bg-white"
          style={{ fontFamily: "inherit" }} />
        {["all", "pending", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filter === f ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
              color: filter === f ? "#fff" : "#7c3aed",
              border: "none", cursor: "pointer"
            }}>
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Paid"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.","Order ID","Customer","Order Total","Your Share (70%)","Status","Date","Receipt","Note"].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14">
                    <p className="font-semibold text-gray-400">No payments yet</p>
                    <p className="text-xs text-gray-300 mt-1">Payments will appear when users buy your templates</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p._id} className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-gray-300 text-xs">{i + 1}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                      #{String(p.orderId?._id || p.orderId || p._id).slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700 font-semibold">
                      {p.userId?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-600 text-xs">
                      Rs.{(p.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-black text-emerald-600 text-sm">
                        Rs.{(p.vendorShare || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: p.status === "paid" ? "#dcfce7" : "#fef9c3",
                          color:      p.status === "paid" ? "#15803d" : "#854d0e"
                        }}>
                        {p.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.receiptFile ? (
                        <a href={UPLOADS + p.receiptFile} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white no-underline inline-block transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                          Download
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "#fef9c3", color: "#854d0e" }}>
                          Awaiting
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      {p.receiptNote ? (
                        <span className="text-xs text-gray-500 truncate block" title={p.receiptNote}>
                          {p.receiptNote}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-violet-50 flex items-center justify-between"
            style={{ background: "#faf5ff" }}>
            <p className="text-xs text-gray-400 font-semibold">
              Showing {filtered.length} of {payments.length} payments
            </p>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Earned</p>
                <p className="font-black text-emerald-600">Rs.{totalEarned.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Pending</p>
                <p className="font-black text-amber-600">Rs.{totalPending.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorPayments