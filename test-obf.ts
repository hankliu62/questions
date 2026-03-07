import { obfuscate, deobfuscate, isObfuscated } from './src/utils/crypto';

const testToken = 'ghp_test_token_12345';
console.log('Original Token:', testToken);

const obfuscated = obfuscate(testToken);
console.log('Obfuscated:', obfuscated);
console.log('Is Obfuscated:', isObfuscated(obfuscated));

const restored = deobfuscate(obfuscated);
console.log('Restored:', restored);

const notObfuscated = 'plain_text';
console.log('Plain Text Is Obfuscated:', isObfuscated(notObfuscated));
console.log('Deobfuscate Plain Text:', deobfuscate(notObfuscated));

if (testToken === restored) {
  console.log('Success: Restored token matches original.');
} else {
  console.log('Failure: Restored token does not match original.');
}
