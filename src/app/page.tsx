import HomeWrapper from "./home-wrapper";

export const metadata = {
  title: "LOUAAB - Location de jouets pour enfants au Maroc",
  description: "Louez des jouets de qualité pour vos enfants. Renouvelez quand vous voulez, sans encombrement. Service de location de jouets au Maroc.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return <HomeWrapper />;
}
