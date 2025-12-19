"use client";
import { useState } from "react";
import { useHttp } from "@/composable/Service/http/useHttp";
import storeHttp from "@/Services/http/store.http";
import { CreateStoreDto, Store } from "@repo/dtos";

const useStore = () => {
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
    return createHttp.request(form);
  };

  const fetchStores = async () => {
    return listHttp.request({});
  };

  const updateStore = async (id: string, form: Partial<CreateStoreDto>) => {
    return updateHttp.request({ id, form });
  };

  const deleteStore = async (id: string) => {
    return deleteHttp.request(id);
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
      deleteHttp.loading,

    // Errors
    errors: {
      create: createHttp.error,
      list: listHttp.error,
      update: updateHttp.error,
      delete: deleteHttp.error,
    },

    // Data
    stores: listHttp.data,
  };
};

export default useStore;
