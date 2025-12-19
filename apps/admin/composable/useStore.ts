"use client";
import { useState, useEffect } from "react";
import { useHttp } from "@/composable/Service/http/useHttp";
import storeHttp from "@/Services/http/store.http";
import { CreateStoreDto, Store } from "@repo/dtos";

// --- Module-Level State (Shared across all useStore instances) ---
let globalStores: Store[] = [
  {
    id: "1",
    name: "Abracasa",
    location: "Bloco A, 1º Piso",
    phone: "(21) 2441-1234",
    website: "https://abracasa.com.br",
    facebook: "abracasa",
    instagram: "abracasa",
    youtube: "abracasa",
    image: "AB",
  },
  {
    id: "2",
    name: "Lumini",
    location: "Bloco B, 2º Piso",
    phone: "(21) 2441-5678",
    website: "https://lumini.com.br",
    facebook: "lumini",
    instagram: "lumini",
    youtube: "lumini",
    image: "LU",
  },
  {
    id: "3",
    name: "Tok&Stok",
    location: "Bloco C, Térreo",
    phone: "(21) 2441-9012",
    website: "https://tokstok.com.br",
    facebook: "tokstok",
    instagram: "tokstok",
    youtube: "tokstok",
    image: "TO",
  },
];

// Simple subscription system
const listeners: Set<(stores: Store[]) => void> = new Set();
const notifyListeners = () => {
  listeners.forEach((listener) => listener([...globalStores]));
};

const useStore = () => {
  const [data, setData] = useState<Store[]>(globalStores); // Initialize with current global state
  const [loadingList, setLoadingList] = useState(false);

  // Sync with global state
  useEffect(() => {
    const listener = (newStores: Store[]) => setData(newStores);
    listeners.add(listener);
    // Ensure we have the latest data on mount
    setData([...globalStores]);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Operations
  const createHttp = useHttp(storeHttp.create);
  const listHttp = useHttp(storeHttp.list);
  // Explicitly typing params for updateHttp to avoid inference issues with Partial types
  const updateHttp = useHttp(
    (params: { id: string; form: Partial<CreateStoreDto> }) =>
      storeHttp.update(params.id, params.form)
  );
  const deleteHttp = useHttp(storeHttp.delete);

  const createStore = async (form: CreateStoreDto) => {
    setLoadingList(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        let imageUrl = "AB"; // Default fallback
        if (form.image instanceof File) {
          imageUrl = URL.createObjectURL(form.image);
        } else if (typeof form.image === "string") {
          imageUrl = form.image;
        }

        const newStore: Store = {
          id: Math.random().toString(36).substr(2, 9),
          ...form,
          phone: form.phone || null, // handle optional
          image: imageUrl,
        } as Store;

        globalStores = [...globalStores, newStore];
        notifyListeners();
        setLoadingList(false);
        resolve();
      }, 500);
    });
  };

  const fetchStores = async () => {
    // Just simulates a delay, data is already synced via listener
    setLoadingList(true);
    return new Promise<Store[]>((resolve) => {
      setTimeout(() => {
        setLoadingList(false);
        resolve([...globalStores]);
      }, 500);
    });
  };

  const updateStore = async (id: string, form: Partial<CreateStoreDto>) => {
    setLoadingList(true);
    return new Promise<Store>((resolve) => {
      setTimeout(() => {
        globalStores = globalStores.map((store) => {
          if (store.id === id) {
            let updatedImage = store.image; // Default to keeping existing

            if (form.image instanceof File) {
              updatedImage = URL.createObjectURL(form.image);
            } else if (typeof form.image === "string") {
              updatedImage = form.image;
            }
            // If form.image is null or undefined, we keep updatedImage as store.image

            return { ...store, ...form, image: updatedImage } as Store;
          }
          return store;
        });
        notifyListeners();
        setLoadingList(false);
        // Find updated store to return
        const updated = globalStores.find((s) => s.id === id);
        resolve(updated as Store);
      }, 500);
    });
  };

  const deleteStore = async (id: string) => {
    setLoadingList(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        globalStores = globalStores.filter((store) => store.id !== id);
        notifyListeners();
        setLoadingList(false);
        resolve();
      }, 500);
    });
  };

  return {
    // Methods
    createStore,
    fetchStores,
    updateStore,
    deleteStore,

    // Status
    loading:
      createHttp.loading ||
      listHttp.loading ||
      updateHttp.loading ||
      deleteHttp.loading ||
      loadingList,

    // Errors
    errors: {
      create: createHttp.error,
      list: listHttp.error,
      update: updateHttp.error,
      delete: deleteHttp.error,
    },

    // Data
    stores: data,
  };
};

export default useStore;
