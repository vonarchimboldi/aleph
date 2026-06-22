export function ReviewCycle() {
  const cx = 200;
  const cy = 100;
  const r = 70;

  const days = [
    { angle: 0, label: "Day 1", type: "new" },
    { angle: 51, label: "Day 3", type: "review" },
    { angle: 103, label: "Day 6", type: "new" },
    { angle: 154, label: "Day 9", type: "review" },
    { angle: 206, label: "Day 12", type: "new" },
    { angle: 257, label: "Day 15", type: "adaptive" },
    { angle: 309, label: "Day 18", type: "new" },
  ];

  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md"
    >
      {/* Cycle ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.02"
      />

      {/* Direction arrow */}
      <path
        d={`M ${cx + r + 5} ${cy - 5} A ${r + 5} ${r + 5} 0 0 1 ${cx + r + 5} ${cy + 5}`}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
        markerEnd="url(#cycleArrow)"
      />

      <defs>
        <marker id="cycleArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="currentColor" fillOpacity="0.25" />
        </marker>
      </defs>

      {/* Day markers */}
      {days.map((d) => {
        const rad = ((d.angle - 90) * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const isAdaptive = d.type === "adaptive";
        const isReview = d.type === "review";

        return (
          <g key={d.label}>
            <circle
              cx={x}
              cy={y}
              r={isAdaptive ? 10 : 7}
              fill={isAdaptive ? "currentColor" : "none"}
              fillOpacity={isAdaptive ? 0.15 : 0}
              stroke="currentColor"
              strokeOpacity={isAdaptive ? 0.6 : isReview ? 0.35 : 0.25}
              strokeWidth={isAdaptive ? 2 : 1.5}
              strokeDasharray={isReview ? "3 2" : undefined}
            />
            <text
              x={x}
              y={y + (isAdaptive ? 4 : 3)}
              textAnchor="middle"
              className="text-[7px] font-medium"
              fill="currentColor"
              fillOpacity={isAdaptive ? 0.7 : 0.5}
            >
              {d.label.replace("Day ", "")}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        className="text-[9px] font-semibold"
        fill="currentColor"
        fillOpacity="0.55"
      >
        15-day
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        className="text-[9px]"
        fill="currentColor"
        fillOpacity="0.45"
      >
        adaptive cycle
      </text>

      {/* Legend */}
      <g transform="translate(20, 190)">
        <circle cx="0" cy="0" r="5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
        <text x="10" y="3" className="text-[8px]" fill="currentColor" fillOpacity="0.4">New material</text>
        
        <circle cx="80" cy="0" r="5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        <text x="90" y="3" className="text-[8px]" fill="currentColor" fillOpacity="0.4">Review</text>
        
        <circle cx="150" cy="0" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
        <text x="162" y="3" className="text-[8px]" fill="currentColor" fillOpacity="0.4">Adaptive quiz</text>
      </g>
    </svg>
  );
}
