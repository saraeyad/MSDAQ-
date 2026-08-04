import { Button } from "@/components/ui/button";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card p-8 text-center">
          <h2 className="font-headline text-xl font-bold">
            {this.props.title ?? "حدث خطأ في هذه الصفحة"}
          </h2>
          <p className="text-sm text-muted-foreground">
            تعذّر عرض المحتوى. جرّب إعادة التحميل أو العودة لاحقاً.
          </p>
          <p className="max-w-full truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground dir-ltr">
            {this.state.error.message}
          </p>
          <Button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            إعادة التحميل
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
