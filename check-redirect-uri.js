import * as AuthSession from 'expo-auth-session';

// Generate development redirect URI
const devRedirectUri = AuthSession.makeRedirectUri({
  scheme: undefined,
  path: 'oauth'
});

console.log('=== GOOGLE CLOUD CONSOLE REDIRECT URIs ===');
console.log('Add these redirect URIs to your Google OAuth configuration:');
console.log('');
console.log('1. Development/Expo Go:');
console.log('   ', devRedirectUri);
console.log('');
console.log('2. Production iOS:');
console.log('   ', 'com.digitizeapp.digitizeapp:/oauth');
console.log('');
console.log('3. Production Android:');
console.log('   ', 'com.digitizeapp.digitizeapp:/oauth');
console.log('');
console.log('4. Keep your existing web redirect:');
console.log('   ', 'https://staging-auth.digitizeapp.com/oauth2/idpresponse');
console.log('');
console.log('=====================================');
