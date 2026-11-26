interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-20 opacity-60">
      <p className="text-xl">{message}</p>
    </div>
  );
}