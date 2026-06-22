export function FeedbackLoop() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md"
    >
      {/* Background rings */}
      <circle cx="200" cy="150" r="120" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
      <circle cx="200" cy="150" r="90" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      <circle cx="200" cy="150" r="60" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="200" cy="150" r="30" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

      {/* Center dot */}
      <circle cx="200" cy="150" r="4" fill="currentColor" fillOpacity="0.6" />

      {/* Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 200 + 120 * Math.cos(rad);
        const y2 = 150 + 120 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1="200"
            y1="150"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        );
      })}

      {/* Strength areas (filled polygons) */}
      <polygon
        points="200,150 260,110 290,150 260,190"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <polygon
        points="200,150 140,110 110,150"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />

      {/* Weakness marker */}
      <circle cx="140" cy="190" r="6" fill="currentColor" fillOpacity="0.25" />
      <circle cx="140" cy="190" r="3" fill="currentColor" fillOpacity="0.6" />

      {/* Data point markers on strength area */}
      <circle cx="260" cy="110" r="3.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="290" cy="150" r="3.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="260" cy="190" r="3.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="140" cy="110" r="3.5" fill="currentColor" fillOpacity="0.35" />
      <circle cx="110" cy="150" r="3.5" fill="currentColor" fillOpacity="0.35" />

      {/* Labels */}
      <text x="200" y="30" textAnchor="middle" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Combinatorics
      </text>
      <text x="340" y="100" textAnchor="start" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Probability
      </text>
      <text x="340" y="210" textAnchor="start" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Distributions
      </text>
      <text x="200" y="285" textAnchor="middle" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Expectation
      </text>
      <text x="55" y="210" textAnchor="end" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Inequalities
      </text>
      <text x="55" y="100" textAnchor="end" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
        Variance
      </text>

      {/* Feedback loop arrows */}
      <path
        d="M 320 80 Q 350 150 320 220"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
        markerEnd="url(#arrowhead)"
      />

      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="currentColor" fillOpacity="0.3" />
        </marker>
      </defs>

      {/* Central label */}
      <text x="200" y="154" textAnchor="middle" className="text-[9px] font-medium" fill="currentColor" fillOpacity="0.7">
        You are here
      </text>
    </svg>
  );
}
