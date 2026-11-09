import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#005A63";
const PINK = "#FFDDD2";

function iconByRoute(routeName: string): keyof typeof Ionicons.glyphMap {
    switch (routeName) {
        case "home": return "home";
        case "turma": return "people";
        case "userProfile": return "person";
        default: return "ellipse";
    }
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarIcon: ({ focused }) => {
                    const iconName = iconByRoute(route.name);
                    if (!focused) {
                        return (
                            <View style={styles.iconContainer}>
                                <Ionicons name={iconName} size={24} color={GREEN} />
                            </View>
                        );
                    }
                    return (
                        <View style={styles.iconContainerActive}>
                            <Ionicons name={iconName} size={24} color={PINK} />
                        </View>
                    );
                },
            })}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="turma" />
            <Tabs.Screen name="userProfile" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0, height: -2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: 25,
        paddingTop: 13
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center"
    },
    iconContainerActive: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: GREEN,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: GREEN,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.3,
        shadowRadius: 3
    },
});