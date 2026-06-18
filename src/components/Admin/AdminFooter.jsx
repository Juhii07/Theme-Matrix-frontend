const AdminFooter = () => {
  return (
    <footer
      className="px-6 py-3 flex items-center justify-between flex-shrink-0 bg-white border-t border-violet-100">

      <p className="text-xs text-gray-400">
        © 2026{" "}
        <span className="font-bold text-violet-600">ThemeMatrix</span>
        {" "}—  Designed and Developed by Survivor Infotech.
      </p>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span className="text-xs text-gray-400">All systems operational</span>
      </div>

    </footer>
  )
}

export default AdminFooter