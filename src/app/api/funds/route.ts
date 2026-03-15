import { NextRequest, NextResponse } from 'next/server';
import { fundDB } from '@/lib/db';
import { getBatchFundInfo } from '@/lib/eastmoney';

// 获取用户的自选基金
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const fundCodes = await fundDB.getUserFunds(userId);
    const fundsInfo = await getBatchFundInfo(fundCodes);

    return NextResponse.json({ funds: fundsInfo });
  } catch (error) {
    console.error('获取基金列表失败:', error);
    return NextResponse.json(
      { error: '获取基金列表失败' },
      { status: 500 }
    );
  }
}

// 添加自选基金
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { fundCode } = await request.json();

    if (!fundCode || !/^\d{6}$/.test(fundCode)) {
      return NextResponse.json(
        { error: '基金代码格式不正确' },
        { status: 400 }
      );
    }

    await fundDB.add(userId, fundCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('添加基金失败:', error);
    return NextResponse.json(
      { error: '添加基金失败' },
      { status: 500 }
    );
  }
}

// 删除自选基金
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fundCode = searchParams.get('code');

    if (!fundCode) {
      return NextResponse.json(
        { error: '缺少基金代码' },
        { status: 400 }
      );
    }

    await fundDB.remove(userId, fundCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除基金失败:', error);
    return NextResponse.json(
      { error: '删除基金失败' },
      { status: 500 }
    );
  }
}
