import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"

const StarRating = ({ value, onChange, readonly = false, size = "text-2xl" }) => {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ background: "none", border: "none", cursor: readonly ? "default" : "pointer", padding: "2px" }}>
          <span className={size}
            style={{ color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db", transition: "color 0.15s" }}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

const TemplateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(0)
  const [msg, setMsg] = useState("")
  const [adding, setAdding] = useState(false)
  const [discount, setDiscount] = useState(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Rating states
  const [ratings, setRatings] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [ratingMsg, setRatingMsg] = useState("")
  const [ratingNote, setRatingNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [ratingComplaint, setRatingComplaint] = useState("")

  const token = localStorage.getItem("userToken")
  const userId = localStorage.getItem("userId")

  // ─── API calls ────────────────────────────────────────────────
  const getTemplate = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/userapi/template/${id}`)
      setTemplate(res.data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const getActiveDiscount = async () => {
    try {
      if (!token) return
      const res = await axios.get(
        "http://localhost:5000/api/user/active-discount",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.discount) setDiscount(res.data.discount)
    } catch (e) { console.log(e) }
  }

  // ✅ Check if user purchased this template
  const checkPurchase = async () => {
    try {
      if (!token) return
      const res = await axios.get(
        `http://localhost:5000/userapi/check-purchase/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsPurchased(res.data.purchased || false)
    } catch (e) {
      console.log("Purchase check error:", e)
      setIsPurchased(false)
    }
  }

  // ✅ Download zip file via backend (secured)
  const handleDownload = async () => {
    if (!token) return navigate("/login")
    setDownloading(true)
    try {
      const res = await axios.get(
        `http://localhost:5000/userapi/download/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"  // ✅ important for file download
        }
      )
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${template?.designName || "template"}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setMsg("✅ Download started!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e) {
      console.log("Download error:", e)
      if (e.response?.status === 403) {
        setMsg("❌ Please purchase this template first")
      } else if (e.response?.status === 404) {
        setMsg("❌ File not found. Please contact support.")
      } else {
        setMsg("❌ Download failed. Please try again.")
      }
      setTimeout(() => setMsg(""), 4000)
    }
    setDownloading(false)
  }

  const getRatings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/userapi/ratings/${id}`)
      const list = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.ratings) ? res.data.ratings : []
      setRatings(list)
      if (userId) {
        const mine = list.find(r => r.userId?._id === userId || r.userId === userId)
        if (mine) {
          setUserRating(mine.rating)
          setRatingNote(mine.review || "")
          setHasRated(true)
        }
      }
    } catch (e) { console.log("Ratings fetch error:", e) }
  }




  const submitRating = async () => {
    if (!token) return navigate("/login")
    if (!userRating) return setRatingMsg("Please select a star rating")
    setSubmitting(true); setRatingMsg("")
    try {
      await axios.post(
        `http://localhost:5000/userapi/rate/${id}`,
        {
          rating: userRating,
          review: ratingNote,
          complaint: ratingComplaint,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRatingMsg("✅ Rating submitted!")
      setHasRated(true)
      getRatings()
    } catch (e) {
      setRatingMsg("❌ " + (e.response?.data?.message || "Failed to submit rating"))
    }
    setSubmitting(false)
    setTimeout(() => setRatingMsg(""), 3000)
  }

  const addToCart = async () => {
    if (!token) return navigate("/login")
    setAdding(true)
    try {
      await axios.post(
        "http://localhost:5000/userapi/add-to-cart",
        { templateId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg("✅ Added to cart!")
      window.dispatchEvent(new Event("cartUpdated"))
      setTimeout(() => setMsg(""), 3000)
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.message || "Failed"))
      setTimeout(() => setMsg(""), 3000)
    }
    setAdding(false)
  }

  useEffect(() => {
    getTemplate()
    getActiveDiscount()
    getRatings()
    checkPurchase()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-12 h-12 rounded-full border-4 animate-spin"
        style={{ borderColor: "#ede9fe", borderTopColor: "#a855f7" }} />
    </div>
  )

  if (!template) return (
    <div className="text-center py-20 text-gray-400">Template not found</div>
  )

  const previews = template.previewImages || []
  const allImages = template.designThumbnail
    ? [template.designThumbnail, ...previews.filter(p => p !== template.designThumbnail)]
    : previews
  const originalPrice = template.regularPrice || 0
  const discountPercent = discount?.percentage || 0
  const discountAmount = Math.round((originalPrice * discountPercent) / 100)
  const finalPrice = originalPrice - discountAmount
  const fakeOriginal = Math.round(originalPrice * 1.3)

  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null

  const ratingLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Toast */}
      {msg && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl"
          style={{
            background: msg.includes("✅") ? "#dcfce7" : "#fee2e2",
            color: msg.includes("✅") ? "#15803d" : "#dc2626",
            border: `1px solid ${msg.includes("✅") ? "#bbf7d0" : "#fecaca"}`
          }}>
          {msg}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12">

        {/* ─── LEFT ─── */}
        <div>

          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden mb-4 border border-violet-100 bg-violet-50"
            style={{ height: "360px" }}>
            {allImages[preview]
              ? <img src={`${IMG}${allImages[preview]}`}
                className="w-full h-full object-cover" alt="preview" />
              : <div className="w-full h-full flex items-center justify-center font-black text-8xl"
                style={{ color: "#a855f7" }}>
                {template.designName?.charAt(0)}
              </div>
            }
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                📸 {allImages.length} Images
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#c084fc #f3e8ff" }}>
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setPreview(i)}
                    className="flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      width: "80px", height: "60px",
                      border: i === preview ? "2.5px solid #a855f7" : "2px solid #ede9fe",
                      background: "none", cursor: "pointer",
                      boxShadow: i === preview ? "0 4px 12px rgba(168,85,247,0.3)" : "none",
                      transform: i === preview ? "scale(1.05)" : "scale(1)",
                    }}>
                    <img src={`${IMG}${img}`} className="w-full h-full object-cover" alt={`img ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 border border-violet-100"
            style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>
            <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-widest">
              📄 About This Template
            </h3>
            {template.designDescriptionOne && (
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {template.designDescriptionOne}
              </p>
            )}
            {template.designDescriptionTwo && (
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                {template.designDescriptionTwo}
              </p>
            )}
            {template.designTags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {template.designTags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT ─── */}
        <div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              🏷️ {template.designCategory?.name || "Template"}
            </span>
            {avgRating && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                ⭐ {avgRating} ({ratings.length} {ratings.length === 1 ? "review" : "reviews"})
              </span>
            )}
            {/* ✅ Purchased badge */}
            {isPurchased && (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "#dcfce7", color: "#15803d" }}>
                ✅ Purchased
              </span>
            )}
          </div>

          <h1 className="font-black text-gray-900 text-3xl mb-2">{template.designName}</h1>
          <p className="text-gray-400 text-sm mb-4">
            by <span className="font-bold text-violet-600">{template.vendorId?.name || "Developer"}</span>
          </p>

          {/* Key Features */}
          {template.designKeyFeatures?.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">✨ Key Features</p>
              <div className="flex flex-wrap gap-2">
                {template.designKeyFeatures.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "#f3e8ff", color: "#6b21a8" }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price & CTA */}
          <div className="rounded-2xl p-5 border border-violet-200 mb-5"
            style={{ background: "linear-gradient(135deg,#faf5ff,#f3e8ff)" }}>

            {/* ✅ Show price only if NOT purchased */}
            {!isPurchased && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs line-through">₹{fakeOriginal}</p>
                  <p className="font-black text-violet-700" style={{ fontSize: "2.2rem", lineHeight: 1 }}>
                    ₹{discountPercent > 0 ? finalPrice : originalPrice}
                  </p>
                  {discountPercent > 0 ? (
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">
                      🏷️ {discountPercent}% OFF — Limited time
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Best price guaranteed</p>
                  )}
                </div>
                {template.supportPrice && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Extended support</p>
                    <p className="font-bold text-gray-700">₹{template.supportPrice}</p>
                  </div>
                )}
              </div>
            )}

            {/* ✅ Savings badge — only if not purchased */}
            {!isPurchased && discountPercent > 0 && (
              <div className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <span className="text-emerald-600 text-sm">🎉</span>
                <p className="text-xs font-bold text-emerald-700">
                  You save ₹{discountAmount} on this template!
                </p>
              </div>
            )}

            {/* ✅ PURCHASED — Show Download button */}
            {isPurchased ? (
              <div>
                {/* Already owned banner */}
                <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-black text-emerald-700">
                      You already own this template!
                    </p>
                    <p className="text-xs text-emerald-500 mt-0.5">
                      Download your zip file below
                    </p>
                  </div>
                </div>

                {/* ✅ Download ZIP button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading || !template.designPackage}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
                  style={{
                    background: !template.designPackage
                      ? "#9ca3af"
                      : "linear-gradient(135deg,#10b981,#059669)",
                    border: "none",
                    cursor: (downloading || !template.designPackage) ? "not-allowed" : "pointer",
                    boxShadow: template.designPackage ? "0 4px 20px rgba(16,185,129,0.4)" : "none"
                  }}>
                  {downloading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing Download...
                    </>
                  ) : !template.designPackage ? (
                    "📦 No File Available"
                  ) : (
                    "📦 Download ZIP File"
                  )}
                </button>

                {/* Live Demo if available */}
                {template.demoUrl && (
                  <a href={template.demoUrl} target="_blank" rel="noreferrer"
                    className="mt-3 w-full py-3 rounded-xl font-bold text-sm no-underline border-2 border-violet-300 text-violet-700 bg-white hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                    👁️ Live Demo
                  </a>
                )}
              </div>

            ) : (
              /* ✅ NOT purchased — Show Add to Cart */
              <div className="flex gap-3">
                <button onClick={addToCart} disabled={adding}
                  className="flex-1 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:scale-100"
                  style={{
                    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                    border: "none",
                    cursor: adding ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 20px rgba(168,85,247,0.4)"
                  }}>
                  {adding ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : "🛒 Add to Cart"}
                </button>
                {template.demoUrl && (
                  <a href={template.demoUrl} target="_blank" rel="noreferrer"
                    className="px-5 py-3.5 rounded-xl font-bold text-sm no-underline border-2 border-violet-300 text-violet-700 bg-white hover:bg-violet-50 transition-colors">
                    👁️ Live Demo
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Extra Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ["📦", "Instant Download", "After purchase"],
              ["🔄", "Lifetime Access", "Free updates"],
              ["🛡️", "Secure Payment", "100% protected"],
              ["💬", "24/7 Support", "Always available"],
            ].map(([icon, title, sub]) => (
              <div key={title} className="bg-white rounded-xl p-3 border border-violet-100 text-center">
                <p className="text-lg">{icon}</p>
                <p className="text-xs font-black text-gray-700 mt-1">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RATINGS SECTION ─── */}
      <div className="mt-12">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          ⭐ Ratings & Reviews
          {avgRating && (
            <span className="ml-3 text-base font-bold text-amber-500">
              {avgRating} / 5 ({ratings.length} {ratings.length === 1 ? "review" : "reviews"})
            </span>
          )}
        </h2>




        {/* Review text */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Review (optional)
          </p>
          <textarea
            value={ratingNote}
            onChange={e => setRatingNote(e.target.value)}
            placeholder="Tell others what you think about this template..."
            rows={3}
            disabled={!token}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white resize-none"
            style={{ fontFamily: "inherit" }}
          />
        </div>

        {/* ✅ Complaint (optional) */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Report a Problem (optional)
          </p>
          <textarea
            value={ratingComplaint}
            onChange={e => setRatingComplaint(e.target.value)}
            placeholder="Report any issue with this template (broken files, wrong description, etc)..."
            rows={2}
            disabled={!token}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-red-100 bg-red-50/30 focus:border-red-300 focus:bg-white resize-none"
            style={{ fontFamily: "inherit" }}
          />
        </div>





        <div className="grid lg:grid-cols-2 gap-8">

          {/* Submit Rating */}
          <div className="bg-white rounded-2xl p-6 border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
            <h3 className="font-black text-gray-800 mb-1">
              {hasRated ? "✏️ Update Your Rating" : "✍️ Write a Review"}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              {token ? "Share your experience with this template" : "Login to leave a review"}
            </p>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Your Rating
              </p>
              <div className="flex items-center gap-3">
                <StarRating value={userRating} onChange={setUserRating} size="text-3xl" />
                {userRating > 0 && (
                  <span className="text-sm font-bold text-amber-600">
                    {ratingLabel[userRating]}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Review (optional)
              </p>
              <textarea
                value={ratingNote}
                onChange={e => setRatingNote(e.target.value)}
                placeholder="Tell others what you think about this template..."
                rows={3}
                disabled={!token}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white resize-none"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {ratingMsg && (
              <div className="mb-3 px-4 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  background: ratingMsg.includes("✅") ? "#dcfce7" : "#fee2e2",
                  color: ratingMsg.includes("✅") ? "#15803d" : "#dc2626",
                }}>
                {ratingMsg}
              </div>
            )}

            {token ? (
              <button onClick={submitRating} disabled={submitting || !userRating}
                className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{
                  background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(168,85,247,0.3)"
                }}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : hasRated ? "Update Rating" : "Submit Rating"}
              </button>
            ) : (
              <button onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                🔐 Login to Rate
              </button>
            )}
          </div>

          {/* Rating Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
            <h3 className="font-black text-gray-800 mb-4">📊 Rating Breakdown</h3>
            {ratings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">⭐</p>
                <p className="text-gray-400 text-sm">No ratings yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl"
                style={{ background: "linear-gradient(135deg,#faf5ff,#f3e8ff)" }}>
                <div className="text-center">
                  <p className="font-black text-violet-700" style={{ fontSize: "3rem", lineHeight: 1 }}>
                    {avgRating}
                  </p>
                  <StarRating value={Math.round(avgRating)} readonly size="text-lg" />
                  <p className="text-xs text-gray-400 mt-1">{ratings.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = ratings.filter(r => r.rating === star).length
                    const pct = ratings.length ? Math.round((count / ratings.length) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{star}</span>
                        <span className="text-amber-400 text-xs">★</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f59e0b,#fbbf24)" }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Individual Reviews */}
        {ratings.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-black text-gray-800 text-lg">💬 All Reviews</h3>
            {ratings.map((r, i) => (
              <div key={r._id || i}
                className="bg-white rounded-2xl p-5 border border-violet-100 flex gap-4"
                style={{ boxShadow: "0 2px 8px rgba(109,40,217,0.04)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)" }}>
                  {(r.userId?.name || r.userName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800 text-sm">
                      {r.userId?.name || r.userName || "User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })
                        : ""}
                    </p>
                  </div>
                  <StarRating value={r.rating} readonly size="text-sm" />
                  {r.review && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.review}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateDetail