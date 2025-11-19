import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StatisticsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Страница статистики</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  text: { color: '#fff', fontSize: 20 },
});
