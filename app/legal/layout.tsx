import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <div className="bg-white min-h-screen">
                {children}
            </div>
            <Footer />
        </>
    );
}
