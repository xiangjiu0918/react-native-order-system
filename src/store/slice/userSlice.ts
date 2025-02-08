import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "../index";

export interface UserState {
  userId: number | undefined;
  username: string | undefined;
  email: string | undefined;
  avatar: string | undefined;
}

const initialState: UserState = {
  userId: undefined,
  username: undefined,
  email: undefined,
  avatar: undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    load: (state, action: PayloadAction<UserState>) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.avatar = action.payload.avatar;
    },
    exist: state => {
      state.userId = undefined;
      state.username = undefined;
      state.email = undefined;
      state.avatar = undefined;
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
    },
  },
});

export const {load, exist, updateAvatar} = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
