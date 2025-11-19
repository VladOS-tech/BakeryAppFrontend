import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Tab {
  key: string;
  label: string;
}

const TABS: Tab[] = [
  { key: 'bakeries', label: 'По булочным' },
  { key: 'warehouses', label: 'По складам' },
  { key: 'products', label: 'По продуктам' },
];

interface Props {
  tab: string;
  setTab: (tab: string) => void;
}

const TabSwitcher: React.FC<Props> = ({ tab, setTab }) => {
  return (
    <View style={styles.container}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tab, tab === t.key && styles.activeTab]}
          onPress={() => setTab(t.key)}
        >
          <Text style={styles.tabText}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#0a5',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TabSwitcher;
