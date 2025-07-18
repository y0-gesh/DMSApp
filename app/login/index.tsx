import { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image, ToastAndroid } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validateMobileNumber = (number: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleGenerateOTP = async () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    if (!mobileNumber) {
      setErrorMessage('Please enter your mobile number');
      return;
    }
    
    if (!validateMobileNumber(mobileNumber)) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Generating OTP for:', mobileNumber);
      
      const res = await axios.post('https://apis.allsoft.co/api/documentManagement/generateOTP', {
        mobile_number: mobileNumber,
      });
      
      console.log('Generate OTP Response:', JSON.stringify(res.data));
      
      if (res.data?.status === 'error') {
        throw new Error(res.data?.message || 'Failed to generate OTP');
      }
      
      // If successful, navigate to OTP screen
      router.push({ pathname: '/login/otp', params: { mobile: mobileNumber } });
    } catch (error: any) {
      console.error('Generate OTP Error:', error);
      
      // More specific error messages based on the error
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        if (error.response.status === 429) {
          setErrorMessage('Too many attempts. Please try again later.');
        } else if (error.response.status === 400) {
          setErrorMessage('Invalid mobile number format. Please check and try again.');
        } else if (error.response.status === 401) {
          // Handle unregistered mobile number
          setErrorMessage('This mobile number is not registered. Please contact your administrator to register.');
        } else {
          setErrorMessage(error.response.data?.message || 'Failed to send OTP. Please try again.');
        }
      } else if (error.request) {
        console.log('Error request:', error.request);
        setErrorMessage('Network error. Please check your internet connection.');
      } else {
        setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>Document Management System</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Login</Text>
        <Text style={styles.subheading}>Enter your mobile number to continue</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="10-digit mobile number"
            onChangeText={(text) => {
              setMobileNumber(text);
              if (errorMessage) setErrorMessage('');
            }}
            value={mobileNumber}
            editable={!loading}
          />
        </View>
        
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f9fc',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
  },
  prefix: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#7fb9ca',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
});
