import { connection } from "next/server";
import { FeatureFlagsPageContent } from "@/features/admin/components/feature-flags-page-content";

export default async function FeatureFlagsPage() {
  await connection();
  return <FeatureFlagsPageContent />;
}
