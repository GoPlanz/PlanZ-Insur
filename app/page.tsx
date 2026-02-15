import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Shield,
  Gamepad2,
  ArrowRight,
  Clock,
} from "lucide-react";

const tools = [
  {
    id: "birthday-calculator",
    name: "生日回溯计算器",
    description: "输入出生日期，查看六家保司的回溯机会，计算费率上涨前的剩余时间",
    icon: Clock,
    status: "ready",
    phase: "阶段一",
  },
  {
    id: "compound-compare",
    name: "复利与资产对比",
    description: "银行定存 vs 保险复利的时间价值对比，资产配置雷达图分析",
    icon: TrendingUp,
    status: "coming",
    phase: "阶段一",
  },
  {
    id: "fx-calculator",
    name: "汇率盈亏计算器",
    description: "计算美元保单需要持有多少年才能抵消汇率下跌的损失",
    icon: DollarSign,
    status: "coming",
    phase: "阶段二",
  },
  {
    id: "critical-illness",
    name: "重疾条款对比",
    description: "香港各保司重疾定义对照表，理赔数据与高发疾病分析",
    icon: Shield,
    status: "coming",
    phase: "阶段二",
  },
  {
    id: "wealth-simulator",
    name: "财富风险模拟器",
    description: "游戏化推演：债务、婚变、税务等风险场景下的财富防御力测试",
    icon: Gamepad2,
    status: "coming",
    phase: "阶段三",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="mb-4">
            PlanZ Insurance Tools
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            香港保险工具站
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            游戏化保险教育工具，让复杂的保险决策变得简单直观
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isReady = tool.status === "ready";

              return (
                <Card
                  key={tool.id}
                  className={`transition-all duration-300 ${
                    isReady
                      ? "hover:border-primary/50 hover:shadow-lg cursor-pointer"
                      : "opacity-60"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={isReady ? "default" : "secondary"}>
                        {isReady ? "可用" : tool.phase}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isReady ? (
                      <Link href={`/${tool.id}`}>
                        <Button className="w-full">
                          开始使用
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        即将上线
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>PlanZ Insurance Tools · 专业香港保险咨询工具</p>
        </div>
      </footer>
    </div>
  );
}
