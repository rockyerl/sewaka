import { NextRequest, NextResponse } from "next/server";
import { getVendorComparison } from "@/features/vendors/actions/vendor-comparison-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const category = searchParams.get("category");

    if (!workspaceId || !category) {
      return NextResponse.json(
        { error: "workspaceId dan category diperlukan" },
        { status: 400 }
      );
    }

    const comparison = await getVendorComparison(workspaceId, category);
    return NextResponse.json(comparison);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil data perbandingan vendor" },
      { status: 500 }
    );
  }
}
