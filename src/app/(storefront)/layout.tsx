import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { getGlobalStoreSettings } from "@/actions/store-settings.actions";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getGlobalStoreSettings();

  return (
    <>
      <Header logoUrl={settings.headerLogoUrl} storeName={settings.storeName} />
      <main className="min-h-screen">{children}</main>
      <Footer logoUrl={settings.headerLogoUrl} storeName={settings.storeName} phoneNumber={settings.phoneNumber} />
      {settings.whatsappNumber && (
        <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} />
      )}
    </>
  );
}
