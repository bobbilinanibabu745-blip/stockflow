
import "./StatCard.css";

function StatCard({ icon, label, value, note, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        {icon}
      </div>

      <p>{label}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </article>
  );
}

export default StatCard;
