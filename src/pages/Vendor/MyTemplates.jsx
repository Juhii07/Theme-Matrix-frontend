import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const IMG          = "http://localhost:5000/uploads/"
const ITEMS_PER_PAGE = 5

const MyTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [toggling,  setToggling]  = useState(null)

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  // GET http://localhost:5000/vendorapi/my-templates
  const getTemplates = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        "http://localhost:5000/vendorapi/my-templates",
        { headers: H }
      )
      setTemplates(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getTemplates() }, [])

  // POST http://localhost:5000/vendorapi/toggle-template/:id
  const handleToggle = async (t) => {
    setToggling(t._id)
    try {
      const res = await axios.post(
        `http://localhost:5000/vendorapi/toggle-template/${t._id}`,
        {},
        { headers: H }
      )
      setTemplates(prev =>
        prev.map(item =>
          item._id === t._id
            ? { ...item, isEnabled: res.data.isEnabled, designStatus: res.data.designStatus }
            : item
        )
      )
    } catch (e) { console.log(e) }
    setToggling(null)
  }

  // POST http://localhost:5000/vendorapi/delete-template/:id
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return
    try {
      await axios.post(
        `http://localhost:5000/vendorapi/delete-template/${id}`,
        {},
        { headers: H }
      )
      const remaining = templates.filter(t => t._id !== id)
      setTemplates(remaining)
      const maxPage = Math.ceil(remaining.length / ITEMS_PER_PAGE) || 1
      if (page > maxPage) setPage(maxPage)
    } catch (e) { console.log(e) }
  }

  // ── Status Badge ──
  const Badge = ({ s }) => {
    const styles = {
      approved:        "bg-emerald-100 text-emerald-700",
      pending:         "bg-amber-100 text-amber-700",
      rejected:        "bg-red-100 text-red-600",
      disabled:        "bg-gray-100 text-gray-500",
      "change needed": "bg-orange-100 text-orange-700",
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold
        ${styles[s] || "bg-gray-100 text-gray-500"}`}>
        {s}
      </span>
    )
  }

  // ── Toggle Switch ──
  const ToggleSwitch = ({ t }) => {
    const canToggle = t.designStatus !== "rejected"

    if (!canToggle) {
      return <span className="text-xs font-semibold text-gray-300">—</span>
    }

    const isOn   = t.isEnabled === true
    const isBusy = toggling === t._id

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleToggle(t)}
          disabled={isBusy}
          title={isOn ? "Click to Disable" : "Click to Enable"}
          className={`relative inline-block w-11 h-6 rounded-full border-none
            transition-all duration-300 focus:outline-none flex-shrink-0
            ${isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${isOn
              ? "bg-gradient-to-r from-violet-500 to-purple-600"
              : "bg-gray-300"
            }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full
            shadow-md transition-all duration-300
            ${isOn ? "left-5" : "left-0.5"}`}
          />
        </button>
        <span className={`text-xs font-bold
          ${isOn ? "text-violet-600" : "text-gray-400"}`}>
          {isBusy ? "..." : isOn ? "On" : "Off"}
        </span>
      </div>
    )
  }

  // ── Pagination ──
  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE)
  const paginated  = templates.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{font-family:'Plus Jakarta Sans',sans-serif;}`}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">🎨 My Templates</h2>
          <p className="text-sm text-gray-400 mt-1">
            {templates.length} total template{templates.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/vendor/upload"
          className="px-4 py-2 rounded-xl font-bold text-white text-sm
            no-underline transition-all hover:scale-105 hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}
        >
          + Upload New
        </Link>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Head */}
            <thead className="bg-violet-50">
              <tr>
                {["No.", "Thumb", "Template", "Category", "Price", "Status", "Toggle", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold
                    uppercase tracking-wider text-violet-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <p className="text-4xl mb-3">🎨</p>
                    <p className="font-bold text-gray-400 mb-2">No templates yet</p>
                    <Link to="/vendor/upload"
                      className="text-sm font-bold text-violet-600 no-underline hover:underline">
                      Upload your first template →
                    </Link>
                  </td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <tr key={t._id}
                    className="border-t border-violet-50 hover:bg-violet-50
                      transition-colors duration-150">

                    {/* No. */}
                    <td className="px-5 py-4 text-xs font-semibold text-gray-400">
                      {(page - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>

                    {/* Thumbnail */}
                    <td className="px-5 py-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden
                        border border-violet-100 bg-violet-50 flex-shrink-0">
                        {t.designThumbnail ? (
                          <img
                            src={`${IMG}${t.designThumbnail}`}
                            alt={t.designName}
                            className="w-full h-full object-cover"
                            onError={e => {
                              e.target.parentNode.innerHTML =
                                `<div class="w-full h-full flex items-center justify-center font-black text-sm text-violet-600 bg-violet-50">${t.designName?.charAt(0)?.toUpperCase()}</div>`
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center
                            justify-center font-black text-sm text-violet-600">
                            {t.designName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Template Name */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-800 text-xs leading-snug">
                        {t.designName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[130px]">
                        {t.shortDescription || "—"}
                      </p>
                    </td>

                    {/* Category — populated from designCategory */}
                    <td className="px-5 py-4">
                      {t.designCategory && typeof t.designCategory === "object"
                        && t.designCategory.name ? (
                        <span className="px-2.5 py-1 rounded-full text-xs
                          font-bold bg-violet-100 text-violet-700">
                          {t.designCategory.name}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs
                          font-bold bg-gray-100 text-gray-400">
                          No Category
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-bold text-sm
                      text-violet-700 whitespace-nowrap">
                      ₹{t.regularPrice}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge s={t.designStatus} />
                    </td>

                    {/* Toggle */}
                    <td className="px-5 py-4">
                      <ToggleSwitch t={t} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/vendor/edit-template/${t._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold
                            text-white no-underline transition-all
                            hover:scale-105 hover:opacity-90 whitespace-nowrap"
                          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold
                            bg-red-100 text-red-600 border-none cursor-pointer
                            transition-all hover:scale-105 hover:bg-red-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && templates.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-4
            border-t border-violet-50">

            <p className="text-xs font-semibold text-gray-400">
              Showing{" "}
              <span className="text-violet-600 font-bold">
                {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, templates.length)}
              </span>{" "}
              of{" "}
              <span className="text-violet-600 font-bold">{templates.length}</span>{" "}
              templates
            </p>

            <div className="flex items-center gap-1.5">

              {/* Prev */}
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none
                  transition-all
                  ${page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-white cursor-pointer hover:scale-105 hover:opacity-90"
                  }`}
                style={page !== 1
                  ? { background: "linear-gradient(135deg,#a855f7,#7c3aed)" }
                  : {}}
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border-none
                    cursor-pointer transition-all hover:scale-105
                    ${num === page
                      ? "text-white"
                      : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                    }`}
                  style={num === page
                    ? { background: "linear-gradient(135deg,#a855f7,#7c3aed)" }
                    : {}}
                >
                  {num}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none
                  transition-all
                  ${page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-white cursor-pointer hover:scale-105 hover:opacity-90"
                  }`}
                style={page !== totalPages
                  ? { background: "linear-gradient(135deg,#a855f7,#7c3aed)" }
                  : {}}
              >
                Next →
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTemplates