import PoliticalCompass from "@/components/political-compass";

export default function Home() {
  return (
    <div className="h-[calc(100vh-73px)] w-full overflow-hidden">
      <PoliticalCompass />
    </div>
  );
}