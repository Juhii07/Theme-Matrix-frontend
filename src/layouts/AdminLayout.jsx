import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "../components/Admin/AdminSidebar"
import AdminHeader  from "../components/Admin/AdminHeader"
import AdminFooter  from "../components/Admin/AdminFooter"

const pageTitles = {
  "/admin/dashboard":       "Dashboard",
  "/admin/vendors":         "Vendors",
  "/admin/users":           "Users",
  "/admin/add-category":    "Add Category",
  "/admin/view-categories": "Categories",
  "/admin/all-templates":   "All Templates",
  "/admin/edit-profile":    "Edit Profile",
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || "Admin Panel"

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8f5ff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); *{ font-family:'Plus Jakarta Sans',sans-serif; }`}</style>

      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <AdminHeader
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          title={title}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <AdminFooter />

      </div>
    </div>
  )
}

export default AdminLayout