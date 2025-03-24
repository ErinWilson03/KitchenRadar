import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";


// todo delete this if not actually gonna use it
interface ItemDeletionModalProps {
  visible: boolean;
  itemName: string;
  onConfirm: (addToShoppingList: boolean) => void;
  onCancel: () => void;
}

const ItemDeletionModal: React.FC<ItemDeletionModalProps> = ({
  visible,
  itemName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Delete Item</Text>
          <Text style={styles.message}>
            Would you like to add "{itemName}" to your shopping list?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => onConfirm(true)}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onConfirm(false)}
            >
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  button: {
    width: 100,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ItemDeletionModal;
