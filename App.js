import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { Provider as AuthProvider, Context as AuthContext } from './src/context/AuthContext';
import * as Font from 'expo-font';
import '@fontsource/poppins/400.css' // Regular weight

// Import login
import LoginScreen from './src/login/LoginScreen';
import RegisterScreen from './src/login/RegisterScreen';

// Import screens
import TaskListScreen from './src/screens/TaskListScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import theme
import { darkTheme, navigationTheme } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const lastTabPress = useRef({ time: 0, tabName: '' });

  const handleTabPress = (tabName, navigation, route) => {
    const currentTime = new Date().getTime();
    const { time: lastTime, tabName: lastTab } = lastTabPress.current;

    lastTabPress.current = {
      time: currentTime,
      tabName,
    };

    if (
      tabName === 'Tasks' &&
      lastTab === 'Tasks' &&
      currentTime - lastTime < 300
    ) {
      const refreshTasks = route?.params?.refreshTasks;
      if (refreshTasks) {
        refreshTasks();
      }
      return;
    }

    if (!navigation.isFocused()) {
      navigation.navigate(tabName);
    }
  };

  const screenOptions = {
    tabBarActiveTintColor: darkTheme.primary.main,
    tabBarInactiveTintColor: darkTheme.text.secondary,
    tabBarStyle: {
      backgroundColor: darkTheme.background.elevated,
      borderTopColor: darkTheme.border.primary,
      height: 60,
      paddingBottom: 10,
    },
    headerStyle: {
      backgroundColor: darkTheme.background.primary,
      borderBottomColor: darkTheme.border.primary,
      borderBottomWidth: 1,
    },
    headerTintColor: darkTheme.text.primary,
    headerTitleStyle: {
      fontFamily: 'Poppins-Bold',
      fontSize: 20,
      color: darkTheme.text.primary,
    },
    headerTitleAlign: 'center',
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      fontSize: 12,
    },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          headerTitle: 'My Tasks',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleTabPress('Tasks', navigation, route);
          },
        })}
      />
      <Tab.Screen
        name="Add Task"
        component={AddTaskScreen}
        options={{
          headerTitle: 'Add New Task',
          tabBarLabel: 'Add Task',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              height: 60, 
              width: 60, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <View style={{
                backgroundColor: focused ? darkTheme.primary.main : darkTheme.primary.light,
                borderRadius: 30,
                padding: 15,
                marginBottom: 30,
              }}>
                <Ionicons name="add" size={30} color={darkTheme.text.primary} />
              </View>
            </View>
          ),
          tabBarIconStyle: {
            height: 60,
            width: 60,
          },
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleTabPress('Add Task', navigation);
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profile',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleTabPress('Profile', navigation);
          },
        })}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { state } = useContext(AuthContext);

  return (
    <Stack.Navigator
      initialRouteName={state.token ? 'MainApp' : 'Login'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: darkTheme.background.primary },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}