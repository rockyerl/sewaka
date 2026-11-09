"use client";

import { Check } from "lucide-react";

export type InvitationTheme = {
  value: string;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  patterns: {
    background: string;
    overlay: string;
  };
  previewGradient: string;
};

export const INVITATION_THEMES: InvitationTheme[] = [
  // Existing 5 themes
  {
    value: "emas",
    label: "Emas Klasik",
    colors: {
      primary: "#D4AF37",
      secondary: "#B8941F",
      accent: "#F5E6A3",
      background: "#FFFEF5",
      text: "#3D2B1F",
    },
    fonts: { heading: "Playfair Display", body: "Lato" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #D4AF37 0%, #F5E6A3 100%)",
  },
  {
    value: "burgundy",
    label: "Burgundy Elegan",
    colors: {
      primary: "#5B132B",
      secondary: "#8B1A3A",
      accent: "#C4788A",
      background: "#FFF5F5",
      text: "#2D1B1B",
    },
    fonts: { heading: "Playfair Display", body: "Lato" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #5B132B 0%, #C4788A 100%)",
  },
  {
    value: "sage",
    label: "Sage Natural",
    colors: {
      primary: "#87A96B",
      secondary: "#6B8E4E",
      accent: "#C5D5A3",
      background: "#F5FAF0",
      text: "#2D3B2D",
    },
    fonts: { heading: "Cormorant Garamond", body: "Nunito" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #87A96B 0%, #C5D5A3 100%)",
  },
  {
    value: "rose",
    label: "Rose Romantis",
    colors: {
      primary: "#C4788A",
      secondary: "#A85D73",
      accent: "#F0C4D4",
      background: "#FFF5F8",
      text: "#3D2B30",
    },
    fonts: { heading: "Great Vibes", body: "Lato" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #C4788A 0%, #F0C4D4 100%)",
  },
  {
    value: "navy",
    label: "Navy Premium",
    colors: {
      primary: "#2C3E50",
      secondary: "#34495E",
      accent: "#85929E",
      background: "#F0F4F8",
      text: "#1A252F",
    },
    fonts: { heading: "Playfair Display", body: "Roboto" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #2C3E50 0%, #85929E 100%)",
  },
  // New 7 themes
  {
    value: "minimalist",
    label: "Minimalist Modern",
    colors: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#CCCCCC",
      background: "#FFFFFF",
      text: "#000000",
    },
    fonts: { heading: "Inter", body: "Inter" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #000000 0%, #CCCCCC 100%)",
  },
  {
    value: "floral",
    label: "Floral Garden",
    colors: {
      primary: "#D4849A",
      secondary: "#B86B82",
      accent: "#F5C6D0",
      background: "#FFFBFC",
      text: "#4A2C3A",
    },
    fonts: { heading: "Dancing Script", body: "Quicksand" },
    patterns: { background: "floral", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #D4849A 0%, #F5C6D0 50%, #C5D5A3 100%)",
  },
  {
    value: "geometric",
    label: "Geometric Art",
    colors: {
      primary: "#1A1A2E",
      secondary: "#16213E",
      accent: "#E94560",
      background: "#F8F8F8",
      text: "#1A1A2E",
    },
    fonts: { heading: "Montserrat", body: "Open Sans" },
    patterns: { background: "geometric", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #1A1A2E 0%, #E94560 100%)",
  },
  {
    value: "vintage",
    label: "Vintage Classic",
    colors: {
      primary: "#8B6914",
      secondary: "#A67C00",
      accent: "#D4B896",
      background: "#FDF8F0",
      text: "#4A3728",
    },
    fonts: { heading: "Cormorant Garamond", body: "Lora" },
    patterns: { background: "vintage", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #8B6914 0%, #D4B896 100%)",
  },
  {
    value: "tropical",
    label: "Tropical Paradise",
    colors: {
      primary: "#00897B",
      secondary: "#00695C",
      accent: "#80CBC4",
      background: "#F0FAF8",
      text: "#1A3B35",
    },
    fonts: { heading: "Pacifico", body: "Nunito" },
    patterns: { background: "tropical", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #00897B 0%, #80CBC4 50%, #FFB74D 100%)",
  },
  {
    value: "luxury",
    label: "Luxury Gold",
    colors: {
      primary: "#1A1A1A",
      secondary: "#333333",
      accent: "#D4AF37",
      background: "#0A0A0A",
      text: "#FFFFFF",
    },
    fonts: { heading: "Cinzel", body: "Cormorant Garamond" },
    patterns: { background: "luxury", overlay: "gold-shimmer" },
    previewGradient: "linear-gradient(135deg, #1A1A1A 0%, #D4AF37 50%, #1A1A1A 100%)",
  },
  {
    value: "pastel",
    label: "Pastel Dream",
    colors: {
      primary: "#B8A9C9",
      secondary: "#9B8BB4",
      accent: "#E8D5F5",
      background: "#FDF8FF",
      text: "#4A3B5C",
    },
    fonts: { heading: "Quicksand", body: "Quicksand" },
    patterns: { background: "none", overlay: "none" },
    previewGradient: "linear-gradient(135deg, #B8A9C9 0%, #E8D5F5 50%, #F5C6D0 100%)",
  },
];

export function InvitationThemeGallery({
  selectedTheme,
  onThemeChange,
}: {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}) {
  const selected = INVITATION_THEMES.find((t) => t.value === selectedTheme);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {INVITATION_THEMES.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => onThemeChange(theme.value)}
            className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
              selectedTheme === theme.value
                ? "border-[#5B132B] ring-2 ring-[#5B132B]/30"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {/* Preview gradient */}
            <div
              className="aspect-[3/4] w-full"
              style={{ background: theme.previewGradient }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            {/* Check mark */}
            {selectedTheme === theme.value && (
              <div className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md">
                <Check className="size-3 text-[#5B132B]" />
              </div>
            )}
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs font-medium text-white">{theme.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected theme details */}
      {selected && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Detail Theme: {selected.label}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Heading Font</p>
              <p className="font-medium text-foreground">{selected.fonts.heading}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Body Font</p>
              <p className="font-medium text-foreground">{selected.fonts.body}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Primary Color</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="size-4 rounded border"
                  style={{ backgroundColor: selected.colors.primary }}
                />
                <span className="font-mono text-[10px] text-foreground">
                  {selected.colors.primary}
                </span>
              </div>
            </div>
          </div>
          {/* Color palette preview */}
          <div className="mt-3 flex gap-1">
            {Object.values(selected.colors).map((color, i) => (
              <div
                key={i}
                className="h-6 flex-1 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
