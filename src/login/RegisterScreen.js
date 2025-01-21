import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Context as AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme } from '../theme';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { state, signup, clearErrorMessage } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordInput, setPasswordInput] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [passwordTimer, setPasswordTimer] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    const unsubscribe = navigation.addListener('blur', () => {
      clearErrorMessage();
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setPasswordInput({
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      unsubscribe();
      if (passwordTimer) {
        clearTimeout(passwordTimer);
      }
    };
  }, [navigation, passwordTimer]);

  const validatePassword = useCallback((password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*#?&]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push('Password must be at least 8 characters');
    }
    if (!hasUpperCase) {
      errors.push('Include at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Include at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Include at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Include at least one special character (@$!%*#?&)');
    }
    
    return errors;
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const handlePasswordChange = useCallback((field, value) => {
    setPasswordInput(prev => ({
      ...prev,
      [field]: value
    }));

    if (passwordTimer) {
      clearTimeout(passwordTimer);
    }

    const newTimer = setTimeout(() => {
      const passwordErrors = validatePassword(value);
      
      if (field === 'password') {
        if (passwordErrors.length > 0) {
          setErrors(prev => ({
            ...prev,
            password: passwordErrors.join(', ')
          }));
        } else {
          setErrors(prev => {
            const { password, ...rest } = prev;
            return rest;
          });
        }
      }

      if (field === 'confirmPassword' || (field === 'password' && passwordInput.confirmPassword)) {
        if (field === 'password' && value !== passwordInput.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }));
        } else if (field === 'confirmPassword' && value !== passwordInput.password) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }));
        } else {
          setErrors(prev => {
            const { confirmPassword, ...rest } = prev;
            return rest;
          });
        }
      }

      if (passwordErrors.length === 0) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }, 500);

    setPasswordTimer(newTimer);
  }, [passwordInput, passwordTimer, validatePassword]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordErrors = validatePassword(passwordInput.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
    }

    if (!passwordInput.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordInput.password !== passwordInput.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordInput, validatePassword]);

  const handleSignup = async () => {
    if (isSubmitting) return;
    
    Keyboard.dismiss();
    clearErrorMessage();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: passwordInput.password
      });

      Alert.alert(
        'Success',
        'Registration successful! Please log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      if (errorMessage.includes('username')) {
        setErrors(prev => ({ ...prev, username: 'Username already exists' }));
      } else if (errorMessage.includes('email')) {
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field,
    placeholder,
    icon,
    isPassword = false,
    keyboardType = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <View style={[
        styles.inputWrapper,
        errors[field] && styles.inputError
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={errors[field] ? darkTheme.error : darkTheme.text.secondary} 
          style={styles.inputIcon} 
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={darkTheme.text.placeholder}
          value={isPassword ? passwordInput[field] : formData[field]}
          onChangeText={(text) => 
            isPassword ? handlePasswordChange(field, text) : handleInputChange(field, text)
          }
          secureTextEntry={isPassword && !showPasswords[field]}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          keyboardType={keyboardType}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPasswords(prev => ({
              ...prev,
              [field]: !prev[field]
            }))}
          >
            <Ionicons
              name={showPasswords[field] ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={darkTheme.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.content, isKeyboardVisible && styles.contentCompressed]}>
            {!isKeyboardVisible && (
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/Logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Please fill in the form to continue
                </Text>
              </View>
            )}

            <View style={styles.formContainer}>
              {renderInput('username', 'Username', 'person-outline')}
              {renderInput('email', 'Email', 'mail-outline', false, 'email-address')}
              {renderInput('password', 'Password', 'lock-closed-outline', true)}
              {renderInput('confirmPassword', 'Confirm Password', 'lock-closed-outline', true)}

              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.disabledButton]}
                onPress={handleSignup}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Ionicons 
                      name="arrow-forward" 
                      size={20} 
                      color="#fff" 
                      style={styles.buttonIcon} 
                    />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                disabled={isSubmitting}
              >
                <Text style={styles.loginButtonText}>
                  Already have an account? <Text style={styles.loginButtonTextBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  contentCompressed: {
    justifyContent: 'flex-end',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: darkTheme.text.primary,
    letterSpacing: 0.5,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkTheme.input.border,
    borderRadius: 12,
    backgroundColor: darkTheme.input.background,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: darkTheme.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: darkTheme.text.primary,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: darkTheme.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  button: {
    backgroundColor: darkTheme.button.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: darkTheme.button.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: darkTheme.button.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkTheme.divider,
  },
  dividerText: {
    color: darkTheme.text.secondary,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loginButton: {
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: darkTheme.text.secondary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loginButtonTextBold: {
    color: darkTheme.primary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default RegisterScreen;