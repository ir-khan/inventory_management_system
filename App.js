import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './src/navigations';

export default function App() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
