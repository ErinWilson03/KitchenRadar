import React, { useEffect, useState } from "react";
import { Text, ScrollView, ActivityIndicator } from "react-native";
import { fetchDeletionLogs } from "@/lib/api";
import AnalyticsCharts from "@/components/AnalyticsCharts";

type DeletionLogData = {
  totalDeleted: number;
  reasons: {
    expired: number;
    consumed: number;
    preference: number;
    other: number;
  };
};

const defaultData: DeletionLogData = {
  totalDeleted: 0,
  reasons: {
    expired: 0,
    consumed: 0,
    preference: 0,
    other: 0,
  },
};

const Insights = () => {
  const [data, setData] = useState<DeletionLogData>(defaultData); // this avoids an error that the data could be undefined as we're beginning with a populated state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      const fetchedData = await fetchDeletionLogs();
      if (fetchedData) {
        setData(fetchedData);
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#1E3F20",
          textAlign: "center",
        }}
      >
        Kitchen Insights
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6b8e69",
          textAlign: "center",
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Let's take a look at your household consumption and waste
      </Text>

      <AnalyticsCharts data={data} />
    </ScrollView>
  );
};

export default Insights;
