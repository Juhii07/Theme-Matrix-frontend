import { useState, useEffect } from "react"
import { Link, useNavigate, Outlet } from "react-router-dom"
import axios from "axios"
import UserFooter from "../components/Footer"

const UserLayout = () => {
  const navigate  = useNavigate()
  const userName  = localStorage.getItem("userName")
  const userToken = localStorage.getItem("userToken")
  const [search, setSearch]       = useState("")
  const [cartCount, setCartCount] = useState(0)

  const getCartCount = async () => {
    const token = localStorage.getItem("userToken")
    if (!token) return setCartCount(0)
    try {
      const res = await axios.get(
        "http://localhost:5000/userapi/view-cart",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      let items = []
      if (Array.isArray(res.data))            items = res.data
      else if (Array.isArray(res.data?.cart)) items = res.data.cart
      else if (Array.isArray(res.data?.data)) items = res.data.data
      setCartCount(items.length)
    } catch (e) {
      // ✅ Auto logout if token expired
      if (e.response?.status === 401) {
        localStorage.removeItem("userToken")
        localStorage.removeItem("userId")
        localStorage.removeItem("userName")
        setCartCount(0)
      } else {
        setCartCount(0)
      }
    }
  }

  useEffect(() => {
    getCartCount()
    const handleCartUpdate = () => getCartCount()
    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("focus",       handleCartUpdate)
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("focus",       handleCartUpdate)
    }
  }, [])

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const logout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    setCartCount(0)
    navigate("/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* TOP BAR */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex gap-6">
            <span>📧 support@themematrix.com</span>
            <span className="hidden sm:inline">📞 +91 97265 60648</span>
          </div>
          <div className="hidden md:block text-gray-500">
            Premium UI Kits &amp; Templates Marketplace
          </div>
          <div className="flex gap-4">
            {["Facebook", "Instagram", "Twitter"].map(s => (
              <span key={s} className="hover:text-violet-400 cursor-pointer transition-colors">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
              TM
            </div>
            <span className="text-xl font-black text-gray-800">
              Theme<span className="text-violet-600">Matrix</span>
            </span>
          </Link>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-6 text-gray-600 font-semibold text-sm">
            <Link to="/"        className="hover:text-violet-600 no-underline transition-colors">Home</Link>
            <Link to="/about"   className="hover:text-violet-600 no-underline transition-colors">About</Link>
            <Link to="/contact" className="hover:text-violet-600 no-underline transition-colors">Contact</Link>

            {/* ✅ My Orders link — only visible when logged in */}
            {userToken && (
              <Link to="/my-orders"
                className="hover:text-violet-600 no-underline transition-colors font-semibold"
                style={{ color: "#6b7280" }}>
                📦 My Orders
              </Link>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* SEARCH */}
            <div className="hidden lg:flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 bg-gray-50">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="outline-none text-sm bg-transparent w-36 text-gray-600"
              />
            </div>

            {/* CART WITH LIVE BADGE */}
            <Link
              to="/cart"
              className="relative no-underline text-gray-700 hover:text-violet-600 transition-colors"
              style={{ display: "inline-flex", alignItems: "center" }}>
              <span className="text-2xl">🛒</span>
              <span
                className="absolute -top-2 -right-2 text-white flex items-center justify-center rounded-full font-bold"
                style={{
                  background: "#7c3aed",
                  minWidth: "18px",
                  height: "18px",
                  fontSize: "10px",
                  fontWeight: "900",
                  padding: "0 3px"
                }}>
                {cartCount}
              </span>
            </Link>

            {userToken ? (
              <>
                {/* ✅ My Orders — visible in right section on small screens */}
                <Link
                  to="/my-template"
                  className="text-sm font-semibold text-gray-600 no-underline hover:text-violet-600 transition-colors hidden sm:block">
                  🎨 My Templates
                </Link>

                <Link
                  to="/edit-profile"
                  className="text-sm font-semibold text-gray-600 no-underline hover:text-violet-600 transition-colors hidden sm:block">
                  👤 {userName}
                </Link>

                <button
                  onClick={logout}
                  className="px-5 py-2 text-sm font-bold text-white rounded-full transition hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                    border: "none",
                    cursor: "pointer"
                  }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-bold rounded-full transition no-underline"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold rounded-full transition no-underline border-2 border-violet-500 text-violet-600 hover:bg-violet-50">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT WITH CONTEXT */}
      <main className="min-h-screen bg-gray-50">
        <Outlet context={{ cartCount, setCartCount, getCartCount }} />
      </main>

      <UserFooter />
    </div>
  )
}

export default UserLayout