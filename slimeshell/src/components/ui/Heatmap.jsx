const INTENSITY_COLORS = [
  '#0F1520',
  '#0C3628',
  '#065F46',
  '#34D399',
  '#6EE7B7',
]

export default function Heatmap({ data = {}, className = '' }) {
  const today = new Date()
  const weeks = 52
  const days = 7

  const getColor = (count) => {
    if (!count) return INTENSITY_COLORS[0]
    if (count <= 2) return INTENSITY_COLORS[1]
    if (count <= 5) return INTENSITY_COLORS[2]
    if (count <= 10) return INTENSITY_COLORS[3]
    return INTENSITY_COLORS[4]
  }

  const cells = []
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < days; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const key = date.toISOString().split('T')[0]
      cells.push({ key, count: data[key] || 0, week: weeks - 1 - w, day: d })
    }
  }

  const totalActive = Object.values(data).filter((v) => v > 0).length

  return (
    <div className={className}>
      <div className="flex gap-[3px]">
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: days }, (_, d) => {
              const cell = cells.find((c) => c.week === w && c.day === d)
              return (
                <div
                  key={d}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: getColor(cell?.count || 0) }}
                  title={cell ? `${cell.key}: ${cell.count} activities` : ''}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-[11px] text-text-dim">{totalActive} active days in {today.getFullYear()}</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-text-faint">Less</span>
          {INTENSITY_COLORS.map((color, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: color }} aria-hidden="true" />
          ))}
          <span className="font-mono text-[10px] text-text-faint">More</span>
        </div>
      </div>
    </div>
  )
}
