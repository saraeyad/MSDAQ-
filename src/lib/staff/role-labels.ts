/** Built-in role purposes from the صبارة بوست API collection. */
export const ROLE_PURPOSES: Record<string, string> = {
  "super-admin":
    "صلاحيات كاملة — يتجاوز فحص الملكية ويدير المستخدمين والأدوار",
  admin: "نفس مجموعة صلاحيات المدير العام (إدارة تشغيلية)",
  journalist:
    "إنشاء المقالات وتحريرها ونشرها وجدولتها + جميع أدوات الذكاء الاصطناعي",
  "copy-editor": "تحرير نصوص المقالات وأدوات اللغة — بدون نشر",
  "fact-checker":
    "فحص المصداقية والصور وإدارة المصادر — بدون كتابة",
};

export function rolePurpose(name: string): string | undefined {
  return ROLE_PURPOSES[name];
}
