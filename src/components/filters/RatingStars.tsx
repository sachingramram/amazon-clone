export default function RatingStars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    if (i < full) return "★";
    if (i === full && half) return "☆"; // simple look; can customize half-star if needed
    return "☆";
  });
  return <span className="text-yellow-500">{stars.join("")}</span>;
}
