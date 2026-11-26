"use client";

import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { useProducts } from "@/hooks/dashboard/useProducts";
import { useOrders } from "@/hooks/dashboard/useOrders";
import { useCustomFields } from "@/hooks/dashboard/useCustomFields";
import { useStoreSettings } from "@/hooks/dashboard/useStoreSettings";

import { Toast } from "@/components/dashboard/Toast";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { StoreErrorState } from "@/components/dashboard/StoreErrorState";
import { SubscriptionBlock } from "@/components/dashboard/SubscriptionBlock";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProductsSection } from "@/components/dashboard/ProductsSection";
import { OrdersSection } from "@/components/dashboard/OrdersSection";
import { CustomFieldsSection } from "@/components/dashboard/CustomFieldsSection";
import { StoreSettingsSection } from "@/components/dashboard/StoreSettingsSection";
import { ProductModal } from "@/components/dashboard/ProductModal";
import { TemplatePreviewModal } from "@/components/dashboard/TemplatePreviewModal";

export default function DashboardPage() {
  const {
    store,
    setStore,
    products,
    setProducts,
    orders,
    setOrders,
    customFields,
    setCustomFields,
    loading,
    activeTab,
    setActiveTab,
    toast,
    showToast,
    handleLogout,
    handleCopyStoreLink,
  } = useDashboard();

  const {
    newProduct,
    setNewProduct,
    imageFile,
    setImageFile,
    isUploading,
    isAdding,
    setIsAdding,
    editingProductId,
    customFieldValues,
    setCustomFieldValues,
    resetForm,
    handleEditClick,
    handleSaveProduct,
    handleDeleteProduct,
  } = useProducts({ store, products, setProducts, customFields, showToast });

  const {
    loadingOrders,
    processingOrderId,
    refreshOrders,
    handleOrderAction,
  } = useOrders({ orders, setOrders, setProducts, showToast });

  const {
    editingFieldId,
    fieldForm,
    setFieldForm,
    savingField,
    resetFieldForm,
    handleSaveCustomField,
    handleEditCustomField,
    handleDeleteCustomField,
  } = useCustomFields({ store, customFields, setCustomFields, showToast });

  const {
    logoFile,
    setLogoFile,
    isUploadingLogo,
    handleUploadLogo,
    selectedTemplate,
    setSelectedTemplate,
    previewTemplate,
    setPreviewTemplate,
    isSavingTemplate,
    handleApplyTemplate,
  } = useStoreSettings({ store, setStore, showToast });

  if (loading) return <LoadingState />;
  if (!store) return <StoreErrorState />;

  if (store.subscription && !store.subscription.canManage) {
    return (
      <SubscriptionBlock subscription={store.subscription} onLogout={handleLogout} />
    );
  }

  const existingCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans flex flex-col md:flex-row relative">
      <Toast toast={toast} />

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          store={store}
          isSaving={isSavingTemplate}
          onCancel={() => setPreviewTemplate(null)}
          onApply={handleApplyTemplate}
        />
      )}

      <ProductModal
        open={isAdding}
        editingProductId={editingProductId}
        newProduct={newProduct}
        onChangeProduct={setNewProduct}
        customFields={customFields}
        customFieldValues={customFieldValues}
        onChangeCustomFieldValue={(fieldId, value) =>
          setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }))
        }
        existingCategories={existingCategories}
        onImageChange={setImageFile}
        onSubmit={handleSaveProduct}
        onClose={resetForm}
        isUploading={isUploading}
      />

      <DashboardSidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLogout={handleLogout}
      />

      <MobileNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">
        <DashboardHeader
          storeName={store.name}
          storeSlug={store.slug}
          onCopyLink={handleCopyStoreLink}
        />

        {activeTab === "resumen" && (
          <DashboardOverview
            orders={orders}
            products={products}
            onChangeTab={setActiveTab}
          />
        )}

        {activeTab === "productos" && (
          <ProductsSection
            products={products}
            customFields={customFields}  
            onAdd={() => {
              resetForm();
              setIsAdding(true);
            }}
            onEdit={handleEditClick}
            onDelete={handleDeleteProduct}
          />
        )}

        {activeTab === "campos" && (
          <CustomFieldsSection
            customFields={customFields}
            editingFieldId={editingFieldId}
            fieldForm={fieldForm}
            savingField={savingField}
            onChangeFieldForm={setFieldForm}
            onSave={handleSaveCustomField}
            onEdit={handleEditCustomField}
            onDelete={(id) =>
              handleDeleteCustomField(id, (deletedId) => {
                setCustomFieldValues((prev) => {
                  const next = { ...prev };
                  delete next[deletedId];
                  return next;
                });
              })
            }
            onCancelEdit={resetFieldForm}
          />
        )}

        {activeTab === "pedidos" && (
          <OrdersSection
            orders={orders}
            loadingOrders={loadingOrders}
            processingOrderId={processingOrderId}
            onRefresh={refreshOrders}
            onAction={handleOrderAction}
          />
        )}

        {activeTab === "ajustes" && (
          <StoreSettingsSection
            store={store}
            logoFile={logoFile}
            isUploadingLogo={isUploadingLogo}
            selectedTemplate={selectedTemplate}
            previewTemplate={previewTemplate}
            isSavingTemplate={isSavingTemplate}
            onLogoFileChange={setLogoFile}
            onUploadLogo={handleUploadLogo}
            onPreviewTemplate={setPreviewTemplate}
          />
        )}
      </main>

      {activeTab === "productos" && (
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="md:hidden fixed bottom-20 right-6 bg-emerald-500 text-black w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] z-40 active:scale-95"
        >
          +
        </button>
      )}
    </div>
  );
}