export function ConceptGraph() {
  const nodes = [
    { id: "a", x: 80, y: 50, label: "Joint\nPMF", strength: 0.7 },
    { id: "b", x: 200, y: 35, label: "Marginal", strength: 0.9 },
    { id: "c", x: 320, y: 50, label: "Conditional", strength: 0.4 },
    { id: "d", x: 140, y: 110, label: "Covariance", strength: 0.85 },
    { id: "e", x: 260, y: 110, label: "Correlation", strength: 0.6 },
    { id: "f", x: 80, y: 170, label: "Tower\nProperty", strength: 0.3 },
    { id: "g", x: 200, y: 170, label: "Total\nVariance", strength: 0.5 },
    { id: "h", x: 320, y: 170, label: "Independence", strength: 0.8 },
  ];

  const edges = [
    ["a", "b"], ["a", "c"], ["b", "d"], ["c", "e"],
    ["d", "e"], ["c", "f"], ["f", "g"], ["h", "b"], ["h", "c"],
  ];

  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md"
    >
      {/* Edges */}
      {edges.map(([from, to], i) => {
        const a = nodes.find((n) => n.id === from)!;
        const b = nodes.find((n) => n.id === to)!;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.strength > 0.7 ? 18 : n.strength > 0.5 ? 14 : 12}
            fill="currentColor"
            fillOpacity={n.strength > 0.7 ? 0.12 : n.strength > 0.5 ? 0.08 : 0.06}
            stroke="currentColor"
            strokeOpacity={n.strength > 0.7 ? 0.5 : n.strength > 0.5 ? 0.35 : 0.25}
            strokeWidth="1.5"
          />
          {/* Weakness halo for low-strength nodes */}
          {n.strength < 0.5 && (
            <circle
              cx={n.x}
              cy={n.y}
              r={n.strength > 0.7 ? 22 : n.strength > 0.5 ? 18 : 16}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
            />
          )}
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className="text-[8px] font-medium"
            fill="currentColor"
            fillOpacity={n.strength > 0.5 ? 0.65 : 0.45}
          >
            {n.label.split("\n").map((line, i) => (
              <tspan key={i} x={n.x} dy={i === 0 ? 0 : 10}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(280, 195)">
        <circle cx="0" cy="0" r="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        <text x="10" y="3" className="text-[8px]" fill="currentColor" fillOpacity="0.45">Strong</text>
        <circle cx="50" cy="0" r="5" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 1" />
        <text x="60" y="3" className="text-[8px]" fill="currentColor" fillOpacity="0.45">Weak</text>
      </g>
    </svg>
  );
}
