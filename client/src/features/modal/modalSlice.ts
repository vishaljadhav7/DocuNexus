import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  modals: Record<string, boolean>;
}

const initialState: ModalState = {
  modals: {},
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;

export const selectIsModalOpen = (state: { modal: ModalState }, key: string) =>
  Boolean(state.modal.modals[key]);

// const isOpen = useAppSelector((state) => selectIsModalOpen(state, 'exampleModal'));