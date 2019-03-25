import { AsyncStorage, Alert } from 'react-native';
import axios from 'axios';

const ReturnAxiosInstance = () => {
  const AxiosInstance = axios.create({
    baseURL: 'https://api-dev.futabus.vn/api/v1/',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  AxiosInstance.interceptors.request.use(
    async (config) => {
      config.headers.Authorization = 'Bearer ' + await AsyncStorage.getItem('userToken')
      return config;
    },
    error => Promise.reject(error)
  );

  AxiosInstance.interceptors.response.use(
    response => response.data,
    (error) => {
      if (!error.response) {
        // Alert.alert('Network Error!');
        return console.log(error);
        // return dispatch({ type: 'NETWORK_FAILURE' });
      } else if (error.response.status === 500) {
        Alert.alert('Server Error!');
      } else if (error.response.status === 404) {
        Alert.alert('Endpoint doesn\'t exist!');
      }
      // handle the errors due to the status code here
      return error.response.data;
    },
  );
  return AxiosInstance;
};
export default new ReturnAxiosInstance()
