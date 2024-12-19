import { configureStore } from "@reduxjs/toolkit";
import userReducer from './slice/userSlice';
import bottomBarReducer from './slice/bottomBarSlice';
import addressReducer from './slice/addressSlice'

const store = configureStore({
    reducer: {
        user: userReducer,
        bottomBar: bottomBarReducer,
        address: addressReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;