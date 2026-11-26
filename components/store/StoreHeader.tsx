interface StoreHeaderProps {
  storeName: string;
  storeCategory: string;
}

export function StoreHeader({ storeName, storeCategory }: StoreHeaderProps) {
  return (
    <header className="py-8 md:py-12 px-4 text-center max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
        Catálogo de {storeName}
      </h1>
      <p className="text-base md:text-lg opacity-70">
        Los mejores productos de {storeCategory.toLowerCase()}.
      </p>
    </header>
  );
}