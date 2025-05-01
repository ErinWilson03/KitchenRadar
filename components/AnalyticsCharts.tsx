import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface AnalyticsChartsProps {
  data: {
    totalDeleted: number;
    reasons: {
      expired: number;
      consumed: number;
      preference: number;
      other: number;
    };
  };
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const pieChartData = [
    {
      name: "Expired",
      quantity: data.reasons.expired,
      color: "#6b8e69",
    },
    {
      name: "Consumed",
      quantity: data.reasons.consumed,
      color: "#4e684f",
    },
    {
      name: "Preference",
      quantity: data.reasons.preference,
      color: "#1E3F20",
    },
    {
      name: "Other",
      quantity: data.reasons.other,
      color: "#b5c7a8",
    },
  ];

  // Calculate percentages
  const totalItems = data.totalDeleted;
  const pieChartDataWithPercentages = pieChartData.map((item) => ({
    ...item,
    percentage:
      totalItems > 0 ? ((item.quantity / totalItems) * 100).toFixed(1) : 0,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <PieChart
          data={pieChartDataWithPercentages.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            color: item.color,
            legendFontColor: "#000",
            legendFontSize: 0, // Hide default legend
          }))}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(30, 63, 32, ${opacity})`,
          }}
          accessor="quantity"
          backgroundColor="transparent"
          paddingLeft="90"
          absolute
          hasLegend={false}
        />
      </View>

      {/* Legend with Percentages */}
      <View style={styles.legend}>
        {pieChartDataWithPercentages.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>
              {item.name}: {item.percentage}%
            </Text>
          </View>
        ))}
      </View>

      <View className="w-full border-t border-primary-200 my-3"></View>

      {/* Total Items Deleted */}
      <Text style={styles.totalDeletedText}>
        Total Items Deleted: {data.totalDeleted}
      </Text>

      {/* Breakdown Table */}
      <View style={styles.table}>
        <Text style={styles.tableHeader}>Breakdown by Reason</Text>
        {pieChartData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableText}>{item.name}</Text>
            <Text style={styles.tableText}>{item.quantity}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  legend: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 16,
    color: "#1E3F20",
  },
  totalDeletedText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4e684f",
    textAlign: "center",
    marginTop: 20,
  },
  table: {
    marginTop: 40,
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3F20",
    marginBottom: 10,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableText: {
    fontSize: 16,
    color: "#1E3F20",
  },
});

export default AnalyticsCharts;
