// components/features/home/PrincipalScreen.tsx
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/(tabs)/context';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

// ✅ TU HAPTIC TAB (ajustá el path si hace falta)
import { HapticTab } from '@/constants/HapticTab';

// Screens reales
import CredencialScreen from '@/components/features/home/CredencialScreen';
import PrestadorScreen from '@/components/features/home/PrestadoresScreen';
import FarmaciaScreen from './FarmaciaScreen';

// Menú lateral
import { MenuProvider, useMenu } from '@/components/menu/MenuProvider';
import { RightMenu } from '@/components/menu/RightMenu';

type RootTabParamList = {
  Inicio: undefined;
  Farmacias: undefined;
  Prestadores: undefined;
  Credencial: undefined;
};

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

const Tab = createBottomTabNavigator<RootTabParamList>();

const TITLES: Record<keyof RootTabParamList, string> = {
  Inicio: 'Medic Gestión',
  Farmacias: 'Farmacias',
  Prestadores: 'Prestadores',
  Credencial: 'Mi credencial',
};

const ICONS: Record<keyof RootTabParamList, React.ComponentProps<typeof Ionicons>['name']> = {
  Inicio: 'home',
  Farmacias: 'medkit',
  Prestadores: 'people',
  Credencial: 'card',
};

type InicioProps = BottomTabScreenProps<RootTabParamList, 'Inicio'>;

const InicioScreen: React.FC<InicioProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const userName = useMemo(() => user?.nombre ?? 'invitado', [user]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.Title, { color: theme.colors.text }]}>Bienvenido, {userName}</Text>
      <View style={[styles.lineaInferior2, { backgroundColor: theme.isDark ? '#23324A' : '#BFD6EF' }]} />

      <Text style={[styles.Title, { marginTop: 18, fontSize: 22, color: theme.colors.text }]}>
        Accesos rápidos
      </Text>
      <View style={[styles.lineaInferior2, { backgroundColor: theme.isDark ? '#23324A' : '#BFD6EF' }]} />

      <View style={{ marginTop: 12, gap: 10 }}>
        <Pressable
          onPress={() => navigation.navigate('Farmacias')}
          style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Ir a Farmacias"
        >
          <Ionicons name="medkit-outline" size={22} color={theme.colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Farmacias</Text>
            <Text style={[styles.quickSub, { color: theme.colors.muted }]}>
              Buscá farmacias y datos de contacto.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Prestadores')}
          style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Ir a Prestadores"
        >
          <Ionicons name="people-outline" size={22} color={theme.colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Prestadores</Text>
            <Text style={[styles.quickSub, { color: theme.colors.muted }]}>
              Encontrá médicos y centros disponibles.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Credencial')}
          style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Ir a Mi credencial"
        >
          <Ionicons name="card-outline" size={22} color={theme.colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Mi credencial</Text>
            <Text style={[styles.quickSub, { color: theme.colors.muted }]}>
              Mostrá tu credencial rápidamente.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </Pressable>
      </View>

      <Text style={[styles.Title, { marginTop: 18, fontSize: 22, color: theme.colors.text }]}>
        Novedades
      </Text>
      <View style={[styles.lineaInferior2, { backgroundColor: theme.isDark ? '#23324A' : '#BFD6EF' }]} />

      <View style={{ marginTop: 12 }}>
        <View style={[styles.novedadCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.text} />
          <Text style={[styles.novedadText, { color: theme.colors.text }]}>
            Mantenete al día con información importante de tu cobertura y servicios.
          </Text>
        </View>

        <View style={[styles.novedadCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="call-outline" size={20} color={theme.colors.text} />
          <Text style={[styles.novedadText, { color: theme.colors.text }]}>
            En caso de urgencia, utilizá los canales oficiales desde la app.
          </Text>
        </View>

        <View style={[styles.novedadCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="documents-outline" size={20} color={theme.colors.text} />
          <Text style={[styles.novedadText, { color: theme.colors.text }]}>
            Revisá tu credencial y prestadores disponibles desde las pestañas inferiores.
          </Text>
        </View>
      </View>

      <Text style={[styles.Title, { marginTop: 18, fontSize: 22, color: theme.colors.text }]}>
        Medic te ayuda
      </Text>
      <View style={[styles.lineaInferior2, { backgroundColor: theme.isDark ? '#23324A' : '#BFD6EF' }]} />

      <View style={[styles.cajaTexto, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.texto, { color: theme.colors.muted }]}>
          Accedé rápido a prestadores, farmacias y tu credencial desde el menú y las pestañas.
        </Text>
      </View>
    </ScrollView>
  );
};

export default function PrincipalScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // ✅ clave para NO superponer con la barra de navegación de Android:
  const extraBottom = Math.max(insets.bottom, 10); // 10px mínimo por seguridad
  const baseHeight = 56; // altura base cómoda (sin adivinar demasiado)

  return (
    <MenuProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Tab.Navigator
          initialRouteName="Inicio"
          backBehavior="history"
          // ✅ refuerza safe area en tabs (por si algún device raro no lo respeta)
          safeAreaInsets={{ bottom: extraBottom }}
          screenOptions={({ route }) => ({
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.headerBg },
            headerTitleAlign: 'left',
            headerTitle: () => (
              <Text style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                {TITLES[route.name as keyof RootTabParamList]}
              </Text>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <HeaderBurger />
              </View>
            ),

            // ✅ TU HAPTIC TAB
            tabBarButton: (props) => <HapticTab {...props} />,

            // ✅ indicador arriba del tab activo
            tabBarIcon: ({ size, color, focused }) => {
              const iconName = ICONS[route.name as keyof RootTabParamList] ?? 'home';
              return (
                <View style={styles.iconWrap}>
                  <View
                    style={[
                      styles.activeTopLine,
                      { backgroundColor: focused ? theme.colors.tabActive : 'transparent' },
                    ]}
                  />
                  <Ionicons name={iconName} size={size} color={color} />
                </View>
              );
            },

            tabBarLabel: TITLES[route.name as keyof RootTabParamList],

            lazy: false,
            freezeOnBlur: true,
            tabBarHideOnKeyboard: true,

            tabBarActiveTintColor: theme.colors.tabActive,
            tabBarInactiveTintColor: theme.colors.tabInactive,

            // ✅ acá está la diferencia: altura/padding según insets
            tabBarStyle: {
              backgroundColor: theme.colors.tabBg,
              borderTopColor: theme.colors.tabBorder,
              height: baseHeight + extraBottom,
              paddingBottom: extraBottom,
              paddingTop: 8,
            },
          })}
        >
          <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: '' }} />
          <Tab.Screen name="Farmacias" component={FarmaciaScreen} />
          <Tab.Screen name="Prestadores" component={PrestadorScreen} />
          <Tab.Screen name="Credencial" component={CredencialScreen} options={{ title: TITLES.Credencial }} />
        </Tab.Navigator>

        <RightMenu />
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 20, fontWeight: '600', marginLeft: 2 },

  container: { flex: 1 },
  Title: { fontSize: 28, fontWeight: '600' },
  lineaInferior2: { height: 2, width: '100%', borderRadius: 2 },

  cajaTexto: {
    padding: 8,
    borderRadius: 8,
    elevation: 10,
    marginTop: 12,
  },
  texto: { margin: 8, fontSize: 16, textAlign: 'center' },

  novedadCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  novedadText: { flex: 1, fontSize: 14, lineHeight: 20 },

  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  quickTitle: { fontSize: 16, fontWeight: '700' },
  quickSub: { marginTop: 2, fontSize: 13 },

  iconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTopLine: {
    position: 'absolute',
    top: -8,
    height: 3,
    width: 34,
    borderRadius: 3,
  },
});
