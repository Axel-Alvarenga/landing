"use client";

import { useStore } from "@/hooks/store/useStore";
import { useCart } from "@/hooks/store/useCart";
import { useProductFilters } from "@/hooks/store/useProductFilters";
import { useCheckout } from "@/hooks/store/useCheckout";

import { getTheme, isLight } from "@/lib/store/templates";

import { StoreLoading } from "@/components/store/StoreLoading";
import { StoreNotFound } from "@/components/store/StoreNotFound";
import { StoreNavbar } from "@/components/store/StoreNavbar";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFilters } from "@/components/store/StoreFilters";
import { ProductGrid } from "@/components/store/ProductGrid";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartDrawer } from "@/components/store/CartDrawer";

export default function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { store, products, loading, slug } = useStore(params);
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    totalItems,
  } = useCart(slug);

  // ⚠️ useProductFilters necesita store; lo pasamos null-safe
  const filters = useProductFilters(products, store);

  const {
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    isCheckingOut,
    handleCheckout,
  } = useCheckout({
    store,
    cart,
    total,
    onSuccess: clearCart,
  });

  if (loading) return <StoreLoading />;
  if (!store) return <StoreNotFound />;

  const theme = getTheme(store.template);
  const isLightTheme = isLight(store.template);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} font-sans relative overflow-x-hidden`}
    >
      <StoreNavbar
        store={store}
        isLightTheme={isLightTheme}
        navClass={theme.nav}
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        totalItems={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <StoreHeader
        storeName={store.name}
        storeCategory={store.category}
      />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <StoreFilters
          isLightTheme={isLightTheme}
          searchQuery={filters.searchQuery}
          onSearchChange={filters.setSearchQuery}
          categoriesList={filters.categoriesList}
          selectedCategory={filters.selectedCategory}
          onCategoryChange={filters.setSelectedCategory}
          filterableFields={filters.filterableFields}
          customFilters={filters.customFilters}
          onCustomFilterChange={(fieldId, value) =>
            filters.setCustomFilters((prev) => ({
              ...prev,
              [fieldId]: value,
            }))
          }
          priceMin={filters.priceMin}
          priceMax={filters.priceMax}
          onPriceMinChange={filters.setPriceMin}
          onPriceMaxChange={filters.setPriceMax}
          numberFields={filters.numberFields}
          numberFilters={filters.numberFilters}
          onNumberFilterChange={(fieldId, range) =>
            filters.setNumberFilters((prev) => ({
              ...prev,
              [fieldId]: range,
            }))
          }
          sortBy={filters.sortBy}
          onSortChange={filters.setSortBy}
          sortOptions={filters.sortOptions}
        />

        <ProductGrid
          products={products}
          filteredProducts={filters.filteredProducts}
          storeCustomFields={store.customFields}
          isLightTheme={isLightTheme}
          themeBg={theme.bg}
          themeCard={theme.card}
          themeAccent={theme.accent}
          onAddToCart={addToCart}
          onResetFilters={filters.resetFilters}
        />
      </main>

      <StoreFooter storeName={store.name} isLightTheme={isLightTheme} />

      {/* Fondo del carrito */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        storeCustomFields={store.customFields}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        isCheckingOut={isCheckingOut}
        onCheckout={handleCheckout}
      />
    </div>
  );
}