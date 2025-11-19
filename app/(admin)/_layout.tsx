import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function AdminDrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer>
        <Drawer.Screen name="requests" options={{ drawerLabel: "Заявки", title: "Заявки" }} />
        <Drawer.Screen name="add-product" options={{ drawerLabel: "Добавить продукт", title: "Добавить продукт" }} />
        <Drawer.Screen name="warehouses" options={{ drawerLabel: "Склады", title: "Склады" }} />
        <Drawer.Screen name="statistics" options={{ drawerLabel: "Статистика", title: "Статистика" }} />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
