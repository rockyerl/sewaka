import { getSystemSettings, updateSystemSettingAction } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default async function SettingsPage() {
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
                      <Label className="font-mono text-sm">{setting.key}</Label>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Textarea
                      name="value"
                      defaultValue={typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value, null, 2)}
                      className="font-mono text-sm"
                      rows={3}
                    />
                    <Button type="submit" size="sm">
                      <Save className="mr-2 h-3 w-3" /> Simpan
                    </Button>
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
