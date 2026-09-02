import { Header } from '@/components/header'; import { Footer } from '@/components/footer';
import { OuterAdRails } from '@/components/outer-ad-rails';
import { NewsletterSignup } from '@/components/newsletter-signup';
export default function SiteLayout({children}:{children:React.ReactNode}){return <><Header/><OuterAdRails>{children}</OuterAdRails><NewsletterSignup/><Footer/></>}
