import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

const itemsPerPage = 10

const VendorOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all") // all|today|week|month|year|custom
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vendorapi/my-orders", { headers: H })
      const list = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.orders) ? res.data.orders : []
      setOrders(list)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getOrders() }, [])

  // ── Date filter logic ──────────────────────────────────────────────────
  const isInDateRange = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()

    if (dateFilter === "today") {
      return d.toDateString() === now.toDateString()
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo && d <= now
    }
    if (dateFilter === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (dateFilter === "year") {
      return d.getFullYear() === now.getFullYear()
    }
    if (dateFilter === "custom" && fromDate && toDate) {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      to.setHours(23, 59, 59)
      return d >= from && d <= to
    }
    return true // "all"
  }

  // ── Combined filter ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        String(o._id).toLowerCase().includes(search.toLowerCase()) ||
        o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.paymentId?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" ? true : o.status?.toLowerCase() === statusFilter
      const matchDate = isInDateRange(o.createdAt)
      return matchSearch && matchStatus && matchDate
    })
  }, [orders, search, statusFilter, dateFilter, fromDate, toDate])

  useEffect(() => { setCurrentPage(1) }, [search, statusFilter, dateFilter, fromDate, toDate])

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)

  const totalRevenue = filtered.reduce((s, o) => s + (o.finalTotal || 0), 0)
  const totalItems = filtered.reduce((s, o) => s + (o.items?.length || 0), 0)

  // ── Excel Download ─────────────────────────────────────────────────────
  const downloadExcel = async () => {
    if (filtered.length === 0) return alert("No orders to export")

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Orders")

    // ✅ Define columns
    worksheet.columns = [
      { header: "Sr No", key: "srNo", width: 8 },
      { header: "Order ID", key: "orderId", width: 16 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Customer Email", key: "email", width: 26 },
      { header: "Template", key: "template", width: 30 },
      { header: "Price (Rs.)", key: "price", width: 14 },
      { header: "Order Total (Rs.)", key: "total", width: 18 },
      { header: "Status", key: "status", width: 14 },
      { header: "Payment ID", key: "paymentId", width: 24 },
      { header: "Date", key: "date", width: 16 },
      { header: "Discount Code", key: "discountCode", width: 16 },
      { header: "Discount (%)", key: "discountPercent", width: 14 },
    ]

    // ✅ Style header row
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } }
      cell.alignment = { vertical: "middle", horizontal: "center" }
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      }
    })

    // ✅ Add data rows
    let srNo = 1
    filtered.forEach(o => {
      o.items?.forEach(item => {
        const row = worksheet.addRow({
          srNo,
          orderId: String(o._id).slice(-8).toUpperCase(),
          customer: o.userId?.name || "—",
          email: o.userId?.email || "—",
          template: item.templateId?.designName || "Template",
          price: item.price || 0,
          total: o.finalTotal || 0,
          status: o.status || "—",
          paymentId: o.paymentId || "—",
          date: new Date(o.createdAt).toLocaleDateString("en-IN"),
          discountCode: o.discountCode || "—",
          discountPercent: o.discountPercent || 0,
        })

        // ✅ Style data rows alternating
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "left" }
          cell.border = {
            top: { style: "thin", color: { argb: "FFE9D5FF" } },
            bottom: { style: "thin", color: { argb: "FFE9D5FF" } },
            left: { style: "thin", color: { argb: "FFE9D5FF" } },
            right: { style: "thin", color: { argb: "FFE9D5FF" } },
          }
          if (srNo % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F3FF" } }
          }
        })
        srNo++
      })
    })

    // ✅ Add summary row at bottom
    worksheet.addRow({})
    const summaryRow = worksheet.addRow({
      srNo: "TOTAL",
      customer: `${filtered.length} Orders`,
      total: filtered.reduce((s, o) => s + (o.finalTotal || 0), 0),
    })
    summaryRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FF7C3AED" } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE9FE" } }
    })

    // ✅ Generate and download file
    const label = dateFilter === "all" ? "All"
      : dateFilter === "today" ? "Today"
        : dateFilter === "week" ? "ThisWeek"
          : dateFilter === "month" ? "ThisMonth"
            : dateFilter === "year" ? "ThisYear"
              : `${fromDate}_to_${toDate}`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
    saveAs(blob, `VendorOrders_${label}.xlsx`)
  }

  // ── Pill style ─────────────────────────────────────────────────────────
  const pill = (active) => ({
    background: active ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
    color: active ? "#fff" : "#7c3aed",
    border: "none",
    cursor: "pointer",
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">📋 My Orders</h2>
          <p className="text-gray-400 mt-1">Orders containing your templates</p>
        </div>
        {/* ✅ Download Excel */}
        <button
          onClick={downloadExcel}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:scale-100"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", cursor: "pointer" }}>
          📥 Download Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          ["Total Orders", filtered.length, "from-violet-500 to-purple-700"],
          ["Total Items", totalItems, "from-fuchsia-500 to-pink-600"],
          ["Revenue", "Rs." + totalRevenue.toLocaleString("en-IN"), "from-emerald-500 to-green-600"],
        ].map(([label, value, bg]) => (
          <div key={label}
            className={"rounded-2xl p-4 text-white bg-gradient-to-br " + bg}
            style={{ boxShadow: "0 4px 16px rgba(109,40,217,0.2)" }}>
            <p className="font-black text-2xl">{value}</p>
            <p className="text-xs text-white/70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Date Filter Pills ── */}
      <div className="bg-white rounded-2xl border border-violet-100 p-4 mb-4"
        style={{ boxShadow: "0 2px 8px rgba(109,40,217,0.06)" }}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📅 Filter by Date</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All Time"],
            ["today", "Today"],
            ["week", "This Week"],
            ["month", "This Month"],
            ["year", "This Year"],
            ["custom", "Custom Range"],
          ].map(([val, label]) => (
            <button key={val}
              onClick={() => setDateFilter(val)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={pill(dateFilter === val)}>
              {label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {dateFilter === "custom" && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border-2 border-violet-100 outline-none focus:border-violet-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border-2 border-violet-100 outline-none focus:border-violet-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            {fromDate && toDate && (
              <div className="mt-4">
                <span className="text-xs font-bold text-violet-600 px-3 py-1.5 rounded-xl"
                  style={{ background: "#f3e8ff" }}>
                  📅 {fromDate} → {toDate}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-violet-100 flex-1 max-w-sm"
          style={{ boxShadow: "0 2px 8px rgba(109,40,217,0.06)" }}>
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Order ID, customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="text-gray-300 hover:text-red-400 font-bold text-xs"
              style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-violet-100 outline-none bg-white"
          style={{ color: "#7c3aed", cursor: "pointer" }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        {/* Clear filters */}
        {(search || statusFilter !== "all" || dateFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setDateFilter("all"); setFromDate(""); setToDate("") }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-600 bg-white border border-red-100"
            style={{ cursor: "pointer" }}>
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-semibold">
          {filtered.length > 0
            ? `Showing ${filtered.length} order${filtered.length !== 1 ? "s" : ""}`
            : "No orders found"}
        </p>
        {filtered.length > 0 && (
          <p className="text-sm font-black text-violet-600">
            Revenue: Rs.{totalRevenue.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-violet-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f5f3ff" }}>
              <tr>
                {["No.", "Order ID", "Customer", "Templates", "Date", "Total", "Status"].map(h => (
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
                [1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-300 text-sm">
                    No orders found for selected filters
                  </td>
                </tr>
              ) : (
                paginated.map((o, i) => (
                  <tr key={o._id}
                    className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                    <td className="px-4 py-3.5 text-xs font-bold" style={{ color: "#c4b5fd" }}>
                      {startIndex + i + 1}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                      #{String(o._id).slice(-8).toUpperCase()}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-800 text-xs">{o.userId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{o.userId?.email || ""}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {o.items?.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-600 truncate max-w-[160px]">
                            {item.templateId?.designName || "Template"}
                          </p>
                        ))}
                        {o.items?.length > 2 && (
                          <p className="text-xs text-violet-400 font-semibold">
                            +{o.items.length - 2} more
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>

                    <td className="px-4 py-3.5 font-black text-violet-600 whitespace-nowrap">
                      Rs.{(o.finalTotal || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: o.status === "completed" ? "#dcfce7" : "#fef9c3",
                          color: o.status === "completed" ? "#15803d" : "#854d0e"
                        }}>
                        {o.status === "completed" ? "✅" : "⏳"} {o.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100"
            style={{ background: "#faf5ff" }}>
            <p className="text-xs text-gray-500">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40"
                style={{ border: "none", cursor: "pointer" }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color: currentPage === page ? "#fff" : "#4b5563",
                    border: "none", cursor: "pointer"
                  }}>
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40"
                style={{ border: "none", cursor: "pointer" }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-violet-50 flex items-center justify-between"
            style={{ background: "#faf5ff" }}>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", cursor: "pointer" }}>
              📥 Download Excel Report
            </button>
            <p className="text-sm font-black" style={{ color: "#7c3aed" }}>
              Total Revenue: Rs.{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorOrders