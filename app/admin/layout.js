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
        <ul className="d-flex gap-3 list-unstyled mb-0">
          <li>
            <a href="/admin/import" className="text-white text-decoration-none">Import ACES/PIES</a>
          </li>
          <li>
            <a href="/admin/dealers" className="text-white text-decoration-none">Dealers</a>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  )
}
