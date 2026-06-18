import { useState } from "react"

const Contact = () => {
  const [form,    setForm]    = useState({ name: "", email: "", message: "" })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = () => {
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
      setForm({ name: "", email: "", message: "" })
    }, 1000)
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-r from-gray-950 to-purple-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold mb-3">Contact ThemeMatrix</h1>
          <p className="text-gray-300">
            Have questions about templates, purchases, or selling on
            ThemeMatrix? Our support team is here to help you.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10">

        {/* INFO */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Get in Touch</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Reach out for support, partnership, or general inquiries.
            We typically respond within 24 hours.
          </p>

          <div className="space-y-3 text-gray-700 mb-8">
            <p className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "#f3e8ff" }}>📧</span>
              <span>support@themematrix.com</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "#f3e8ff" }}>📞</span>
              <span>+91 98765 43210</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "#f3e8ff" }}>📍</span>
              <span>Ahmedabad, India</span>
            </p>
          </div>

          {/* Quick help cards */}
          <div className="space-y-3">
            {[
              ["🛒", "Purchase Support",  "Questions about buying templates or payment issues."],
              ["🎨", "Vendor Support",    "Help with uploading or managing your templates."],
              ["🛡️", "General Enquiry",  "Anything else — we're happy to help!"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl border border-violet-100 bg-white hover:border-violet-300 transition">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow">

          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)}
                className="px-6 py-2.5 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition text-sm"
                style={{ border: "none", cursor: "pointer" }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-2">Send a Message</h3>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm focus:border-violet-500 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Your email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm focus:border-violet-500 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm focus:border-violet-500 transition-colors resize-none bg-white"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={loading || !form.name || !form.email || !form.message}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: "none", cursor: "pointer" }}>
                {loading ? "⏳ Sending..." : "Send Message"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Contact