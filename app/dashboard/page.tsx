
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { allTemplates } from "@/lib/templates";
import { resizeImage } from "@/lib/resizeImage";

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");

  // ESTADOS DE PRODUCTOS
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: ""
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");

  // ESTADOS DE AJUSTES
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // ESTADOS DEL LOGO
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // TOASTS
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CARGAR TIENDA
  useEffect(() => {
    const checkUserAndFetchStore = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch("/api/stores/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          cache: "no-store"
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error buscando tienda:", errorData);

          setStore(null);
          setProducts([]);
          return;
        }

        const data = await res.json();

        localStorage.setItem("currentStoreSlug", data.slug);

        setStore(data);
        setProducts(data.products || []);
        setSelectedTemplate(data.template);
        if (!data.subscription?.canManage) {
          return;
        }

        // Cargar pedidos de esta tienda
        const ordersRes = await fetch("/api/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          cache: "no-store"
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } else {
          const ordersError = await ordersRes.json().catch(() => null);
          console.error("Error cargando pedidos:", ordersError);
        }

      } catch (error) {
        console.error("Error cargando Dashboard:", error);
        setStore(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchStore();
  }, []);

  // GUARDAR PRODUCTO
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !store) return;

    setIsUploading(true);

    let finalImageUrl = editingProductId ? editImageUrl : "";

    try {
      if (imageFile) {
        const resizedBlob = await resizeImage(imageFile, 800, 800);
        const filePath = `${store.id}/${Math.random()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, resizedBlob, {
            contentType: "image/jpeg"
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl }
        } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const isEditing = !!editingProductId;
      const url = isEditing
        ? `/api/products/${editingProductId}`
        : "/api/products";

      const method = isEditing ? "PUT" : "POST";

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          storeId: store.id,
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock || 0,
          imageUrl: finalImageUrl,
          category: newProduct.category.trim() !== ""
            ? newProduct.category.trim()
            : "General"
        })
      });

      if (res.ok) {
        const savedProduct = await res.json();

        if (isEditing) {
          setProducts(
            products.map(p =>
              p.id === editingProductId ? savedProduct : p
            )
          );

          showToast("Producto actualizado");
        } else {
          setProducts([savedProduct, ...products]);
          showToast("Producto creado");
        }

        resetForm();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando producto:", errorData);
        showToast("Error al guardar", "error");
      }

    } catch (error) {
      console.error(error);
      showToast("Error al procesar la imagen o guardar el producto", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // EDITAR PRODUCTO
  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);

    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || ""
    });

    setEditImageUrl(product.imageUrl || "");
    setImageFile(null);
    setIsAdding(true);
  };

  // LIMPIAR FORMULARIO
  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      stock: "",
      category: ""
    });

    setImageFile(null);
    setEditImageUrl("");
    setEditingProductId(null);
    setIsAdding(false);
  };

  // ELIMINAR PRODUCTO
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast("Producto eliminado");
      } else {
        showToast("No se pudo eliminar el producto", "error");
      }

    } catch (error) {
      console.error(error);
      showToast("Error al eliminar el producto", "error");
    }
  };

  // SUBIR LOGO
  const handleUploadLogo = async () => {
    if (!logoFile || !store) return;

    setIsUploadingLogo(true);

    try {
      const resizedBlob = await resizeImage(logoFile, 500, 500);
      const filePath = `${store.id}/logo-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, resizedBlob, {
          contentType: "image/jpeg"
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(`/api/stores/${store.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          logoUrl: publicUrl
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando logo:", errorData);
        throw new Error("Error al guardar el logo");
      }

      const updatedStore = await res.json();

      setStore(updatedStore);
      setLogoFile(null);

      showToast("Logo actualizado correctamente");

    } catch (error) {
      console.error(error);
      showToast("Error al subir el logo", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // APLICAR DISEÑO
  const handleApplyTemplate = async () => {
    if (!previewTemplate || !store) return;

    setIsSavingTemplate(true);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(`/api/stores/${store.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          template: previewTemplate.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando diseño:", errorData);
        throw new Error("Error al guardar el diseño");
      }

      const updatedStore = await res.json();

      setStore(updatedStore);
      setSelectedTemplate(updatedStore.template);
      setPreviewTemplate(null);

      showToast("Diseño aplicado correctamente");

    } catch (error) {
      console.error(error);
      showToast("Error al aplicar el diseño", "error");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // ACTUALIZAR LISTA DE PEDIDOS
  const refreshOrders = async () => {
    setLoadingOrders(true);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store"
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "No se pudieron cargar los pedidos");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : "Error al cargar pedidos",
        "error"
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // CONFIRMAR O CANCELAR PEDIDO
  const handleOrderAction = async (
    orderId: string,
    action: "confirm" | "cancel"
  ) => {
    const confirmation =
      action === "confirm"
        ? "¿Confirmar este pedido como vendido? Se descontará el stock."
        : "¿Cancelar este pedido? Si ya estaba vendido, se devolverá el stock.";

    if (!confirm(confirmation)) return;

    setProcessingOrderId(orderId);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ orderId, action })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el pedido");
      }

      setOrders((previous) =>
        previous.map((order) => order.id === orderId ? data : order)
      );

      // Actualizar productos para reflejar el stock nuevo
      const storeRes = await fetch("/api/stores/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store"
      });

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setProducts(storeData.products || []);
      }

      showToast(
        action === "confirm"
          ? "Pedido confirmado. Stock actualizado."
          : "Pedido cancelado. Stock actualizado si correspondía."
      );
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      showToast(
        error instanceof Error ? error.message : "Error al procesar pedido",
        "error"
      );
      await refreshOrders();
    } finally {
      setProcessingOrderId(null);
    }
  };

  // CERRAR SESIÓN
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentStoreSlug");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">
        Cargando panel...
      </div>
    );
  }

  // BLOQUEO POR SUSCRIPCIÓN VENCIDA O EN PERÍODO DE GRACIA
  if (store.subscription && !store.subscription.canManage) {
    const isGrace = store.subscription.status === "GRACE";

    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 text-white">
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">

          <div className="text-5xl mb-5">
            {isGrace ? "⏳" : "🔒"}
          </div>

          <h1 className="text-2xl font-bold mb-3">
            {isGrace ? "Tu período de prueba terminó" : "Tu suscripción venció"}
          </h1>

          <p className="text-slate-400 mb-6">
            {isGrace
              ? "Tu tienda está en período de gracia. El panel de administración está bloqueado. Todavía tenés tiempo para renovar."
              : "Tu acceso al panel está suspendido. Renovando tu suscripción podrás volver a administrar tu tienda."
            }
          </p>

          {isGrace && (
            <p className="text-amber-400 font-semibold mb-6">
              Días restantes de gracia: {store.subscription.daysRemaining}
            </p>
          )}

          <p className="text-slate-500 text-sm mb-6">
            Tu catálogo público permanece disponible.
          </p>

          <Link
            href="/upgrade"
            className="block w-full bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400"
          >
            Renovar suscripción
          </Link>

          <button
            onClick={handleLogout}
            className="mt-5 text-slate-400 hover:text-white text-sm"
          >
            Cerrar sesión
          </button>

        </div>
      </div>
    );
  }

  const existingCategories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans flex flex-col md:flex-row relative">

      {/* TOASTS */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
          <span className="text-xl">
            {toast.type === "success" ? "✅" : "❌"}
          </span>
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* MODAL PREVIEW TEMPLATE */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1a1e26]">
              <h2 className="text-lg font-bold text-white">
                Previsualización: {previewTemplate.name}
              </h2>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto ${previewTemplate.bg} ${previewTemplate.textColor} p-6`}>
              <div className={`flex justify-between items-center mb-8 pb-4 border-b ${previewTemplate.isLight
                  ? "border-black/10"
                  : "border-white/10"
                }`}>
                <div className="flex items-center gap-3">
                  {store.logoUrl && (
                    <img
                      src={store.logoUrl}
                      alt="Logo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}

                  <span className="font-bold text-xl">{store.name}</span>
                </div>

                <button className={`px-4 py-1.5 rounded-full text-xs font-bold ${previewTemplate.isLight
                    ? "bg-black text-white"
                    : "bg-white text-black"
                  }`}>
                  🛒 Carrito (0)
                </button>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">
                  Catálogo de {store.name}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`${previewTemplate.card} rounded-xl overflow-hidden shadow-sm p-4`}
                  >
                    <div className={`h-32 rounded-lg mb-3 ${previewTemplate.isLight
                        ? "bg-black/5"
                        : "bg-white/10"
                      }`}></div>

                    <h3 className="font-bold text-sm mb-1">
                      Producto de ejemplo
                    </h3>

                    <p className={`font-bold ${previewTemplate.accent}`}>
                      $2500
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#1a1e26] flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-5 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={handleApplyTemplate}
                disabled={isSavingTemplate}
                className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSavingTemplate ? "Aplicando..." : "Aplicar Diseño"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTOS */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">

            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingProductId ? "Editar Producto" : "Nuevo Producto"}
              </h2>

              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nombre
                </label>

                <input
                  type="text"
                  required
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                  value={newProduct.name}
                  onChange={e =>
                    setNewProduct({
                      ...newProduct,
                      name: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Categoría
                </label>

                <input
                  type="text"
                  list="category-suggestions"
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                  value={newProduct.category}
                  onChange={e =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value
                    })
                  }
                />

                <datalist id="category-suggestions">
                  {existingCategories.map((cat: any) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Precio
                </label>

                <input
                  type="number"
                  required
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                  value={newProduct.price}
                  onChange={e =>
                    setNewProduct({
                      ...newProduct,
                      price: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Stock
                </label>

                <input
                  type="number"
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                  value={newProduct.stock}
                  onChange={e =>
                    setNewProduct({
                      ...newProduct,
                      stock: e.target.value
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Imagen (Se ajustará a 800x800px)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black"
                  onChange={e =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isUploading ? "Procesando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#15181e] border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tighter">
            ARAE
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("resumen")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "resumen"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-[#1a1e26] text-slate-400"
              }`}
          >
            <span>📊</span> Resumen
          </button>

          <button
            onClick={() => setActiveTab("productos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "productos"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-[#1a1e26] text-slate-400"
              }`}
          >
            <span>📦</span> Productos
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "pedidos"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-[#1a1e26] text-slate-400"
              }`}
          >
            <span>🛒</span> Pedidos
          </button>

          <button
            onClick={() => setActiveTab("ajustes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "ajustes"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-[#1a1e26] text-slate-400"
              }`}
          >
            <span>⚙️</span> Ajustes
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-[#0f1115] border border-slate-700 text-slate-300 py-2.5 rounded-lg text-sm hover:bg-slate-800"
          >
            ← Salir al inicio
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-2.5 rounded-lg text-sm hover:bg-red-500/20"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* NAVBAR MÓVIL */}
      <div className="md:hidden bg-[#15181e] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <h2 className="text-xl font-bold text-white">ARAE</h2>

        <button
          onClick={handleLogout}
          className="text-red-400 text-sm font-medium"
        >
          Salir
        </button>
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-[#15181e] border-t border-slate-800 flex justify-around p-3 z-40 pb-safe">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`flex flex-col items-center gap-1 ${activeTab === "resumen" ? "text-emerald-400" : "text-slate-400"
            }`}
        >
          <span>📊</span>
          <span className="text-[10px]">Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab("productos")}
          className={`flex flex-col items-center gap-1 ${activeTab === "productos" ? "text-emerald-400" : "text-slate-400"
            }`}
        >
          <span>📦</span>
          <span className="text-[10px]">Productos</span>
        </button>

        <button
          onClick={() => setActiveTab("pedidos")}
          className={`flex flex-col items-center gap-1 ${activeTab === "pedidos" ? "text-emerald-400" : "text-slate-400"
            }`}
        >
          <span>🛒</span>
          <span className="text-[10px]">Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab("ajustes")}
          className={`flex flex-col items-center gap-1 ${activeTab === "ajustes" ? "text-emerald-400" : "text-slate-400"
            }`}
        >
          <span>⚙️</span>
          <span className="text-[10px]">Ajustes</span>
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Hola, {store.name} 👋
            </h1>

            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Acá tenés el resumen de tu tienda hoy.
            </p>
          </div>

          <Link
            href={`/t/${store.slug}`}
            target="_blank"
            className="bg-white text-black px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-bold hover:bg-slate-200 transition inline-flex items-center gap-2 text-sm shadow-lg w-fit"
          >
            Ver mi tienda ↗
          </Link>
        </header>
        {/* ESTADO DE SUSCRIPCIÓN */}
        {store.subscription && (
          <div className="mb-8 bg-[#15181e] border border-slate-800 rounded-xl p-5">
            {store.subscription.status === "TRIAL" ? (
              <>
                <p className="text-emerald-400 font-bold">
                  🎁 Período de prueba gratuito
                </p>
                <p className="text-slate-300 text-sm mt-2">
                  Te quedan {store.subscription.daysRemaining} días de prueba.
                </p>
              </>
            ) : store.subscription.status === "PRO" ? (
              <>
                <p className="text-emerald-400 font-bold">
                  ⭐ Plan Pro activo
                </p>
                <p className="text-slate-300 text-sm mt-2">
                  Vencimiento:{" "}
                  {new Date(store.subscription.expiresAt).toLocaleDateString("es-PY")}
                </p>
              </>
            ) : null}
          </div>
        )}

        {/* RESUMEN */}
        {activeTab === "resumen" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

              <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm mb-2 font-medium">
                  Ventas de hoy
                </p>
                <p className="text-3xl font-bold text-white">$0.00</p>
              </div>

              <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm mb-2 font-medium">
                  Visitas
                </p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>

              <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm mb-2 font-medium">
                  Productos Activos
                </p>
                <p className="text-3xl font-bold text-white">
                  {products.length}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        {activeTab === "productos" && (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">

            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Tus Productos
              </h2>

              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="hidden md:block bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400"
              >
                + Agregar
              </button>
            </div>

            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No tenés productos.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                    <tr>
                      <th className="px-4 md:px-6 py-3 font-medium">
                        Producto
                      </th>

                      <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">
                        Categoría
                      </th>

                      <th className="px-4 md:px-6 py-3 font-medium">
                        Precio
                      </th>

                      <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">
                        Stock
                      </th>

                      <th className="px-4 md:px-6 py-3 font-medium text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {products.map(p => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#1a1e26]/50 transition"
                      >
                        <td className="px-4 md:px-6 py-4 font-medium text-white">
                          {p.name}
                        </td>

                        <td className="px-4 md:px-6 py-4 text-slate-400 hidden md:table-cell">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs">
                            {p.category || "General"}
                          </span>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-emerald-400 font-medium">
                          ${p.price}
                        </td>

                        <td className="px-4 md:px-6 py-4 text-slate-400 hidden md:table-cell">
                          {p.stock} u.
                        </td>

                        <td className="px-4 md:px-6 py-4 text-right flex justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="text-blue-400 font-medium text-[10px] md:text-xs bg-blue-400/10 px-2 md:px-3 py-1.5 rounded"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-400 font-medium text-[10px] md:text-xs bg-red-400/10 px-2 md:px-3 py-1.5 rounded"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Pedidos recibidos
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Administrá los pedidos de tus clientes.
                </p>
              </div>

              <button
                onClick={refreshOrders}
                disabled={loadingOrders}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
              >
                {loadingOrders ? "Actualizando..." : "↻ Actualizar"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Todos", value: orders.length },
                { label: "Pendientes", value: orders.filter(o => o.status === "PENDING").length },
                { label: "Vendidos", value: orders.filter(o => o.status === "SOLD").length },
                { label: "Cancelados", value: orders.filter(o => o.status === "CANCELLED").length }
              ].map((item) => (
                <div key={item.label} className="bg-[#15181e] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {loadingOrders ? (
              <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
                Cargando pedidos...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Todavía no recibiste pedidos
                </h3>
                <p className="text-slate-400 text-sm">
                  Cuando un cliente realice un pedido, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">
                            Pedido #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400"
                              : order.status === "SOLD"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                            {order.status === "PENDING"
                              ? "Pendiente"
                              : order.status === "SOLD"
                                ? "Vendido"
                                : "Cancelado"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">
                          Cliente: <strong>{order.customerName}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleString("es-PY")}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <p className="text-xs text-slate-400">Total del pedido</p>
                        <p className="text-xl font-bold text-emerald-400">
                          Gs. {Number(order.total).toLocaleString("es-PY")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Pago: {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 md:p-6">
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-3">
                        Productos
                      </p>

                      <div className="space-y-2">
                        {(order.items || []).map((item: any) => (
                          <div key={item.id} className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-300">
                              {item.quantity} x {item.productName}
                            </span>
                            <span className="text-slate-400 whitespace-nowrap">
                              Gs. {Number(item.subtotal).toLocaleString("es-PY")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleOrderAction(order.id, "confirm")}
                            disabled={processingOrderId === order.id}
                            className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 disabled:opacity-50"
                          >
                            {processingOrderId === order.id ? "Procesando..." : "✓ Confirmar venta"}
                          </button>
                        )}

                        {order.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleOrderAction(order.id, "cancel")}
                            disabled={processingOrderId === order.id}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 disabled:opacity-50"
                          >
                            Cancelar pedido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AJUSTES */}
        {activeTab === "ajustes" && (
          <div className="space-y-8">

            {/* LOGO */}
            <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-2">
                Logo de la tienda
              </h2>

              <p className="text-slate-400 text-sm mb-6">
                Subí una imagen cuadrada. Recomendamos 500x500 píxeles
                (se ajustará automáticamente).
              </p>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                <div className="w-24 h-24 rounded-2xl bg-[#0f1115] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {store.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-600 text-xs text-center p-2">
                      Sin logo
                    </span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black"
                    onChange={e =>
                      setLogoFile(e.target.files?.[0] || null)
                    }
                  />

                  <button
                    onClick={handleUploadLogo}
                    disabled={!logoFile || isUploadingLogo}
                    className="bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isUploadingLogo ? "Subiendo..." : "Actualizar Logo"}
                  </button>
                </div>
              </div>
            </div>

            {/* DISEÑO */}
            <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-2">
                Diseño de tu tienda
              </h2>

              <p className="text-slate-400 text-sm mb-6">
                Elegí un diseño. Hacé clic en uno para previsualizarlo antes de aplicarlo.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTemplate(t)}
                    className={`relative border-2 rounded-xl overflow-hidden transition-all duration-200 group text-left ${selectedTemplate === t.id
                        ? "border-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/20"
                        : "border-slate-700 hover:border-slate-500"
                      }`}
                  >
                    <div className={`h-24 p-3 flex flex-col ${t.color}`}>
                      <div className={`font-bold text-[10px] truncate ${t.textColor}`}>
                        {store.name}
                      </div>

                      <div className="flex gap-1 mt-auto">
                        <div className={`w-6 h-6 rounded opacity-30 ${t.textColor.replace("text-", "bg-")}`}></div>
                        <div className={`w-6 h-6 rounded opacity-30 ${t.textColor.replace("text-", "bg-")}`}></div>
                      </div>
                    </div>

                    <div className="bg-[#0f1115] p-2 text-center border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-medium text-slate-300 truncate">
                        {t.name}
                      </span>

                      {selectedTemplate === t.id && (
                        <span className="text-emerald-500 text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
                        Previsualizar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTÓN MÓVIL AGREGAR PRODUCTO */}
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
