import { redirect } from "next/navigation";

export default function FreePage() {
  redirect("/contents?priceType=FREE");
}
