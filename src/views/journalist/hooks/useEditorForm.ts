import { errorToast, successToast } from "@/components/sonner-toast";
import {
  journalistEditorSchema,
  type JournalistEditorSchemaType,
} from "@/schemas/journalist-editor-schema";
import JournalistArticles_APIs from "@/services/api/journalist-articles";
import { getApiErrorMessage } from "@/services/types/auth";
import {
  buildAddSourcePayload,
  computePublishReadiness,
  isHumanSource,
  mergeArticleSources,
  PUBLISH_TRUST_THRESHOLD,
} from "@/services/types/journalist-articles";
import type {
  JournalistArticleSource,
  JournalistArticleStatus,
  SourceConsentStatus,
  StandardsCheckResult,
} from "@/types/journalist-article";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import {
  getPersistedSources,
  persistSources,
} from "@/lib/journalist-sources-cache";
import useJournalistNotifications from "./useJournalistNotifications";

function parseTagsInput(tags?: string): string[] {
  if (!tags?.trim()) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function useEditorForm(articleId?: number) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkResult, setCheckResult] = useState<StandardsCheckResult | null>(null);
  const [savedArticleId, setSavedArticleId] = useState<number | undefined>(articleId);
  const [sources, setSources] = useState<JournalistArticleSource[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [articleStatus, setArticleStatus] = useState<JournalistArticleStatus>("draft");
  const [publishedAt, setPublishedAt] = useState<string | undefined>();
  const hydratedArticleIdRef = useRef<number | null>(null);
  const pendingCoverFileRef = useRef<File | null>(null);
  const currentCoverPreviewRef = useRef<string | null>(null);

  const form = useForm<JournalistEditorSchemaType>({
    resolver: zodResolver(journalistEditorSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
      coverImage: null,
    },
  });

  const hasPendingConsent = useMemo(
    () =>
      sources.some(
        (source) =>
          isHumanSource(source) && source.consent?.status === "pending",
      ),
    [sources],
  );

  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ["journalist-article", articleId],
    enabled: !!articleId,
    refetchOnWindowFocus: hasPendingConsent,
    refetchInterval: hasPendingConsent ? 30_000 : false,
    queryFn: async () => {
      const response = await JournalistArticles_APIs.getById(articleId!);
      if (response.data.error || !response.data.data) {
        throw new Error(response.data.message || "Article not found");
      }
      return response.data.data;
    },
  });

  const { data: notificationsData } = useJournalistNotifications();

  useEffect(() => {
    if (!notificationsData?.notifications || !savedArticleId) return;

    const consentUpdates = notificationsData.notifications.filter(
      (notification) =>
        notification.data.article_id === savedArticleId &&
        (notification.data.status === "approved" ||
          notification.data.status === "rejected"),
    );

    if (consentUpdates.length === 0) return;

    setSources((current) => {
      const next = current.map((source) => {
        if (!isHumanSource(source)) return source;

        const update = consentUpdates.find((notification) => {
          const sourceName = notification.data.source_name?.trim();
          if (!sourceName) return false;
          return (
            source.consent?.name === sourceName ||
            source.name === sourceName ||
            source.label === sourceName
          );
        });

        const status = update?.data.status as SourceConsentStatus | undefined;
        if (status !== "approved" && status !== "rejected") return source;

        return {
          ...source,
          consent: {
            name: source.consent?.name ?? source.name ?? source.label,
            status,
            consent_approved_at:
              status === "approved"
                ? new Date().toISOString()
                : source.consent?.consent_approved_at,
          },
        };
      });

      persistSources(savedArticleId, next);
      return next;
    });

    queryClient.invalidateQueries({
      queryKey: ["journalist-article", savedArticleId],
    });
  }, [notificationsData, queryClient, savedArticleId]);

  useEffect(() => {
    if (articleId) {
      setSavedArticleId(articleId);
    } else {
      hydratedArticleIdRef.current = null;
    }
  }, [articleId]);

  useEffect(() => {
    if (!article) return;
    const activeArticleId = articleId ?? savedArticleId;
    const shouldHydrateForm = hydratedArticleIdRef.current !== article.id;
    setSavedArticleId(article.id);
    setArticleStatus(article.status);
    setPublishedAt(article.publishedAt);
    setSources((prev) => {
      const merged = mergeArticleSources(
        prev,
        article.sources,
        article.sourcesLoadedFromApi,
      );
      if (merged.length > 0) return merged;
      const cached = getPersistedSources(article.id);
      return cached.length > 0 ? cached : merged;
    });
    const sameArticle = activeArticleId === article.id;

    if (article.coverImage) {
      setCoverPreview(article.coverImage);
      currentCoverPreviewRef.current = article.coverImage;
      pendingCoverFileRef.current = null;
    } else {
      setCoverPreview((current) => {
        const result = sameArticle ? current : null;
        currentCoverPreviewRef.current = result;
        return result;
      });
    }
    if (shouldHydrateForm) {
      form.reset({
        title: article.title ?? "",
        content: article.content ?? "",
        tags: "",
        coverImage: pendingCoverFileRef.current,
      });
      hydratedArticleIdRef.current = article.id;
    }

    if (
      articleId &&
      article.sourcesLoadedFromApi &&
      article.sources.length === 0 &&
      article.trustScore != null
    ) {
      errorToast(t("journalist.editor.sourcesReloadHint"));
    }

    if (article.standardsBreakdown && article.trustScore != null) {
      setCheckResult({
        trustScore: article.trustScore,
        credibilityScore: article.credibilityScore,
        fushaCompliant: article.fushaPassed ?? false,
        dialectDetected: !(article.fushaPassed ?? false),
        canPublish:
          article.isPublishable ??
          ((article.fushaPassed ?? false) &&
            article.trustScore >= PUBLISH_TRUST_THRESHOLD),
        breakdown: Object.entries(article.standardsBreakdown).map(([key, entry]) => ({
          key,
          label: key,
          ...("passed" in entry
            ? { passed: entry.passed, feedback: entry.feedback }
            : { score: entry.score, feedback: entry.feedback }),
        })),
        issues: article.fushaPassed ? [] : ["fusha"],
      });
    }
  }, [article, articleId, form, savedArticleId, t]);

  const isReadOnly = articleStatus === "published";

  const publishReadiness = useMemo(
    () =>
      computePublishReadiness({
        sources,
        fushaPassed: article?.fushaPassed,
        trustScore: article?.trustScore,
        checkResult,
        isPublishable: article?.isPublishable,
      }),
    [sources, article?.fushaPassed, article?.trustScore, checkResult, article?.isPublishable],
  );

  const saveMutation = useMutation({
    mutationFn: (data: JournalistEditorSchemaType) => {
      const coverFile = data.coverImage ?? pendingCoverFileRef.current ?? undefined;
      return JournalistArticles_APIs.save({
        id: savedArticleId,
        title: data.title,
        content: data.content,
        tags: parseTagsInput(data.tags),
        cover_image: coverFile,
      });
    },
    onSuccess: (response, variables) => {
      if (response.data.error || !response.data.data) {
        errorToast(response.data.message);
        return;
      }
      const savedArticle = response.data.data;
      const newId = savedArticle.id;
      const wasNew = !savedArticleId;
      const uploadedFile =
        variables.coverImage ?? pendingCoverFileRef.current ?? null;
      const localCoverPreview = uploadedFile
        ? URL.createObjectURL(uploadedFile)
        : null;

      setSavedArticleId(newId);
      if (savedArticle.coverImage) {
        setCoverPreview(savedArticle.coverImage);
        currentCoverPreviewRef.current = savedArticle.coverImage;
        pendingCoverFileRef.current = null;
      } else if (localCoverPreview) {
        setCoverPreview(localCoverPreview);
        currentCoverPreviewRef.current = localCoverPreview;
      }

      queryClient.setQueryData(["journalist-article", newId], savedArticle);

      successToast(t("journalist.editor.saveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["journalist-articles"] });
      if (wasNew) {
        navigate(`${ROUTES.JOURNALIST_EDITOR}?id=${newId}`, { replace: true });
      }
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("journalist.editor.saveError")));
    },
  });

  const checkMutation = useMutation({
    mutationFn: (id: number) => JournalistArticles_APIs.runStandardsCheck(id),
    onSuccess: (response) => {
      if (response.data.error || !response.data.data) {
        errorToast(response.data.message);
        return;
      }
      setCheckResult(response.data.data);
      queryClient.invalidateQueries({ queryKey: ["journalist-articles"] });
      queryClient.invalidateQueries({ queryKey: ["journalist-article", savedArticleId] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("journalist.editor.checkError")));
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => JournalistArticles_APIs.publish(id),
    onSuccess: async (response) => {
      if (response.data.error) {
        errorToast(response.data.message || t("journalist.editor.publishBlocked"));
        return;
      }
      successToast(t("journalist.editor.publishSuccess"));
      queryClient.invalidateQueries({ queryKey: ["journalist-articles"] });
      if (savedArticleId) {
        await queryClient.invalidateQueries({
          queryKey: ["journalist-article", savedArticleId],
        });
        setArticleStatus("published");
      }
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("journalist.editor.publishError")));
    },
  });

  const addSourceMutation = useMutation({
    mutationFn: (payload: {
      type: JournalistArticleSource["type"];
      url?: string;
      name?: string;
      email?: string;
      phone?: string;
      quote?: string;
      label?: string;
    }) => JournalistArticles_APIs.addSource(savedArticleId!, buildAddSourcePayload(payload)),
    onSuccess: (response) => {
      if (response.data.error || !response.data.data) {
        errorToast(response.data.message);
        return;
      }
      if (response.data.message) {
        successToast(response.data.message);
      }
      setSources((current) => {
        const next = [...current, response.data.data!];
        if (savedArticleId) persistSources(savedArticleId, next);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["journalist-article", savedArticleId] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("journalist.editor.sourceAddError")));
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (sourceId: number) =>
      JournalistArticles_APIs.deleteSource(savedArticleId!, sourceId),
    onSuccess: (response, sourceId) => {
      if (response.data.error) {
        errorToast(response.data.message);
        return;
      }
      setSources((current) => {
        const next = current.filter((source) => source.id !== sourceId);
        if (savedArticleId) persistSources(savedArticleId, next);
        return next;
      });
      successToast(t("journalist.editor.sourceRemoved"));
      queryClient.invalidateQueries({ queryKey: ["journalist-article", savedArticleId] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("journalist.editor.sourceRemoveError")));
    },
  });

  const onSave = (data: JournalistEditorSchemaType) => {
    if (isReadOnly) return;
    saveMutation.mutate(data);
  };

  const onCheck = () => {
    if (isReadOnly) return;
    if (!savedArticleId) {
      errorToast(t("journalist.editor.saveFirst"));
      return;
    }
    checkMutation.mutate(savedArticleId);
  };

  const onPublish = () => {
    if (isReadOnly) return;
    if (!savedArticleId) {
      errorToast(t("journalist.editor.saveFirst"));
      return;
    }
    publishMutation.mutate(savedArticleId);
  };

  const handleCoverChange = (file: File | null) => {
    if (isReadOnly) return;
    pendingCoverFileRef.current = file;
    form.setValue("coverImage", file);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    setCoverPreview(previewUrl);
    currentCoverPreviewRef.current = previewUrl;
  };

  const handleCoverImageError = () => {
    if (pendingCoverFileRef.current) {
      const fallback = URL.createObjectURL(pendingCoverFileRef.current);
      setCoverPreview(fallback);
      currentCoverPreviewRef.current = fallback;
    }
  };

  return {
    form,
    onSave,
    onCheck,
    onPublish,
    onSubmit: onPublish,
    checkResult,
    savedArticleId,
    sources,
    setSources,
    addSource: addSourceMutation.mutate,
    removeSource: deleteSourceMutation.mutate,
    canPublish: publishReadiness.canPublish,
    publishReadiness,
    coverPreview,
    onCoverChange: handleCoverChange,
    onCoverImageError: handleCoverImageError,
    saving: saveMutation.isPending,
    checking: checkMutation.isPending,
    publishing: publishMutation.isPending,
    submitting: publishMutation.isPending,
    addingSource: addSourceMutation.isPending,
    removingSource: deleteSourceMutation.isPending,
    isLoadingArticle,
    isReadOnly,
    articleStatus,
    publishedAt,
    setFormValues: form.reset,
  };
}

export default useEditorForm;
