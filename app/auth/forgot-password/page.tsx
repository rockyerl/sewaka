import { Suspense } from "react";
import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page";

export default function ForgotPasswordRoute() {
  return (
    <Suspense>
      <ForgotPasswordPage />
    </Suspense>
  );
}
