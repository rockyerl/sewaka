import { NextResponse } from "next/server";
import { getFeatureFlagValues } from "@/features/admin/actions/admin-feature-actions";

export const instant = false;

export async function GET() {
  // Skip database in development/build — return defaults
  if (process.env.VERCEL === undefined) {
    return NextResponse.json({
      flags: { maintenance_mode: false, registration_enabled: true, subscription_enabled: true },
    });
  }
  try {
    const flags = await getFeatureFlagValues();
    const flagsMap: Record<string, boolean> = {};
    for (const flag of flags) {
      flagsMap[flag.name] = flag.isEnabled;
    }
    return NextResponse.json({ flags: flagsMap });
  } catch {
    return NextResponse.json(
      { flags: { maintenance_mode: false, registration_enabled: true, subscription_enabled: true } },
      { status: 200 }
    );
  }
}
