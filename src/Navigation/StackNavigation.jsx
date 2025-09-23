import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

import SplashScreen from '../Screens/Splash-Screen/SplashScreen';
import LoginScreen from '../Screens/Login-Screen/LoginScreen';
import SignupScreen from '../Screens/SignUp-Screen/SignupScreen';
import MainTabs from './BottomNavigation';
import ProfileScreen from '../Screens/Profile-Screen/ProfileScreen';
import LostFoundScreen from '../Screens/Lost&Found-Screen/LostFoundScreen';
import EventScreen from '../Screens/Event-Screen/EventScreen';
import AnonymousScreen from '../Screens/Anonymous-Screen/AnonymousScreen';
import FeedBackScreen from '../Screens/Feedback-Screen/FeedBackScreen';
import HelpBoardScreen from '../Screens/HelpBoard-Screen/HelpBoardScreen';
import ReportIssuesScreen from '../Screens/ReportIssues-Screen/ReportIssuesScreen';
import EditProfileScreen from '../Screens/Profile-Screen/EditProfileScreen';
import ViewIssuesDetail from '../Screens/ReportIssues-Screen/ViewIssuesDetail';
import ViewLostDetails from '../Screens/Lost&Found-Screen/ViewLostDetails';
import ViewFeedback from '../Screens/Feedback-Screen/ViewFeedback';
import ViewEventDetail from '../Screens/Event-Screen/ViewEventDetail';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  const token = useSelector(state => state.auth.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="LostFound" component={LostFoundScreen} />
        <Stack.Screen name="Anonymous" component={AnonymousScreen} />
        <Stack.Screen name="Feedback" component={FeedBackScreen} />
        <Stack.Screen name="HelpBoard" component={HelpBoardScreen} />
        <Stack.Screen name="ReportIssues" component={ReportIssuesScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ViewIssuesDetail" component={ViewIssuesDetail} />
        <Stack.Screen name="ViewLostDetails" component={ViewLostDetails} />
        <Stack.Screen name="ViewFeedback" component={ViewFeedback} />
        <Stack.Screen name="ViewEventDetail" component={ViewEventDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;
