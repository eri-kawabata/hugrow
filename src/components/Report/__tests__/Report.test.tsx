import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Report } from '../Report';
import { useReportData } from '../../../hooks/useReportData';
import { useSELResponses } from '../../../hooks/useSELResponses';
import { mockReportData, mockSELResponses } from '../../../test/fixtures';

jest.mock('../../../hooks/useReportData');
jest.mock('../../../hooks/useSELResponses');

describe('Report Component', () => {
  beforeEach(() => {
    (useReportData as jest.Mock).mockReturnValue({
      data: mockReportData,
      loading: false,
      error: null,
      isAuthenticated: true
    });

    (useSELResponses as jest.Mock).mockReturnValue({
      responses: mockSELResponses,
      loading: false,
      error: null,
      fetchResponses: jest.fn()
    });
  });

  it('正しくレンダリングされること', async () => {
    render(<Report />);
    
    expect(screen.getByRole('heading', { name: '学習レポート' })).toBeInTheDocument();
    expect(screen.getByText('総学習時間')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('感情分析')).toBeInTheDocument();
    });
  });

  it('エラー時に再試行ボタンが機能すること', async () => {
    const fetchResponses = jest.fn();
    (useSELResponses as jest.Mock).mockReturnValue({
      responses: [],
      loading: false,
      error: new Error('データの取得に失敗しました'),
      fetchResponses
    });

    render(<Report />);
    
    const retryButton = screen.getByRole('button', { name: '再試行' });
    await userEvent.click(retryButton);
    
    expect(fetchResponses).toHaveBeenCalled();
  });

  // その他のテストケース
}); 