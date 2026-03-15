import { NextRequest, NextResponse } from 'next/server';
import { getFundInfo } from '@/lib/eastmoney';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundCode = searchParams.get('code');

    if (!fundCode) {
      return NextResponse.json(
        { error: '缺少基金代码' },
        { status: 400 }
      );
    }

    const fundInfo = await getFundInfo(fundCode);

    if (!fundInfo) {
      return NextResponse.json(
        { error: '基金不存在或数据获取失败' },
        { status: 404 }
      );
    }

    return NextResponse.json(fundInfo);
  } catch (error) {
    console.error('获取基金估值失败:', error);
    return NextResponse.json(
      { error: '获取基金估值失败' },
      { status: 500 }
    );
  }
}
