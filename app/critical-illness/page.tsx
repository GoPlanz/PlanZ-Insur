"use client";

import { useState, useMemo } from "react";
import { Shield, CheckCircle2, AlertCircle, Info, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  INSURERS,
  HIGH_INCIDENCE_DISEASES,
  CANCER_DEFINITION_DIFFERENCES,
  HEART_ATTACK_DEFINITION_DIFFERENCES,
  STROKE_DEFINITION_DIFFERENCES,
  DEMENTIA_DEFINITION_DIFFERENCES,
  ICU_COVERAGE_DIFFERENCES,
  PARKINSONS_DEFINITION_DIFFERENCES,
  compareInsurers,
  getCancerDifference,
  getHeartAttackTroponin,
  getStrokeDuration,
  type InsurerId,
} from "@/src/lib/data/critical-illness-data";

// 保司颜色配置（使用品牌色）
const INSURER_COLORS: Record<InsurerId, { bg: string; text: string; border: string; hex: string }> = {
  mainland: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", hex: "#DE2910" },
  aia: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", hex: "#cc1344" },
  prudential: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", hex: "#e61b2d" },
  manulife: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30", hex: "#2e8b57" },
  axa: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30", hex: "#00008b" },
  yf: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30", hex: "#012c67" },
  sunlife: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", hex: "#f5b812" },
};

// 疾病分组
const DISEASE_GROUPS = [
  {
    id: "tier1",
    name: "三大高发重疾",
    description: "占所有重疾理赔90%以上",
    color: "text-red-500",
    diseases: HIGH_INCIDENCE_DISEASES.filter((d) => d.tier === 1),
  },
  {
    id: "tier2",
    name: "前六大重疾",
    description: "监管要求必须包含的核心疾病",
    color: "text-orange-500",
    diseases: HIGH_INCIDENCE_DISEASES.filter((d) => d.tier === 2),
  },
  {
    id: "tier3",
    name: "神经系统疾病",
    description: "老龄化社会高发疾病",
    color: "text-yellow-500",
    diseases: HIGH_INCIDENCE_DISEASES.filter((d) => d.tier === 3),
  },
  {
    id: "tier4",
    name: "其他常见重疾",
    description: "相对罕见但影响重大",
    color: "text-blue-500",
    diseases: HIGH_INCIDENCE_DISEASES.filter((d) => d.tier === 4),
  },
];

// 保司对比卡片组件
function InsurerComparisonCard({
  diseaseId,
  selectedInsurers,
  showDetails,
}: {
  diseaseId: string;
  selectedInsurers: InsurerId[];
  showDetails: boolean;
}) {
  const getComparisonContent = () => {
    // 癌症对比
    if (diseaseId === "cancer") {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              <Info className="inline h-4 w-4 mr-1" />
              <strong>核心要点：</strong>
              {CANCER_DEFINITION_DIFFERENCES.common}
            </p>
            <div className="flex items-center gap-2 text-xs text-yellow-500">
              <AlertCircle className="h-3 w-3" />
              <span>安盛对严重前列腺癌的排除标准（T2N0M0）比其他家更严格</span>
            </div>
          </div>
          {showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">原位癌赔付</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {selectedInsurers.map((id) => {
                  const insurer = INSURERS.find((i) => i.id === id)!;
                  const diff = getCancerDifference(id);
                  const colors = INSURER_COLORS[id];
                  const bgColor = colors.hex + "15"; // 15% opacity
                  return (
                    <div key={id} className="p-2 rounded border" style={{ backgroundColor: bgColor, borderColor: colors.hex + "30" }}>
                      <div className="font-medium" style={{ color: colors.hex }}>{insurer.name}</div>
                      <div className="text-muted-foreground mt-1">{diff.carcinomaInSitu}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 心脏病对比
    if (diseaseId === "heart-attack") {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              <Info className="inline h-4 w-4 mr-1" />
              <strong>核心要点：</strong>
              {HEART_ATTACK_DEFINITION_DIFFERENCES.common}
            </p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <CheckCircle2 className="h-3 w-3" />
              <span>安盛Troponin T要求最低（{'>'}0.2 ng/ml），理赔门槛最宽松</span>
            </div>
          </div>
          {showDetails && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">肌钙蛋白要求对比</h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">保司</th>
                      <th className="px-3 py-2 text-right">Troponin I</th>
                      <th className="px-3 py-2 text-right">Troponin T</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInsurers.map((id) => {
                      const insurer = INSURERS.find((i) => i.id === id)!;
                      const tI = getHeartAttackTroponin(id, "I");
                      const tT = getHeartAttackTroponin(id, "T");
                      const colors = INSURER_COLORS[id];
                      const isLenientT = tT === "> 200 ng/L (即0.2 ng/ml)" || tT === "> 0.6 ng/ml";
                      return (
                        <tr key={id} className="border-t border-border">
                          <td className="px-3 py-2 font-medium" style={{ color: colors.hex }}>{insurer.name}</td>
                          <td className="px-3 py-2 text-right font-mono">{tI}</td>
                          <td className={`px-3 py-2 text-right font-mono ${isLenientT ? "text-green-500" : ""}`}>
                            {tT}
                            {isLenientT && <span className="ml-1">✓</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 中风对比
    if (diseaseId === "stroke") {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <Info className="inline h-4 w-4 mr-1" />
              <strong>核心要点：</strong>
              {STROKE_DEFINITION_DIFFERENCES.common}
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <CheckCircle2 className="h-3 w-3" />
              <span>六家香港保司高度一致（28天），比内地（180天）宽松很多</span>
            </div>
          </div>
          {showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">持续时间要求</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {selectedInsurers.map((id) => {
                  const insurer = INSURERS.find((i) => i.id === id)!;
                  const duration = getStrokeDuration(id);
                  const colors = INSURER_COLORS[id];
                  const bgColor = colors.hex + "15";
                  return (
                    <div key={id} className="p-2 rounded border" style={{ backgroundColor: bgColor, borderColor: colors.hex + "30" }}>
                      <div className="font-medium" style={{ color: colors.hex }}>{insurer.name}</div>
                      <div className="text-muted-foreground mt-1">{duration}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 脑退化症对比
    if (diseaseId === "alzheimers") {
      return (
        <div className="space-y-4">
          {showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">MMSE评分要求</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {selectedInsurers.map((id) => {
                  const insurer = INSURERS.find((i) => i.id === id)!;
                  const mmse = DEMENTIA_DEFINITION_DIFFERENCES.mmseRequirement[id];
                  const colors = INSURER_COLORS[id];
                  const isFlexible = id === "sunlife";
                  const bgColor = colors.hex + "15";
                  return (
                    <div key={id} className="p-2 rounded border" style={{ backgroundColor: bgColor, borderColor: colors.hex + "30" }}>
                      <div className="font-medium" style={{ color: colors.hex }}>{insurer.name}</div>
                      <div className="text-muted-foreground mt-1 text-xs">{mmse}</div>
                      {isFlexible && (
                        <div className="text-green-500 text-xs mt-1">
                          <CheckCircle2 className="inline h-3 w-3 mr-1" />
                          替代判定
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Info className="inline h-4 w-4 mr-1" />
          各保司在此疾病上的定义基本一致，无显著差异。
        </p>
      </div>
    );
  };

  return <div className="space-y-4">{getComparisonContent()}</div>;
}

// 疾病卡片组件
function DiseaseCard({
  disease,
  isSelected,
  onSelect,
  showComparison,
  selectedInsurers,
}: {
  disease: typeof HIGH_INCIDENCE_DISEASES[number];
  isSelected: boolean;
  onSelect: () => void;
  showComparison: boolean;
  selectedInsurers: InsurerId[];
}) {
  return (
    <Card
      className={`transition-all cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{disease.name}</CardTitle>
            <CardDescription className="text-xs">{disease.nameEn}</CardDescription>
          </div>
          <Badge
            variant={isSelected ? "default" : "outline"}
            className="shrink-0"
          >
            {disease.tier === 1 && "高发"}
            {disease.tier === 2 && "核心"}
            {disease.tier === 3 && "老年"}
            {disease.tier === 4 && "常见"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {disease.description}
        </p>
        {isSelected && showComparison && selectedInsurers.length >= 2 && (
          <div className="pt-3 border-t border-border">
            <InsurerComparisonCard
              diseaseId={disease.id}
              selectedInsurers={selectedInsurers}
              showDetails={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CriticalIllnessPage() {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
  const [selectedInsurers, setSelectedInsurers] = useState<InsurerId[]>(["aia", "prudential"]);
  const [showDetails, setShowDetails] = useState(false);

  // 计算选中的疾病
  const selectedDisease = useMemo(
    () => HIGH_INCIDENCE_DISEASES.find((d) => d.id === selectedDiseaseId),
    [selectedDiseaseId]
  );

  // 切换保司选择
  const toggleInsurer = (insurerId: InsurerId) => {
    setSelectedInsurers((prev) =>
      prev.includes(insurerId)
        ? prev.length > 2
          ? prev.filter((id) => id !== insurerId)
          : prev
        : [...prev, insurerId]
    );
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
            重疾条款对比
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            同样的疾病，不同的定义
            <br />
            一字之差，可能影响几十万的理赔
          </p>
        </div>
      </section>

      {/* 保司选择 */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">
            选择要对比的保险公司（2-6家）
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {INSURERS.map((insurer) => {
              const isSelected = selectedInsurers.includes(insurer.id);
              const colors = INSURER_COLORS[insurer.id];
              const bgColor = colors.hex + "15";
              return (
                <button
                  key={insurer.id}
                  onClick={() => toggleInsurer(insurer.id)}
                  className="p-3 rounded-lg border-2 transition-all text-center"
                  style={{
                    borderColor: isSelected ? colors.hex : "hsl(var(--border))",
                    backgroundColor: isSelected ? bgColor : "transparent",
                  }}
                >
                  <div className="font-medium text-sm" style={{ color: isSelected ? colors.hex : "inherit" }}>
                    {insurer.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{insurer.nameEn}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 内容区 */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* 疾病列表 */}
          <Tabs defaultValue="tier1" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
              {DISEASE_GROUPS.map((group) => (
                <TabsTrigger key={group.id} value={group.id} className="text-sm">
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {DISEASE_GROUPS.map((group) => (
              <TabsContent key={group.id} value={group.id} className="space-y-6">
                {/* 分组说明 */}
                <Card className={`border-primary/30 bg-primary/5`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-5 w-5 ${group.color}`} />
                      <div>
                        <h3 className={`font-semibold ${group.color}`}>{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 疾病卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.diseases.map((disease) => (
                    <DiseaseCard
                      key={disease.id}
                      disease={disease}
                      isSelected={selectedDiseaseId === disease.id}
                      onSelect={() => setSelectedDiseaseId(disease.id)}
                      showComparison={selectedDiseaseId === disease.id}
                      selectedInsurers={selectedInsurers}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* 详细对比提示 */}
          {selectedDisease && selectedInsurers.length >= 2 && (
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">对比说明</h3>
                  <p className="text-sm text-muted-foreground">
                    以上对比基于各保司公开的产品条款和手册。实际理赔时，保险公司会根据具体病历和检查报告进行判定。
                    建议在投保前咨询专业顾问，了解最新条款细节。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">常见问题</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2">什么是「原位癌」？</h3>
                <p className="text-muted-foreground text-sm">
                  原位癌是指癌细胞仅出现在上皮层内，未突破基底膜侵犯周围组织的早期癌症。
                  各保司均将原位癌排除在「严重癌症」之外，作为「早期重疾」进行赔付，通常保额的20-40%。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2">为什么香港保单的中风定义比内地宽松？</h3>
                <p className="text-muted-foreground text-sm">
                  香港保司通常要求神经功能障碍持续28天，而内地2020年新规要求180天。
                  这是两地监管差异，香港产品的理赔门槛相对更低。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2">肌钙蛋白是什么？为什么重要？</h3>
                <p className="text-muted-foreground text-sm">
                  肌钙蛋白（Troponin）是心肌损伤的特异性指标。心脏病发作的诊断中，
                  肌钙蛋白数值是关键判定标准。安盛对Troponin T的要求最低（{'>'}0.2 ng/ml），
                  意味着在相同情况下更容易达到理赔标准。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-medium mb-2">如何选择重疾险产品？</h3>
                <p className="text-muted-foreground text-sm">
                  建议从以下几个维度考虑：
                  1）核心疾病定义（特别是癌症、心脏病、中风）；
                  2）多重赔偿机制（癌症、心脏病、中风复发是否继续赔付）；
                  3）保费性价比；
                  4）保司理赔服务和口碑。
                  最好的产品是「适合自己的」，建议咨询专业顾问进行个性化方案设计。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">需要专业建议？</h2>
          <p className="text-muted-foreground">
            重疾险条款复杂，每个人的情况不同。
            专业顾问可以为你分析需求，推荐最合适的产品组合。
          </p>
          <Button size="lg" className="px-8">
            预约免费咨询
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* 免责声明 */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            * 本工具提供的条款对比仅供参考，基于公开的产品条款和手册整理。
            实际投保时，请以保险公司的最新条款和核保结果为准。
            不同产品的具体保障范围可能存在差异，详细请参阅正式保单文件。
          </p>
        </div>
      </footer>
    </div>
  );
}
