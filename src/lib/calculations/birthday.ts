import { differenceInDays, addYears, isBefore, isAfter, addMonths } from "date-fns";

/**
 * 保险公司年龄计算规则
 * 基于用户提供的六家保司技术文档
 */

export type InsuranceCompany =
  | "aia"      // 友邦 - ALB, 180天回溯
  | "yf"       // 万通 - ALB, 180天回溯
  | "axa"      // 安盛 - ALB, 180天回溯
  | "sun"      // 永明 - ALB, 180天回溯
  | "pru"      // 保诚 - ANB, 90天回溯
  | "manu";    // 宏利 - Nearest, 180天回溯, 特殊逻辑

export interface CompanyRule {
  id: InsuranceCompany;
  name: string;
  nameEn: string;
  calcMethod: "ALB" | "ANB" | "Nearest";
  backdateDays: number;
  description: string;
}

export const COMPANY_RULES: CompanyRule[] = [
  {
    id: "aia",
    name: "友邦",
    nameEn: "AIA",
    calcMethod: "ALB",
    backdateDays: 180,
    description: "刚过生日≤180天，可回溯至生日前一天",
  },
  {
    id: "yf",
    name: "万通",
    nameEn: "YF Life",
    calcMethod: "ALB",
    backdateDays: 180,
    description: "刚过生日≤180天，可回溯至生日前一天",
  },
  {
    id: "axa",
    name: "安盛",
    nameEn: "AXA",
    calcMethod: "ALB",
    backdateDays: 180,
    description: "刚过生日≤180天，可回溯至生日前一天",
  },
  {
    id: "sun",
    name: "永明",
    nameEn: "Sun Life",
    calcMethod: "ALB",
    backdateDays: 180,
    description: "刚过生日≤180天，可回溯至生日前一天",
  },
  {
    id: "pru",
    name: "保诚",
    nameEn: "Prudential",
    calcMethod: "ANB",
    backdateDays: 90,
    description: "回溯期较短，目标减少ANB",
  },
  {
    id: "manu",
    name: "宏利",
    nameEn: "Manulife",
    calcMethod: "Nearest",
    backdateDays: 180,
    description: "以「生日+6个月」为临界点，需特殊处理",
  },
];

export interface AgeCalculationResult {
  company: CompanyRule;
  currentAge: number;           // 当前保险年龄
  nextAge: number;              // 下次涨价的年龄
  nextAgeDate: Date;            // 下次涨价日期
  daysUntilNextAge: number;     // 距离下次涨价天数
  canBackdate: boolean;         // 是否支持回溯
  backdateDeadline: Date | null; // 回溯截止日期
  backdateAge: number | null;   // 回溯后的年龄
  effectiveDateRestriction: string | null; // 生效日限制（如宏利的日期黑名单）
}

/**
 * 计算ALB（Actual Age Last Birthday）实岁
 * 已过几次生日就是几岁
 */
function calculateALB(birthDate: Date, asOfDate: Date): number {
  let age = asOfDate.getFullYear() - birthDate.getFullYear();
  const birthdayThisYear = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (isBefore(asOfDate, birthdayThisYear)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * 计算ANB（Age Next Birthday）下次生日年龄
 * 当前年龄 + 1
 */
function calculateANB(birthDate: Date, asOfDate: Date): number {
  return calculateALB(birthDate, asOfDate) + 1;
}

/**
 * 计算Nearest Age（最近生日年龄）
 * 宏利特殊逻辑：以「生日+6个月」为临界点
 */
function calculateNearestAge(birthDate: Date, asOfDate: Date): number {
  const alb = calculateALB(birthDate, asOfDate);

  // 计算「上次生日+6个月」的分界线
  const lastBirthday = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (isAfter(lastBirthday, asOfDate)) {
    lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
  }
  const boundary = addMonths(lastBirthday, 6);

  // 如果当前日期 > 分界线，年龄 = ALB + 1
  if (isAfter(asOfDate, boundary) || asOfDate.getTime() === boundary.getTime()) {
    return alb + 1;
  }
  return alb;
}

/**
 * 获取下次涨价日期
 * ALB规则：下次生日 + 6个月
 * ANB规则：下次生日
 * Nearest规则：上次生日 + 6个月（如果已过）或 下次生日 + 6个月
 */
function getNextAgeDate(birthDate: Date, calcMethod: "ALB" | "ANB" | "Nearest", fromDate: Date): Date {
  const currentYear = fromDate.getFullYear();

  if (calcMethod === "ALB") {
    // 下次生日 + 6个月
    const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (isBefore(nextBirthday, fromDate) || nextBirthday.getTime() === fromDate.getTime()) {
      nextBirthday.setFullYear(currentYear + 1);
    }
    return addMonths(nextBirthday, 6);
  }

  if (calcMethod === "ANB") {
    // 下次生日
    const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (isBefore(nextBirthday, fromDate) || nextBirthday.getTime() === fromDate.getTime()) {
      nextBirthday.setFullYear(currentYear + 1);
    }
    return nextBirthday;
  }

  // Nearest: 宏利特殊逻辑
  // 如果已经过了上次生日+6个月，下次涨价是下次生日+6个月
  // 如果还没过，就是上次生日+6个月
  const lastBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  if (isAfter(lastBirthday, fromDate)) {
    lastBirthday.setFullYear(currentYear - 1);
  }
  const boundary = addMonths(lastBirthday, 6);

  if (isAfter(fromDate, boundary)) {
    // 已过临界点，下次涨价是下次生日+6个月
    const nextBirthday = addYears(lastBirthday, 1);
    return addMonths(nextBirthday, 6);
  }
  return boundary;
}

/**
 * 检查宏利的日期黑名单限制
 * 29/30/31日不能作为生效日，需强制调整为28日
 */
function checkManulifeDateRestriction(date: Date): string | null {
  const day = date.getDate();
  if (day === 29 || day === 30 || day === 31) {
    return `生效日${day}日需调整为28日`;
  }
  return null;
}

/**
 * 计算单家保司的年龄和回溯信息
 */
function calculateForCompany(
  birthDate: Date,
  company: CompanyRule,
  asOfDate: Date = new Date()
): AgeCalculationResult {
  let currentAge: number;
  let nextAge: number;

  // 根据计算方式确定当前年龄
  switch (company.calcMethod) {
    case "ALB":
      currentAge = calculateALB(birthDate, asOfDate);
      nextAge = currentAge + 1;
      break;
    case "ANB":
      currentAge = calculateANB(birthDate, asOfDate);
      nextAge = currentAge + 1;
      break;
    case "Nearest":
      currentAge = calculateNearestAge(birthDate, asOfDate);
      nextAge = currentAge + 1;
      break;
  }

  // 计算下次涨价日期
  const nextAgeDate = getNextAgeDate(birthDate, company.calcMethod, asOfDate);
  const daysUntilNextAge = Math.max(0, differenceInDays(nextAgeDate, asOfDate));

  // 计算回溯可行性
  let canBackdate = false;
  let backdateDeadline: Date | null = null;
  let backdateAge: number | null = null;
  let effectiveDateRestriction: string | null = null;

  // 检查是否在回溯期内
  const daysSinceLastBirthday = (() => {
    const lastBirthday = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (isAfter(lastBirthday, asOfDate)) {
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    return differenceInDays(asOfDate, lastBirthday);
  })();

  if (daysSinceLastBirthday <= company.backdateDays) {
    canBackdate = true;
    backdateDeadline = new Date(asOfDate);
    backdateDeadline.setDate(backdateDeadline.getDate() + (company.backdateDays - daysSinceLastBirthday));

    // 回溯后的年龄是当前年龄 - 1
    backdateAge = Math.max(0, currentAge - 1);

    // 宏利特殊：检查日期黑名单
    if (company.id === "manu") {
      effectiveDateRestriction = checkManulifeDateRestriction(nextAgeDate);
    }
  }

  return {
    company,
    currentAge,
    nextAge,
    nextAgeDate,
    daysUntilNextAge,
    canBackdate,
    backdateDeadline,
    backdateAge,
    effectiveDateRestriction,
  };
}

/**
 * 主函数：计算所有保司的年龄信息
 */
export function calculateAllCompanies(
  birthDate: Date,
  asOfDate: Date = new Date()
): AgeCalculationResult[] {
  return COMPANY_RULES.map((company) =>
    calculateForCompany(birthDate, company, asOfDate)
  );
}

/**
 * 计算保费差额（简化估算）
 * 基于年龄段给出大致费率差异
 */
export function estimatePremiumDiff(age: number, sumAssured: number): {
  annualDiff: number;
  twentyYearDiff: number;
} {
  // 简化的费率增长模型：每增加1岁，费率约增加3-5%
  // 这里使用4%作为平均值
  const rateIncrease = 0.04;
  const baseRate = sumAssured * 0.001; // 假设基础费率是保额的0.1%

  const annualDiff = baseRate * rateIncrease;
  const twentyYearDiff = annualDiff * 20;

  return {
    annualDiff: Math.round(annualDiff),
    twentyYearDiff: Math.round(twentyYearDiff),
  };
}

/**
 * 格式化倒计时
 */
export function formatCountdown(days: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = days * 24 * 60 * 60;
  return {
    days: Math.floor(totalSeconds / (24 * 60 * 60)),
    hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
  };
}
