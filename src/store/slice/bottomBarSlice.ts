import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';

interface BottomBarState {
    height: number,
};

const initialState : BottomBarState = {
    height: 0,
}; 

export const BottomBarSlice = createSlice({
    name: 'bottomBar',
    initialState,
    reducers: {
        showBottomBar: state => {
            state.height = 50;
        },
        hideBottomBar: state => {
            state.height = 0;
        },
    }
})

export const { showBottomBar, hideBottomBar } = BottomBarSlice.actions;
export const selectBottomBar = (state: RootState) => state.bottomBar;

export default BottomBarSlice.reducer;