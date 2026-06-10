import { errorToast } from "@/components/sonner-toast";
import { Auth_APIs } from "@/services/api/auth";
import type { CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "./useAuthSession";

const useGoogleAuth = () => {
  const { t } = useTranslation();
  const { completeAuth, handleAuthError, parseAuthResponse } = useAuthSession();
  const [loading, setLoading] = useState(false);

  const onGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential || loading) return;

    setLoading(true);
    try {
      const apiResponse = await Auth_APIs.googleLogin({
        token: response.credential,
      });
      const authData = parseAuthResponse(apiResponse.data);
      completeAuth(authData.token, authData.user);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleError = () => {
    errorToast(t("auth.googleSignInFailed"));
  };

  return { onGoogleSuccess, onGoogleError, loading };
};

export default useGoogleAuth;
