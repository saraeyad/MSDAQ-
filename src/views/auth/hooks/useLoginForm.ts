import { Auth_APIs } from "@/services/api/auth";
import { loginSchema, type LoginSchemaType } from "@/schemas/auth-schema";
import { getAuthErrorMessage } from "@/services/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "./useAuthSession";

const useLoginForm = () => {
  const { t } = useTranslation();
  const { completeAuth, handleAuthError, parseAuthResponse } = useAuthSession();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loginForm = useForm<LoginSchemaType>({
    mode: "onSubmit",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    if (loading) return;

    setLoading(true);
    setApiError(null);
    try {
      const response = await Auth_APIs.login(data);
      const authData = parseAuthResponse(response.data);
      completeAuth(authData.token, authData.user);
    } catch (error) {
      const message = getAuthErrorMessage(error, t, t("auth.authenticationError"));
      setApiError(message);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loginForm, onSubmit, loading, apiError };
};

export default useLoginForm;
