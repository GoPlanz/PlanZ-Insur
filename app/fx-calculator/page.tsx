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

// IRR 市场数据（与复利对比工具一致）
// 基于真实保单现金价值计算的年化收益率
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

// 基于真实IRR数据计算现金价值（与复利对比工具一致）
function calculateCashValueByYear(annualPremium: number, year: number): number {
  if (year <= 0) return 0;

  let totalCashValue = 0;

  // 假设每年年初缴费，计算每年的现金价值累积
  for (let i = 1; i <= year; i++) {
    const yearsSincePayment = year - i + 1;
    const irr = IRR_BY_YEARS[Math.min(yearsSincePayment, 30)] / 100;

    if (irr < 0) {
      // 负IRR年份使用回收比例
      const recoveryFactors: Record<number, number> = {
        1: 0.02,
        2: 0.55,
        3: 0.78,
        4: 0.88,
        5: 0.94,
        6: 0.99,
      };
      totalCashValue += annualPremium * (recoveryFactors[yearsSincePayment] || 1);
    } else {
      // 正IRR年份使用复利公式
      totalCashValue += annualPremium * Math.pow(1 + irr, yearsSincePayment);
    }
  }

  return totalCashValue;
}

// 计算每年的汇率盈亏数据
function calculateYearlyData(
  startRate: number,
  currentRate: number,
  annualPremium: number,
  years: number
) {
  const data = [];

  for (let year = 0; year <= 20; year++) {
    // 现金价值（使用真实IRR计算）
    const cashValueUSD = calculateCashValueByYear(annualPremium, year);

    // 累计已缴保费（美元）
    const totalPaidUSD = year <= years ? annualPremium * year : annualPremium * years;

    // 汇率导致的损失/收益
    const fxLoss = totalPaidUSD * (currentRate - startRate);

    // 投入本金（人民币，投保时汇率）
    const investedRMB = totalPaidUSD * startRate;

    // 当前现金价值（人民币，当前汇率）
    const cashValueRMB = cashValueUSD * currentRate;

    // 实际收益 = 现金价值 - 汇率损失 - 投入本金
    const actualProfit = cashValueRMB - fxLoss - investedRMB;

    // 显示IRR
    const irr = year > 0 ? IRR_BY_YEARS[Math.min(year, 30)] : 0;

    data.push({
      year,
      cashValueUSD: Math.round(cashValueUSD),
      cashValueRMB: Math.round(cashValueRMB),
      totalPaidUSD: Math.round(totalPaidUSD),
      invested: Math.round(investedRMB),
      investedRMB: Math.round(investedRMB),
      cashValue: Math.round(cashValueRMB),
      actualValue: Math.round(cashValueRMB),
      fxLoss: Math.round(-fxLoss),
      actualProfit: Math.round(actualProfit),
      profitLoss: Math.round(actualProfit),
      irr: irr.toFixed(1),
      isLoss: actualProfit < 0,
    });
  }

  return data;
}

// 找到盈亏平衡点
function findBreakEvenYear(data: { actualProfit: number }[]) {
  for (let i = 1; i < data.length; i++) {
    if (data[i].actualProfit > 0 && data[i - 1].actualProfit <= 0) {
      return i;
    }
  }
  return null;
}

export default function FXCalculatorPage() {
  // 输入状态
  const [startRate, setStartRate] = useState(7.0);
  const [currentRate, setCurrentRate] = useState(7.2);
  const [annualPremium, setAnnualPremium] = useState(10000);
  const [paymentYears, setPaymentYears] = useState(5);
  const [selectedYear, setSelectedYear] = useState(10); // 用户选择的查看年份

  // 计算结果
  const result = useMemo(() => {
    const yearlyData = calculateYearlyData(startRate, currentRate, annualPremium, paymentYears);
    const breakEvenYear = findBreakEvenYear(yearlyData);
    const rateChange = ((currentRate - startRate) / startRate) * 100;

    return {
      yearlyData,
      breakEvenYear,
      rateChange,
    };
  }, [startRate, currentRate, annualPremium, paymentYears]);

  // 当前选中的年份数据
  const selectedYearData = result.yearlyData[selectedYear] || result.yearlyData[result.yearlyData.length - 1];

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
                    <span className="text-sm font-medium">{paymentYears}年</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={paymentYears}
                    onChange={(e) => setPaymentYears(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1年</span>
                    <span>20年</span>
                  </div>
                </div>

                {/* 预期退保年份 */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">预期退保年份</label>
                    <span className="text-sm font-medium">{selectedYear}年</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1年</span>
                    <span>20年</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    选择预期退保年份，查看对应收益
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 结果面板 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 当前查看年份提示 */}
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <span className="text-amber-600 font-medium">当前查看第 {selectedYear} 年</span>
                <span className="text-sm text-muted-foreground">（点击图表上的圆点或使用滑块切换年份）</span>
              </div>

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
                        -{formatCurrency(selectedYearData.fxLoss)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">汇率损失</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedYearData.cashValueUSD)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">现金价值(USD)</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${selectedYearData.actualProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedYearData.actualProfit >= 0 ? '+' : ''}{formatCurrency(selectedYearData.actualProfit)}
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
                    点击图表上的年份点查看对应收益
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={result.yearlyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        onClick={(data: unknown) => {
                          const chartData = data as { activePayload?: Array<{ payload: { year: number } }> } | undefined;
                          if (chartData && chartData.activePayload && chartData.activePayload[0]) {
                            const year = chartData.activePayload[0].payload.year;
                            if (year > 0) setSelectedYear(year);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
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
                        <ReferenceLine
                          x={selectedYear}
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{ value: '当前查看', position: 'top', fill: '#f59e0b', fontSize: 12 }}
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
                          dot={{ r: 4, fill: '#22c55e' }}
                          name="实际价值"
                        />
                        <Line
                          type="monotone"
                          dataKey="profitLoss"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#3b82f6' }}
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
