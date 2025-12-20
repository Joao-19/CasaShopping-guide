"use client";
import { useState, useEffect } from "react";
import { useHttp } from "@/composable/Service/http/useHttp";
import storeHttp from "@/Services/http/store.http";
import { CreateStoreDto, Store } from "@repo/dtos";

// --- Module-Level State (Shared across all useStore instances) ---
let globalStores: Store[] = [];

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

  const fetchStores = async () => {
    try {
      setLoadingList(true);
      const stores = await listHttp.request(undefined as any);
      if (stores) {
        globalStores = stores;
        notifyListeners();
        return stores;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      return [];
    } finally {
      setLoadingList(false);
    }
  };

  const createStore = async (form: CreateStoreDto) => {
    try {
      const newStore = await createHttp.request(form);
      if (newStore) {
        // Refresh the list from the server to ensure consistency
        await fetchStores();
      }
    } catch (error) {
      console.error("Failed to create store:", error);
      // createHttp.request handles error state setting, but we might want to log it
    }
  };

  const updateStore = async (id: string, form: Partial<CreateStoreDto>) => {
    try {
      const updatedStore = await updateHttp.request({ id, form });
      if (updatedStore) {
        globalStores = globalStores.map((s) =>
          s.id === id ? updatedStore : s
        );
        notifyListeners();
        return updatedStore;
      }
    } catch (error) {
      console.error("Failed to update store:", error);
    }
  };

  const deleteStore = async (id: string) => {
    try {
      await deleteHttp.request(id);
      globalStores = globalStores.filter((s) => s.id !== id);
      notifyListeners();
    } catch (error) {
      console.error("Failed to delete store:", error);
    }
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
