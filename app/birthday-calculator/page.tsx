"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Clock, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  calculateAllCompanies,
  formatCountdown,
  type AgeCalculationResult,
} from "@/src/lib/calculations/birthday";
import { cn } from "@/lib/utils";

// 倒计时组件
function CountdownTimer({ targetDays }: { targetDays: number }) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDays));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds =
          prev.days * 24 * 60 * 60 +
          prev.hours * 60 * 60 +
          prev.minutes * 60 +
          prev.seconds -
          1;

        if (totalSeconds <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          days: Math.floor(totalSeconds / (24 * 60 * 60)),
          hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDays]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2 text-4xl font-bold font-mono">
      <div className="flex flex-col items-center">
        <span className="text-primary">{pad(timeLeft.days)}</span>
        <span className="text-xs text-muted-foreground font-normal">天</span>
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary">{pad(timeLeft.hours)}</span>
        <span className="text-xs text-muted-foreground font-normal">时</span>
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary">{pad(timeLeft.minutes)}</span>
        <span className="text-xs text-muted-foreground font-normal">分</span>
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary">{pad(timeLeft.seconds)}</span>
        <span className="text-xs text-muted-foreground font-normal">秒</span>
      </div>
    </div>
  );
}

// 获取计算方式的中文描述
function getCalcMethodLabel(method: string): string {
  switch (method) {
    case "ALB":
      return "实岁计算";
    case "ANB":
      return "下次生日";
    case "Nearest":
      return "最近生日";
    default:
      return method;
  }
}

// 保司结果卡片
function CompanyResultCard({
  result,
}: {
  result: AgeCalculationResult;
}) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        result.canBackdate
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-border"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{result.company.name}</CardTitle>
            <CardDescription>{result.company.nameEn}</CardDescription>
          </div>
          <Badge variant={result.canBackdate ? "default" : "secondary"}>
            {getCalcMethodLabel(result.company.calcMethod)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 年龄信息 */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">当前投保年龄</span>
          <span className="text-2xl font-bold">{result.currentAge} 岁</span>
        </div>

        {/* 回溯信息 */}
        {result.canBackdate ? (
          <div className="rounded-lg bg-primary/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">可回溯至 {result.backdateAge} 岁投保</span>
            </div>
            <p className="text-sm text-muted-foreground">
              回溯截止：{result.backdateDeadline
                ? format(result.backdateDeadline, "yyyy年MM月dd日", { locale: zhCN })
                : "-"}
            </p>
            {result.effectiveDateRestriction && (
              <p className="text-xs text-yellow-500">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {result.effectiveDateRestriction}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              已过回溯期（最长{result.company.backdateDays}天）
            </p>
          </div>
        )}

        {/* 下次涨价 */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">下次年龄增长日期</span>
            <span>
              {format(result.nextAgeDate, "MM月dd日", { locale: zhCN })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            年龄增长后，保费将按新年龄计算
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BirthdayCalculatorPage() {
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [results, setResults] = useState<AgeCalculationResult[] | null>(null);
  const [minDays, setMinDays] = useState<number>(0);

  const handleCalculate = useCallback(() => {
    if (!birthDate) return;

    const allResults = calculateAllCompanies(birthDate);
    setResults(allResults);

    // 找到最小的天数（最紧迫的）
    const min = Math.min(...allResults.map((r) => r.daysUntilNextAge));
    setMinDays(min);
  }, [birthDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="mb-4">
            香港保险专用工具
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            生日过后，你的保费可能正在「悄悄上涨」
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            刚过生日？你还有90-180天的回溯窗口，可以用更年轻的投保年龄锁定更低费率
            <br />
            立即计算，看看六家保司哪家还能帮你省
          </p>
        </div>
      </section>

      {/* Input Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>计算你的投保年龄</CardTitle>
              <CardDescription>
                支持友邦、保诚、宏利、安盛、万通、永明六家保司
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 出生日期 */}
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-foreground font-medium">出生日期</Label>
                <DatePicker
                  date={birthDate}
                  onSelect={setBirthDate}
                  placeholder="选择你的出生日期"
                  maxDate={new Date()}
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={!birthDate}
                className="w-full"
                size="lg"
              >
                开始计算
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* 倒计时 */}
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                距离年龄增长还有
              </h2>
              <CountdownTimer targetDays={minDays} />
              <p className="text-muted-foreground">
                六家保司中最近的年龄调整日期
              </p>
            </div>

            {/* 提示说明 */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  保险年龄每增加 1 岁，保费通常上涨 3-5%。
                  <br />
                  在年龄增长前投保，或利用回溯功能，可以锁定更低的费率。
                </p>
              </CardContent>
            </Card>

            {/* 保司对比 */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">六家保司对比</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <CompanyResultCard
                    key={result.company.id}
                    result={result}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button size="lg" className="px-8">
                预约咨询锁定费率
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                专业顾问将在24小时内联系你
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">常见问题</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">什么是「投保年龄」？</h3>
              <p className="text-muted-foreground">
                香港保险采用不同的年龄计算方式。友邦、安盛、万通、永明使用「实岁计算」（已过几次生日就是几岁），
                保诚使用「下次生日」计算方式，宏利使用「最近生日」计算方式（以生日后6个月为界）。
                不同的计算方式会影响你的保费费率。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">什么是「回溯」？</h3>
              <p className="text-muted-foreground">
                回溯是指在投保时选择较早的保单生效日，
                从而使用较年轻的投保年龄计算保费。大多数保司允许回溯 90-180 天。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">费率上涨多少？</h3>
              <p className="text-muted-foreground">
                一般来说，投保年龄每增加 1 岁，保费上涨约 3-5%。
                对于长期缴费的保单，累计差额可能相当可观。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
