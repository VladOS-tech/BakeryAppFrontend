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
        <Drawer.Screen name="index" options={{ drawerLabel: "Главная", title: "Главная" }} />
        <Drawer.Screen name="requests" options={{ drawerLabel: "Заявки", title: "Заявки" }} />
        <Drawer.Screen name="product" options={{ drawerLabel: "Управление продуктами", title: "Управление продуктами" }} />
        <Drawer.Screen name="warehouses" options={{ drawerLabel: "Управление складами", title: "Управление складами" }} />
        <Drawer.Screen name="bakeries" options={{ drawerLabel: "Управление булочными", title: "Управление булочными" }} />
        <Drawer.Screen name="statistics" options={{ drawerLabel: "Статистика", title: "Статистика" }} />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
