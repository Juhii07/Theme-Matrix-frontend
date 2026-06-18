import { useState, useEffect } from "react"
import axios from "axios"

const UploadTemplate = () => {
  const [designName,           setDesignName]           = useState("")
  const [demoUrl,              setDemoUrl]              = useState("")
  const [regularPrice,         setRegularPrice]         = useState("")
  const [supportPrice,         setSupportPrice]         = useState("")
  const [designDescriptionOne, setDesignDescriptionOne] = useState("")
  const [designDescriptionTwo, setDesignDescriptionTwo] = useState("")
  const [designKeyFeatures,    setDesignKeyFeatures]    = useState("")
  const [designCategory,       setDesignCategory]       = useState("")
  const [thumbnail,            setThumbnail]            = useState(null)
  const [packageFile,          setPackageFile]          = useState(null)
  const [previewImgs,          setPreviewImgs]          = useState([])
  const [categories,           setCategories]           = useState([])
  const [loading,              setLoading]              = useState(false)
  const [msg,                  setMsg]                  = useState("")
  const [error,                setError]                = useState("")
  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  // GET http://localhost:5000/vendorapi/category
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/vendorapi/category", { headers: H })
        setCategories(res.data.categories || [])
      } catch (e) { console.log(e) }
    }
    getCategories()
  }, [])

  // POST http://localhost:5000/vendorapi/upload-template (multipart)
  const upload = async () => {
    if (!designName || !regularPrice || !designCategory || !thumbnail)
      return setError("Name, price, category and thumbnail are required")
    setLoading(true); setMsg(""); setError("")
    try {
      const fd = new FormData()
      fd.append("designName",           designName)
      fd.append("demoUrl",              demoUrl)
      fd.append("regularPrice",         regularPrice)
      fd.append("supportPrice",         supportPrice)
      fd.append("designDescriptionOne", designDescriptionOne)
      fd.append("designDescriptionTwo", designDescriptionTwo)
      fd.append("designKeyFeatures",    designKeyFeatures)
      fd.append("designCategory",       designCategory)
      fd.append("designThumbnail",      thumbnail)
      if (packageFile) fd.append("designPackage", packageFile)
      previewImgs.forEach(f => fd.append("previewImages", f))

      await axios.post("http://localhost:5000/vendorapi/upload-template", fd, { headers: H })

      setMsg("✅ Template uploaded! Awaiting admin approval.")
      setDesignName("")
      setDemoUrl("")
      setRegularPrice("")
      setSupportPrice("")
      setDesignDescriptionOne("")
      setDesignDescriptionTwo("")
      setDesignKeyFeatures("")
      setDesignCategory("")
      setThumbnail(null)
      setPackageFile(null)
      setPreviewImgs([])
    } catch (e) { setError(e.response?.data?.message || "Upload failed") }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">⬆️ Upload Template</h2>
        <p className="text-sm text-gray-400 mt-1">Submit your template for admin review</p>
      </div>

      {msg   && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{msg}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">⚠️ {error}</div>}

      <div className="grid lg:grid-cols-2 gap-5">

        {/* LEFT — Template Details */}
        <div className="bg-white rounded-2xl p-6 border border-violet-100 space-y-4"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <h3 className="font-black text-gray-800">📝 Template Details</h3>

          {/* Template Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              🎨 Template Name *
            </label>
            <input
              type="text"
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              placeholder="My Awesome Template"
              className={inputCls}
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              🔗 Demo URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              placeholder="https://demo.example.com"
              className={inputCls}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                💰 Regular Price *
              </label>
              <input
                type="number"
                value={regularPrice}
                onChange={e => setRegularPrice(e.target.value)}
                placeholder="999"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                🛡️ Support Price
              </label>
              <input
                type="number"
                value={supportPrice}
                onChange={e => setSupportPrice(e.target.value)}
                placeholder="199"
                className={inputCls}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              🏷️ Category *
            </label>
            <select
              value={designCategory}
              onChange={e => setDesignCategory(e.target.value)}
              className={inputCls}>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              ✨ Key Features (comma separated)
            </label>
            <input
              type="text"
              value={designKeyFeatures}
              onChange={e => setDesignKeyFeatures(e.target.value)}
              placeholder="Responsive, Dark Mode, RTL"
              className={inputCls}
            />
          </div>

          {/* Description One */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📄 Description
            </label>
            <textarea
              rows={3}
              value={designDescriptionOne}
              onChange={e => setDesignDescriptionOne(e.target.value)}
              placeholder="Describe your template..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-violet-50 border-2 border-transparent focus:border-violet-400"
            />
          </div>

          {/* Description Two */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📄 Description 2 (optional)
            </label>
            <textarea
              rows={2}
              value={designDescriptionTwo}
              onChange={e => setDesignDescriptionTwo(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-violet-50 border-2 border-transparent focus:border-violet-400"
            />
          </div>

        </div>

        {/* RIGHT — Upload Files */}
        <div className="bg-white rounded-2xl p-6 border border-violet-100 space-y-4"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <h3 className="font-black text-gray-800">📁 Upload Files</h3>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              🖼️ Thumbnail Image *
            </label>
            <div className="rounded-xl p-4 text-center border-2 border-dashed border-violet-200 bg-violet-50">
              {thumbnail ? (
                <div>
                  <img src={URL.createObjectURL(thumbnail)}
                    className="w-full h-32 object-cover rounded-lg mb-2" alt="preview" />
                  <p className="text-xs font-semibold text-emerald-600">✅ {thumbnail.name}</p>
                  <button onClick={() => setThumbnail(null)}
                    className="text-xs text-red-500 mt-1"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm text-gray-400 font-medium">Click to select thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setThumbnail(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Package File */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📦 Package File (ZIP/RAR)
            </label>
            <div className="rounded-xl p-4 text-center border-2 border-dashed border-violet-200 bg-violet-50">
              {packageFile ? (
                <div>
                  <p className="text-sm font-semibold text-emerald-600">✅ {packageFile.name}</p>
                  <button onClick={() => setPackageFile(null)}
                    className="text-xs text-red-500 mt-1"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <span className="text-3xl">📦</span>
                  <span className="text-sm text-gray-400 font-medium">Click to select zip/rar</span>
                  <input
                    type="file"
                    accept=".zip,.rar,.gz,.tar"
                    className="hidden"
                    onChange={e => setPackageFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Preview Images */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📸 Preview Images (max 10)
            </label>
            <div className="rounded-xl p-4 text-center border-2 border-dashed border-violet-200 bg-violet-50">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <span className="text-3xl">📸</span>
                <span className="text-sm text-gray-400 font-medium">Select up to 10 preview images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => setPreviewImgs(Array.from(e.target.files).slice(0, 10))}
                />
              </label>
              {previewImgs.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-emerald-600 mb-2">
                    ✅ {previewImgs.length} image(s) selected
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {previewImgs.map((img, i) => (
                      <img key={i} src={URL.createObjectURL(img)}
                        className="w-14 h-10 object-cover rounded-lg border border-violet-200" alt={`preview ${i}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={upload}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:scale-100"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : "🚀 Submit Template for Review"}
          </button>

        </div>
      </div>
    </div>
  )
}

export default UploadTemplate