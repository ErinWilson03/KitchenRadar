import React, { useState, useEffect, useRef } from "react";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";

interface BarcodeScannerProps {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  onBarcodeScanned: (data: string, productData: any) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isModalVisible,
  setIsModalVisible,
  onBarcodeScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scanLockRef = useRef(false); // UseRef will prevent multiple scans

  const { isLoading, error, fetchProductData } = useBarcodeScanner();

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      console.log("Camera permission status:", permission?.status);
    })();
  }, [permission]);

  const handleClose = () => {
    setIsModalVisible(false);
    setScanned(false);
    scanLockRef.current = false; // ✅ Reset scan lock on close
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanLockRef.current) return; // ✅ Prevent multiple rapid scans
    scanLockRef.current = true;

    setScanned(true);

    try {
      const result = await fetchProductData(data);

      if (!result) {
        Alert.alert("Error", "No product data found. Try again.");
        scanLockRef.current = false;
        setScanned(false);
        return;
      }

      Alert.alert(
        "Product Found",
        `Name: ${result.name}\nStorage: ${result.storageCategory}\nDate Type: ${result.dateType}\nFrozen: ${result.isFrozen ? "Yes" : "No"}`,
        [
          {
            text: "Use This Product",
            onPress: () => {
              onBarcodeScanned(data, result);
              handleClose();
            },
          },
          {
            text: "Scan Again",
            onPress: () => {
              scanLockRef.current = false; // ✅ Unlock scan on retry
              setScanned(false);
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", `Failed to fetch product data: ${error}`);
      scanLockRef.current = false; // ✅ Unlock scan after error
      setScanned(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 relative">
        <View className="absolute inset-0 bg-black/50" />
        <View className="absolute inset-0 justify-center items-center z-10">
          <View className="bg-white rounded-2xl p-6 w-[85%] max-w-[400px] shadow-lg">
            <Text className="text-xl font-semibold mb-3 text-center">
              Camera Permission Required
            </Text>
            <Text className="text-base text-gray-600 mb-6 text-center leading-6">
              We need your permission to use the camera for barcode scanning
            </Text>
            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 p-3.5 rounded-lg bg-gray-100"
                onPress={handleClose}
              >
                <Text className="text-gray-600 text-center text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-3.5 rounded-lg bg-primary-300"
                onPress={requestPermission}
              >
                <Text className="text-white text-center text-base font-medium">
                  Grant Permission
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.cameraView}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8"],
        }}
        onBarcodeScanned={!scanned ? handleBarCodeScanned : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.cornerTL, styles.corner]} />
              <View style={[styles.cornerTR, styles.corner]} />
              <View style={[styles.cornerBL, styles.corner]} />
              <View style={[styles.cornerBR, styles.corner]} />
            </View>
            <Text style={styles.scanText}>Align barcode in the frame</Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BFAE" />
            <Text style={styles.loadingText}>Fetching product data...</Text>
          </View>
        )}

        {scanned && !isLoading && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              scanLockRef.current = false; // ✅ Unlock scan on retry
            }}
          >
            <Text style={styles.scanAgainText}>Tap to scan again</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#000",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 22,
  },
  placeholderView: {
    width: 40,
  },
  cameraView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanAreaContainer: {
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderRadius: 8,
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00BFAE",
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanText: {
    color: "#fff",
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 191, 174, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
  },
});

export default BarcodeScanner;
