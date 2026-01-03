import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CRMPage } from "./crm-page";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <CRMPage userId={user.id} />;
}
