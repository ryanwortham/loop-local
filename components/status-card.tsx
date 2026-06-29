type StatusCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'green' | 'blue' | 'amber' | 'neutral';
};

export function StatusCard({ label, value, detail, tone = 'neutral' }: StatusCardProps) {
  return (
    <article className={`status-card status-card--${tone}`}>
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <span>{detail}</span>
    </article>
  );
}
