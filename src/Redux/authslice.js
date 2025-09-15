import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: { token: null, refreshToken: null, user: null },
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
