'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

interface FundInfo {
  code: string;
  name: string;
  type: string;
  netValue: number;
  netValueDate: string;
  dayGrowth: number;
  estimatedValue?: number;
  estimatedGrowth?: number;
  updateTime?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFundCode, setNewFundCode] = useState('');
  const [error, setError] = useState('');

  const { data, error: fetchError, mutate } = useSWR<{ funds: FundInfo[] }>(
    '/api/funds',
    fetcher,
    { refreshInterval: 30000 } // 每30秒刷新
  );

  useEffect(() => {
    if (fetchError?.message?.includes('未登录')) {
      router.push('/login');
    }
  }, [fetchError, router]);

  const handleAddFund = async () => {
    if (!/^\d{6}$/.test(newFundCode)) {
      setError('基金代码必须是6位数字');
      return;
    }

    try {
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fundCode: newFundCode })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewFundCode('');
      setShowAddModal(false);
      setError('');
      mutate();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteFund = async (fundCode: string) => {
    try {
      const response = await fetch(`/api/funds?code=${fundCode}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      mutate();
    } catch (err) {
      console.error('删除基金失败:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">基金实时估值</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + 添加基金
          </button>
        </div>

        {/* Fund List */}
        {data.funds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            还没有添加基金，点击上方按钮添加
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.funds.map((fund) => (
              <div
                key={fund.code}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {fund.name}
                    </h3>
                    <p className="text-sm text-gray-500">{fund.code}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFund(fund.code)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">净值</span>
                    <span className="font-medium">{fund.netValue.toFixed(4)}</span>
                  </div>

                  {fund.estimatedValue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">估值</span>
                      <span className="font-medium">{fund.estimatedValue.toFixed(4)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">涨幅</span>
                    <span
                      className={`font-bold ${
                        (fund.estimatedGrowth || fund.dayGrowth) >= 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {((fund.estimatedGrowth || fund.dayGrowth) >= 0 ? '+' : '')}
                      {(fund.estimatedGrowth || fund.dayGrowth).toFixed(2)}%
                    </span>
                  </div>

                  {fund.updateTime && (
                    <div className="text-xs text-gray-400 mt-2">
                      更新时间: {fund.updateTime}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Fund Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">添加基金</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="输入6位基金代码"
              value={newFundCode}
              onChange={(e) => setNewFundCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              maxLength={6}
            />

            <div className="flex gap-2">
              <button
                onClick={handleAddFund}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setNewFundCode('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
