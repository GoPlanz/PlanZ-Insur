/**
 * 生日回溯计算器测试用例
 * 用于验证各保司年龄计算逻辑的正确性
 */

import {
  calculateAllCompanies,
  COMPANY_RULES,
  type InsuranceCompany,
} from "./birthday";

// 本地日期格式化函数（避免UTC时区问题）
const formatLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// 测试用例1：ALB计算（友邦、安盛等）
// 出生日期：1990年6月15日
// 当前日期：2024年3月1日（还未到生日）
// 预期：ALB = 33岁（1990->2024=34，但生日还没到，所以33）
console.log("=== 测试用例1：ALB计算（生日前） ===");
const testDate1 = new Date("1990-06-15");
const asOfDate1 = new Date("2024-03-01");
const results1 = calculateAllCompanies(testDate1, asOfDate1);

const albCompanies1 = results1.filter((r) => r.company.calcMethod === "ALB");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate1));
albCompanies1.forEach((r) => {
  console.log(
    `${r.company.name}: 当前年龄=${r.currentAge}岁, 预期=33岁, ${
      r.currentAge === 33 ? "✅" : "❌"
    }`
  );
});

// 测试用例2：ALB计算（友邦、安盛等）
// 出生日期：1990年6月15日
// 当前日期：2024年8月1日（已过生日）
// 预期：ALB = 34岁
console.log("\n=== 测试用例2：ALB计算（生日后） ===");
const asOfDate2 = new Date("2024-08-01");
const results2 = calculateAllCompanies(testDate1, asOfDate2);

const albCompanies2 = results2.filter((r) => r.company.calcMethod === "ALB");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate2));
albCompanies2.forEach((r) => {
  console.log(
    `${r.company.name}: 当前年龄=${r.currentAge}岁, 预期=34岁, ${
      r.currentAge === 34 ? "✅" : "❌"
    }`
  );
});

// 测试用例3：ANB计算（保诚）
// 出生日期：1990年6月15日
// 当前日期：2024年3月1日（还未到生日）
// 预期：ANB = 34岁（ALB 33 + 1）
console.log("\n=== 测试用例3：ANB计算（保诚） ===");
const pruResult1 = results1.find((r) => r.company.id === "pru");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate1));
console.log(
  `保诚: 当前年龄=${pruResult1?.currentAge}岁, 预期=34岁, ${
    pruResult1?.currentAge === 34 ? "✅" : "❌"
  }`
);

// 测试用例4：Nearest计算（宏利）
// 出生日期：1990年6月15日
// 当前日期：2024年8月1日（已过生日，但未过+6个月）
// 分界线：2024年6月15日 + 6个月 = 2024年12月15日
// 预期：Nearest = 34岁（因为8月1日 < 12月15日）
console.log("\n=== 测试用例4：Nearest计算（宏利 - 临界点内） ===");
const manuResult1 = results2.find((r) => r.company.id === "manu");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate2));
console.log("分界线: 2024-12-15（生日+6个月）");
console.log(
  `宏利: 当前年龄=${manuResult1?.currentAge}岁, 预期=34岁, ${
    manuResult1?.currentAge === 34 ? "✅" : "❌"
  }`
);

// 测试用例5：Nearest计算（宏利）
// 出生日期：1990年6月15日
// 当前日期：2025年1月1日（已过临界点）
// 分界线：2024年6月15日 + 6个月 = 2024年12月15日
// 预期：Nearest = 35岁（因为1月1日 > 12月15日）
console.log("\n=== 测试用例5：Nearest计算（宏利 - 临界点后） ===");
const asOfDate3 = new Date("2025-01-01");
const results3 = calculateAllCompanies(testDate1, asOfDate3);
const manuResult2 = results3.find((r) => r.company.id === "manu");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate3));
console.log("分界线: 2024-12-15（上次生日+6个月）");
console.log(
  `宏利: 当前年龄=${manuResult2?.currentAge}岁, 预期=35岁, ${
    manuResult2?.currentAge === 35 ? "✅" : "❌"
  }`
);

// 测试用例6：回溯判断
// 出生日期：1990年6月15日
// 当前日期：2024年8月1日（距离上次生日47天）
// 预期：所有180天回溯的保司都应该可以回溯
console.log("\n=== 测试用例6：回溯可行性判断 ===");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate2));
console.log("距离上次生日: 47天");
results2.forEach((r) => {
  const expectedCanBackdate = r.company.backdateDays >= 47;
  const status = r.canBackdate === expectedCanBackdate ? "✅" : "❌";
  console.log(
    `${r.company.name}: 可回溯=${r.canBackdate}, 预期=${expectedCanBackdate}, 回溯期限=${r.company.backdateDays}天 ${status}`
  );
});

// 测试用例7：下次涨价日期
// 出生日期：1990年6月15日
// 当前日期：2024年3月1日
// ALB保司预期下次涨价日期：2024年6月15日 + 6个月 = 2024年12月15日
console.log("\n=== 测试用例7：下次涨价日期（ALB） ===");
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate1));
albCompanies1.forEach((r) => {
  const expectedDate = "2024-12-15";
  const actualDate = formatLocalDate(r.nextAgeDate);
  console.log(
    `${r.company.name}: 下次涨价=${actualDate}, 预期=${expectedDate}, ${
      actualDate === expectedDate ? "✅" : "❌"
    }`
  );
});

// 测试用例8：下次涨价日期（ANB - 保诚）
// 出生日期：1990年6月15日
// 当前日期：2024年3月1日
// 预期下次涨价日期：2024年6月15日（下次生日）
console.log("\n=== 测试用例8：下次涨价日期（ANB - 保诚） ===");
const pruResult2 = results1.find((r) => r.company.id === "pru");
const expectedPruDate = "2024-06-15";
const actualPruDate = pruResult2 ? formatLocalDate(pruResult2.nextAgeDate) : "";
console.log("出生日期:", formatLocalDate(testDate1));
console.log("当前日期:", formatLocalDate(asOfDate1));
console.log(
  `保诚: 下次涨价=${actualPruDate}, 预期=${expectedPruDate}, ${
    actualPruDate === expectedPruDate ? "✅" : "❌"
  }`
);

// 测试用例9：宏利日期黑名单
// 出生日期：1990年1月31日
// 当前日期：2024年3月1日
// 下次涨价日期包含31日，应该触发日期限制提示
console.log("\n=== 测试用例9：宏利日期黑名单 ===");
const testDate2 = new Date("1990-01-31");
const results4 = calculateAllCompanies(testDate2, asOfDate1);
const manuResult3 = results4.find((r) => r.company.id === "manu");
console.log("出生日期:", formatLocalDate(testDate2));
console.log("当前日期:", formatLocalDate(asOfDate1));
console.log(
  `宏利: 日期限制=${manuResult3?.effectiveDateRestriction || "无"}, 预期=应有提示, ${
    manuResult3?.effectiveDateRestriction ? "✅" : "❌"
  }`
);

console.log("\n=== 测试完成 ===");
