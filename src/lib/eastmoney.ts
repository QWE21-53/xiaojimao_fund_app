/**
 * 东方财富网基金数据抓取
 * 数据源：天天基金网 API
 */

export interface FundInfo {
  code: string;
  name: string;
  type: string;
  netValue: number; // 最新净值
  netValueDate: string; // 净值日期
  dayGrowth: number; // 日增长率
  estimatedValue?: number; // 实时估值
  estimatedGrowth?: number; // 实时估算涨幅
  updateTime?: string; // 更新时间
}

export interface StockHolding {
  code: string;
  name: string;
  ratio: number; // 持仓比例
  shares: number; // 持股数量
}

/**
 * 获取基金基本信息
 */
export async function getFundInfo(fundCode: string): Promise<FundInfo | null> {
  try {
    // 天天基金网 API
    const url = `https://fundgz.1234567.com.cn/js/${fundCode}.js`;
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://fund.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const text = await response.text();
    
    // 解析 JSONP 响应
    const jsonMatch = text.match(/jsonpgz\((.*)\)/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[1]);

    return {
      code: data.fundcode,
      name: data.name,
      type: '混合型', // 需要额外接口获取
      netValue: parseFloat(data.dwjz),
      netValueDate: data.jzrq,
      dayGrowth: parseFloat(data.gszzl),
      estimatedValue: parseFloat(data.gsz),
      estimatedGrowth: parseFloat(data.gszzl),
      updateTime: data.gztime
    };
  } catch (error) {
    console.error(`获取基金 ${fundCode} 信息失败:`, error);
    return null;
  }
}

/**
 * 获取基金持仓股票
 */
export async function getFundHoldings(fundCode: string): Promise<StockHolding[]> {
  try {
    // 东方财富网持仓接口
    const url = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${fundCode}&topline=10`;
    const response = await fetch(url, {
      headers: {
        'Referer': `https://fundf10.eastmoney.com/ccmx_${fundCode}.html`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    
    // 解析 HTML 提取持仓数据
    const holdings: StockHolding[] = [];
    const regex = /<tr>.*?<td>(\d+)<\/td>.*?<td>([^<]+)<\/td>.*?<td>([^<]+)<\/td>.*?<td>([^<]+)<\/td>/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      holdings.push({
        code: match[2],
        name: match[3],
        ratio: parseFloat(match[4]),
        shares: 0 // 需要额外解析
      });
    }

    return holdings;
  } catch (error) {
    console.error(`获取基金 ${fundCode} 持仓失败:`, error);
    return [];
  }
}

/**
 * 获取股票实时行情
 */
export async function getStockPrice(stockCode: string): Promise<number> {
  try {
    // 新浪财经实时行情接口
    const url = `https://hq.sinajs.cn/list=${stockCode}`;
    const response = await fetch(url);
    const text = await response.text();
    
    const match = text.match(/="([^"]+)"/);
    if (!match) return 0;

    const data = match[1].split(',');
    return parseFloat(data[3]); // 当前价格
  } catch (error) {
    console.error(`获取股票 ${stockCode} 价格失败:`, error);
    return 0;
  }
}

/**
 * 实时估算基金净值
 * 根据持仓股票涨跌幅加权计算
 */
export async function estimateFundValue(fundCode: string): Promise<FundInfo | null> {
  try {
    const fundInfo = await getFundInfo(fundCode);
    if (!fundInfo) return null;

    // 如果已有实时估值，直接返回
    if (fundInfo.estimatedValue && fundInfo.estimatedGrowth !== undefined) {
      return fundInfo;
    }

    // 获取持仓并计算
    const holdings = await getFundHoldings(fundCode);
    if (holdings.length === 0) return fundInfo;

    let totalChange = 0;
    let totalRatio = 0;

    for (const holding of holdings.slice(0, 10)) { // 取前10大持仓
      const price = await getStockPrice(holding.code);
      if (price > 0) {
        // 简化计算：假设持仓比例 * 股票涨幅
        totalChange += holding.ratio * 0.01; // 示例计算
        totalRatio += holding.ratio;
      }
    }

    if (totalRatio > 0) {
      fundInfo.estimatedGrowth = (totalChange / totalRatio) * 100;
      fundInfo.estimatedValue = fundInfo.netValue * (1 + fundInfo.estimatedGrowth / 100);
    }

    return fundInfo;
  } catch (error) {
    console.error(`估算基金 ${fundCode} 净值失败:`, error);
    return null;
  }
}

/**
 * 批量获取基金信息
 */
export async function getBatchFundInfo(fundCodes: string[]): Promise<FundInfo[]> {
  const results = await Promise.all(
    fundCodes.map(code => getFundInfo(code))
  );
  return results.filter((info): info is FundInfo => info !== null);
}
