import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useBarcodeScanner } from "./../../hooks/useBarcodeScanner";
import { View, Text, Button } from "react-native";

// Mock component to simulate barcode scanning in the UI
const MockBarcodeScanner = ({ onScan }: { onScan: (barcode: string) => void }) => (
  <View>
    <Button title="Scan Barcode" onPress={() => onScan("123456789")} />
  </View>
);

// Mock API response to represent what an actual response could look like
const mockProductData = {
  name: "Mock Product",
  storageCategory: "fridge",
  dateType: "best_before",
  isFrozen: false,
  imageUrl: "https://example.com/mock-image.jpg",
  brand: "Mock Brand",
};

jest.mock("./../../hooks/useBarcodeScanner", () => {
  return {
    useBarcodeScanner: jest.fn(() => ({
      isLoading: false,
      error: null,
      productData: null,
      fetchProductData: jest.fn(() => Promise.resolve(mockProductData)),
    })),
  };
});

describe("Barcode Scanner Integration", () => {
  it("calls fetchProductData when barcode is scanned and updates UI", async () => {
    const { getByText, queryByText } = render(<MockBarcodeScanner onScan={useBarcodeScanner().fetchProductData} />);

    // Simulate barcode scan
    fireEvent.press(getByText("Scan Barcode"));

    // Check API call
    expect(useBarcodeScanner().fetchProductData).toHaveBeenCalled();

    // Wait for UI update
    await waitFor(() => {
      expect(queryByText("Mock Product")).toBeTruthy();
      expect(queryByText("Storage: fridge")).toBeTruthy();
      expect(queryByText("Brand: Mock Brand")).toBeTruthy();
    });
  });

  it("displays an error when API request fails", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
    const { getByText } = render(<MockBarcodeScanner onScan={useBarcodeScanner().fetchProductData} />);

    // Simulate barcode scan
    fireEvent.press(getByText("Scan Barcode"));

    // Wait for error message
    await waitFor(() => {
      expect(getByText("Error: Network error")).toBeTruthy();
    });
  });
});
