import { getAllToys } from "@/lib/toys-data";
import JouetsClient from "./page.client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JouetsPage() {
  const toys = await getAllToys({ noCache: true, revalidateSeconds: 0 });
  return <JouetsClient initialToys={toys} />;
}
