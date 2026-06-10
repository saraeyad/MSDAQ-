import FormFile from "@/components/form/form-file";
import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import { APPLY_COUNTRIES } from "@/constants/countries";
import i18n from "@/i18n";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useJournalistRequestForm, {
  JOURNALIST_APPLY_TOTAL_STEPS,
} from "../hooks/useJournalistRequestForm";
import JournalistApplySteps from "./journalist-apply-steps";

const STEP_TITLE_KEYS = [
  "journalistRequest.steps.personal",
  "journalistRequest.steps.professional",
  "journalistRequest.steps.documents",
] as const;

export default function JournalistRequestForm() {
  const { t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const {
    form,
    onSubmit,
    loading,
    affiliationType,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    user,
    isPending,
  } = useJournalistRequestForm();

  if (isPending) {
    return null;
  }

  const countryOptions = APPLY_COUNTRIES.map((country) => ({
    LABEL: t(country.labelKey),
    VALUE: country.value,
  }));

  const isLastStep = currentStep === JOURNALIST_APPLY_TOTAL_STEPS;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="journalist-apply-form-card"
      >
        <JournalistApplySteps
          currentStep={currentStep}
          totalSteps={JOURNALIST_APPLY_TOTAL_STEPS}
        />

        <div className="journalist-apply-form-header">
          <p className="text-label-caps text-muted-foreground">
            {t("journalistRequest.stepLabel", {
              current: currentStep,
              total: JOURNALIST_APPLY_TOTAL_STEPS,
            })}
          </p>
          <h3 className="font-headline text-2xl font-semibold text-foreground">
            {t(STEP_TITLE_KEYS[currentStep - 1])}
          </h3>
        </div>

        {currentStep === 1 ? (
          <div className="journalist-apply-form-grid">
            <FormInput
              name="full_name"
              label={t("journalistRequest.fullNamePassport")}
              placeholder={t("journalistRequest.fullNamePlaceholder")}
              required
              columnView
              className="journalist-apply-field md:col-span-2"
            />
            <div className="journalist-apply-readonly-field md:col-span-2">
              <label className="journalist-apply-field-label">
                {t("journalistRequest.professionalEmail")}
              </label>
              <p className="journalist-apply-readonly-value">{user?.email}</p>
            </div>
            <div className="journalist-apply-readonly-field">
              <label className="journalist-apply-field-label">
                {t("journalistRequest.phone")}
              </label>
              <p className="journalist-apply-readonly-value">
                {user?.phone ?? t("journalistRequest.phoneMissing")}
              </p>
            </div>
            <FormSelect
              name="address_country"
              label={t("journalistRequest.residenceCountry")}
              placeholder={t("journalistRequest.selectCountry")}
              required
              columnView
              isStringValue
              options={countryOptions}
              wrapperClassName="journalist-apply-field"
            />
            <FormInput
              name="address_city"
              label={t("journalistRequest.addressCity")}
              placeholder={t("journalistRequest.cityPlaceholder")}
              required
              columnView
              className="journalist-apply-field md:col-span-2"
            />
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="journalist-apply-form-grid">
            <FormSelect
              name="affiliation_type"
              label={t("journalistRequest.affiliationType")}
              placeholder={t("journalistRequest.selectAffiliation")}
              required
              columnView
              isStringValue
              options={[
                { LABEL: t("journalistRequest.independent"), VALUE: "independent" },
                { LABEL: t("journalistRequest.affiliated"), VALUE: "affiliated" },
              ]}
              wrapperClassName="journalist-apply-field md:col-span-2"
            />
            {affiliationType === "affiliated" ? (
              <FormInput
                name="outlet_name"
                label={t("journalistRequest.outletName")}
                placeholder={t("journalistRequest.outletPlaceholder")}
                required
                columnView
                className="journalist-apply-field md:col-span-2"
              />
            ) : (
              <p className="md:col-span-2 text-body-md leading-relaxed text-muted-foreground">
                {t("journalistRequest.independentHint")}
              </p>
            )}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="journalist-apply-form-grid">
            <FormFile
              name="id_photo"
              label={t("journalistRequest.idPhoto")}
              required
              accept="image/*,.pdf,application/pdf"
              columnView
              className="journalist-apply-field md:col-span-2"
            />
            <FormFile
              name="journalism_proof"
              label={t("journalistRequest.journalismProof")}
              accept="image/*,.pdf"
              columnView
              className="journalist-apply-field md:col-span-2"
            />
            <p className="md:col-span-2 text-sm leading-relaxed text-muted-foreground">
              {t("journalistRequest.documentsHint")}
            </p>
          </div>
        ) : null}

        <div className="journalist-apply-form-actions">
          {currentStep > 1 ? (
            <button
              type="button"
              className="journalist-apply-btn-secondary"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              <BackIcon className="size-4" />
              {t("journalistRequest.back")}
            </button>
          ) : (
            <span />
          )}

          {isLastStep ? (
            <button
              type="submit"
              className="journalist-apply-btn-primary"
              disabled={loading}
            >
              {loading ? <Loader className="size-4 animate-spin" /> : null}
              {t("journalistRequest.submit")}
            </button>
          ) : (
            <button
              type="button"
              className="journalist-apply-btn-primary"
              onClick={() => void goToNextStep()}
              disabled={loading}
            >
              {t("journalistRequest.next")}
              <NextIcon className="size-4" />
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
