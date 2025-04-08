import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignIn from "@/app/sign-in";
import { useGlobalContext } from "@/lib/global-provider";
import { login } from "@/lib/appwrite";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

// Mock useGlobalContext
jest.mock("@/lib/global-provider", () => ({
  useGlobalContext: jest.fn(),
}));

// Mock login function
jest.mock("@/lib/appwrite", () => ({
  login: jest.fn(),
}));

// Ensure TypeScript understands it's a Jest mock function
const mockUseGlobalContext = useGlobalContext as jest.MockedFunction<
  typeof useGlobalContext
>;

const googleLoginText = "Continue using Google";
const facebookLoginText = "Continue using Facebook";

describe("SignIn Screen", () => {
  const mockLogin = login as jest.MockedFunction<typeof login>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGlobalContext.mockReturnValue({
      refetch: jest.fn(),
      loading: false,
      isLoggedIn: false,
      user: null,
    });
  });

  it("renders the SignIn screen correctly", () => {
    const { getByText } = render(<SignIn />);

    expect(getByText("Manage your Waste-Free Future")).toBeTruthy();
    expect(getByText("Login to KitchenRadar")).toBeTruthy();
    expect(getByText(googleLoginText)).toBeTruthy();
    expect(getByText(facebookLoginText)).toBeTruthy();
  });

  it("calls login function when Google button is pressed", async () => {
    mockLogin.mockResolvedValue(true);

    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText(googleLoginText));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("google"));
  });

  it("handles login failure correctly", async () => {
    mockLogin.mockResolvedValue(false);

    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText(googleLoginText));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("google"));
  });
});
