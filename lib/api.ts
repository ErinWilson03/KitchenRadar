import { databases, DATABASE_ID, INVENTORY_LOGS_COLLECTION_ID } from '@/lib/appwrite';

type RemovalReason = 'expired' | 'consumed' | 'preference' | 'other';

export const fetchDeletionLogs = async () => {
  const logs = await databases.listDocuments(
    DATABASE_ID,
    INVENTORY_LOGS_COLLECTION_ID
  );

  const aggregatedData = {
    totalDeleted: 0,
    reasons: {
      expired: 0,
      consumed: 0,
      preference: 0,
      other: 0,
    },
  };

  // logs.documents.forEach((log) => {
  //   // Add the quantity to the totalDeleted counter
  //   aggregatedData.totalDeleted += log.quantity;

  //   const reason = log.removal_reason as RemovalReason;
    
  //   // If the reason matches a known type, increment it; otherwise default to 'other'
  //   if (reason in aggregatedData.reasons) {
  //     aggregatedData.reasons[reason] += log.quantity;
  //   } else {
  //     aggregatedData.reasons.other += log.quantity;
  //   }
  // });

  logs.documents.forEach((log) => {
    aggregatedData.totalDeleted += log.quantity;

    // Normalize reason string: lowercase, trimmed
    const rawReason = String(log.action || '').trim().toLowerCase();

    const reason = ['expired', 'consumed', 'preference'].includes(rawReason)
      ? (rawReason as RemovalReason)
      : 'other';

    aggregatedData.reasons[reason] += log.quantity;
    console.log("Listed removal reasons: ", aggregatedData);
    
  });
  return aggregatedData;
};
    
