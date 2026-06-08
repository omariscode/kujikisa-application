import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const TABS_CONFIG = [
  {
    name: "index",
    title: "Início",
    icon: "home-outline" as const,
    iconActive: "home" as const,
  },
  {
    name: "history",
    title: "Histórico",
    icon: "time-outline" as const,
    iconActive: "time" as const,
  },
  {
    name: "manual-prescription",
    title: "Novo",
    icon: "add-outline" as const,
    iconActive: "add" as const,
  },
  {
    name: "settings",
    title: "Config",
    icon: "settings-outline" as const,
    iconActive: "settings" as const,
  },
  {
    name: "profile",
    title: "perfil",
    icon: "person-outline" as const,
    iconActive: "person" as const,
  },
];

const TAB_BAR_HEIGHT = isIOS ? 76 : 66;
const BORDER_RADIUS = isIOS ? 34 : 0;

function AnimatedTabItem({
  tab,
  isFocused,
  onPress,
  activeColor,
  inactiveColor,
  activeBg,
}: {
  tab: (typeof TABS_CONFIG)[number];
  isFocused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  activeBg: string;
}) {
  const bgScale = useSharedValue(isFocused ? 1 : 0.85);
  const bgOpacity = useSharedValue(isFocused ? 1 : 0);
  const iconScale = useSharedValue(isFocused ? 1.05 : 1);

  useEffect(() => {
    const springConfig = { damping: 24, stiffness: 280 };
    if (isFocused) {
      bgScale.value = withSpring(1, springConfig);
      bgOpacity.value = withTiming(1, { duration: 180 });
      iconScale.value = withSpring(1.05, springConfig);
    } else {
      bgScale.value = withSpring(0.85, springConfig);
      bgOpacity.value = withTiming(0, { duration: 160 });
      iconScale.value = withSpring(1, springConfig);
    }
  }, [isFocused]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
    opacity: bgOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityLabel={tab.title}
    >
      <Animated.View
        style={[
          styles.activeBackground,
          { backgroundColor: activeBg },
          bgStyle,
        ]}
        pointerEvents="none"
      />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isFocused ? tab.iconActive : tab.icon}
          size={22}
          color={isFocused ? activeColor : inactiveColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const { isDark, colors, backgrounds } = useAppTheme();
  const slideIn = useSharedValue(60);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    slideIn.value = withSpring(0, { damping: 22, stiffness: 220 });
    fadeIn.value = withTiming(1, { duration: 300 });
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideIn.value }],
    opacity: fadeIn.value,
  }));

  const activeBg = colors.primary;
  const activeIcon = "#FFFFFF";
  const inactiveIcon = isDark ? "#6B7280" : "#6B7280";

  const items = TABS_CONFIG.map((tab, index) => (
    <AnimatedTabItem
      key={tab.name}
      tab={tab}
      isFocused={state.index === index}
      activeColor={activeIcon}
      inactiveColor={inactiveIcon}
      activeBg={activeBg}
      onPress={() => {
        const event = navigation.emit({
          type: "tabPress",
          target: state.routes[index]?.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
          navigation.navigate(tab.name);
        }
      }}
    />
  ));

  if (isIOS) {
    return (
      <BlurView
        intensity={60}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.tabBarContainer,
          {
            borderColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.9)",
          },
        ]}
      >
        <View
          style={[
            styles.tabBarInner,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.2)"
                : "rgba(255,255,255,0.08)",
            },
          ]}
        >
          <Animated.View style={[styles.tabBarContent, barStyle]}>
            {items}
          </Animated.View>
        </View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.tabBarContainer,
        styles.tabBarContainerAndroid,
        {
          backgroundColor: backgrounds.tabBar,
          borderColor: "transparent",
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tabBarContent,
          { paddingTop: 0, paddingBottom: 0 },
          barStyle,
        ]}
      >
        {items}
      </Animated.View>
    </View>
  );
}

export default function AppLayout() {
  const { backgrounds } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: backgrounds.screen }]}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          animation: isIOS ? "fade" : "shift",
        }}
      >
        {TABS_CONFIG.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title }}
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: isIOS ? 16 : 0,
    left: isIOS ? 16 : 0,
    right: isIOS ? 16 : 0,
    height: TAB_BAR_HEIGHT,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    borderWidth: isIOS ? 1 : 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
    }),
  },
  tabBarContainerAndroid: {
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarInner: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
  },
  tabBarContent: {
    flexDirection: "row",
    paddingTop: isIOS ? 8 : 0,
    paddingBottom: isIOS ? 8 : 0,
  },
  tabItem: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBackground: {
    position: "absolute",
    width: 58,
    height: 36,
    borderRadius: 18,
  },
});
