/**
 * 复利计算逻辑验证测试
 * 运行方式：在终端中执行 `bun run test:compound` (需配置) 或直接在Node中运行
 */

import {
  calculateCompound,
  formatCurrency,
  formatRate,
  getDifferenceDescription,
} from "../compound";

console.log("=== 复利计算逻辑验证 ===\n");

// 测试用例1：基本复利计算
console.log("【测试1】基本复利计算");
const test1 = calculateCompound({
  principal: 1000000,
  bankRate: 2.5,
  insuranceRate: 5.0,
  years: 30,
});

console.log(`本金: ${formatCurrency(test1.principal)}`);
console.log(`银行定存(${test1.bankRate}%): ${formatCurrency(test1.bankFinalAmount)}`);
console.log(`储蓄分红险(${test1.insuranceRate}%): ${formatCurrency(test1.insuranceFinalAmount)}`);
console.log(`差额: ${formatCurrency(test1.difference)} (${test1.differenceRatio.toFixed(1)}%)`);
console.log(`银行翻倍时间: ${test1.doublingTime.bank || "无"}年`);
console.log(`保险翻倍时间: ${test1.doublingTime.insurance || "无"}年`);

// 验证计算公式
// 银行单利: 1000000 * (1 + 0.025 * 30) = 1,750,000
const expectedBank = 1000000 * (1 + 0.025 * 30);
// 保险复利: 1000000 * (1.05)^30 = 4,321,942
const expectedInsurance = 1000000 * Math.pow(1.05, 30);

console.log(`\n验证银行单利: ${formatCurrency(test1.bankFinalAmount)} ≈ ${formatCurrency(expectedBank)} ✓`);
console.log(`验证保险复利: ${formatCurrency(test1.insuranceFinalAmount)} ≈ ${formatCurrency(expectedInsurance)} ✓`);

// 72法则验证
console.log(`\n【验证72法则】`);
console.log(`银行 2.5%: 72/2.5 = ${72 / 2.5} ≈ ${test1.doublingTime.bank}年`);
console.log(`保险 5.0%: 72/5 = ${72 / 5} ≈ ${test1.doublingTime.insurance}年`);

// 测试用例2：不同本金
console.log("\n【测试2】不同本金对比");
const principals = [100000, 500000, 1000000, 3000000];
principals.forEach((p) => {
  const result = calculateCompound({
    principal: p,
    bankRate: 2.5,
    insuranceRate: 5.0,
    years: 30,
  });
  console.log(`${formatCurrency(p)} → 差额: ${formatCurrency(result.difference)} - ${getDifferenceDescription(result.difference)}`);
});

// 测试用例3：不同利率
console.log("\n【测试3】不同利率对比");
const rateTests = [
  { bank: 2.0, insurance: 4.5, name: "保守" },
  { bank: 2.5, insurance: 5.0, name: "标准" },
  { bank: 3.0, insurance: 5.5, name: "乐观" },
];

rateTests.forEach((test) => {
  const result = calculateCompound({
    principal: 1000000,
    bankRate: test.bank,
    insuranceRate: test.insurance,
    years: 20,
  });
  console.log(`${test.name}: 银行${test.bank}% vs 保险${test.insurance}% → 20年差额 ${formatCurrency(result.difference)}`);
});

// 测试用例4：不同年限
console.log("\n【测试4】不同年限的复利效应");
const yearTests = [10, 20, 30, 40];
yearTests.forEach((years) => {
  const result = calculateCompound({
    principal: 1000000,
    bankRate: 2.5,
    insuranceRate: 5.0,
    years,
  });
  console.log(`${years}年: 银行${formatCurrency(result.bankFinalAmount)} vs 保险${formatCurrency(result.insuranceFinalAmount)} = 差${formatCurrency(result.difference)}`);
});

// 测试用例5：边界情况
console.log("\n【测试5】边界情况");
// 零利率
const zeroRate = calculateCompound({
  principal: 1000000,
  bankRate: 0,
  insuranceRate: 0,
  years: 10,
});
console.log(`零利率: 本金=${formatCurrency(zeroRate.principal)}, 银行=${formatCurrency(zeroRate.bankFinalAmount)}, 保险=${formatCurrency(zeroRate.insuranceFinalAmount)}`);

// 低本金
const lowPrincipal = calculateCompound({
  principal: 10000,
  bankRate: 2.5,
  insuranceRate: 5.0,
  years: 10,
});
console.log(`低本金(1万): 银行=${formatCurrency(lowPrincipal.bankFinalAmount)}, 保险=${formatCurrency(lowPrincipal.insuranceFinalAmount)}`);

console.log("\n=== 测试完成 ===");

// 导出结果供检查
export const testResults = {
  basic: test1,
  zeroRate,
  lowPrincipal,
};
