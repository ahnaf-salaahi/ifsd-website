import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">
            Institute for Skills Development
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            Empowering students and youth through skills, education, and
            guidance since 2026.
          </p>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/scholarships" className="hover:text-white">Scholarships</Link></li>
            <li><Link href="/programmes" className="hover:text-white">Programmes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
            <li><Link href="/success-stories" className="hover:text-white">Success Stories</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Email: info.isd.lk@gmail.com</li>
            <li>Phone: +94 71 144 2448</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Institute for Skills Development (Pvt) Ltd. All rights reserved.
      </div>
    </footer>
  );
}