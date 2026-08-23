import { memo } from 'react';
import type { YieldScenario } from '../types/bond';
import { formatCurrency, formatPercent } from '../utils/format';

interface Props { scenarios: YieldScenario[]; }

export const YieldCurveChart = memo(function YieldCurveChart({ scenarios }: Props) {
  const width = 720;
  const height = 270;
  const padding = 34;
  const prices = scenarios.map((item) => item.estimatedPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = Math.max(max - min, 1);
  const points = scenarios.map((item, index) => ({
    ...item,
    x: padding + index * ((width - padding * 2) / (scenarios.length - 1)),
    y: height - padding - ((item.estimatedPrice - min) / range) * (height - padding * 2),
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');

  return <section className="analytics-card curve-card">
    <div className="analytics-heading"><div><span className="panel-kicker">Interest-rate sensitivity</span><h2>Price–yield curve</h2></div><span>±200 bps</span></div>
    <div className="chart-wrap" role="img" aria-label="Bond price falls as yield rises">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#62d5b2" stopOpacity=".28"/><stop offset="1" stopColor="#62d5b2" stopOpacity="0"/></linearGradient></defs>
        {[0, 1, 2, 3].map((line) => <line key={line} x1={padding} x2={width-padding} y1={padding + line * 60} y2={padding + line * 60} className="chart-grid" />)}
        <path d={`${path} L ${points.at(-1)?.x} ${height-padding} L ${padding} ${height-padding} Z`} className="chart-area" />
        <path d={path} className="chart-line" />
        {points.map((point) => <circle key={point.basisPoints} cx={point.x} cy={point.y} r={point.basisPoints === 0 ? 6 : 4} className={point.basisPoints === 0 ? 'chart-point chart-point--current' : 'chart-point'} />)}
      </svg>
      <div className="chart-labels">{points.map((point) => <span key={point.basisPoints}><b>{formatPercent(point.yield, 2)}</b><small>{formatCurrency(point.estimatedPrice)}</small></span>)}</div>
    </div>
  </section>;
});
