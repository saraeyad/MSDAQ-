/** Quick sanity checks for API envelope helpers (no React). */

function isApiSuccessful(body) {
  if (typeof body.success === "boolean") return body.success;
  if (typeof body.error === "boolean") return !body.error;
  return false;
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

const envelopeCases = [
  { name: "success true", body: { success: true, data: { id: 1 } }, ok: true },
  { name: "success false", body: { success: false, data: null }, ok: false },
  { name: "legacy error false", body: { error: false, data: { id: 1 } }, ok: true },
  { name: "legacy error true", body: { error: true, data: null }, ok: false },
];

let failed = 0;
for (const test of envelopeCases) {
  const ok = isApiSuccessful(test.body) === test.ok;
  if (!ok) {
    failed += 1;
    console.error("FAIL envelope", test.name);
  } else {
    console.log("OK envelope", test.name);
  }
}

const listCases = [
  { name: "array", input: [{ id: 1 }], expect: 1 },
  {
    name: "paginated",
    input: { data: [{ id: 1 }, { id: 2 }], meta: {} },
    expect: 2,
  },
  { name: "null", input: null, expect: 0 },
];

for (const test of listCases) {
  const result = unwrapList(test.input);
  const ok = Array.isArray(result) && result.length === test.expect;
  if (!ok) {
    failed += 1;
    console.error("FAIL list", test.name, result);
  } else {
    console.log("OK list", test.name);
  }
}

if (failed) {
  process.exit(1);
}

console.log("smoke-api-data: all passed");
