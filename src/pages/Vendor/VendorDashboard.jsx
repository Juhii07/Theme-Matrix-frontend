import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"

const IMG = "http://localhost:5000/uploads/"

const VendorDashboard = () => {
  const [templates,    setTemplates]    = useState([])
  const [cartProducts, setCartProducts] = useState([])
  const [categories,   setCategories]   = useState([])
  const [orders,       setOrders]       = useState([])
  const [payments,     setPayments]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [duration,     setDuration]     = useState("all")   // ✅ default "all" so chart always shows

  const vendorName = localStorage.getItem("vendorName") || "Vendor"
  const vendorId   = localStorage.getItem("vendorId")
  const navigate   = useNavigate()
  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getData = async () => {
    setLoading(true)
    try {
      const [t, c, cat, o] = await Promise.all([
        axios.get("http://localhost:5000/vendorapi/my-templates",  { headers: H }),
        axios.get("http://localhost:5000/vendorapi/cart-products", { headers: H }),
        axios.get("http://localhost:5000/vendorapi/category",      { headers: H }),
        axios.get("http://localhost:5000/vendorapi/my-orders",     { headers: H }),
      ])

      setTemplates(Array.isArray(t.data) ? t.data : [])
      setCartProducts(Array.isArray(c.data) ? c.data : [])

      // ✅ handle both {categories:[]} and [] response shapes
      const catData = Array.isArray(cat.data)
        ? cat.data
        : Array.isArray(cat.data?.categories)
        ? cat.data.categories
        : Array.isArray(cat.data?.data)
        ? cat.data.data
        : []
      setCategories(catData)

      // ✅ handle both [] and {orders:[]} response shapes
      const rawOrders = Array.isArray(o.data)
        ? o.data
        : Array.isArray(o.data?.orders)
        ? o.data.orders
        : []

      // ✅ filter only orders that contain this vendor's templates
      const myTemplateIds = Array.isArray(t.data)
        ? t.data.map(tmpl => tmpl._id?.toString())
        : []

      const vendorOrders = rawOrders.filter(order =>
        order.items?.some(item => {
          const tid = item.templateId?._id?.toString()
            || item.templateId?.toString()
          return myTemplateIds.includes(tid)
        })
      )
      setOrders(vendorOrders)

    } catch (e) {
      console.log("VendorDashboard fetch error:", e)
    }
    setLoading(false)
  }

  useEffect(() => { getData() }, [])

  const approved     = templates.filter(t => t.designStatus === "approved").length
  const pending      = templates.filter(t => t.designStatus === "pending").length
  const totalRevenue = orders.reduce((s, o) => s + (o.finalTotal || 0), 0)

  const stats = [
    { label: "Total Templates", value: templates.length,   bg: "from-violet-500 to-purple-600" },
    { label: "Approved",        value: approved,            bg: "from-emerald-500 to-green-600" },
    { label: "Pending",         value: pending,             bg: "from-amber-500 to-orange-500"  },
    { label: "Total Orders",    value: orders.length,       bg: "from-blue-500 to-cyan-600"     },
    { label: "Cart Items",      value: cartProducts.length, bg: "from-pink-500 to-rose-500"     },
    { label: "Revenue",
      value: "Rs." + totalRevenue.toLocaleString("en-IN"),
      bg: "from-teal-500 to-emerald-600"
    },
  ]

  // ✅ FIXED: build chart data correctly
  const buildChartData = () => {
    const now     = new Date()
    const grouped = {}

    // ✅ if no real orders, show placeholder bars so chart is never empty
    if (orders.length === 0) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      return months.map(m => ({ date: m, Purchases: 0, Revenue: 0 }))
    }

    orders.forEach(order => {
      if (!order.createdAt) return
      const d = new Date(order.createdAt)
      let key = ""

      if (duration === "week") {
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
        if (diffDays > 7) return
        key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      } else if (duration === "month") {
        if (
          d.getMonth()     !== now.getMonth() ||
          d.getFullYear()  !== now.getFullYear()
        ) return
        key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      } else if (duration === "year") {
        if (d.getFullYear() !== now.getFullYear()) return
        key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      } else {
        // "all"
        key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      }

      if (!key) return
      if (!grouped[key]) grouped[key] = { date: key, Purchases: 0, Revenue: 0 }

      // ✅ count only items belonging to this vendor
      const myTemplateIds = templates.map(t => t._id?.toString())
      const vendorItems = (order.items || []).filter(item => {
        const tid = item.templateId?._id?.toString() || item.templateId?.toString()
        return myTemplateIds.includes(tid)
      })
      grouped[key].Purchases += vendorItems.length
      grouped[key].Revenue   += order.finalTotal || 0
    })

    const result = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )

    // ✅ if filter returns nothing, still show empty placeholder
    if (result.length === 0) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      return months.map(m => ({ date: m, Purchases: 0, Revenue: 0 }))
    }

    return result
  }

  const chartData = buildChartData()

  const statusBadge = (s) => {
    const cls = {
      approved: "bg-emerald-100 text-emerald-700",
      pending:  "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-600",
      disabled: "bg-gray-100 text-gray-500"
    }
    return (
      <span className={"px-2.5 py-1 rounded-full text-xs font-bold " + (cls[s] || cls.disabled)}>
        {s}
      </span>
    )
  }

  const catColors = [
    ["#f5f3ff","#7c3aed"], ["#fdf4ff","#a21caf"], ["#eff6ff","#1d4ed8"],
    ["#f0fdf4","#15803d"], ["#fffbeb","#b45309"], ["#fff1f2","#be123c"],
    ["#ecfeff","#0e7490"], ["#f0fdfa","#0f766e"],
  ]

  const getTemplateCount = (catId) =>
    templates.filter(t =>
      t.designCategory === catId ||
      t.designCategory?._id === catId ||
      t.designCategory?.toString() === catId
    ).length

  return (
    <div>

      {/* Welcome Banner */}
      <div className="rounded-2xl px-6 py-5 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6b21a8,#7c3aed,#4c1d95)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "rgba(255,255,255,0.5)" }}>Welcome back</p>
        <h2 className="text-2xl font-black text-white">{vendorName}'s Dashboard</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          {pending > 0
            ? `${pending} template(s) awaiting approval`
            : "All templates are up to date"}
        </p>
        <Link to="/vendor/upload"
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block px-4 py-2 rounded-xl text-xs font-bold no-underline"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
          + Upload New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, bg }) => (
          <div key={label}
            className={"rounded-2xl p-5 bg-gradient-to-br " + bg}
            style={{ boxShadow: "0 8px 24px rgba(109,40,217,0.2)" }}>
            {loading
              ? <div className="h-9 w-14 rounded-lg bg-white/30 animate-pulse mb-1" />
              : <p className="font-black text-white mb-1 text-3xl">{value}</p>}
            <p className="text-xs font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Purchases Chart ── */}
      <div className="bg-white rounded-2xl border border-violet-100 mb-6"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-gray-800">My Template Purchases</h3>
            <p className="text-xs text-gray-400 mt-0.5">Orders containing your templates</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/vendor/orders"
              className="text-xs font-bold no-underline text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              View all orders
            </Link>
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
        </div>

        <div className="p-5">
          {loading ? (
            <div className="h-64 rounded-xl animate-pulse bg-violet-50" />
          ) : (
            // ✅ always render chart — shows 0 bars when no data
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  interval={0}
                  angle={chartData.length > 6 ? -30 : 0}
                  textAnchor={chartData.length > 6 ? "end" : "middle"}
                  height={chartData.length > 6 ? 50 : 30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #ede9fe",
                    fontSize: "12px"
                  }}
                  formatter={(value, name) =>
                    name === "Revenue"
                      ? ["Rs." + value.toLocaleString("en-IN"), name]
                      : [value, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Purchases" fill="#a855f7" radius={[6,6,0,0]} />
                <Bar dataKey="Revenue"   fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary footer */}
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

      {/* Categories */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100 mb-6"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
          <h3 className="font-black text-gray-800">Available Categories</h3>
          <Link to="/vendor/categories"
            className="text-xs font-bold no-underline text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
            View all
          </Link>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 rounded-xl animate-pulse bg-violet-50" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-300 py-4 text-sm">No categories available</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((c, i) => {
                const [bg, tc] = catColors[i % catColors.length]
                const count    = getTemplateCount(c._id)
                return (
                  <button key={c._id}
                    onClick={() => navigate("/vendor/categories/" + c._id)}
                    className="rounded-xl p-4 text-left transition-all hover:scale-105"
                    style={{
                      background: bg,
                      border: "2px solid " + tc + "20",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    }}>
                    <p className="font-black text-xs truncate" style={{ color: tc }}>{c.name}</p>
                    <p className="text-xs mt-1 font-semibold" style={{ color: tc + "99" }}>
                      {count} template{count !== 1 ? "s" : ""}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Templates */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
          <h3 className="font-black text-gray-800">My Templates</h3>
          <Link to="/vendor/my-templates"
            className="text-xs font-bold no-underline text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["Thumb","Name","Category","Price","Status"].map(h => (
                  <th key={h}
                    className="px-5 py-3 text-left text-xs font-bold text-violet-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 rounded-full bg-violet-50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-300">
                    No templates yet.{" "}
                    <Link to="/vendor/upload" className="text-violet-600 font-bold no-underline">
                      Upload one
                    </Link>
                  </td>
                </tr>
              ) : (
                templates.slice(0, 5).map(t => (
                  <tr key={t._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-violet-100">
                        {t.designThumbnail
                          ? <img
                              src={IMG + t.designThumbnail}
                              className="w-full h-full object-cover"
                              onError={e => {
                                e.target.parentNode.innerHTML =
                                  `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f3ff;color:#7c3aed;font-weight:900;font-size:12px'>${t.designName?.charAt(0)?.toUpperCase() || "T"}</div>`
                              }}
                            />
                          : <div className="w-full h-full flex items-center justify-center font-black text-sm bg-violet-50 text-violet-600">
                              {t.designName?.charAt(0)?.toUpperCase()}
                            </div>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{t.designName}</td>
                    <td className="px-5 py-3">
                      {t.designCategory ? (
                        <button
                          onClick={() => navigate("/vendor/categories/" + (t.designCategory?._id || t.designCategory))}
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-600 hover:bg-violet-100"
                          style={{ border: "none", cursor: "pointer" }}>
                          {t.designCategory?.name || "View"}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-violet-700">
                      {"Rs." + t.regularPrice}
                    </td>
                    <td className="px-5 py-3">{statusBadge(t.designStatus)}</td>
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

export default VendorDashboard