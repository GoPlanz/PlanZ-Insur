/**
 * 复利与资产对比工具 - 计算逻辑
 */

// =============================================================================
// 类型定义
// =============================================================================

export interface CompoundInput {
  principal: number;      // 本金
  bankRate: number;       // 银行利率（单利，%）
  insuranceRate: number;  // 保险复利（%）
  years: number;          // 投资年限
}

export interface CompoundResult {
  principal: number;
  bankRate: number;
  insuranceRate: number;
  years: number;
  bankFinalAmount: number;        // 银行最终金额（单利）
  insuranceFinalAmount: number;   // 保险最终金额（复利）
  difference: number;             // 差额
  differenceRatio: number;        // 差额比例
  bankData: YearData[];           // 银行年度数据
  insuranceData: YearData[];      // 保险年度数据
  doublingTime: {
    bank: number | null;          // 银行翻倍年限
    insurance: number | null;     // 保险翻倍年限
  };
}

export interface YearData {
  year: number;
  bankAmount: number;
  insuranceAmount: number;
  difference: number;
}

// =============================================================================
// 复利/单利计算
// =============================================================================

/**
 * 计算单利最终金额
 * A = P(1 + rt)
 */
function calculateSimpleInterest(
  principal: number,
  rate: number,
  years: number
): number {
  return principal * (1 + (rate / 100) * years);
}

/**
 * 计算复利最终金额
 * A = P(1 + r)^t
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number
): number {
  return principal * Math.pow(1 + rate / 100, years);
}

/**
 * 计算翻倍时间（72法则）
 */
function calculateDoublingTime(rate: number): number | null {
  if (rate <= 0) return null;
  return Math.round(72 / rate);
}

/**
 * 完整的复利对比计算
 */
export function calculateCompound(input: CompoundInput): CompoundResult {
  const { principal, bankRate, insuranceRate, years } = input;

  // 计算年度数据
  const bankData: YearData[] = [];
  const insuranceData: YearData[] = [];

  for (let year = 1; year <= years; year++) {
    const bankAmount = calculateSimpleInterest(principal, bankRate, year);
    const insuranceAmount = calculateCompoundInterest(principal, insuranceRate, year);

    bankData.push({
      year,
      bankAmount,
      insuranceAmount: 0,
      difference: 0,
    });

    insuranceData.push({
      year,
      bankAmount: 0,
      insuranceAmount,
      difference: insuranceAmount - bankAmount,
    });
  }

  // 最终金额
  const bankFinalAmount = bankData[bankData.length - 1].bankAmount;
  const insuranceFinalAmount = insuranceData[insuranceData.length - 1].insuranceAmount;
  const difference = insuranceFinalAmount - bankFinalAmount;
  const differenceRatio = principal > 0 ? (difference / principal) * 100 : 0;

  // 翻倍时间
  const doublingTime = {
    bank: calculateDoublingTime(bankRate),
    insurance: calculateDoublingTime(insuranceRate),
  };

  return {
    principal,
    bankRate,
    insuranceRate,
    years,
    bankFinalAmount,
    insuranceFinalAmount,
    difference,
    differenceRatio,
    bankData,
    insuranceData,
    doublingTime,
  };
}

// =============================================================================
// 格式化工具
// =============================================================================

export function formatCurrency(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`;
  }
  return amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * 生成差额描述文案
 */
export function getDifferenceDescription(difference: number): string {
  if (difference < 100000) {
    return "相当于一次豪华旅行";
  } else if (difference < 300000) {
    return "相当于一辆中档轿车";
  } else if (difference < 500000) {
    return "相当于一辆豪华汽车";
  } else if (difference < 1000000) {
    return "相当于一辆豪车 + 全家环球旅行";
  } else if (difference < 3000000) {
    return "相当于一套房产的首付";
  } else if (difference < 8000000) {
    return "相当于孩子从幼儿园到大学的完整教育基金";
  } else if (difference < 20000000) {
    return "相当于东京一栋收租楼";
  } else {
    return "相当于实现初步财富自由";
  }
}

// =============================================================================
// 资产配置雷达图数据
// =============================================================================

export interface AssetDimension {
  id: string;
  label: string;
  description: string;
}

export interface AssetProfile {
  id: string;
  name: string;
  values: number[]; // 五个维度的评分 (0-10)
  color: string;
}

// 五个评估维度
export const assetDimensions: AssetDimension[] = [
  { id: "volatility", label: "波动性", description: "价格波动的剧烈程度" },
  { id: "liquidity", label: "流动性", description: "变现的便利程度" },
  { id: "tax", label: "税务优势", description: "税务递延或减免空间" },
  { id: "protection", label: "债务隔离", description: "资产与债务的隔离程度" },
  { id: "inheritance", label: "传承便利", description: "代际传承的便利性" },
];

// 资产配置数据（评分0-10，越高越优）
export const assetProfiles: AssetProfile[] = [
  {
    id: "a-stock",
    name: "A股",
    values: [8, 7, 3, 2, 3], // 高波动、中流动性、低税务、低隔离、低传承
    color: "#ef4444",
  },
  {
    id: "us-stock",
    name: "美股",
    values: [7, 8, 4, 3, 3], // 中高波动、高流动性、中税务、低隔离、低传承
    color: "#3b82f6",
  },
  {
    id: "bitcoin",
    name: "比特币",
    values: [10, 6, 5, 8, 5], // 极高波动、中流动性、中税务、高隔离、中传承
    color: "#f59e0b",
  },
  {
    id: "savings-insurance",
    name: "储蓄分红险",
    values: [2, 3, 9, 9, 9], // 低波动、低流动性、极高税务、极高隔离、极高传承
    color: "#1e90ff",
  },
];

/**
 * 获取资产特性说明
 */
export function getAssetDescription(assetId: string): string {
  const descriptions: Record<string, string> = {
    "a-stock": "A股市场波动较大，适合风险承受能力强的投资者，但缺乏税务筹划和债务隔离功能。",
    "us-stock": "美股相对成熟，流动性好，但同样面临税务和资产隔离的挑战。",
    "bitcoin": "比特币波动性极高，具有去中心化的优势，在债务隔离方面有一定优势，但风险极大。",
    "savings-insurance": "储蓄分红险波动性极低，提供税务递延、债务隔离和定向传承等多重保障，是财富防御的核心工具。",
  };
  return descriptions[assetId] || "";
}

/**
 * 获取配置建议
 */
export function getAllocationAdvice(selectedAssets: string[]): string {
  const hasHighRisk = selectedAssets.some((id) =>
    ["a-stock", "us-stock", "bitcoin"].includes(id)
  );
  const hasInsurance = selectedAssets.includes("savings-insurance");

  if (hasHighRisk && !hasInsurance) {
    return "💡 建议：考虑配置一定比例的储蓄分红险，平衡风险并提供财富保障。";
  } else if (!hasHighRisk && hasInsurance) {
    return "💡 建议：适度配置高成长资产，在保障基础上追求更高收益。";
  } else if (hasHighRisk && hasInsurance) {
    return "✅ 资产配置较为均衡，既有成长性又有保障性。";
  } else {
    return "📊 请选择资产进行对比分析。";
  }
}
