import i18n from "@/i18n";

const useDir = () => {
  const isRTL = i18n.dir() === "rtl";
  return { isRTL };
};

export default useDir;
