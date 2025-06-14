import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem("token") ? localStorage.getItem("token"):null,
    currentUser : null,
    error : null,
    loading : false,
};

const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers:{
        signInStart : (state) =>{
            state.loading = true;
        },
        signInSuccess : (state, action)=>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
            localStorage.setItem("token",action.payload.token)
        },
        signInFailure : (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },
        signOutStart : (state)=>{
            state.loading = true;
        },
        signOutSuccess : (state)=>{
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        signOutFailure : (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },
        updateUserStart : (state)=>{
            state.loading = true;
        },
        updateUserSuccess : (state, action)=>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateUserFailure : (state,action)=>{
            state.error = action.payload;
            state.loading = false;
        },
    }
});

export const {signInStart, signInSuccess, signInFailure, signOutStart, signOutSuccess, signOutFailure, updateUserStart, updateUserSuccess, updateUserFailure} = userSlice.actions;
export default userSlice.reducer;
