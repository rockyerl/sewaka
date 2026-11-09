import { getSystemSettings, updateSystemSettingAction } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitOutline } from "@/components/ui/submit-button";
import { Save } from "lucide-react";

export async function updateSettingAction(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const valueStr = formData.get("value") as string;
  let value;
  try {
    value = JSON.parse(valueStr);
  } catch {
    value = valueStr;
  }
  await updateSystemSettingAction(key, { value });
}

export async function AdminSettingsPageContent() {
  const settings = await getSystemSettings();

  const categories = {
    general: { label: "Umum", icon: "⚙️" },
    email: { label: "Email", icon: "📧" },
    payment: { label: "Pembayaran", icon: "💳" },
    storage: { label: "Storage", icon: "💾" },
    notification: { label: "Notifikasi", icon: "🔔" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Konfigurasi platform Sewaka</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(categories).map(([catKey, catInfo]) => {
          const catSettings = settings.filter(s => s.category === catKey);
          if (catSettings.length === 0) return null;
          return (
            <Card key={catKey}>
              <CardHeader>
                <CardTitle className="text-lg">{catInfo.icon} {catInfo.label}</CardTitle>
                <CardDescription>{catSettings.length} pengaturan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {catSettings.map((setting) => (
                  <form key={setting.id} action={updateSettingAction} className="space-y-3 border-b pb-6 last:border-0">
                    <input type="hidden" name="key" value={setting.key} />
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-muted-foreground">{setting.key}</span>
                      <p className="text-[10px] text-muted-foreground">{setting.description}</p>
                    </div>
                    <label htmlFor={`setting-value-${setting.id}`} className="text-xs font-medium text-muted-foreground">Nilai konfigurasi</label>
                    <textarea
                      id={`setting-value-${setting.id}`}
                      name="value"
                      defaultValue={JSON.stringify(setting.value, null, 2)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                    />
                    <SubmitOutline>
                      <Save className="size-3.5 mr-1" />
                      Simpan
                    </SubmitOutline>
                  </form>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
