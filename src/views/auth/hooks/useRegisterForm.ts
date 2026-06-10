import { errorToast, successToast } from "@/components/sonner-toast";
import { useAuth } from "@/context/auth";
import { getRedirectFromSearch } from "@/lib/auth-redirect";
import { ROUTES } from "@/router/routes";
import { registerSchema, type RegisterSchemaType } from "@/schemas/auth-schema";
import { Auth_APIs } from "@/services/api/auth";
import { getAuthErrorMessage, parseAuthResponse } from "@/services/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

const useRegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const registerForm = useForm<RegisterSchemaType>({
    mode: "onSubmit",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await Auth_APIs.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone,
      });

      const authData = parseAuthResponse(response.data);
      saveAuth(authData.token, authData.user);
      successToast(t("auth.registerSuccess"));

      const redirect = getRedirectFromSearch(searchParams.toString());
      navigate(redirect ?? ROUTES.HOME);
    } catch (error) {
      const message = getAuthErrorMessage(error, t, t("auth.registerError"));
      errorToast(message);

      if (message === t("auth.emailAlreadyTaken")) {
        registerForm.setError("email", { message });
      }
    } finally {
      setLoading(false);
    }
  };

  return { registerForm, onSubmit, loading };
};

export default useRegisterForm;
