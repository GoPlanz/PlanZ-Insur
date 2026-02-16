"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { TrendingUp, Clock, Info, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import {
  calculateCompound,
  formatCurrency,
  formatRate,
  getDifferenceDescription,
  type CompoundInput,
} from "@/src/lib/calculations/compound";

// IRR 市场数据（根据年限自动建议）
// ⚠️ 香港保险演示收益限高：30年后最高6.5%
// 储蓄分红险实际IRR数据（真实保单现金价值对应的年化收益率）
const IRR_BY_YEARS: Record<number, number> = {
  1: -98.50,
  2: -45.20,
  3: -22.10,
  4: -12.30,
  5: -5.60,
  6: -1.20,
  7: 1.35,
  8: 2.65,
  9: 3.20,
  10: 3.65,
  11: 3.95,
  12: 4.25,
  13: 4.60,
  14: 4.85,
  15: 5.05,
  16: 5.20,
  17: 5.38,
  18: 5.55,
  19: 5.75,
  20: 5.95,
  21: 6.05,
  22: 6.12,
  23: 6.20,
  24: 6.28,
  25: 6.35,
  26: 6.40,
  27: 6.45,
  28: 6.50,
  29: 6.50,
  30: 6.50,
};

// 用于UI显示的简化IRR数据
const IRR_BY_YEARS_SIMPLE: Record<number, number> = {
  5: -5.6,
  10: 3.65,
  15: 5.05,
  20: 5.95,
  25: 6.35,
  30: 6.5,
  40: 6.5,
  50: 6.5,
  60: 6.5,
};

// 获取建议的IRR
function getSuggestedIRR(years: number): number {
  const exactMatch = IRR_BY_YEARS[years];
  if (exactMatch) return exactMatch;

  // 找最接近的年限
  const availableYears = Object.keys(IRR_BY_YEARS).map(Number).sort((a, b) => a - b);
  const closestYear = availableYears.reduce((prev, curr) =>
    Math.abs(curr - years) < Math.abs(prev - years) ? curr : prev
  );
  return IRR_BY_YEARS[closestYear];
}

// 基于真实IRR数据计算现金价值
function calculateActualCashValue(principal: number, year: number, irrByYears: Record<number, number>): number {
  if (year <= 0) return 0;

  // 获取该年份的IRR
  const irr = irrByYears[Math.min(year, 30)] / 100; // 最多30年数据，之后用30年的IRR

  // 如果IRR为负或极小，使用简化的现金价值模型
  if (irr < 0) {
    // 前6年现金价值很低，逐步恢复
    const recoveryFactors: Record<number, number> = {
      1: 0.02,   // 第1年：2%
      2: 0.55,   // 第2年：55%
      3: 0.78,   // 第3年：78%
      4: 0.88,   // 第4年：88%
      5: 0.94,   // 第5年：94%
      6: 0.99,   // 第6年：99%
    };
    return principal * (recoveryFactors[year] || 1);
  }

  // 对于正IRR年份，使用复利公式：现金价值 = 本金 × (1 + IRR)^年数
  // 但需要与前面的年份平滑衔接
  return principal * Math.pow(1 + irr, year);
}

// 曲线图组件
function CompoundChart({
  result,
  delayedResult,
  cashValue,
}: {
  result: ReturnType<typeof calculateCompound>;
  delayedResult: { insuranceData: { year: number; bankAmount: number; insuranceAmount: number; difference: number }[] } | null;
  cashValue: number;
}) {
  const chartData = useMemo(() => {
    const principal = result.principal;

    const data = result.bankData.map((bank, i) => {
      const year = bank.year;
      // 使用真实IRR数据计算现金价值
      const cashValue = calculateActualCashValue(principal, year, IRR_BY_YEARS);

      return {
        year: bank.year,
        单利: bank.bankAmount,
        复利: cashValue,
        差额: cashValue - bank.bankAmount,
      };
    });

    // 如果有延迟投资数据，添加对比
    if (delayedResult) {
      return data.map((d) => {
        let delayedAmount = 0;
        const startYear = 5; // 晚5年开始投入

        // 对于延迟投入，从第5年开始计算
        if (d.year >= startYear) {
          const yearSinceStart = d.year - startYear + 1; // 第5年开始是第1年
          // 使用真实IRR数据计算现金价值
          delayedAmount = calculateActualCashValue(principal, yearSinceStart, IRR_BY_YEARS);
        }

        return {
          ...d,
          "复利（晚5年投入）": delayedAmount,
        };
      });
    }

    return data;
  }, [result, delayedResult]);

  const formatYAxis = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">第 {label} 年</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 曲线图 */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="year"
              tick={{ fill: "#fafafa", fontSize: 12 }}
              stroke="#333"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}年`}
            />
            <YAxis
              tick={{ fill: "#fafafa", fontSize: 12 }}
              stroke="#333"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="单利"
              stroke="#60A5FA"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="复利"
              stroke="#22C55E"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {delayedResult && (
              <Line
                type="monotone"
                dataKey="复利（晚5年投入）"
                stroke="#F97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            {/* 锁定期标记 - 7年锁定期结束 */}
            {result.years >= 7 && (
              <>
                <ReferenceDot
                  x={7}
                  y={chartData.find((d: any) => d.year === 7)?.复利 || result.principal}
                  r={5}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
              </>
            )}
            <ReferenceDot
              x={result.years}
              y={cashValue}
              r={6}
              fill="#22C55E"
              stroke="none"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-400 rounded" />
          <span>单利</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded" />
          <span>复利</span>
        </div>
        {delayedResult && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: "repeating-linear-gradient(90deg, #F97316, #F97316 5px, transparent 5px, transparent 10px)" }} />
            <span>复利（晚5年投入）</span>
          </div>
        )}
        {result.years >= 7 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            <span className="text-xs text-muted-foreground">7年锁定期结束</span>
          </div>
        )}
      </div>

      {/* 年度增长数据表 */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[500px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">年份</th>
              <th className="px-2 sm:px-4 py-2 text-right">单利</th>
              <th className="px-2 sm:px-4 py-2 text-right">复利现金价值</th>
              <th className="px-2 sm:px-4 py-2 text-right">差额</th>
            </tr>
          </thead>
          <tbody>
            {result.bankData
              .filter((d) => d.year % 5 === 0 || d.year === result.years)
              .map((bank) => {
                const year = bank.year;
                const principal = result.principal;

                // 使用真实IRR数据计算现金价值
                const cashValue = calculateActualCashValue(principal, year, IRR_BY_YEARS);

                const difference = cashValue - bank.bankAmount;
                const diffPercent = bank.bankAmount > 0
                  ? ((difference / bank.bankAmount) * 100).toFixed(0)
                  : "0";
                const isInLockup = year <= 7; // 7年锁定期

                return (
                  <tr key={bank.year} className="border-t border-border">
                    <td className="px-2 sm:px-4 py-2">
                      {bank.year}年
                      {isInLockup && (
                        <span className="ml-1 text-xs text-red-500">(锁定期)</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-right font-mono text-blue-400">
                      {formatCurrency(bank.bankAmount)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-right font-mono text-green-500 font-bold">
                      {formatCurrency(cashValue)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-right font-mono text-yellow-500">
                      {difference >= 0 ? "+" : ""}{formatCurrency(difference)}
                      <span className="text-yellow-500/70 text-xs ml-1">({diffPercent}%)</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CompoundComparePage() {
  // 默认示例数据
  const [principal, setPrincipal] = useState<number>(1000000);
  const [simpleRate, setSimpleRate] = useState<number>(1.5);
  const [compoundRate, setCompoundRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(30);
  const [isUsingSuggestedRate, setIsUsingSuggestedRate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // 计算理论结果
  const result = calculateCompound({
    principal,
    bankRate: simpleRate,
    insuranceRate: compoundRate,
    years,
  });

  // 计算现金价值（基于真实IRR数据）
  const cashValue = useMemo(() => {
    return calculateActualCashValue(principal, years, IRR_BY_YEARS);
  }, [principal, years]);

  // 延迟5年的对比结果（用于对比卡片）
  const delayedResultForCard = useMemo(() => {
    if (years <= 10) return null;
    const delayedYears = years - 5;
    return {
      insuranceFinalAmount: calculateActualCashValue(principal, delayedYears, IRR_BY_YEARS),
      years: delayedYears,
    };
  }, [principal, years]);

  // 延迟5年的对比结果（用于图表，保持相同年限长度）
  const delayedResultForChart = useMemo(() => {
    if (years <= 10) return null;
    // 构造包含前5年为0的数据数组
    const paddedData = Array(5).fill(null).map((_, i) => ({
      year: i + 1,
      bankAmount: 0,
      insuranceAmount: 0,
      difference: 0,
    }));
    // 从第6年开始才有数据
    const actualData = result.bankData.slice(0, years - 5).map((bank, i) => {
      const yearSinceStart = i + 1; // 从第1年开始计算
      const cashValue = calculateActualCashValue(principal, yearSinceStart, IRR_BY_YEARS);
      return {
        year: bank.year + 5,
        bankAmount: 0,
        insuranceAmount: cashValue,
        difference: cashValue,
      };
    });
    return {
      insuranceData: [...paddedData, ...actualData],
    };
  }, [principal, years, result.bankData]);

  // IRR自动建议
  useEffect(() => {
    if (isUsingSuggestedRate) {
      const suggested = getSuggestedIRR(years);
      setCompoundRate(suggested);
    }
  }, [years, isUsingSuggestedRate]);

  // 处理用户交互
  const handleInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // 快捷年限按钮
  const yearShortcuts = [10, 20, 30, 40, 50, 60];

  // 恢复建议利率
  const handleRestoreSuggestedRate = () => {
    setIsUsingSuggestedRate(true);
    setCompoundRate(getSuggestedIRR(years));
  };

  // 计算倍数（使用真实现金价值）
  const multiplier = result.bankFinalAmount > 0
    ? (cashValue / result.bankFinalAmount).toFixed(1)
    : "1.0";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="mb-4">
            阶段一工具
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {years}年，复利是单利的 {multiplier} 倍
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            时间越久，差距越大 • 基于香港分红险演示数据
          </p>
        </div>
      </section>

      {/* Input Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                设置对比参数
              </CardTitle>
              <CardDescription>
                调整本金、利率和年限，看看单利与复利的差距
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 本金输入 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="principal" className="font-medium">投入本金</Label>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(principal)}
                  </span>
                </div>
                <Slider
                  id="principal"
                  value={[principal]}
                  onValueChange={([v]) => {
                    setPrincipal(v);
                    handleInteract();
                  }}
                  min={100000}
                  max={5000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10万</span>
                  <span>500万</span>
                </div>
              </div>

              {/* 单利利率 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="simpleRate" className="font-medium">
                      单利投资（如：定存、国债）
                    </Label>
                    <p className="text-xs text-muted-foreground">利息不产生新利息</p>
                  </div>
                  <span className="text-xl font-bold text-blue-400">{formatRate(simpleRate)}</span>
                </div>
                <Slider
                  id="simpleRate"
                  value={[simpleRate]}
                  onValueChange={([v]) => {
                    setSimpleRate(v);
                    handleInteract();
                  }}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* 复利利率 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compoundRate" className="font-medium">
                      复利投资（如：分红保单、再投资）
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      利滚利，时间的朋友
                      {compoundRate > 6.5 && (
                        <span className="text-orange-500 ml-1">• 高于港险演示限高6.5%</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-500">{formatRate(compoundRate)}</span>
                    {isUsingSuggestedRate && (
                      <p className="text-xs text-muted-foreground">市场参考值</p>
                    )}
                  </div>
                </div>
                <Slider
                  id="compoundRate"
                  value={[compoundRate]}
                  onValueChange={([v]) => {
                    setCompoundRate(v);
                    setIsUsingSuggestedRate(false);
                    handleInteract();
                  }}
                  min={0.5}
                  max={8}
                  step={0.1}
                  className="w-full"
                />
                {!isUsingSuggestedRate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRestoreSuggestedRate}
                    className="text-xs h-7 px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    恢复建议值 ({formatRate(getSuggestedIRR(years))})
                  </Button>
                )}
              </div>

              {/* 投资年限 - 滑块+快捷标签 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">投资年限</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold">{years} 年</span>
                  </div>
                </div>

                {/* 快捷年限按钮 */}
                <div className="flex gap-2">
                  {yearShortcuts.map((y) => (
                    <Button
                      key={y}
                      variant={years === y ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setYears(y);
                        handleInteract();
                      }}
                      className="flex-1"
                    >
                      {y}年
                    </Button>
                  ))}
                </div>

                {/* 滑块微调 */}
                <Slider
                  value={[years]}
                  onValueChange={([v]) => {
                    setYears(v);
                    handleInteract();
                  }}
                  min={10}
                  max={60}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10年</span>
                  <span>60年</span>
                </div>
              </div>

              {!hasInteracted && (
                <p className="text-xs text-center text-muted-foreground bg-muted/50 py-2 rounded">
                  💡 示例数据，调整上方参数查看您的实际情况
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section - 默认展示 */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Aha Moment */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="py-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <TrendingUp className="h-6 w-6" />
                <h2 className="text-xl sm:text-2xl font-bold">
                  {years}年后，复利是单利的 {multiplier} 倍
                </h2>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(principal)} 本金
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-card/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">单利投资</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(result.bankFinalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    年化 {formatRate(simpleRate)}
                  </div>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    复利现金价值
                    {years <= 7 && <span className="text-red-500 ml-1">(锁定期)</span>}
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(cashValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    年化 {formatRate(compoundRate)}
                    {years <= 7 && (
                      <>
                        <br />
                        <span className="text-orange-500">💡 前7年为锁定期，现金价值低于本金</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-sm text-muted-foreground mb-1">差距</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {cashValue - result.bankFinalAmount >= 0 ? "+" : ""}{formatCurrency(cashValue - result.bankFinalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cashValue >= result.bankFinalAmount ? "多赚" : "少赚"} {Math.abs(((cashValue - result.bankFinalAmount) / result.bankFinalAmount) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground pt-2">
                {getDifferenceDescription(result.difference)}
              </p>
            </CardContent>
          </Card>

          {/* 曲线图 */}
          <Card>
            <CardHeader>
              <CardTitle>复利的时间威力</CardTitle>
              <CardDescription>
                观察单利线性增长与复利指数增长的差距如何随时间扩大
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompoundChart result={result} delayedResult={delayedResultForChart} cashValue={cashValue} />
            </CardContent>
          </Card>

          {/* 延迟5年对比 */}
          {years > 10 && delayedResultForCard && (
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  还在犹豫？看看晚5年开始会怎样
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">现在开始</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(cashValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">{years}年后现金价值</div>
                  </div>
                  <div className="bg-card/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">5年后开始</div>
                    <div className="text-xl font-bold text-orange-500">
                      {formatCurrency(delayedResultForCard.insuranceFinalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{years - 5}年后现金价值</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  晚5年开始，最终少赚{" "}
                  <span className="text-orange-500 font-bold">
                    {formatCurrency(cashValue - delayedResultForCard.insuranceFinalAmount)}
                  </span>
                  {" "}({((cashValue - delayedResultForCard.insuranceFinalAmount) / cashValue * 100).toFixed(1)}%)
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA - 统一咨询入口 */}
          <div className="text-center space-y-4 py-8">
            <p className="text-muted-foreground">
              想了解适合您的复利投资方案？
            </p>
            <Button size="lg" className="px-8">
              预约免费咨询
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              专业顾问将根据您的年龄和预算，定制最优配置方案
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">常见问题</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  什么是单利和复利？
                </h3>
                <p className="text-muted-foreground text-sm">
                  单利只按本金计算利息，利息不会产生新的利息（如银行定存、国债）。
                  复利是利息加入本金再计算利息，实现"利滚利"（如分红保单、基金分红再投资）。
                  时间越长，复利优势越明显。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  复利投资的收益确定吗？
                </h3>
                <p className="text-muted-foreground text-sm">
                  香港储蓄分红险由保证现金价值和非保证分红组成。保证部分是写入合同、确定给付的；
                  非保证分红根据保险公司投资表现分配。根据历史数据，主流保司的分红实现率稳定在95%-105%之间。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  什么时候开始最合适？
                </h3>
                <p className="text-muted-foreground text-sm">
                  复利投资越早开始越好，但任何时间开始都比不开始强。
                  使用我们的生日回溯计算器，看看能否抓住费率上涨前的最后机会。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
