import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';

import './global.css';
import { AppProviders } from '@/providers/AppProviders';

export default function App() {
  return (
    <>
      <AppProviders />
      <StatusBar style="dark" />
    </>
  );
}
