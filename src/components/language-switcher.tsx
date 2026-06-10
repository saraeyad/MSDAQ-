import cookies from "js-cookie";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import i18n from "../i18n";
import Tooltip from "./tooltip";
import { Button } from "./ui/button";

const LanguageSwitcher = () => {
  const currentLang = cookies.get("i18next") || "ar";
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang);

  useEffect(() => {
    document.dir = i18n.dir(selectedLanguage);
  }, [selectedLanguage]);

  const toggleLanguage = () => {
    const newLanguage = selectedLanguage === "en" ? "ar" : "en";
    cookies.set("i18next", newLanguage);
    setSelectedLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    window.location.reload();
  };

  const tooltipText =
    selectedLanguage === "en" ? "التبديل إلى العربية" : "Switch to English";

  return (
    <Tooltip title={tooltipText}>
      <Button
        onClick={toggleLanguage}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-secondary"
        aria-label="Toggle language"
      >
        <Globe className="size-4" />
      </Button>
    </Tooltip>
  );
};

export default LanguageSwitcher;
