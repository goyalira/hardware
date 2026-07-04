import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axios";

export interface Address {
  label?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  addresses?: Address[];
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
};

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Something went wrong. Please try again.";
}

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    payload: { name: string; email: string; password: string; phone?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      return data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_: void, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: Partial<Pick<AuthUser, "name" | "phone" | "addresses">>, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/auth/profile", payload);
      return data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
