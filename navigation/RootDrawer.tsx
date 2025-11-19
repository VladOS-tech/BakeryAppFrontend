import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import AddProductPage from '../app/(admin)/add-product'; // <- добавление продукта (создай эту страницу)
import RequestsPage from '../app/(admin)/requests'; // <- твоя страница заявок
import StatisticsPage from '../app/(admin)/statistics'; // <- страница статистики (создай)
import WarehousesPage from '../app/(admin)/warehouses'; // <- страница складов (создай)

const Drawer = createDrawerNavigator();

export default function RootDrawer() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Requests">
        <Drawer.Screen name="Requests" component={RequestsPage} options={{ title: 'Заявки' }} />
        <Drawer.Screen name="AddProduct" component={AddProductPage} options={{ title: 'Добавить продукт' }} />
        <Drawer.Screen name="Warehouses" component={WarehousesPage} options={{ title: 'Склады' }} />
        <Drawer.Screen name="Statistics" component={StatisticsPage} options={{ title: 'Статистика' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
