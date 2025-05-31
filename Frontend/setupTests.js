import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Define global if it doesn't exist (for browser environments)
if (typeof global === 'undefined') {
  window.global = window;
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
