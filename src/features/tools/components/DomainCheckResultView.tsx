import { Badge } from "@/components/ui/badge";
import { formatDomainDate } from "@/lib/domain-input";
import type { DomainCheckResult, DomainDnsRecord } from "@/types";
import {
  Calendar,
  Globe,
  Lock,
  Server,
  Shield,
  TrendingUp,
} from "lucide-react";

function groupDnsRecords(records: DomainDnsRecord[] | undefined) {
  if (!records?.length) return [];
  const groups = new Map<string, DomainDnsRecord[]>();
  for (const record of records) {
    const list = groups.get(record.type) ?? [];
    list.push(record);
    groups.set(record.type, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function expiryTone(days: number | null | undefined): "ok" | "warn" | "danger" {
  if (days == null) return "ok";
  if (days <= 14) return "danger";
  if (days <= 45) return "warn";
  return "ok";
}

export function DomainCheckResultView({ result }: { result: DomainCheckResult }) {
  const dnsGroups = groupDnsRecords(result.dns_records);
  const categories = Object.entries(result.categories ?? {});
  const ranks = Object.entries(result.popularity_ranks ?? {}).sort(
    ([, a], [, b]) => a - b,
  );
  const expiry = expiryTone(result.days_until_expiry);

  return (
    <div className="domain-check-result">
      <header className="domain-check-result__hero">
        <div className="domain-check-result__hero-main">
          <span className="domain-check-result__icon">
            <Globe className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="domain-check-result__domain" dir="ltr">
              {result.domain}
            </p>
            {result.tld ? (
              <p className="domain-check-result__tld">.{result.tld}</p>
            ) : null}
          </div>
        </div>
        <div className="domain-check-result__badges">
          <Badge
            variant={result.is_available ? "secondary" : "default"}
            className={
              result.is_available
                ? "domain-check-result__status domain-check-result__status--available"
                : "domain-check-result__status"
            }
          >
            {result.is_available ? "متاح للتسجيل" : "مسجّل"}
          </Badge>
          {result.cached ? (
            <Badge variant="outline">من الذاكرة المؤقتة</Badge>
          ) : null}
        </div>
      </header>

      {!result.is_available ? (
        <>
          <section className="domain-check-result__grid">
            {result.reputation != null ? (
              <div className="domain-check-result__stat">
                <Shield className="size-4 text-primary" />
                <span className="domain-check-result__stat-label">السمعة</span>
                <strong className="domain-check-result__stat-value">
                  {result.reputation}
                </strong>
              </div>
            ) : null}
            {result.days_until_expiry != null ? (
              <div
                className={`domain-check-result__stat domain-check-result__stat--${expiry}`}
              >
                <Calendar className="size-4" />
                <span className="domain-check-result__stat-label">
                  متبقٍ للانتهاء
                </span>
                <strong className="domain-check-result__stat-value">
                  {result.days_until_expiry} يوم
                </strong>
              </div>
            ) : null}
            {result.registrar ? (
              <div className="domain-check-result__stat">
                <span className="domain-check-result__stat-label">
                  جهة التسجيل
                </span>
                <strong className="domain-check-result__stat-value domain-check-result__stat-value--text">
                  {result.registrar}
                </strong>
              </div>
            ) : null}
          </section>

          <section className="domain-check-result__panel">
            <h3 className="domain-check-result__panel-title">تواريخ النطاق</h3>
            <dl className="domain-check-result__facts">
              <div>
                <dt>تاريخ التسجيل</dt>
                <dd>{formatDomainDate(result.registered_at)}</dd>
              </div>
              <div>
                <dt>تاريخ الانتهاء</dt>
                <dd>{formatDomainDate(result.expires_at)}</dd>
              </div>
              <div>
                <dt>آخر تحديث WHOIS</dt>
                <dd>{formatDomainDate(result.updated_at)}</dd>
              </div>
              {result.last_analysis_date ? (
                <div>
                  <dt>آخر تحليل أمني</dt>
                  <dd>{formatDomainDate(result.last_analysis_date)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {result.security ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                <Shield className="size-4" />
                التحليل الأمني
              </h3>
              <div className="domain-check-result__security">
                <span className="domain-check-result__security-chip domain-check-result__security-chip--harmless">
                  آمن {result.security.harmless}
                </span>
                <span className="domain-check-result__security-chip domain-check-result__security-chip--undetected">
                  غير مكتشف {result.security.undetected}
                </span>
                <span className="domain-check-result__security-chip domain-check-result__security-chip--suspicious">
                  مشبوه {result.security.suspicious}
                </span>
                <span className="domain-check-result__security-chip domain-check-result__security-chip--malicious">
                  خبيث {result.security.malicious}
                </span>
              </div>
              {result.votes ? (
                <p className="domain-check-result__votes">
                  تصويت المجتمع: {result.votes.harmless} آمن ·{" "}
                  {result.votes.malicious} خبيث
                </p>
              ) : null}
            </section>
          ) : null}

          {result.ssl?.issuer || result.ssl?.expires_at ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                <Lock className="size-4" />
                شهادة SSL
              </h3>
              <dl className="domain-check-result__facts">
                {result.ssl.issuer ? (
                  <div>
                    <dt>الجهة المصدرة</dt>
                    <dd>{result.ssl.issuer}</dd>
                  </div>
                ) : null}
                {result.ssl.expires_at ? (
                  <div>
                    <dt>انتهاء الشهادة</dt>
                    <dd>{formatDomainDate(result.ssl.expires_at)}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {categories.length > 0 ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                تصنيفات المصادر
              </h3>
              <div className="domain-check-result__categories">
                {categories.map(([vendor, label]) => (
                  <div key={vendor} className="domain-check-result__category">
                    <span className="domain-check-result__category-vendor">
                      {vendor}
                    </span>
                    <span className="domain-check-result__category-label">
                      {label.trim()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {ranks.length > 0 ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                <TrendingUp className="size-4" />
                شعبية النطاق
              </h3>
              <div className="domain-check-result__ranks">
                {ranks.map(([source, rank]) => (
                  <div key={source} className="domain-check-result__rank">
                    <span>{source}</span>
                    <strong dir="ltr">#{rank}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {result.name_servers && result.name_servers.length > 0 ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                <Server className="size-4" />
                خوادم الأسماء
              </h3>
              <ul className="domain-check-result__list">
                {result.name_servers.map((ns) => (
                  <li key={ns} dir="ltr">
                    {ns}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {dnsGroups.length > 0 ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">
                <Server className="size-4" />
                سجلات DNS
              </h3>
              <div className="domain-check-result__dns">
                {dnsGroups.map(([type, records]) => (
                  <div key={type} className="domain-check-result__dns-group">
                    <p className="domain-check-result__dns-type">{type}</p>
                    <ul className="domain-check-result__list">
                      {records.map((record, index) => (
                        <li key={`${type}-${index}`}>
                          <span dir="ltr">{record.value}</span>
                          {record.ttl != null ? (
                            <span className="domain-check-result__ttl">
                              TTL {record.ttl}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {result.tags && result.tags.length > 0 ? (
            <section className="domain-check-result__panel">
              <h3 className="domain-check-result__panel-title">وسوم</h3>
              <div className="domain-check-result__tags">
                {result.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <p className="domain-check-result__available-note">
          هذا النطاق يبدو متاحاً للتسجيل حسب بيانات WHOIS الحالية.
        </p>
      )}
    </div>
  );
}
