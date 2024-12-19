import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export interface UserState {
    username: string | undefined, 
    password: string | undefined,
};

const initialState: UserState = {
    username: undefined,
    password: undefined,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        load: (state, action: PayloadAction<UserState>) => {
            state.username = action.payload.username;
            state.password = action.payload.password;
        }, exist: state => {
            state.username = undefined;
            state.password = undefined;
        },
    },
});

export const { load, exist } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
