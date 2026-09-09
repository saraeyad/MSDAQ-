import { formatCount } from "./analytics-mappers";
import type { AnalyticsPageRow } from "./analytics-mappers";
import type { HorizontalBarChartItem } from "@/features/admin/dashboard/components/HorizontalBarChartCard";
import { chartColor } from "@/features/admin/dashboard/components/chart-colors";
import type { ReactNode } from "react";

type DeviceKind = "phone" | "tablet" | "desktop";

function deviceKind(name: string): DeviceKind {
  const key = name.trim().toLowerCase();
  if (
    key.includes("جوال") ||
    key.includes("هاتف") ||
    key.includes("mobile") ||
    key.includes("phone")
  ) {
    return "phone";
  }
  if (key.includes("لوحي") || key.includes("tablet") || key.includes("ipad")) {
    return "tablet";
  }
  return "desktop";
}

function DevicePicture({ kind }: { kind: DeviceKind }) {
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 72 96" className="analytics-device-pic" aria-hidden>
        <rect x="16" y="4" width="40" height="88" rx="8" fill="#1a1a1a" />
        <rect x="19" y="10" width="34" height="70" rx="3" fill="#dbe7f3" />
        <circle cx="36" cy="87" r="3.2" fill="#8a8d91" />
        <rect x="31" y="7" width="10" height="2" rx="1" fill="#3a3a3a" />
      </svg>
    );
  }

  if (kind === "tablet") {
    return (
      <svg viewBox="0 0 92 72" className="analytics-device-pic" aria-hidden>
        <rect x="6" y="4" width="80" height="64" rx="8" fill="#1a1a1a" />
        <rect x="11" y="9" width="70" height="50" rx="3" fill="#dbe7f3" />
        <circle cx="46" cy="64.5" r="2.4" fill="#8a8d91" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 110 84" className="analytics-device-pic" aria-hidden>
      <rect x="8" y="6" width="94" height="58" rx="6" fill="#1a1a1a" />
      <rect x="13" y="11" width="84" height="46" rx="2.5" fill="#dbe7f3" />
      <path d="M36 70h38l8 8H28z" fill="#c5c8cc" />
      <rect x="22" y="78" width="66" height="4" rx="2" fill="#8a8d91" />
    </svg>
  );
}

const DONUT_C = 2 * Math.PI * 52;
const DONUT_GAP = 4;

function sourceLabel(name: string): string {
  const key = name.trim().toLowerCase();
  if (key === "google" || key.includes("google.")) return "جوجل";
  if (key.includes("facebook")) return "فيسبوك";
  if (key.includes("instagram")) return "إنستغرام";
  if (key === "t.me" || key.includes("telegram")) return "تيليجرام";
  if (key === "direct" || key === "مباشر") return "مباشر";
  return name;
}

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="analytics-card">
      <h2 className="analytics-card__title">{title}</h2>
      <p className="analytics-card__note">{note}</p>
      {children}
    </section>
  );
}

function niceCeiling(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude >= 100 ? magnitude / 2 : magnitude;
  return Math.ceil(value / step) * step;
}

export function AnalyticsArticleRanks({ rows }: { rows: AnalyticsPageRow[] }) {
  const chartRows = rows.slice(0, 6);
  const maxValue = Math.max(...chartRows.map((row) => row.views), 1);

  return (
    <Card title="أكثر المقالات زيارة" note="مشاهدات كل مقال اليوم">
      {chartRows.length === 0 ? (
        <p className="analytics-empty">
          لا زيارات لصفحات مقالات اليوم. يظهر هنا مسار مثل /articles/…
        </p>
      ) : (
        <ol className="analytics-ranks">
          {chartRows.map((row, index) => {
            const pct = Math.max(8, (row.views / maxValue) * 100);
            return (
              <li key={`${row.path}-${row.label}`} className="analytics-rank">
                <span className="analytics-rank__n">{formatCount(index + 1)}</span>
                <div className="analytics-rank__body">
                  <span className="analytics-rank__title" title={row.label}>
                    {row.label}
                  </span>
                  <div className="analytics-rank__track" aria-hidden>
                    <div
                      className="analytics-rank__fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="analytics-rank__views">
                  {formatCount(row.views)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export function AnalyticsSkyline({ rows }: { rows: AnalyticsPageRow[] }) {
  const chartRows = rows.slice(0, 6);
  const maxValue = niceCeiling(Math.max(...chartRows.map((row) => row.views), 0));
  const ticks = [0, 1, 2, 3, 4].map((step) => Math.round((maxValue * step) / 4));

  return (
    <Card title="الصفحات والشاشات" note="الأكثر قراءة اليوم">
      {chartRows.length === 0 ? (
        <p className="analytics-empty">لا بيانات بعد.</p>
      ) : (
        <div className="admin-vbar-chart" dir="ltr">
          <div className="admin-vbar-chart__y-axis" aria-hidden>
            {[...ticks].reverse().map((tick) => (
              <span key={tick} className="admin-vbar-chart__tick">
                {tick}
              </span>
            ))}
          </div>
          <div className="admin-vbar-chart__plot">
            <div className="admin-vbar-chart__grid" aria-hidden>
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className="admin-vbar-chart__gridline"
                  style={{ bottom: `${(tick / maxValue) * 100}%` }}
                />
              ))}
            </div>
            <div className="admin-vbar-chart__bars">
              {chartRows.map((row, index) => {
                const height = Math.max(
                  row.views > 0 ? 4 : 0,
                  (row.views / maxValue) * 100,
                );
                const color = chartColor(index);
                return (
                  <div key={`${row.path}-${row.label}`} className="admin-vbar-chart__column">
                    <span className="admin-vbar-chart__value">
                      {formatCount(row.views)}
                    </span>
                    <div className="admin-vbar-chart__track">
                      <div
                        className="admin-vbar-chart__fill"
                        style={{
                          height: `${height}%`,
                          background: `linear-gradient(180deg, color-mix(in srgb, ${color} 75%, white), ${color})`,
                        }}
                      />
                    </div>
                    <span className="admin-vbar-chart__label">
                      <span className="admin-vbar-chart__clip">{row.label}</span>
                      <span className="admin-vbar-chart__tip" role="tooltip">
                        {row.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function AnalyticsReferrerDonut({
  items,
}: {
  items: HorizontalBarChartItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <Card title="مصادر الزيارات" note="حسب عدد الجلسات">
      {items.length === 0 ? (
        <p className="analytics-empty">لا بيانات بعد.</p>
      ) : (
        <div className="analytics-donut">
          <div className="analytics-donut__center">
            <svg width="168" height="168" viewBox="0 0 168 168">
              <circle cx="84" cy="84" r="64" fill="#f6f7f8" />
              <g transform="rotate(-90 84 84)">
                <circle
                  cx="84"
                  cy="84"
                  r="52"
                  fill="none"
                  stroke="#eef0f3"
                  strokeWidth="18"
                />
                {items.map((item, index) => {
                  const raw = total > 0 ? (item.value / total) * DONUT_C : 0;
                  const dash = Math.max(0, raw - DONUT_GAP);
                  const circle = (
                    <circle
                      key={item.name}
                      cx="84"
                      cy="84"
                      r="52"
                      fill="none"
                      stroke={chartColor(index)}
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${DONUT_C - dash}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += raw;
                  return circle;
                })}
              </g>
            </svg>
            <div className="analytics-donut__total">
              <span className="analytics-donut__n">{formatCount(total)}</span>
              <span className="analytics-donut__t">جلسة</span>
            </div>
          </div>
          <div className="analytics-legend">
            {items.map((item, index) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const color = chartColor(index);
              return (
                <div key={item.name} className="analytics-legend__item">
                  <span
                    className="analytics-legend__sw"
                    style={{ background: color }}
                  />
                  <div className="analytics-legend__meta">
                    <div className="analytics-legend__row">
                      <span className="analytics-legend__name">
                        {sourceLabel(item.name)}
                      </span>
                      <span className="analytics-legend__num">
                        {formatCount(item.value)}
                      </span>
                    </div>
                    <div className="analytics-legend__track">
                      <div
                        className="analytics-legend__fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                  <span className="analytics-legend__pct">{pct}٪</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

export function AnalyticsDeviceBubbles({
  items,
}: {
  items: HorizontalBarChartItem[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card title="الأجهزة" note="كيف يتصفحون">
      {items.length === 0 ? (
        <p className="analytics-empty">لا بيانات بعد.</p>
      ) : (
        <div className="analytics-devices">
          {items.map((item) => {
            const kind = deviceKind(item.name);
            const scale = 0.82 + (item.value / max) * 0.28;
            return (
              <div key={item.name} className="analytics-device">
                <div
                  className="analytics-device__art"
                  data-kind={kind}
                  style={{ transform: `scale(${scale})` }}
                >
                  <DevicePicture kind={kind} />
                </div>
                <span className="analytics-device__n">{formatCount(item.value)}</span>
                <span className="analytics-device__lbl">{item.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function AnalyticsCountryLollipops({
  items,
}: {
  items: HorizontalBarChartItem[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card title="الدول" note="من أين هم">
      {items.length === 0 ? (
        <p className="analytics-empty">لا بيانات بعد.</p>
      ) : (
        <div className="analytics-lollipops">
          {items.map((item) => {
            const pct = (item.value / max) * 100;
            const dot = 6 + (item.value / max) * 5;
            return (
              <div key={item.name} className="analytics-lolli">
                <span className="analytics-lolli__name">{item.name}</span>
                <div className="analytics-lolli__track">
                  <div className="analytics-lolli__fill" style={{ width: `${pct}%` }} />
                  <div
                    className="analytics-lolli__dot"
                    style={{
                      right: `${pct}%`,
                      width: dot,
                      height: dot,
                    }}
                  />
                </div>
                <span className="analytics-lolli__num">{formatCount(item.value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

