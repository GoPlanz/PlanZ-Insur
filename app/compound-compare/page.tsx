"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Clock, Info, ChevronRight, Sparkles, RotateCcw, Menu, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  const irr = irrByYears[Math.min(year, 30)] / 100;

  // 如果IRR为负，使用简化的现金价值模型
  if (irr < 0) {
    const recoveryFactors: Record<number, number> = {
      1: 0.02,
      2: 0.55,
      3: 0.78,
      4: 0.88,
      5: 0.94,
      6: 0.99,
    };
    return principal * (recoveryFactors[year] || 1);
  }

  // 对于正IRR年份，使用复利公式
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

    const data = result.bankData.map((bank) => {
      const year = bank.year;
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
        const startYear = 5;

        if (d.year >= startYear) {
          const yearSinceStart = d.year - startYear + 1;
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
      <div className="h-[300px] w-full">
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
            {/* 锁定期标记 */}
            {result.years >= 7 && (
              <ReferenceDot
                x={7}
                y={chartData.find((d: any) => d.year === 7)?.复利 || result.principal}
                r={5}
                fill="#ef4444"
                stroke="white"
                strokeWidth={2}
              />
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
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-blue-400 rounded" />
          <span>单利</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-green-500 rounded" />
          <span>复利</span>
        </div>
        {delayedResult && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded" style={{ background: "repeating-linear-gradient(90deg, #F97316, #F97316 3px, transparent 3px, transparent 6px)" }} />
            <span>复利（晚5年投入）</span>
          </div>
        )}
        {result.years >= 7 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 border border-white" />
            <span className="text-muted-foreground">7年锁定期结束</span>
          </div>
        )}
      </div>

      {/* 年度增长数据表 */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs min-w-[400px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 text-left">年份</th>
              <th className="px-2 py-2 text-right">单利</th>
              <th className="px-2 py-2 text-right">复利现金价值</th>
              <th className="px-2 py-2 text-right">差额</th>
            </tr>
          </thead>
          <tbody>
            {result.bankData
              .filter((d) => d.year % 5 === 0 || d.year === result.years)
              .map((bank) => {
                const year = bank.year;
                const principal = result.principal;
                const cashValue = calculateActualCashValue(principal, year, IRR_BY_YEARS);
                const difference = cashValue - bank.bankAmount;
                const diffPercent = bank.bankAmount > 0
                  ? ((difference / bank.bankAmount) * 100).toFixed(0)
                  : "0";
                const isInLockup = year <= 7;

                return (
                  <tr key={bank.year} className="border-t border-border">
                    <td className="px-2 py-2">
                      {bank.year}年
                      {isInLockup && (
                        <span className="ml-1 text-xs text-red-500">(锁定期)</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-blue-400">
                      {formatCurrency(bank.bankAmount)}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-green-500 font-bold">
                      {formatCurrency(cashValue)}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-yellow-500">
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

// 左侧输入面板组件
function InputPanel({
  principal, setPrincipal,
  simpleRate, setSimpleRate,
  compoundRate, setCompoundRate,
  years, setYears,
  isUsingSuggestedRate, setIsUsingSuggestedRate,
  hasInteracted, setHasInteracted,
  multiplier,
}: {
  principal: number; setPrincipal: (v: number) => void;
  simpleRate: number; setSimpleRate: (v: number) => void;
  compoundRate: number; setCompoundRate: (v: number) => void;
  years: number; setYears: (v: number) => void;
  isUsingSuggestedRate: boolean; setIsUsingSuggestedRate: (v: boolean) => void;
  hasInteracted: boolean; setHasInteracted: (v: boolean) => void;
  multiplier: string;
}) {
  const handleInteract = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleRestoreSuggestedRate = () => {
    setIsUsingSuggestedRate(true);
    setCompoundRate(getSuggestedIRR(years));
  };

  const yearShortcuts = [10, 20, 30, 40, 50, 60];

  return (
    <div className="h-full flex flex-col">
      {/* 核心结论 - 顶部 */}
      <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
        <Badge variant="outline" className="mb-3">
          复利对比工具
        </Badge>
        <h1 className="text-2xl font-bold mb-2">
          {years}年后
        </h1>
        <p className="text-3xl font-bold text-primary">
          复利是单利的 {multiplier} 倍
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          时间越久，差距越大
        </p>
      </div>

      {/* 输入区 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 本金输入 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="principal" className="font-medium">投入本金</Label>
            <span className="text-xl font-bold text-primary">
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
              <Label htmlFor="simpleRate" className="font-medium">单利投资</Label>
              <p className="text-xs text-muted-foreground">定存、国债</p>
            </div>
            <span className="text-lg font-bold text-blue-400">{formatRate(simpleRate)}</span>
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
              <Label htmlFor="compoundRate" className="font-medium">复利投资</Label>
              <p className="text-xs text-muted-foreground">分红保单</p>
              {compoundRate > 6.5 && (
                <span className="text-xs text-orange-500">超演示限高</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-green-500">{formatRate(compoundRate)}</span>
              {isUsingSuggestedRate && (
                <p className="text-xs text-muted-foreground">市场参考</p>
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
              恢复建议值
            </Button>
          )}
        </div>

        {/* 投资年限 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">投资年限</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{years} 年</span>
            </div>
          </div>

          {/* 快捷年限按钮 */}
          <div className="flex gap-1.5 flex-wrap">
            {yearShortcuts.map((y) => (
              <Button
                key={y}
                variant={years === y ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setYears(y);
                  handleInteract();
                }}
                className="flex-1 min-w-[50px]"
              >
                {y}
              </Button>
            ))}
          </div>

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
        </div>

        {!hasInteracted && (
          <p className="text-xs text-center text-muted-foreground bg-muted/50 py-2 rounded">
            💡 示例数据，调整参数查看您的实际情况
          </p>
        )}
      </div>
    </div>
  );
}

export default function CompoundComparePage() {
  const [principal, setPrincipal] = useState<number>(1000000);
  const [simpleRate, setSimpleRate] = useState<number>(1.5);
  const [compoundRate, setCompoundRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(30);
  const [isUsingSuggestedRate, setIsUsingSuggestedRate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const result = calculateCompound({
    principal,
    bankRate: simpleRate,
    insuranceRate: compoundRate,
    years,
  });

  const cashValue = useMemo(() => {
    return calculateActualCashValue(principal, years, IRR_BY_YEARS);
  }, [principal, years]);

  const delayedResultForCard = useMemo(() => {
    if (years <= 10) return null;
    const delayedYears = years - 5;
    return {
      insuranceFinalAmount: calculateActualCashValue(principal, delayedYears, IRR_BY_YEARS),
      years: delayedYears,
    };
  }, [principal, years]);

  const delayedResultForChart = useMemo(() => {
    if (years <= 10) return null;
    const paddedData = Array(5).fill(null).map((_, i) => ({
      year: i + 1,
      bankAmount: 0,
      insuranceAmount: 0,
      difference: 0,
    }));
    const actualData = result.bankData.slice(0, years - 5).map((bank, i) => {
      const yearSinceStart = i + 1;
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

  useEffect(() => {
    if (isUsingSuggestedRate) {
      const suggested = getSuggestedIRR(years);
      setCompoundRate(suggested);
    }
  }, [years, isUsingSuggestedRate]);

  const multiplier = result.bankFinalAmount > 0
    ? (cashValue / result.bankFinalAmount).toFixed(1)
    : "1.0";

  return (
    <div className="min-h-screen bg-background">
      {/* 桌面端：左右分栏 */}
      <div className="hidden lg:flex min-h-screen">
        {/* 左侧：输入面板 */}
        <div className="w-[400px] border-r border-border bg-card flex flex-col">
          <InputPanel
            principal={principal} setPrincipal={setPrincipal}
            simpleRate={simpleRate} setSimpleRate={setSimpleRate}
            compoundRate={compoundRate} setCompoundRate={setCompoundRate}
            years={years} setYears={setYears}
            isUsingSuggestedRate={isUsingSuggestedRate} setIsUsingSuggestedRate={setIsUsingSuggestedRate}
            hasInteracted={hasInteracted} setHasInteracted={setHasInteracted}
            multiplier={multiplier}
          />
        </div>

        {/* 右侧：结果展示 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-8">
            {/* 结果摘要卡片 */}
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="py-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">单利</div>
                    <div className="text-xl font-bold text-blue-400">
                      {formatCurrency(result.bankFinalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatRate(simpleRate)}/年</div>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="text-sm text-muted-foreground mb-1">
                      复利现金价值
                      {years <= 7 && <span className="text-red-500 ml-1 text-xs">(锁定期)</span>}
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(cashValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatRate(compoundRate)}/年</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">差距</div>
                    <div className="text-xl font-bold text-yellow-500">
                      {cashValue - result.bankFinalAmount >= 0 ? "+" : ""}{formatCurrency(cashValue - result.bankFinalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.abs(((cashValue - result.bankFinalAmount) / result.bankFinalAmount) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-4 text-sm">
                  {getDifferenceDescription(result.difference)}
                </p>
              </CardContent>
            </Card>

            {/* 曲线图 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">复利的时间威力</CardTitle>
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
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-orange-500" />
                    还在犹豫？看看晚5年开始会怎样
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">现在开始</div>
                      <div className="text-lg font-bold text-green-500">{formatCurrency(cashValue)}</div>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">5年后开始</div>
                      <div className="text-lg font-bold text-orange-500">{formatCurrency(delayedResultForCard.insuranceFinalAmount)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    晚5年，少赚 <span className="text-orange-500 font-bold">{formatCurrency(cashValue - delayedResultForCard.insuranceFinalAmount)}</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <div className="text-center space-y-4 py-4">
              <p className="text-muted-foreground text-sm">想了解适合您的复利投资方案？</p>
              <Button size="lg" className="px-8">
                预约免费咨询
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* FAQ */}
            <div className="space-y-4 pt-8 border-t border-border">
              <h2 className="text-lg font-semibold text-center">常见问题</h2>
              <Card>
                <CardContent className="py-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-primary" />
                    什么是单利和复利？
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    单利只按本金计算利息（如银行定存）。复利是利滚利（如分红保单），时间越长优势越明显。
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-primary" />
                    复利投资的收益确定吗？
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    香港储蓄分红险由保证现金价值和非保证分红组成。主流保司分红实现率稳定在95%-105%之间。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端：垂直布局 */}
      <div className="lg:hidden">
        {/* 顶部栏 */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold">复利对比工具</h1>
            <p className="text-sm text-primary">{years}年后，复利是单利的 {multiplier} 倍</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* 输入面板 - 可折叠 */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 space-y-6">
            {/* 本金 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">投入本金</Label>
                <span className="font-bold text-primary">{formatCurrency(principal)}</span>
              </div>
              <Slider
                value={[principal]}
                onValueChange={([v]) => setPrincipal(v)}
                min={100000}
                max={5000000}
                step={100000}
              />
            </div>

            {/* 单利 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">单利 {formatRate(simpleRate)}</Label>
              </div>
              <Slider
                value={[simpleRate]}
                onValueChange={([v]) => setSimpleRate(v)}
                min={0.5}
                max={5}
                step={0.1}
              />
            </div>

            {/* 复利 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">复利 {formatRate(compoundRate)}</Label>
                {!isUsingSuggestedRate && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setIsUsingSuggestedRate(true);
                    setCompoundRate(getSuggestedIRR(years));
                  }} className="h-6 text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />恢复
                  </Button>
                )}
              </div>
              <Slider
                value={[compoundRate]}
                onValueChange={([v]) => {
                  setCompoundRate(v);
                  setIsUsingSuggestedRate(false);
                }}
                min={0.5}
                max={8}
                step={0.1}
              />
            </div>

            {/* 年限 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">投资年限</Label>
                <span className="font-bold">{years} 年</span>
              </div>
              <div className="flex gap-1">
                {[10, 20, 30, 40, 50, 60].map((y) => (
                  <Button
                    key={y}
                    variant={years === y ? "default" : "outline"}
                    size="sm"
                    onClick={() => setYears(y)}
                    className="flex-1"
                  >
                    {y}
                  </Button>
                ))}
              </div>
              <Slider
                value={[years]}
                onValueChange={([v]) => setYears(v)}
                min={10}
                max={60}
                step={1}
              />
            </div>
          </div>
        )}

        {/* 结果区 */}
        <div className="p-4 space-y-4">
          {/* 结果摘要 */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">单利</div>
                  <div className="text-sm font-bold text-blue-400">{formatCurrency(result.bankFinalAmount)}</div>
                </div>
                <div className="border-x border-border">
                  <div className="text-xs text-muted-foreground">
                    复利{years <= 7 && <span className="text-red-500 text-xs">(锁定)</span>}
                  </div>
                  <div className="text-sm font-bold text-green-500">{formatCurrency(cashValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">差距</div>
                  <div className="text-sm font-bold text-yellow-500">
                    {cashValue - result.bankFinalAmount >= 0 ? "+" : ""}{formatCurrency(cashValue - result.bankFinalAmount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 曲线图 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">复利的时间威力</CardTitle>
            </CardHeader>
            <CardContent>
              <CompoundChart result={result} delayedResult={delayedResultForChart} cashValue={cashValue} />
            </CardContent>
          </Card>

          {/* 延迟对比 */}
          {years > 10 && delayedResultForCard && (
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>现在开始: <strong className="text-green-500">{formatCurrency(cashValue)}</strong></span>
                  <span>5年后: <strong className="text-orange-500">{formatCurrency(delayedResultForCard.insuranceFinalAmount)}</strong></span>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  晚5年少赚 <span className="text-orange-500 font-bold">{formatCurrency(cashValue - delayedResultForCard.insuranceFinalAmount)}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="text-center py-4">
            <Button className="w-full">
              预约免费咨询
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
