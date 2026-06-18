import { useState, useEffect } from "react"
import axios from "axios"

const ITEMS_PER_PAGE = 5

const VendorCartProducts = () => {
  const [cartProducts, setCartProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getCartProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vendorapi/cart-products", { headers: H })
      console.log("Cart Products:", res.data)
      setCartProducts(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
  }

  useEffect(() => { getCartProducts() }, [])

  const total = cartProducts.reduce((sum, c) => sum + (c.price || c.templateId?.regularPrice || 0), 0)

  // Pagination logic
  const totalPages = Math.ceil(cartProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = cartProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getPrice = (c) => {
    const val = c.price || c.templateId?.regularPrice
    if (!val) return "—"
    return typeof val === "number" ? val.toLocaleString("en-IN") : val
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-7">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">🛒 Cart Products</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {cartProducts.length} purchase{cartProducts.length !== 1 ? "s" : ""} of your templates
        </p>
      </div>

      {/* Total Revenue Banner */}
      {cartProducts.length > 0 && (
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
          style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: "#dcfce7", color: "#166534" }}>₹</div>
            <div>
              <p className="text-sm font-black text-emerald-800">Total Revenue</p>
              <p className="text-xs text-emerald-500">
                {cartProducts.length} sale{cartProducts.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.", "Customer", "Email", "Template", "Price"].map(h => (
                  <th key={h}
                    className="px-5 py-3 text-left text-xs font-bold text-violet-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-gray-300 text-sm">
                    No purchases yet
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((c, i) => (
                  <tr key={c._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    {/* # */}
                    <td className="px-5 py-3.5 text-gray-300 text-xs">
                      {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                          {c.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {c.userId?.name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {c.userId?.email || "—"}
                    </td>

                    {/* Template */}
                    <td className="px-5 py-3.5 font-semibold text-gray-700">
                      {c.templateId?.title || c.templateId?.designName || "—"}
                    </td>

                    {/* Price — FIXED: no mixed ?? with || */}
                    <td className="px-5 py-3.5 font-black text-gray-800">
                      ₹{getPrice(c)}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-violet-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, cartProducts.length)} of {cartProducts.length}
            </p>
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                style={{
                  background: currentPage === 1 ? "#f5f3ff" : "#ede9fe",
                  color: currentPage === 1 ? "#c4b5fd" : "#7c3aed",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}>
                ‹
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`dot-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                      style={{
                        background: currentPage === p ? "#7c3aed" : "#f5f3ff",
                        color: currentPage === p ? "#fff" : "#7c3aed"
                      }}>
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                style={{
                  background: currentPage === totalPages ? "#f5f3ff" : "#ede9fe",
                  color: currentPage === totalPages ? "#c4b5fd" : "#7c3aed",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default VendorCartProducts