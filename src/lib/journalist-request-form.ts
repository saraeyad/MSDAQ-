import { APPLY_COUNTRIES } from "@/constants/countries";
import type { JournalistRequestSchemaType } from "@/schemas/journalist-request-schema";

export function getCountryLabel(
  countryCode: string,
  translate: (key: string) => string,
): string {
  const country = APPLY_COUNTRIES.find((item) => item.value === countryCode);
  return country ? translate(country.labelKey) : countryCode;
}

export function buildJournalistRequestFormData(
  data: JournalistRequestSchemaType,
  translate: (key: string) => string,
): FormData {
  const formData = new FormData();

  formData.append("full_name", data.full_name.trim());
  formData.append("address_city", data.address_city.trim());
  formData.append(
    "address_country",
    getCountryLabel(data.address_country, translate),
  );
  formData.append("affiliation_type", data.affiliation_type);

  if (data.affiliation_type === "affiliated" && data.outlet_name?.trim()) {
    formData.append("outlet_name", data.outlet_name.trim());
  }

  formData.append("id_photo", data.id_photo);

  if (data.journalism_proof) {
    formData.append("journalism_proof", data.journalism_proof);
  }

  return formData;
}
