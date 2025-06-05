"use client";
import { useState } from "react";

interface Dog {
  id: number;
  name: string;
  emoji: string;
  breed: string;
  age: string;
  personality: string;
}

export default function FeaturedDogs() {
  const [dogs] = useState<Dog[]>([
    {
      id: 1,
      name: "Buddy",
      emoji: "🐕",
      breed: "Golden Retriever Mix",
      age: "3 years",
      personality: "Friendly",
    },
    {
      id: 2,
      name: "Luna",
      emoji: "🐩",
      breed: "Border Collie",
      age: "2 years",
      personality: "Energetic",
    },
    {
      id: 3,
      name: "Max",
      emoji: "🦮",
      breed: "German Shepherd",
      age: "5 years",
      personality: "Loyal",
    },
  ]);

  const handleDogClick = (dogName: string): void => {
    alert(
      `You're interested in ${dogName}! In a real app, this would open a detailed profile. 🐕`
    );
  };

  const handleAdoptClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    dogName: string
  ): void => {
    e.stopPropagation();

    const button = e.target as HTMLButtonElement;
    button.textContent = "Application Sent! 🎉";
    button.style.background = "#ff6b6b";

    setTimeout(() => {
      alert(
        `Congratulations! You've started the adoption process for ${dogName}! 🌟`
      );
    }, 1000);
  };

  return (
    <section className="featured-dogs" id="dogs">
      <div className="container">
        <h2 className="section-title">Featured Pups Looking for Love</h2>
        <div className="dogs-grid">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="dog-card"
              onClick={() => handleDogClick(dog.name)}
            >
              <div className="dog-image">{dog.emoji}</div>
              <div className="dog-info">
                <div className="dog-name">{dog.name}</div>
                <div className="dog-details">
                  {dog.breed} • {dog.age} • {dog.personality}
                </div>
                <div className="reward-badge">🌟 +500 Points</div>
                <button
                  className="adopt-button"
                  onClick={(e) => handleAdoptClick(e, dog.name)}
                >
                  Meet {dog.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
