import { useState, useEffect } from "react"
import axios from "axios"

const AdminDiscount = () => {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading]     = useState(false)
  const [form, setForm]           = useState({
    percentage: "", startDate: "", endDate: ""
  })
  const [msg, setMsg] = useState({ text: "", type: "" })

  // ✅ Fixed: "token" instead of "adminToken"
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getDiscounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/discounts", { headers: H })
      setDiscounts(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
  }

  useEffect(() => { getDiscounts() }, [])

  const showMsg = (text, type) => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: "", type: "" }), 3000)
  }

  const handleCreate = async () => {
    if (!form.percentage || !form.startDate || !form.endDate) {
      return showMsg("Please fill all required fields", "error")
    }
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/api/admin/discounts", {
        code:       `DISCOUNT${Date.now()}`,
        percentage: form.percentage,
        startDate:  form.startDate,
        endDate:    form.endDate,
        usageLimit: null
      }, { headers: H })
      showMsg("Discount created successfully!", "success")
      setForm({ percentage: "", startDate: "", endDate: "" })
      getDiscounts()
    } catch (e) {
      showMsg(e.response?.data?.message || "Error creating discount", "error")
    }
    setLoading(false)
  }

  const handleToggle = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/discounts/${id}/toggle`,
        {},
        { headers: H }
      )
      getDiscounts()
    } catch (e) { console.log(e) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount?")) return
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/discounts/${id}`,
        { headers: H }
      )
      showMsg("Discount deleted", "success")
      getDiscounts()
    } catch (e) { console.log(e) }
  }

  const isExpired = (endDate) => new Date(endDate) < new Date()

  return (
    <div>

      {/* Header */}
      <div className="mb-7">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">🏷️ Discount Codes</h2>
        <p className="text-sm text-gray-400 mt-0.5">Create and manage discount codes for users</p>
      </div>

      {/* Message */}
      {msg.text && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold ${
          msg.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <h3 className="text-sm font-black text-gray-700 mb-4 uppercase tracking-widest">
          Create New Discount
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Discount % */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Discount % *
            </label>
            <input
              type="number" min="1" max="100"
              className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm focus:outline-none focus:border-violet-400"
              placeholder="e.g. 10"
              value={form.percentage}
              onChange={e => setForm({ ...form, percentage: e.target.value })}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Start Date *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm focus:outline-none focus:border-violet-400"
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              End Date *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm focus:outline-none focus:border-violet-400"
              value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-8 py-2.5 rounded-xl text-sm font-black text-white transition-all"
            style={{
              background: loading ? "#c4b5fd" : "#7c3aed",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Creating..." : "+ Create Discount"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.", "Code", "Discount", "Start Date", "End Date", "Usage", "Status", "Actions"].map(h => (
                  <th key={h}
                    className="px-5 py-3 text-left text-xs font-bold text-violet-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-300 text-sm">
                    No discount codes yet
                  </td>
                </tr>
              ) : (
                discounts.map((d, i) => (
                  <tr key={d._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    {/* No */}
                    <td className="px-5 py-3.5 text-gray-300 text-xs">{i + 1}</td>

                    {/* Code */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                        {d.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-3.5 font-black text-gray-800">
                      {d.percentage}% OFF
                    </td>

                    {/* Start Date */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(d.startDate).toLocaleDateString("en-IN")}
                    </td>

                    {/* End Date */}
                    <td className="px-5 py-3.5 text-xs">
                      <span className={isExpired(d.endDate) ? "text-red-400 font-bold" : "text-gray-500"}>
                        {new Date(d.endDate).toLocaleDateString("en-IN")}
                        {isExpired(d.endDate) && " (Expired)"}
                      </span>
                    </td>

                    {/* Usage */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {d.usedCount} / {d.usageLimit ?? "∞"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: d.isActive ? "#dcfce7" : "#fee2e2",
                          color:      d.isActive ? "#166534" : "#991b1b"
                        }}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(d._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: d.isActive ? "#fef3c7" : "#dcfce7",
                            color:      d.isActive ? "#92400e" : "#166534",
                            border: "none",
                            cursor: "pointer"
                          }}>
                          {d.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            cursor: "pointer"
                          }}>
                          Delete
                        </button>
                      </div>
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

export default AdminDiscount



