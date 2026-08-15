import { getSettings, updateMultipleSettings } from "@/actions/admin.settings.actions";
import { Save, Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#E91E8C]" />
          Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage global settings, analytics tracking IDs, and store preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={updateMultipleSettings} className="space-y-8">
          
          {/* ── Store Details ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Store Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Store Name</label>
                <input 
                  name="store_name"
                  type="text" 
                  defaultValue={settings["store_name"] || "DevWonder Fashion"}
                  placeholder="e.g. DevWonder Fashion"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <input 
                  name="store_currency"
                  type="text" 
                  defaultValue={settings["store_currency"] || "Tk"}
                  placeholder="e.g. Tk, $, etc."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* ── Analytics & Tracking ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Analytics & Tracking</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Google Analytics (GA4) ID</label>
                <input 
                  name="ga_measurement_id"
                  type="text" 
                  defaultValue={settings["ga_measurement_id"] || ""}
                  placeholder="e.g. G-XXXXXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] transition-shadow font-mono"
                />
                <p className="text-xs text-gray-500">Leave blank to disable GA4 tracking.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Meta Pixel ID</label>
                <input 
                  name="meta_pixel_id"
                  type="text" 
                  defaultValue={settings["meta_pixel_id"] || ""}
                  placeholder="e.g. 123456789012345"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] transition-shadow font-mono"
                />
                <p className="text-xs text-gray-500">Leave blank to disable Meta Pixel tracking.</p>
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
