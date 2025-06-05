"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <nav className="container">
        <Link href="/" className="logo">
          <div className="dog-icon">🐕</div>
          fetch
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="#dogs">Dogs</Link>
          </li>
          <li>
            <Link href="#rewards">Rewards</Link>
          </li>
          <li>
            <Link href="#about">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
