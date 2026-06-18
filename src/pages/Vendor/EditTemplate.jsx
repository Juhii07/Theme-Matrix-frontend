import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

const EditTemplate = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()

  const [designName,          setDesignName]          = useState("")
  const [designCategory,      setDesignCategory]      = useState("")
  const [demoUrl,             setDemoUrl]             = useState("")
  const [regularPrice,        setRegularPrice]        = useState("")
  const [supportPrice,        setSupportPrice]        = useState("")
  const [designDescriptionOne,setDesignDescriptionOne]= useState("")
  const [designDescriptionTwo,setDesignDescriptionTwo]= useState("")
  const [shortDescription,    setShortDescription]    = useState("")
  const [designKeyFeatures,   setDesignKeyFeatures]   = useState("")
  const [thumbnail,           setThumbnail]           = useState(null)
  const [packageFile,         setPackageFile]         = useState(null)
  const [categories,          setCategories]          = useState([])
  const [loading,             setLoading]             = useState(true)
  const [saving,              setSaving]              = useState(false)
  const [error,               setError]               = useState("")
  const [success,             setSuccess]             = useState("")

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  // GET http://localhost:5000/vendorapi/template/:id
  const getTemplate = async () => {
    setLoading(true)
    try {
      const [tplRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5000/vendorapi/template/${id}`, { headers: H }),
        axios.get(`http://localhost:5000/vendorapi/category`,       { headers: H }),
      ])

      const t = tplRes.data
      setDesignName(t.designName           || "")
      setDesignCategory(t.designCategory?._id || t.designCategory || "")
      setDemoUrl(t.demoUrl                 || "")
      setRegularPrice(t.regularPrice       || "")
      setSupportPrice(t.supportPrice       || "")
      setDesignDescriptionOne(t.designDescriptionOne || "")
      setDesignDescriptionTwo(t.designDescriptionTwo || "")
      setShortDescription(t.shortDescription         || "")
      setDesignKeyFeatures(
        Array.isArray(t.designKeyFeatures)
          ? t.designKeyFeatures.join(", ")
          : t.designKeyFeatures || ""
      )

      setCategories(
        Array.isArray(catRes.data.categories) ? catRes.data.categories : []
      )
    } catch (e) {
      console.log(e)
      setError("Failed to load template")
    }
    setLoading(false)
  }

  useEffect(() => { getTemplate() }, [id])

  // POST http://localhost:5000/vendorapi/edit-template/:id
  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    if (!designName.trim()) {
      return setError("Template name is required")
    }

    setSaving(true)
    try {
      // ALWAYS use FormData — multer requires it
      const fd = new FormData()
      fd.append("designName",           designName)
      fd.append("designCategory",       designCategory)
      fd.append("demoUrl",              demoUrl)
      fd.append("regularPrice",         regularPrice)
      fd.append("supportPrice",         supportPrice)
      fd.append("designDescriptionOne", designDescriptionOne)
      fd.append("designDescriptionTwo", designDescriptionTwo)
      fd.append("shortDescription",     shortDescription)

      // Convert comma-separated features to array
      const featuresArr = designKeyFeatures
        .split(",")
        .map(f => f.trim())
        .filter(Boolean)
      featuresArr.forEach(f => fd.append("designKeyFeatures", f))

      // Only append files if new ones selected
      if (thumbnail)   fd.append("designThumbnail", thumbnail)
      if (packageFile) fd.append("designPackage",   packageFile)

      await axios.post(
        `http://localhost:5000/vendorapi/edit-template/${id}`,
        fd,
        {
          headers: {
            ...H,
            "Content-Type": "multipart/form-data",
          }
        }
      )

      setSuccess("Template updated successfully! Sent for admin review.")
      setTimeout(() => navigate("/vendor/my-templates"), 1500)

    } catch (e) {
      console.log(e)
      setError(e?.response?.data?.msg || "Update failed. Please try again.")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600
          rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{font-family:'Plus Jakarta Sans',sans-serif;}`}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">✏️ Edit Template</h2>
          <p className="text-sm text-gray-400 mt-1">
            Update details — will be sent for admin review
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/my-templates")}
          className="px-4 py-2 rounded-xl font-bold text-sm border-none
            cursor-pointer transition-all hover:scale-105 bg-gray-100 text-gray-600"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200
            text-red-600 text-xs font-semibold">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200
            text-emerald-700 text-xs font-semibold">
            ✅ {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Design Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              placeholder="Enter template name"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Category
            </label>
            <select
              value={designCategory}
              onChange={e => setDesignCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Regular Price */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Regular Price (₹)
            </label>
            <input
              type="number"
              value={regularPrice}
              onChange={e => setRegularPrice(e.target.value)}
              placeholder="e.g. 999"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Support Price */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Support Price (₹)
            </label>
            <input
              type="number"
              value={supportPrice}
              onChange={e => setSupportPrice(e.target.value)}
              placeholder="e.g. 299"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Demo URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Demo URL
            </label>
            <input
              type="text"
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              placeholder="https://your-demo-url.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Short Description
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="Brief one-line description"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Description One */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Description One
            </label>
            <textarea
              value={designDescriptionOne}
              onChange={e => setDesignDescriptionOne(e.target.value)}
              placeholder="Main description of your template"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Description Two */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Description Two
            </label>
            <textarea
              value={designDescriptionTwo}
              onChange={e => setDesignDescriptionTwo(e.target.value)}
              placeholder="Additional description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Key Features */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Key Features
              <span className="normal-case font-normal text-gray-300 ml-1">
                (comma separated)
              </span>
            </label>
            <input
              type="text"
              value={designKeyFeatures}
              onChange={e => setDesignKeyFeatures(e.target.value)}
              placeholder="e.g. Responsive, Dark Mode, Free Updates"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Thumbnail
              <span className="normal-case font-normal text-gray-300 ml-1">
                (leave blank to keep existing)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setThumbnail(e.target.files[0] || null)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors cursor-pointer"
            />
          </div>

          {/* Package File */}
          <div>
            <label className="block text-xs font-bold text-gray-400
              uppercase tracking-widest mb-2">
              Package File
              <span className="normal-case font-normal text-gray-300 ml-1">
                (leave blank to keep existing)
              </span>
            </label>
            <input
              type="file"
              accept=".zip,.rar"
              onChange={e => setPackageFile(e.target.files[0] || null)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                border-2 border-gray-200 bg-gray-50 focus:border-violet-400
                focus:bg-white transition-colors cursor-pointer"
            />
          </div>

        </div>

        {/* ── Save Button ── */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-6 w-full py-3 rounded-xl font-black text-white text-sm
            border-none cursor-pointer transition-all hover:scale-[1.02]
            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
            disabled:scale-100"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white
                rounded-full animate-spin" />
              Saving...
            </span>
          ) : "💾 Save Changes"}
        </button>

      </div>
    </div>
  )
}

export default EditTemplate