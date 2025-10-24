// styleManager.test.js
import { setStyle, resetStyle, applyPersistedStyles } from '../dev/styleManager';

describe('Style Manager', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
    localStorage.clear();
  });

  test('setStyle applies variable to document root', () => {
    setStyle('primary-color', 'red');
    expect(document.documentElement.style.getPropertyValue('--primary-color')).toBe('red');
  });

  test('setStyle persists variable to localStorage', () => {
    setStyle('background', 'blue');
    const styles = JSON.parse(localStorage.getItem('customStyles'));
    expect(styles.background).toBe('blue');
  });

  test('resetStyle removes variable from document root and storage', () => {
    setStyle('font-size', '16px');
    resetStyle('font-size');
    expect(document.documentElement.style.getPropertyValue('--font-size')).toBe('');
    const styles = JSON.parse(localStorage.getItem('customStyles'));
    expect(styles['font-size']).toBeUndefined();
  });

  test('applyPersistedStyles reapplies saved styles on load', () => {
    localStorage.setItem('customStyles', JSON.stringify({ 'primary-color': 'green' }));
    applyPersistedStyles();
    expect(document.documentElement.style.getPropertyValue('--primary-color')).toBe('green');
  });

  test('setStyle throws error if arguments missing', () => {
    expect(() => setStyle('only-variable')).toThrow();
    expect(() => setStyle('', 'someValue')).toThrow();
  });
});
