"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Info, ChevronRight, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 计算累积现金价值（简化版复利计算）
function calculateCashValue(
  annualPremium: number,
  years: number,
  irRate: number
): number {
  let total = 0;
  for (let i = 0; i < years; i++) {
    // 假设保费在年初缴纳
    total += annualPremium * Math.pow(1 + irRate, years - i);
  }
  return total;
}

// 计算每年的汇率盈亏
function calculateYearlyData(
  startYear: number,
  startRate: number,
  currentRate: number,
  annualPremium: number,
  years: number,
  irRate: number
) {
  const data = [];
  const totalPremium = annualPremium * years;

  // 汇率变化率
  const rateChange = (currentRate - startRate) / startRate;

  for (let year = 0; year <= years + 10; year++) {
    // 计算现金价值（简化：假设前期积累，后期才有收益）
    const cashValue = calculateCashValue(annualPremium, Math.min(year, years), irRate);

    // 汇率导致的损失/收益
    const fxLoss = totalPremium * rateChange * (year / years);

    // 实际收益（人民币）
    const actualValue = cashValue * currentRate - fxLoss;

    // 累计保费投入（人民币）
    const investedRMB = annualPremium * Math.min(year, years) * currentRate;

    // 盈亏
    const profitLoss = actualValue - investedRMB;

    data.push({
      year,
      cashValueUSD: Math.round(cashValue),
      fxLoss: Math.round(-fxLoss),
      actualValue: Math.round(actualValue),
      invested: Math.round(investedRMB),
      profitLoss: Math.round(profitLoss),
    });
  }

  return data;
}

// 找到盈亏平衡点
function findBreakEvenYear(data: { profitLoss: number }[]) {
  for (let i = 1; i < data.length; i++) {
    if (data[i].profitLoss > 0 && data[i - 1].profitLoss <= 0) {
      return i;
    }
  }
  return null;
}

export default function FXCalculatorPage() {
  // 输入状态
  const [startYear, setStartYear] = useState(2020);
  const [startRate, setStartRate] = useState(7.0);
  const [currentRate, setCurrentRate] = useState(7.2);
  const [annualPremium, setAnnualPremium] = useState(10000);
  const [years, setYears] = useState(5);
  const [irRate, setIrRate] = useState(5);

  // 计算结果
  const result = useMemo(() => {
    const totalPremiumUSD = annualPremium * years;
    const totalPremiumRMBAtStart = totalPremiumUSD * startRate;
    const totalPremiumRMBCurrent = totalPremiumUSD * currentRate;

    // 汇率损失
    const fxLoss = totalPremiumRMBCurrent - totalPremiumRMBAtStart;

    // 最终现金价值
    const finalCashValue = calculateCashValue(annualPremium, years, irRate / 100);

    // 换算人民币
    const finalValueRMB = finalCashValue * currentRate;

    // 实际收益（扣除汇率损失）
    const actualProfit = finalValueRMB - totalPremiumRMBAtStart;

    // 年度数据
    const yearlyData = calculateYearlyData(
      startYear,
      startRate,
      currentRate,
      annualPremium,
      years,
      irRate / 100
    );

    // 盈亏平衡年
    const breakEvenYear = findBreakEvenYear(yearlyData);

    return {
      totalPremiumUSD,
      totalPremiumRMBAtStart,
      fxLoss,
      finalCashValue,
      finalValueRMB,
      actualProfit,
      yearlyData,
      breakEvenYear,
      rateChange: ((currentRate - startRate) / startRate) * 100,
    };
  }, [startYear, startRate, currentRate, annualPremium, years, irRate]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="mb-4">
            阶段二工具
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            汇率盈亏计算器
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            买美元保单，汇率究竟影响多大？
            <br />
            多少年才能抵消汇率下跌的损失？
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 输入面板 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  输入参数
                </CardTitle>
                <CardDescription>填写您的保单信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 投保年份 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">投保年份</label>
                  <input
                    type="number"
                    min={2010}
                    max={2030}
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  />
                </div>

                {/* 投保时汇率 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">投保时汇率 (USD/CNY)</label>
                  <input
                    type="number"
                    step={0.01}
                    min={5}
                    max={10}
                    value={startRate}
                    onChange={(e) => setStartRate(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    投保时美元兑人民币汇率
                  </p>
                </div>

                {/* 当前汇率 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">当前汇率 (USD/CNY)</label>
                  <input
                    type="number"
                    step={0.01}
                    min={5}
                    max={10}
                    value={currentRate}
                    onChange={(e) => setCurrentRate(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    当前美元兑人民币汇率
                  </p>
                </div>

                {/* 保费 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">每年保费 (美元)</label>
                  <input
                    type="number"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={annualPremium}
                    onChange={(e) => setAnnualPremium(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  />
                </div>

                {/* 缴费年期 */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">缴费年期</label>
                    <span className="text-sm font-medium">{years}年</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1年</span>
                    <span>20年</span>
                  </div>
                </div>

                {/* 预期IRR */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">预期IRR (%)</label>
                    <span className="text-sm font-medium">{irRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={irRate}
                    onChange={(e) => setIrRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 结果面板 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 关键指标 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.rateChange > 0 ? (
                          <span className="text-green-500">+{result.rateChange.toFixed(1)}%</span>
                        ) : (
                          <span className="text-red-500">{result.rateChange.toFixed(1)}%</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">汇率变化</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        -{formatCurrency(result.fxLoss)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">汇率损失</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(result.finalCashValue)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">现金价值(USD)</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${result.actualProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {result.actualProfit >= 0 ? '+' : ''}{formatCurrency(result.actualProfit)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">实际收益(CNY)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 盈亏平衡 */}
              <Card className={result.breakEvenYear ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-4">
                    {result.breakEvenYear ? (
                      <>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-500">
                            {result.breakEvenYear}年
                          </div>
                          <div className="text-muted-foreground mt-1">
                            预计 {result.breakEvenYear} 年后汇率损失被收益抵消
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">
                          10年以上
                        </div>
                        <div className="text-muted-foreground mt-1">
                          当前条件下汇率损失难以被收益抵消
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 图表 */}
              <Card>
                <CardHeader>
                  <CardTitle>收益变化曲线</CardTitle>
                  <CardDescription>
                    展示历年现金价值、投入与实际收益变化
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}年`}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${formatCurrency(value)}`}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            `${formatCurrency(Number(value) || 0)}`,
                            name === 'invested' ? '累计投入' :
                            name === 'actualValue' ? '实际价值' :
                            name === 'profitLoss' ? '盈亏' : name
                          ]}
                          labelFormatter={(label) => `第${label}年`}
                        />
                        <ReferenceLine
                          y={0}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="3 3"
                        />
                        {result.breakEvenYear && (
                          <ReferenceLine
                            x={result.breakEvenYear}
                            stroke="green"
                            strokeDasharray="5 5"
                            label={{ value: '盈亏平衡', position: 'top', fill: 'green', fontSize: 12 }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="invested"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          dot={false}
                          name="累计投入"
                        />
                        <Line
                          type="monotone"
                          dataKey="actualValue"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={false}
                          name="实际价值"
                        />
                        <Line
                          type="monotone"
                          dataKey="profitLoss"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          name="盈亏"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-muted-foreground" />
                      <span className="text-muted-foreground">累计投入</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-500" />
                      <span className="text-green-500">实际价值</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-blue-500" />
                      <span className="text-blue-500">盈亏</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 说明 */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium">计算说明</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 汇率损失 = 总保费 × 汇率变化率</li>
                      <li>• 现金价值按复利累积计算，假设前期现金价值较低</li>
                      <li>• 实际收益 = 现金价值×当前汇率 - 汇率损失 - 已缴保费</li>
                      <li>• 盈亏平衡点 = 汇率损失被投资收益抵消的年份</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">需要专业建议？</h2>
          <p className="text-muted-foreground">
            汇率波动受多种因素影响，本计算器仅供参考。
            专业顾问可以帮你分析最优的货币配置方案。
          </p>
          <Button size="lg" className="px-8">
            预约免费咨询
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            * 本工具计算结果仅供参考，实际收益受多种因素影响。
            汇率波动可能导致实际收益与预期不符。
          </p>
        </div>
      </footer>
    </div>
  );
}
