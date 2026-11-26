interface StoreFooterProps {
  storeName: string;
  isLightTheme: boolean;
}

export function StoreFooter({ storeName, isLightTheme }: StoreFooterProps) {
  return (
    <footer
      className={`py-8 text-center border-t ${
        isLightTheme ? "border-black/10" : "border-white/10"
      } opacity-60 text-xs`}
    >
      <p>© 2026 {storeName}. Creado con ARAE.</p>
    </footer>
  );
}