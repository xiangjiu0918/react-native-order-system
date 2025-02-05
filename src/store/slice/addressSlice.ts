import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PickerValue } from "@ant-design/react-native";
import type { RootState } from "..";

export interface Address {
    name: string, 
    tel: string, 
    district: PickerValue[],
    detail: string,
    default: boolean,
};

export interface AddressStore extends Address {
    id: number,
};

const initialState: {
    list: AddressStore[],
    default: null | number,
} = {
    list: [],
    default: null,
};

export const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        addItem(state, action: PayloadAction<Address>) {
            const id = state.list.length > 0 ? state.list[state.list.length - 1].id + 1 : 1;
            state.list.push({ id, ...action.payload });
            if (action.payload.default === true) {
                // 清除之前设置的默认项，将当前项设置为默认
                state.list.map(item => item.id === state.default ? { ...item, default: false } : item);
                state.default = id;
            }
        },
        deleteItem(state, id: PayloadAction<number>) {
            // if (id.payload === state.default) state.default = null;
            // console.log("list",{list: state.list.filter(item => item.id !== id.payload), default: state.default})
            return {list: state.list.filter(item => item.id !== id.payload), default: id.payload === state.default ? null: state.default};
        }, changeItem(state, action: PayloadAction<AddressStore>) {
            let index = state.list.findIndex(item => item.id === action.payload.id);
            state.list[index] = action.payload;
            if (action.payload.default === true) {
                // 清除之前设置的默认项，将当前项设置为默认
                state.list.map(item => item.id === state.default ? { ...item, default: false } : item);
                state.default = action.payload.id;
            } else {
                if (state.default === action.payload.id) {
                    state.default = null;
                }
            }
        }, changeDefault(state, action: PayloadAction<{ isDefault: boolean, id: number }>) {
            if (action.payload.isDefault === true) state.default = action.payload.id;
            else if (state.default === action.payload.id) state.default = null;
        }, initList(state, action: PayloadAction<{list: AddressStore[], default: (number | null)}>) {
            state.list = action.payload.list;
            state.default = action.payload.default;
        }
    }
})

export const { addItem, deleteItem, changeItem, changeDefault, initList } = addressSlice.actions;
export const selectAddress = (state: RootState) => state.address;
export default addressSlice.reducer;