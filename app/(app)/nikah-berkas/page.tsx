import { redirect } from "next/navigation";

export default function NikahBerkasRedirect() {
  redirect("/documents?tab=checklist");
}
