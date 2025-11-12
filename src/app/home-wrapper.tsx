import { getFeaturedToys } from "@/lib/toys-data";
import HomePage from "./home-client";

export default async function HomeWrapper() {
  const featuredToys = await getFeaturedToys(6);

  return <HomePage featuredToys={featuredToys} />;
}


