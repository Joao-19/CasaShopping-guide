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
    address: "Bloco A, 1º Piso",
    phone: "(21) 2441-1234",
    site: "https://abracasa.com.br",
    facebookLink: "abracasa",
    instagramLink: "abracasa",
    youtubeLink: "abracasa",
    logoImage: "AB",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "2",
    name: "Lumini",
    address: "Bloco B, 2º Piso",
    phone: "(21) 2441-5678",
    site: "https://lumini.com.br",
    facebookLink: "lumini",
    instagramLink: "lumini",
    youtubeLink: "lumini",
    logoImage: "LU",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "3",
    name: "Tok&Stok",
    address: "Bloco C, Térreo",
    phone: "(21) 2441-9012",
    site: "https://tokstok.com.br",
    facebookLink: "tokstok",
    instagramLink: "tokstok",
    youtubeLink: "tokstok",
    logoImage: "TO",
    createdAt: new Date(),
    modifiedAt: new Date(),
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
    try {
      const newStore = await createHttp.request(form);
      if (newStore) {
        globalStores = [...globalStores, newStore];
        notifyListeners();
      }
    } catch (error) {
      console.error("Failed to create store:", error);
      // createHttp.request handles error state setting, but we might want to log it
    }
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
            let updatedImage = store.logoImage; // Default to keeping existing

            if (form.image instanceof File) {
              updatedImage = URL.createObjectURL(form.image);
            } else if (typeof form.image === "string") {
              updatedImage = form.image;
            }
            // If form.image is null or undefined, we keep updatedImage as store.logoImage

            return {
              ...store,
              ...form,
              logoImage: updatedImage,
              modifiedAt: new Date(),
            } as Store;
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
