"use client";

import { useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateWeddingConceptAction, getWeddingConceptAction } from "@/features/workspaces/actions/concept-actions";

const presetThemes = [
  { name: "Rustic Elegance", colors: ["#8B4513", "#D2B48C", "#F5DEB3", "#556B2F"] },
  { name: "Modern Minimalist", colors: ["#FFFFFF", "#F5F5F5", "#333333", "#888888"] },
  { name: "Bohemian Garden", colors: ["#C19A6B", "#8FBC8F", "#DAA520", "#F4A460"] },
  { name: "Royal Gold", colors: ["#D4AF37", "#5B132B", "#1C1C1C", "#F5F5DC"] },
  { name: "Pastel Dream", colors: ["#FFB6C1", "#B6D7E8", "#E6E6FA", "#F0E68C"] },
  { name: "Tropical Paradise", colors: ["#228B22", "#FF6347", "#FFD700", "#87CEEB"] },
];

export function WeddingConceptPanel({ workspaceId }: { workspaceId: string }) {
  const [theme, setTheme] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateWeddingConceptAction(workspaceId, {
        theme: theme || undefined,
        colorPalette: colors.length > 0 ? colors : undefined,
        description: description || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function applyPreset(preset: typeof presetThemes[0]) {
    setTheme(preset.name);
    setColors(preset.colors);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        <h2 className="text-lg font-serif font-semibold text-[#5B132B]">Konsep Pernikahan</h2>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <div className="space-y-2">
          <Label>Tema Pernikahan</Label>
          <Input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Contoh: Rustic Elegance, Modern Minimalist..."
          />
        </div>

        {/* Preset Themes */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Pilih Tema Preset
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border-2 p-3 text-left transition-all ${
                  theme === preset.name
                    ? "border-[#D4AF37] bg-[#5B132B]/5"
                    : "border-border hover:border-[#D4AF37]/50"
                }`}
              >
                <div className="mb-2 flex gap-1">
                  {preset.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2">
          <Label>Palet Warna Kustom</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <div key={i} className="group relative">
                <div
                  className="h-10 w-10 rounded-lg border-2 border-border/50 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <button
                  type="button"
                  onClick={() => setColors(colors.filter((_, j) => j !== i))}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
                >
                  ×
                </button>
              </div>
            ))}
            {colors.length < 10 && (
              <input
                type="color"
                onChange={(e) => setColors([...colors, e.target.value])}
                className="h-10 w-10 cursor-pointer rounded-lg border-2 border-dashed border-border/50"
              />
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-2">
          <Label>Deskripsi Konsep</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsikan konsep pernikahan impianmu..."
            rows={3}
          />
        </div>

        {/* Save */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-[#5B132B] hover:bg-[#4a1025]">
            {saving ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Konsep"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
