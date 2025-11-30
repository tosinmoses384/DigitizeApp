import { useEffect } from 'react';
import { useNavigation } from 'expo-router';

export const useNavigationSetup = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const listener = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.dispatch(e.data.action);
    });

    return () => {
      listener();
    };
  }, [navigation]);

  return { navigation };
};
