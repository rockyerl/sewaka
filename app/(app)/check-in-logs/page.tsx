import { redirect } from "next/navigation";

export default function CheckInLogsRedirect() {
  redirect("/guests/attendance");
}
