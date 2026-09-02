import type { Metadata } from 'next'; import './globals.css';
export const metadata:Metadata={title:{default:'HealthPress',template:'%s | HealthPress'},description:'Health news and community stories for globally connected families.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>}
