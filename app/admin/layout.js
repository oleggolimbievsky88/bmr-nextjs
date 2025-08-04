'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <ul>
          <li>
            <a href="/admin/import">Import ACES/PIES</a>
          </li>
          {/* Other admin navigation items */}
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
} 