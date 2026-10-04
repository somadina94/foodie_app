import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/types';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { PrivacyScreen } from '@/screens/auth/PrivacyScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { TermsScreen } from '@/screens/auth/TermsScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fafafa' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}
