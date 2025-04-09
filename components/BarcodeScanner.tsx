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
    scanLockRef.current = false; // Reset scan lock on close
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanLockRef.current) return; // Prevent multiple rapid scans
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
              scanLockRef.current = false; // Unlock scan on retry
              setScanned(false);
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", `Failed to fetch product data: ${error}`);
      scanLockRef.current = false; // Unlock scan after error
      setScanned(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionOverlay} />
        <View style={styles.permissionContent}>
          <Text style={styles.permissionText}>Camera Permission Required</Text>
          <Text style={styles.permissionDescription}>
            We need your permission to use the camera for barcode scanning
          </Text>
          <View style={styles.permissionButtons}>
            <TouchableOpacity
              style={styles.permissionCancelButton}
              onPress={handleClose}
            >
              <Text style={styles.permissionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.permissionGrantButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
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
        {/* Close button (X) in the top-right corner */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

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
              scanLockRef.current = false; // Unlock scan on retry
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
  cameraView: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  permissionContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionDescription: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  permissionCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  permissionGrantButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#00BFAE",
  },
  permissionButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BarcodeScanner;
