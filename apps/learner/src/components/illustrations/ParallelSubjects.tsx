export function ParallelSubjects() {
  return (
    <svg
      viewBox="0 0 520 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg"
    >
      {/* Track backgrounds */}
      {[0, 1, 2].map((i) => (
        <rect
          key={`track-${i}`}
          x="20"
          y={35 + i * 55}
          width="480"
          height="36"
          rx="6"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.02"
        />
      ))}

      {/* Progress fills */}
      <rect x="20" y="35" width="340" height="36" rx="6" fill="currentColor" fillOpacity="0.08" />
      <rect x="20" y="90" width="220" height="36" rx="6" fill="currentColor" fillOpacity="0.06" />
      <rect x="20" y="145" width="120" height="36" rx="6" fill="currentColor" fillOpacity="0.05" />

      {/* Chapter markers */}
      {[
        { y: 35, chapters: 10, fill: 0.12 },
        { y: 90, chapters: 4, fill: 0.1 },
        { y: 145, chapters: 3, fill: 0.08 },
      ].map((track, ti) =>
        Array.from({ length: track.chapters }).map((_, ci) => {
          const x = 35 + ci * ((460 - 35) / (track.chapters > 1 ? track.chapters - 1 : 1));
          const done = ci < (ti === 0 ? 7 : ti === 1 ? 2 : 1);
          return (
            <circle
              key={`${ti}-${ci}`}
              cx={track.chapters === 1 ? 250 : x}
              cy={track.y + 18}
              r={done ? 5 : 4}
              fill={done ? "currentColor" : "none"}
              fillOpacity={done ? 0.5 : 0}
              stroke="currentColor"
              strokeOpacity={done ? 0.7 : 0.2}
              strokeWidth={done ? 1.5 : 1}
            />
          );
        })
      )}

      {/* Labels */}
      <text x="15" y="25" textAnchor="end" className="text-[10px] font-medium" fill="currentColor" fillOpacity="0.6">
        Probability
      </text>
      <text x="15" y="80" textAnchor="end" className="text-[10px] font-medium" fill="currentColor" fillOpacity="0.6">
        Linear Algebra
      </text>
      <text x="15" y="135" textAnchor="end" className="text-[10px] font-medium" fill="currentColor" fillOpacity="0.6">
        Calculus
      </text>

      {/* Progress text */}
      <text x="370" y="57" className="text-[9px]" fill="currentColor" fillOpacity="0.45">
        Ch. 7 of 10
      </text>
      <text x="250" y="112" className="text-[9px]" fill="currentColor" fillOpacity="0.45">
        Ch. 2 of 4
      </text>
      <text x="150" y="167" className="text-[9px]" fill="currentColor" fillOpacity="0.45">
        Ch. 1 of 3
      </text>

      {/* Lock icon on Calculus */}
      <rect x="420" y="152" width="12" height="10" rx="2" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" fill="none" />
      <circle cx="426" cy="152" r="2.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" fill="none" />

      {/* Parallel arrows */}
      <path d="M 260 10 Q 280 10 280 25" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <path d="M 260 10 Q 280 10 280 80" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <path d="M 260 10 Q 280 10 280 135" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <text x="260" y="8" textAnchor="middle" className="text-[9px]" fill="currentColor" fillOpacity="0.35">
        studied in parallel
      </text>
    </svg>
  );
}
