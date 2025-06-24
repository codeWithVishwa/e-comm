import { createSlice } from '@reduxjs/toolkit';

// Helper function to load state from localStorage
const loadInitialState = () => {
  try {
    const savedState = localStorage.getItem('userState');
    return savedState ? JSON.parse(savedState) : {
      _id: "",
      name: "",
      email: "",
      avatar: "",
      number: "",
      verify_email: false,
      last_login_date: "",
      status: "active",
      address_details: [],
      shopping_cart: [],
      orderHistory: [],
      role: "",
      token: "",
      refresh_token: ""
    };
  } catch (error) {
    console.error("Failed to parse user state from localStorage", error);
    return {
      _id: "",
      name: "",
      email: "",
      avatar: "",
      number: "",
      verify_email: false,
      last_login_date: "",
      status: "active",
      address_details: [],
      shopping_cart: [],
      orderHistory: [],
      role: "",
      token: "",
      refresh_token: ""
    };
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState: loadInitialState(),
  reducers: {
    setUserDetails: (state, action) => {
      const updatedState = {
        ...state,
        ...action.payload,
        _id: action.payload?._id || state._id,
        email: action.payload?.email || state.email
      };
      
      try {
        localStorage.setItem('userState', JSON.stringify(updatedState));
      } catch (error) {
        console.error("Failed to save user state to localStorage", error);
      }
      
      return updatedState;
    },

    updateAvatar: (state, action) => {
      const newState = {
        ...state,
        avatar: action.payload
      };
      try {
        localStorage.setItem('userState', JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save avatar to localStorage", error);
      }
      return newState;
    },

    updateProfile: (state, action) => {
      const newState = {
        ...state,
        name: action.payload.name ?? state.name,
        email: action.payload.email ?? state.email,
        number: action.payload.number ?? state.number
      };
      
      try {
        localStorage.setItem('userState', JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save profile updates to localStorage", error);
      }
      return newState;
    },

    updateUser: (state, action) => {
      const newState = {
        ...state,
        ...action.payload,
        _id: state._id, // Protect immutable fields
        email: action.payload.email || state.email
      };
      
      try {
        localStorage.setItem('userState', JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save user updates to localStorage", error);
      }
      return newState;
    },

    logout: () => {
      try {
        localStorage.removeItem('userState');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } catch (error) {
        console.error("Failed to clear user data from localStorage", error);
      }
      return {
        _id: "",
        name: "",
        email: "",
        avatar: "",
        number: "",
        verify_email: false,
        last_login_date: "",
        status: "active",
        address_details: [],
        shopping_cart: [],
        orderHistory: [],
        role: "",
        token: "",
        refresh_token: ""
      };
    },

    addAddress: (state, action) => {
      const newState = {
        ...state,
        address_details: [...state.address_details, action.payload]
      };
      try {
        localStorage.setItem('userState', JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save address to localStorage", error);
      }
      return newState;
    },

    updateCart: (state, action) => {
      const newState = {
        ...state,
        shopping_cart: action.payload
      };
      try {
        localStorage.setItem('userState', JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
      return newState;
    }
  }
});

export const { 
  setUserDetails, 
  logout, 
  updateAvatar, 
  updateProfile,
  updateUser,
  addAddress,
  updateCart
} = userSlice.actions;

export default userSlice.reducer;