import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CustomBottomTabs from '../Components/Customs/CustomBottomTabs';
import HomeScreen from '../Screens/Home-Screen/HomeScreen';
import ProfileScreen from '../Screens/Profile-Screen/ProfileScreen';
import EventScreen from '../Screens/Event-Screen/EventScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomBottomTabs {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Event"
        component={EventScreen}
        options={{
          tabBarLabel: 'Events',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
