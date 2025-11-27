import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { logout } from '@/constants/auth';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#111' },
          headerTintColor: '#fff',
        }}
        drawerContent={props => (
          <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            <DrawerItemList {...props} />

            <View style={{ marginTop: 'auto' }}>
              <TouchableOpacity style={styles.logoutItem} onPress={logout}>
                <Text style={styles.logoutText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </DrawerContentScrollView>
        )}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: 'Главная', title: 'Главная' }} />
        <Drawer.Screen name="requests" options={{ drawerLabel: 'История заявок', title: 'История заявок' }} />
        <Drawer.Screen name="product" options={{ drawerLabel: 'Управление продуктами', title: 'Управление продуктами' }} />
        <Drawer.Screen name="warehouses" options={{ drawerLabel: 'Управление складами', title: 'Управление складами' }} />
        <Drawer.Screen name="bakeries" options={{ drawerLabel: 'Управление булочными', title: 'Управление булочными' }} />
        <Drawer.Screen name="staff" options={{ drawerLabel: 'Управление персоналом', title: 'Управление персоналом' }} />
        <Drawer.Screen name="statistics" options={{ drawerLabel: 'Статистика', title: 'Статистика' }} />
        <Drawer.Screen name="audit" options={{ drawerLabel: 'Журнал аудита', title: 'Журнал аудита' }} />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  logoutItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  logoutText: {
    color: '#f44336',
    fontSize: 15,
    fontWeight: '600',
  },
});
