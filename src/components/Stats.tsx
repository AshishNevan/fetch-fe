interface Stat {
  number: string;
  label: string;
}

export default function Stats() {
  const stats: Stat[] = [
    { number: "1,247", label: "Dogs Adopted" },
    { number: "15,000+", label: "Points Donated" },
    { number: "500+", label: "Happy Families" },
    { number: "98%", label: "Success Rate" },
  ];

  return (
    <section className="stats">
      <div className="container">
        <h2 className="section-title">Making a Difference Together</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat">
              <span className="stat-number">{stat.number}</span>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
