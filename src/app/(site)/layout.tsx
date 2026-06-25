import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import MobileActionBar from "@/components/ui/MobileActionBar";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MobileActionBar />
    </div>
  );
}
