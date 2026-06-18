import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"

const IMG = "http://localhost:5000/uploads/"

const AdminDashboard = () => {
  const [vendors,   setVendors]   = useState([])
  const [users,     setUsers]     = useState([])
  const [templates, setTemplates] = useState([])
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [duration,  setDuration]  = useState("month")

  const adminName = localStorage.getItem("adminName") || "Admin"
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getData = async () => {
    setLoading(true)
    try {
      const [v, u, t, o] = await Promise.all([
        axios.get("http://localhost:5000/adminapi/vendors",       { headers: H }),
        axios.get("http://localhost:5000/adminapi/users",         { headers: H }),
        axios.get("http://localhost:5000/adminapi/all-templates", { headers: H }),
        axios.get("http://localhost:5000/adminapi/all-orders",    { headers: H }),
      ])
      setVendors(Array.isArray(v.data) ? v.data : [])
      setUsers(Array.isArray(u.data) ? u.data : [])
      setTemplates(Array.isArray(t.data) ? t.data : [])
      const rawOrders = Array.isArray(o.data) ? o.data
        : Array.isArray(o.data?.orders) ? o.data.orders : []
      setOrders(rawOrders)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getData() }, [])

  // ── build chart data from orders ──────────────────────────────────────
  const buildChartData = () => {
    const now   = new Date()
    let grouped = {}

    orders.forEach(order => {
      const d = new Date(order.createdAt)
      let key = ""

      if (duration === "week") {
        // last 7 days — group by day
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
        if (diffDays > 7) return
        key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      } else if (duration === "month") {
        // this month — group by day
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return
        key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      } else if (duration === "year") {
        // this year — group by month
        if (d.getFullYear() !== now.getFullYear()) return
        key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      } else if (duration === "all") {
        // all time — group by month+year
        key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      }

      if (!grouped[key]) grouped[key] = { date: key, Purchases: 0, Revenue: 0 }
      grouped[key].Purchases += order.items?.length || 1
      grouped[key].Revenue   += order.finalTotal || 0
    })

    return Object.values(grouped).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    )
  }

  const chartData = buildChartData()
  const totalRevenue = orders.reduce((s, o) => s + (o.finalTotal || 0), 0)

  const pending  = templates.filter(t => t.designStatus === "pending").length
  const approved = templates.filter(t => t.designStatus === "approved").length

  const stats = [
    { label: "Total Vendors",   value: vendors.length,   bg: "from-violet-500 to-purple-700" },
    { label: "Total Users",     value: users.length,     bg: "from-fuchsia-500 to-pink-600"  },
    { label: "Total Templates", value: templates.length, bg: "from-purple-500 to-violet-700" },
    { label: "Total Orders",    value: orders.length,    bg: "from-emerald-500 to-green-600" },
    { label: "Pending Review",  value: pending,          bg: "from-amber-400 to-orange-500"  },
    { label: "Total Revenue",   value: "Rs." + totalRevenue.toLocaleString("en-IN"), bg: "from-blue-500 to-cyan-600" },
  ]

  const Badge = ({ s }) => {
    const map = {
      approved: ["#dcfce7","#15803d"],
      pending:  ["#fef9c3","#854d0e"],
      rejected: ["#fee2e2","#dc2626"],
      disabled: ["#f3f4f6","#6b7280"]
    }
    const [bg, tc] = map[s] || map.disabled
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ background: bg, color: tc }}>{s}
      </span>
    )
  }

  return (
    <div>

      {/* Welcome Banner */}
      <div className="rounded-2xl px-6 py-5 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6b21a8,#7c3aed,#4c1d95)" }}>
        <div className="absolute right-0 top-0 w-64 h-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle,#e879f9,transparent)", transform: "translate(20%,-20%)" }} />
        <p className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "rgba(255,255,255,0.5)" }}>Good day</p>
        <h2 className="text-2xl font-black text-white">Hello, {adminName}!</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          {pending > 0
            ? pending + " template(s) waiting for review"
            : "Everything looks great today!"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, bg }) => (
          <div key={label}
            className={"rounded-2xl p-5 bg-gradient-to-br " + bg + " text-white"}
            style={{ boxShadow: "0 8px 32px rgba(109,40,217,0.25)" }}>
            {loading
              ? <div className="h-9 w-16 rounded-xl bg-white/20 animate-pulse mb-1" />
              : <p className="font-black text-3xl leading-none mb-1">{value}</p>}
            <p className="text-xs font-semibold text-white/75">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Purchases Chart ── */}
      <div className="bg-white rounded-2xl border border-violet-100 mb-6"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-gray-800">Template Purchases</h3>
            <p className="text-xs text-gray-400 mt-0.5">All vendors combined</p>
          </div>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-violet-100 outline-none"
            style={{ color: "#7c3aed", cursor: "pointer" }}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="h-64 rounded-xl animate-pulse bg-violet-50" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
              No purchase data for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #ede9fe", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Purchases" fill="#a855f7" radius={[6,6,0,0]} />
                <Bar dataKey="Revenue"   fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 border-t border-violet-50">
          {[
            ["Total Orders",    orders.length],
            ["Total Purchases", orders.reduce((s,o) => s + (o.items?.length || 0), 0)],
            ["Total Revenue",   "Rs." + totalRevenue.toLocaleString("en-IN")],
          ].map(([label, val]) => (
            <div key={label} className="px-5 py-4 text-center border-r border-violet-50 last:border-0">
              <p className="font-black text-gray-800 text-lg">{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent Templates */}
        <div className="rounded-2xl overflow-hidden bg-white border border-violet-100"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
            <h3 className="font-black text-gray-800">Recent Templates</h3>
            <Link to="/admin/all-templates"
              className="text-xs font-bold no-underline text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              View all
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-violet-50/50">
              <tr>
                {["Thumb","Name","Status"].map(h => (
                  <th key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-violet-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={3} className="px-4 py-3">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : (
                templates.slice(0, 5).map(t => (
                  <tr key={t._id}
                    className="border-t border-violet-50 hover:bg-violet-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden border border-violet-100">
                        {t.designThumbnail
                          ? <img src={IMG + t.designThumbnail}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.parentNode.innerHTML = "<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f3ff;color:#7c3aed;font-weight:900;font-size:11px'>" + (t.designName?.charAt(0)?.toUpperCase() || "T") + "</div>" }} />
                          : <div className="w-full h-full flex items-center justify-center font-black text-xs bg-violet-50 text-violet-600">
                              {t.designName?.charAt(0)?.toUpperCase()}
                            </div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{t.designName}</td>
                    <td className="px-4 py-3"><Badge s={t.designStatus} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl overflow-hidden bg-white border border-violet-100"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
            <h3 className="font-black text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders"
              className="text-xs font-bold no-underline text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              View all
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-violet-50/50">
              <tr>
                {["Order","Items","Total","Status"].map(h => (
                  <th key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-violet-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-3">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-300 text-sm">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map(o => (
                  <tr key={o._id}
                    className="border-t border-violet-50 hover:bg-violet-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      #{String(o._id).slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-bold text-violet-700 text-xs">
                      {"Rs." + (o.finalTotal || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: "#dcfce7", color: "#166534" }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard