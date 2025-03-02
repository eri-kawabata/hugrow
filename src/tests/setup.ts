import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// グローバルなモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// スクリーンリーダーのモック
jest.mock('../hooks/useA11y', () => ({
  useA11y: () => ({
    announceToScreenReader: jest.fn(),
  }),
})); 