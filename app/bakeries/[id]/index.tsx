import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BakeryRequestsList from '../../../components/BakeryRequestsList';

export default function BakeryRequestsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <View style={styles.container}><Text style={styles.text}>Invalid bakery ID</Text></View>;
  }

  return <BakeryRequestsList bakeryId={id} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16 },
});
