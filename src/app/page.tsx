import Header from "src/components/Header";
import Hero from "src/components/Hero";
import HowItWorks from "src/components/HowItWorks";
import FeaturedDogs from "src/components/FeaturedDogs";
import Stats from "src/components/Stats";
import Footer from "src/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks />
      <FeaturedDogs />
      <Stats />
      <Footer />
    </main>
  );
}
