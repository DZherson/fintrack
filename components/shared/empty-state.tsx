import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="mb-4 h-24 w-24 text-muted-foreground/30"
        fill="none"
        viewBox="0 0 96 96"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="48" cy="48" r="40" fill="currentColor" opacity="0.15" />
        <path
          d="M32 48h32M48 32v32"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="48" cy="48" r="14" stroke="currentColor" strokeWidth="3" opacity="0.4" />
      </svg>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
