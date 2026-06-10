import HomeArticles from "../components/home-articles";
import HomeCta from "../components/home-cta";
import HomeToolsShowcase from "../components/home-tools-showcase";
import HomePillars from "../components/home-pillars";

export default function Home() {
  return (
    <div>
      <HomeToolsShowcase />
      <HomePillars />
      <HomeArticles />
      <HomeCta />
    </div>
  );
}
