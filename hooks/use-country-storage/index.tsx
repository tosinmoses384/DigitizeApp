import { useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { useGetItemFromStorage } from '../get-item';
import { setUserCountryId } from '../../redux/slice/user-country-id/userCountryIdSlice';

export const useCountryStorage = () => {
  const dispatch = useAppDispatch();
  const { item: countryId } = useGetItemFromStorage('countryId');

  useEffect(() => {
    if (countryId) {
      dispatch(setUserCountryId(countryId));
    }
  }, [countryId, dispatch]);

  return { countryId };
};
