// components/features/home/PrincipalScreen.tsx
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '@/app/(tabs)/context';

// Screens reales
import CredencialScreen from '@/components/features/home/CredencialScreen';
import PrestadorScreen from '@/components/features/home/PrestadoresScreen';
import FarmaciaScreen from './FarmaciaScreen';

// Menú lateral
import { MenuProvider, useMenu } from '@/components/menu/MenuProvider';
import { RightMenu } from '@/components/menu/RightMenu';

function HeaderBurger() {
  const { open } = useMenu();
  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel="Abrir menú">
      <View
        style={{
          width: 30,
          height: 22,
          justifyContent: 'space-between',
          paddingVertical: 2,
          marginRight: 8,
        }}
      >
        <View style={{ height: 3, borderRadius: 2, backgroundColor: '#fff' }} />
        <View style={{ height: 3, borderRadius: 2, backgroundColor: '#fff' }} />
        <View style={{ height: 3, borderRadius: 2, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}

const Tab = createBottomTabNavigator();

const InicioScreen: React.FC = () => {
  const { user } = useAuth();
  const userName = useMemo(() => user?.nombre ?? 'invitado', [user]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.Title}>Bienvenido, {userName}</Text>
      <View style={styles.lineaInferior2} />

      <Text style={[styles.Title, { marginTop: 18, fontSize: 22 }]}>Novedades</Text>
      <View style={styles.lineaInferior2} />

      <View style={{ marginTop: 12 }}>
        <View style={styles.novedadCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0f172a" />
          <Text style={styles.novedadText}>
            Mantenete al día con información importante de tu cobertura y servicios.
          </Text>
        </View>

        <View style={styles.novedadCard}>
          <Ionicons name="call-outline" size={20} color="#0f172a" />
          <Text style={styles.novedadText}>
            En caso de urgencia, utilizá los canales oficiales desde la app.
          </Text>
        </View>

        <View style={styles.novedadCard}>
          <Ionicons name="documents-outline" size={20} color="#0f172a" />
          <Text style={styles.novedadText}>
            Revisá tu credencial y prestadores disponibles desde las pestañas inferiores.
          </Text>
        </View>
      </View>

      <Text style={[styles.Title, { marginTop: 18, fontSize: 22 }]}>Medic te ayuda</Text>
      <View style={styles.lineaInferior2} />

      <View style={styles.cajaTexto}>
        <Text style={styles.texto}>
          Accedé rápido a prestadores, farmacias y tu credencial desde el menú y las pestañas.
        </Text>
      </View>
    </ScrollView>
  );
};

export default function PrincipalScreen() {
  const ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    Inicio: 'home',
    Farmacias: 'medkit',
    Prestadores: 'people',
    Credencial: 'card',
  };

  return (
    <MenuProvider>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          initialRouteName="Inicio"
          screenOptions={({ route }) => ({
            headerShown: true,
            headerStyle: styles.header,
            headerTitleAlign: 'left',
            headerTitle: () => (
              <Text style={styles.headerTitle}>
                {route.name === 'Inicio' ? 'Medic Gestión' : route.name}
              </Text>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {route.name === 'Inicio' && <HeaderBurger />}
              </View>
            ),
            tabBarIcon: ({ size, color }) => {
              const iconName = ICONS[route.name] ?? 'home';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1E5631',
            tabBarInactiveTintColor: '#fff',
            tabBarStyle: styles.tabBar,
          })}
        >
          <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: '' }} />
          <Tab.Screen name="Farmacias" component={FarmaciaScreen} />
          <Tab.Screen name="Prestadores" component={PrestadorScreen} />
          <Tab.Screen
            name="Credencial"
            component={CredencialScreen}
            options={{ title: 'Mi credencial' }}
          />
        </Tab.Navigator>

        <RightMenu />
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#7FADDF', elevation: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginLeft: 2 },

  container: { flex: 1, backgroundColor: '#f5f5f5' },
  Title: { fontSize: 28, fontWeight: '600', color: '#111111' },
  lineaInferior2: { height: 2, width: '100%', backgroundColor: '#BFD6EF', borderRadius: 2 },

  cajaTexto: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    elevation: 10,
    marginTop: 12,
  },
  texto: { margin: 8, fontSize: 16, textAlign: 'center', color: '#424242' },

  novedadCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  novedadText: { flex: 1, color: '#111827', fontSize: 14, lineHeight: 20 },

  tabBar: { backgroundColor: '#7FADDF', borderTopColor: '#7FADDF' },
});
