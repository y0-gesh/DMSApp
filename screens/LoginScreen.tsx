import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-lg font-semibold mb-4">Enter Mobile Number</Text>
      <TextInput
        className="border border-gray-300 rounded w-full p-3 mb-4"
        placeholder="9876543210"
        keyboardType="phone-pad"
      />
      <TouchableOpacity className="bg-blue-600 px-4 py-3 rounded">
        <Text className="text-white text-center font-medium">Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
