import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { format, isBefore, addDays } from "date-fns";
import { isWithinInterval } from "date-fns/isWithinInterval";
import icons from "@/constants/icons";

interface InventoryItemProps {
  name: string;
  quantity: number;
  expiryDate: string;
  isFrozen: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  name,
  quantity,
  expiryDate,
  isFrozen,
  onEdit,
  onDelete,
}) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  const isExpired = isBefore(expiry, today);
  const isNearExpiry = isWithinInterval(expiry, { start: today, end: addDays(today, 7) });

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>Quantity: {quantity}</Text>
        <Text style={styles.details}>Expiry: {format(expiry, "yyyy-MM-dd")}</Text>
      </View>

      <View style={styles.icons}>
        {isFrozen && <Image source={icons.frozen} style={styles.icon} />}
        {isExpired && <Image source={icons.expired} style={styles.icon} />}
        {!isExpired && isNearExpiry && <Image source={icons.warning} style={styles.icon} />}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Image source={icons.edit} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Image source={icons.trash} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
});

export default InventoryItem;
