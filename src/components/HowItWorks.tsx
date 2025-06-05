"use client";
import { useEffect, useRef } from "react";

interface Step {
  icon: string;
  title: string;
  description: string;
}

export default function HowItWorks() {
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, []);

  const steps: Step[] = [
    {
      icon: "🏠",
      title: "Visit Our Shelter",
      description:
        "Browse available dogs and earn 50 points just for visiting!",
    },
    {
      icon: "❤️",
      title: "Adopt Your Companion",
      description:
        "Complete an adoption and earn 500 bonus points plus lifetime rewards!",
    },
    {
      icon: "🎁",
      title: "Redeem Rewards",
      description:
        "Use points for pet food, toys, vet visits, or donate to help more dogs!",
    },
  ];

  return (
    <section className="how-it-works" id="rewards">
      <div className="container">
        <h2 className="section-title">How Fetch Rewards Works</h2>
        <div className="steps">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                stepsRef.current[index] = el;
              }}
              className="step"
            >
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
