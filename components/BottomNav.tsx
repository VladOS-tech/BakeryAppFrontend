import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NAV_ITEMS = [
  { key: 'requests', label: 'Заявки', route: '/requests' },
  { key: 'addProduct', label: 'Добавить продукт', route: '/add-product' },
  { key: 'statistics', label: 'Статистика', route: '/statistics' },
];

const BottomNav: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.navButton}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#222',
    borderTopColor: '#333',
    borderTopWidth: 1,
    paddingVertical: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default BottomNav;
