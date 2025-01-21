// src/context/AuthContext.js

import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.1.10:5000/api';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'signin':
      return { 
        errorMessage: '', 
        token: action.payload.token, 
        user: action.payload.user 
      };
    case 'clear_error_message':
      return { ...state, errorMessage: '' };
    case 'signout':
      return { token: null, errorMessage: '', user: null };
    default:
      return state;
  }
};

const clearErrorMessage = (dispatch) => () => {
  dispatch({ type: 'clear_error_message' });
};

const signup = (dispatch) => async ({ username, email, password }) => {
  try {
    console.log('Register request data:', { username, email, password });
    const response = await axios.post(`${API_URL}/users/register`, {
      username,
      email,
      password,
    });
    
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    dispatch({ 
      type: 'signin', 
      payload: {
        token: response.data.token,
        user: response.data.user
      }
    });
  } catch (err) {
    console.error('Register error:', err.response?.data || err.message);
    dispatch({
      type: 'add_error',
      payload: err.response?.data?.message || 'Something went wrong with sign up'
    });
  }
};

const signin = (dispatch) => async ({ username, password }) => {
  try {
    console.log('Login request data:', { username, password });
    const response = await axios.post(`${API_URL}/users/login`, {
      username,
      password,
    });

    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    dispatch({ 
      type: 'signin', 
      payload: {
        token: response.data.token,
        user: response.data.user
      }
    });
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    dispatch({
      type: 'add_error',
      payload: err.response?.data?.message || 'Invalid username or password'
    });
  }
};

const tryLocalSignin = (dispatch) => async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userString = await AsyncStorage.getItem('user');

    if (token && userString) {
      const user = JSON.parse(userString);
      dispatch({ 
        type: 'signin', 
        payload: {
          token,
          user
        }
      });
    }
  } catch (err) {
    console.error('Local signin error:', err);
    dispatch({
      type: 'add_error',
      payload: 'Error restoring token'
    });
  }
};

const signout = (dispatch) => async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    dispatch({ type: 'signout' });
  } catch (err) {
    console.error('Signout error:', err);
    dispatch({
      type: 'add_error',
      payload: 'Error signing out'
    });
  }
};

export const { Provider, Context } = createDataContext(
  authReducer,
  { 
    signup, 
    signin, 
    signout, 
    clearErrorMessage, 
    tryLocalSignin 
  },
  { 
    token: null, 
    errorMessage: '', 
    user: null 
  }
);