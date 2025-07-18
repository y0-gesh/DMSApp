
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";



const _Layout = () => {
  return (
    // Bottom tab navigator
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 8,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginHorizontal: 0,
          marginBottom: 0,
          height: 60,
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 1,
          borderTopColor: "#eeeeee",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={focused ? "#0a7ea4" : "#666"} />
          ),
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#666",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={22} color={focused ? "#0a7ea4" : "#666"} />
          ),
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#666",
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: "Upload",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cloud-upload" : "cloud-upload-outline"} size={22} color={focused ? "#0a7ea4" : "#666"} />
          ),
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#666",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={focused ? "#0a7ea4" : "#666"} />
          ),
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#666",
        }}
      />
    </Tabs>
  );
};

export default _Layout;
