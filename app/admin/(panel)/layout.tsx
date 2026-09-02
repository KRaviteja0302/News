import { requireAdmin } from '@/lib/auth'; import { AdminNav } from '@/components/admin-nav';
export default async function PanelLayout({children}:{children:React.ReactNode}){await requireAdmin();return <div className="adminShell"><AdminNav/><main className="adminMain">{children}</main></div>}
