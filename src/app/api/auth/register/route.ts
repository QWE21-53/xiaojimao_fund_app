import { NextRequest, NextResponse } from 'next/server';
import { userDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '所有字段都不能为空' },
        { status: 400 }
      );
    }

    // 简单的邮箱验证
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    const user = await userDB.create(email, password, name);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    // 自动登录
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error: any) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    );
  }
}
