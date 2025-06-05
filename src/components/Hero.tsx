"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  useEffect(() => {
    const createFloatingPaw = (): void => {
      const paw = document.createElement("div");
      paw.innerHTML = "🐾";
      paw.style.position = "fixed";
      paw.style.fontSize = "2rem";
      paw.style.opacity = "0.1";
      paw.style.pointerEvents = "none";
      paw.style.left = Math.random() * 100 + "vw";
      paw.style.top = "100vh";
      paw.style.zIndex = "1";
      paw.style.transition = "all 6s linear";

      document.body.appendChild(paw);

      setTimeout(() => {
        paw.style.top = "-100px";
        paw.style.transform = `translateX(${(Math.random() - 0.5) * 200}px)`;
      }, 100);

      setTimeout(() => {
        if (document.body.contains(paw)) {
          document.body.removeChild(paw);
        }
      }, 6000);
    };

    const interval = setInterval(createFloatingPaw, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = async (): Promise<void> => {
    // optimisitic navigation to search page
    router.push("/search");
  };

  return (
    <section className="hero" id="home">
      <div className="container hero-content">
        <h1>Adopt a Friend, Earn Rewards!</h1>
        <p>
          Every adoption earns points you can redeem for pet supplies, vet
          visits, and more good deeds
        </p>
        <button onClick={handleStartJourney} className="cta-button">
          Start Your Journey
        </button>
      </div>
      <div className="floating-elements">
        <div className="floating-paw">🐾</div>
        <div className="floating-paw">🐾</div>
        <div className="floating-paw">🐾</div>
      </div>
    </section>
  );
}
