import { getGlobalStoreSettings, updateGlobalStoreSettings } from "@/actions/store-settings.actions";
import { Save, Settings, Image as ImageIcon, MessageCircle, Truck } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminSettingsPage() {
  const settings = await getGlobalStoreSettings();

  async function handleSave(formData: FormData) {
    "use server";
    
    // Parse the slider images safely (comma separated)
    const sliderInput = formData.get("sliderImages") as string;
    const sliderImages = sliderInput 
      ? sliderInput.split(",").map(s => s.trim()).filter(Boolean) 
      : [];

    await updateGlobalStoreSettings({
      storeName: formData.get("storeName") as string,
      headerLogoUrl: (formData.get("headerLogoUrl") as string) || null,
      phoneNumber: (formData.get("phoneNumber") as string) || null,
      whatsappNumber: (formData.get("whatsappNumber") as string) || null,
      deliveryCharge: Number(formData.get("deliveryCharge")) || 80,
      gaMeasurementId: (formData.get("gaMeasurementId") as string) || null,
      metaPixelId: (formData.get("metaPixelId") as string) || null,
      sliderImages,
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#E91E8C]" />
          Store Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage global storefront settings, contact details, and visual assets.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={handleSave} className="space-y-8">
          
          {/* ── Brand & Assets ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" /> Branding & Media
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Store Name</label>
                <input 
                  name="storeName"
                  type="text" 
                  defaultValue={settings.storeName}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Header Logo URL</label>
                <input 
                  name="headerLogoUrl"
                  type="url" 
                  defaultValue={settings.headerLogoUrl || ""}
                  placeholder="https://.../logo.png"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Homepage Slider Images (Comma Separated URLs)</label>
                <textarea 
                  name="sliderImages"
                  rows={3}
                  defaultValue={Array.isArray(settings.sliderImages) ? settings.sliderImages.join(",\n") : ""}
                  placeholder="https://.../slide1.jpg, https://.../slide2.jpg"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Contact & WhatsApp ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-400" /> Contact Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Support Phone Number</label>
                <input 
                  name="phoneNumber"
                  type="text" 
                  defaultValue={settings.phoneNumber || ""}
                  placeholder="+880 1700-000000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Floating WhatsApp Number</label>
                <input 
                  name="whatsappNumber"
                  type="text" 
                  defaultValue={settings.whatsappNumber || ""}
                  placeholder="+8801700000000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                />
                <p className="text-xs text-gray-500">Number with country code (no spaces/plus) for the floating button.</p>
              </div>
            </div>
          </div>

          {/* ── Delivery & Analytics ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" /> Operations & Tracking
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Delivery Charge (Tk)</label>
                <input 
                  name="deliveryCharge"
                  type="number" 
                  defaultValue={Number(settings.deliveryCharge)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                />
              </div>
              <div className="hidden md:block"></div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Google Analytics (GA4) ID</label>
                <input 
                  name="gaMeasurementId"
                  type="text" 
                  defaultValue={settings.gaMeasurementId || ""}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Meta Pixel ID</label>
                <input 
                  name="metaPixelId"
                  type="text" 
                  defaultValue={settings.metaPixelId || ""}
                  placeholder="123456789012345"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 bg-[#E91E8C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#d8157a] transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
