import AdminShell from './AdminShell'

export const metadata = {
  robots: 'noindex, nofollow',
  title: 'Admin | Mutomorro',
}

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>
}
