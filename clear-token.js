// Simple script to clear the stored token
const { deleteItemAsync } = require('expo-secure-store');

const clearToken = async () => {
  try {
    await deleteItemAsync('token');
    console.log('✅ Token cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing token:', error);
  }
};

clearToken();
