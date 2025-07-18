import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  ToastAndroid
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPVerification() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();
  
  // Create refs for each input field
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  
  // Get the combined OTP value
  const otp = otpValues.join('');
  
  // Start countdown for OTP resend
  
  // Start countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);
  
  // Handle input change for each OTP digit
  const handleOtpChange = (text: string, index: number) => {
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage('');
    
    // Handle pasting multiple digits
    if (text.length > 1) {
      // Only allow digits
      const digits = text.replace(/\D/g, '').split('').slice(0, 6);
      const newOtpValues = [...otpValues];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtpValues[index + i] = digit;
        }
      });
      
      setOtpValues(newOtpValues);
      
      // Focus on the next empty field or the last field
      const nextEmptyIndex = newOtpValues.findIndex(val => val === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
      return;
    }
    
    // Only allow digits for single character input
    if (text && !/^\d$/.test(text)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = text;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input if current input is filled
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpValues[index]) {
        // Clear current input if it has a value
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      } else if (index > 0) {
        // Focus and clear previous input when backspace is pressed on empty input
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      console.log('Verifying OTP:', { mobile_number: mobile, otp });
      
      const res = await axios.post('https://apis.allsoft.co/api/documentManagement/validateOTP', {
        mobile_number: mobile,
        otp,
      });

      console.log('OTP Verification Response:', JSON.stringify(res.data));
      
      if (res.data?.status === 'error' || !res.data?.token) {
        throw new Error(res.data?.message || 'Invalid OTP response');
      }

      const token = res.data?.token || res.data; // Adjust depending on actual response
      await signIn(token);
      
      // Router navigation is handled by AuthContext
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      
      // More specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          setErrorMessage('Invalid OTP. Please check and try again.');
        } else if (error.response.status === 404) {
          setErrorMessage('OTP expired or not found. Please request a new OTP.');
        } else {
          setErrorMessage(error.response.data?.message || 'Failed to verify OTP. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('Error request:', error.request);
        setErrorMessage('Network error. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage(error.message || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      console.log('Resending OTP to:', mobile);
      
      const res = await axios.post('https://apis.allsoft.co/api/documentManagement/generateOTP', {
        mobile_number: mobile,
      });
      
      console.log('Resend OTP Response:', JSON.stringify(res.data));
      
      if (res.data?.status === 'error') {
        throw new Error(res.data?.message || 'Failed to resend OTP');
      }
      
      // Reset countdown
      setCountdown(30);
      setResendDisabled(true);
      setOtpValues(['', '', '', '', '', '']);
      
      // Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.show('OTP has been resent to your mobile number', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'OTP has been resent to your mobile number');
      }
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      
      // More specific error messages based on the error
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        setErrorMessage(error.response.data?.message || 'Failed to resend OTP. Please try again.');
      } else if (error.request) {
        console.log('Error request:', error.request);
        setErrorMessage('Network error. Please check your internet connection.');
      } else {
        setErrorMessage(error.message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    router.back();
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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.heading}>Verify OTP</Text>
        <Text style={styles.subheading}>
          Enter the 6-digit code sent to <Text style={styles.phoneText}>{mobile}</Text>
        </Text>
        
        <View className="flex flex-row justify-between mb-6">
          {otpValues.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-12 h-14 border border-gray-300 rounded-lg bg-gray-50 text-center text-xl font-semibold"
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>
        
        {errorMessage ? (
          <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
        ) : null}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the OTP? </Text>
          {resendDisabled ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
              <Text style={styles.resendButton}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0a7ea4',
    fontWeight: '500',
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
  phoneText: {
    fontWeight: '600',
    color: '#333',
  },
  otpContainer: {
    marginBottom: 25,
  },
  otpInput: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  countdownText: {
    fontSize: 14,
    color: '#888',
  },
  resendButton: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
