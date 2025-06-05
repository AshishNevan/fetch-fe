import Link from "next/link";

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const footerSections: FooterSection[] = [
    {
      title: "Adopt",
      links: [
        { name: "Available Dogs", href: "#" },
        { name: "Adoption Process", href: "#" },
        { name: "Success Stories", href: "#" },
        { name: "Adoption Events", href: "#" },
      ],
    },
    {
      title: "Rewards",
      links: [
        { name: "How It Works", href: "#" },
        { name: "Point Values", href: "#" },
        { name: "Redeem Rewards", href: "#" },
        { name: "Partner Stores", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Volunteer", href: "#" },
        { name: "Donate", href: "#" },
        { name: "Foster Program", href: "#" },
        { name: "Contact Us", href: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "Newsletter", href: "#" },
        { name: "Facebook", href: "#" },
        { name: "Instagram", href: "#" },
        { name: "Twitter", href: "#" },
      ],
    },
  ];

  return (
    <footer id="about">
      <div className="container">
        <div className="footer-content">
          {footerSections.map((section, index) => (
            <div key={index} className="footer-section">
              <h3>{section.title}</h3>
              {section.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href}>
                  {link.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <p>
          &copy; 2025 Fetch Rewards Shelter. Making adoption rewarding for
          everyone. 🐾
        </p>
      </div>
    </footer>
  );
}
