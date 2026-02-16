/**
 * 重疾条款对比数据
 * 数据来源：NotebookLM 重大疾病条款笔记 (ee3add6a-7c8e-4917-8b9d-3946738fa638)
 * 更新日期：2026-02-15
 */

// =============================================================================
// 保司列表
// =============================================================================

export const INSURERS = [
  { id: "mainland", name: "内地(2020新规)", nameEn: "Mainland China" },
  { id: "aia", name: "友邦", nameEn: "AIA" },
  { id: "prudential", name: "保诚", nameEn: "Prudential" },
  { id: "manulife", name: "宏利", nameEn: "Manulife" },
  { id: "axa", name: "安盛", nameEn: "AXA" },
  { id: "yf", name: "万通", nameEn: "YF Life" },
  { id: "sunlife", name: "永明", nameEn: "Sun Life" },
] as const;

export type InsurerId = typeof INSURERS[number]["id"];

// =============================================================================
// 高发重疾列表（12种）
// =============================================================================

export const HIGH_INCIDENCE_DISEASES = [
  {
    id: "cancer",
    name: "癌症/恶性肿瘤",
    nameEn: "Cancer / Malignant Tumour",
    tier: 1,
    description: "恶性细胞不受控制地生长、扩散并侵入破坏正常组织。包括白血病、淋巴瘤和肉瘤。",
    keyConditions: "必须经病理学检查确诊。一般不包括原位癌及部分早期的前列腺癌、甲状腺癌。",
    claimsShare: "占所有重疾理赔的60%-80%",
  },
  {
    id: "heart-attack",
    name: "心脏病发作/较重急性心肌梗死",
    nameEn: "Heart Attack / Acute Myocardial Infarction",
    tier: 1,
    description: "因血液供应不足导致部分心肌坏死。",
    keyConditions: "通常需要满足典型胸痛病史、心电图改变、心肌酶或肌钙蛋白升高中的若干项。",
    claimsShare: "三大高发重疾之一",
  },
  {
    id: "stroke",
    name: "中风/严重脑中风后遗症",
    nameEn: "Stroke / Severe Stroke Sequelae",
    tier: 1,
    description: "因脑血管出血、栓塞或梗塞导致的脑组织坏死。",
    keyConditions: "必须导致永久性的神经功能障碍，持续时间通常要求至少4周（香港）或180天（内地）。",
    claimsShare: "三大高发重疾之一",
  },
  {
    id: "kidney-failure",
    name: "肾衰竭/终末期肾病",
    nameEn: "Kidney Failure / End Stage Renal Disease",
    tier: 2,
    description: "慢性不可逆的双肾功能衰竭。",
    keyConditions: "必须已经进行了规律性的透析治疗或已接受肾脏移植手术，且持续至少90天。",
    claimsShare: "前六大重疾之一",
  },
  {
    id: "organ-transplant",
    name: "重大器官移植术",
    nameEn: "Major Organ Transplantation",
    tier: 2,
    description: "因相应器官功能衰竭，实际接受了异体器官移植。",
    keyConditions: "受保器官包括心脏、肺、肝、肾、胰腺，也包括造血干细胞（骨髓）移植。",
    claimsShare: "前六大重疾之一",
  },
  {
    id: "cabg",
    name: "冠状动脉搭桥手术",
    nameEn: "Coronary Artery Bypass Surgery",
    tier: 2,
    description: "为治疗严重的冠心病而进行的开胸手术。",
    keyConditions: "必须实际实施了开胸手术以进行血管旁路移植。血管成形术（通波仔）通常属于早期/轻症。",
    claimsShare: "前六大重疾之一",
  },
  {
    id: "brain-tumor",
    name: "良性脑肿瘤",
    nameEn: "Benign Brain Tumour",
    tier: 3,
    description: "脑部或颅脑膜内的非癌性肿瘤。",
    keyConditions: "必须引起颅内压增高症状，通常需要手术切除或导致永久性神经系统损害。",
    claimsShare: "神经系统疾病高发",
  },
  {
    id: "parkinsons",
    name: "柏金逊病",
    nameEn: "Parkinson's Disease",
    tier: 3,
    description: "中枢神经系统退化性疾病，病因不明。",
    keyConditions: "必须无法通过药物控制，且导致日常生活活动无法自理（通常需无法完成3项以上ADLs）。",
    claimsShare: "老年退化性疾病",
  },
  {
    id: "alzheimers",
    name: "阿尔茨海默病/脑退化症",
    nameEn: "Alzheimer's Disease / Severe Dementia",
    tier: 3,
    description: "因大脑进行性不可逆改变导致的智能严重衰退。",
    keyConditions: "表现为严重的认知能力障碍，日常生活必须持续受到他人监护，部分保司要求MMSE<10分。",
    claimsShare: "老年退化性疾病",
  },
  {
    id: "blindness",
    name: "失明",
    nameEn: "Blindness",
    tier: 4,
    description: "双眼视力永久不可逆性丧失。",
    keyConditions: "即使矫正后视力仍低于特定标准（如2/60）或视野半径极度缩小。",
    claimsShare: "常见重疾",
  },
  {
    id: "ms",
    name: "多发性硬化症",
    nameEn: "Multiple Sclerosis",
    tier: 4,
    description: "中枢神经系统白质脱髓鞘的疾病。",
    keyConditions: "必须有明确的神经系统功能缺损，且通常要求有多次发作记录或影像学证实。",
    claimsShare: "相对罕见",
  },
  {
    id: "burns",
    name: "严重烧伤",
    nameEn: "Major Burns",
    tier: 4,
    description: "皮肤受到大面积的三度烧伤。",
    keyConditions: "烧伤面积通常要求达到全身体表面积的20%或以上。",
    claimsShare: "意外相关",
  },
] as const;

// =============================================================================
// 各保司定义差异详细对比
// =============================================================================

/**
 * 癌症定义差异
 */
export const CANCER_DEFINITION_DIFFERENCES = {
  common: "所有保司均排除原位癌、T1N0M0甲状腺癌、T1a/T1b前列腺癌，将它们归类为早期重疾。内地新规将这些归为轻症。",
  insurerSpecific: {
    mainland: {
      prostate: "排除T1N0M0期前列腺癌（归入轻症，赔30%）",
      thyroid: "排除TNM I期甲状腺癌（归入轻症，赔30%）",
      carcinomaInSitu: "明确归为轻症，赔30%，上限10万",
    },
    aia: {
      prostate: "排除T1a/T1b前列腺癌",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "视为早期重疾，不同器官可赔2次",
    },
    prudential: {
      prostate: "排除T1a/T1b前列腺癌",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "视为早期/轻症疾病",
    },
    manulife: {
      prostate: "排除T1a/T1b前列腺癌（含T1c期，较宽松）",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "赔20%，最高4万港币，不同器官可赔2次",
    },
    axa: {
      prostate: "排除T2N0M0或以下且Gleason<7的前列腺癌（门槛更高）",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "视为非严重疾病，不同器官可赔2次",
    },
    yf: {
      prostate: "排除T1a/T1b前列腺癌",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "视为早期疾病，不同器官可赔2次",
    },
    sunlife: {
      prostate: "排除T1a/T1b前列腺癌",
      thyroid: "排除T1N0M0甲状腺癌",
      carcinomaInSitu: "视为早期重疾，不同器官可赔2次",
    },
  },
  notes: "安盛对严重前列腺癌的排除标准（T2N0M0且Gleason<7）比其他几家更严格。",
};

/**
 * 心脏病定义差异（肌钙蛋白要求）
 */
export const HEART_ATTACK_DEFINITION_DIFFERENCES = {
  common: "需符合典型胸痛、心电图改变、心肌酶升高中的若干项。",
  troponinI: {
    mainland: "> 正常值15倍",
    aia: "> 0.5 ng/ml",
    prudential: "> 0.5 ng/ml",
    manulife: "> 0.5 ng/ml",
    axa: "> 500 ng/L (即0.5 ng/ml)",
    yf: "> 0.5 ng/ml",
    sunlife: "> 0.5 ng/ml",
  },
  troponinT: {
    mainland: "> 正常值15倍（非常严格）",
    aia: "> 1.0 ng/ml",
    manulife: "> 0.6 ng/ml (中等偏宽)",
    prudential: "> 0.6 ng/ml",
    axa: "> 200 ng/L (即0.2 ng/ml，最宽松)",
    yf: "> 1.0 ng/ml",
    sunlife: "> 1.0 ng/ml",
  },
  notes: "内地2020新规要求肌钙蛋白升高15倍才能赔100%，香港通常只需>0.2-1.0 ng/ml即可。安盛最宽松。",
};

/**
 * 中风定义差异
 */
export const STROKE_DEFINITION_DIFFERENCES = {
  common: "需有永久性神经机能缺损及影像学证据。",
  durationRequirement: {
    mainland: "确诊180天后仍遗留下列障碍之一",
    aia: "确诊后持续至少4星期（28天）",
    prudential: "发病后至少4星期",
    manulife: "持续至少4星期（4 weeks）",
    axa: "发病后至少28天",
    yf: "持续4个星期或以上",
    sunlife: "持续最少28日",
  },
  notes: "香港要求4周（28天），内地要求180天。香港理赔更快，更早获得赔偿金进行康复治疗。",
};

/**
 * 脑退化症定义差异
 */
export const DEMENTIA_DEFINITION_DIFFERENCES = {
  mmseRequirement: {
    mainland: "需MMSE≤10分或无法完成3项ADL",
    aia: "需MMSE < 10分",
    prudential: "未在定义中硬性规定MMSE分数",
    manulife: "严重：需依赖他人照顾；早期：MMSE≤19分",
    axa: "明确要求MMSE < 10分",
    yf: "明确要求MMSE < 10分",
    sunlife: "MMSE < 10分或无法自理日常生活（替代判定）",
  },
  notes: "万通和永明在脑退化症上明确了量化标准（MMSE<10分），标准清晰减少争议。永明额外提供了'无法自理'作为替代判定标准，相对灵活。内地要求与香港类似。",
};

/**
 * ICU保障差异
 */
export const ICU_COVERAGE_DIFFERENCES = {
  aia: "两级保障：72小时（20%）、120小时+手术+维生支持（100%）",
  prudential: "未作为独立非重疾类别列出",
  manulife: "两级保障：连续3天（20%）、连续5天+手术+维生支持（100%）",
  axa: "特定保障：72小时（非严重，20%）、120小时+复杂手术+维生（严重，100%）",
  yf: "120小时+手术+维生支持（作为一种严重疾病赔付）",
  sunlife: "针对复杂手术提供保障，非纯ICU时长",
  notes: "宏利和友邦提供了分级的ICU保障，即使未确诊特定重疾，只要住进ICU达一定时长即可获赔，保障范围更广。",
};

/**
 * 柏金逊病定义差异
 */
export const PARKINSONS_DEFINITION_DIFFERENCES = {
  common: "需无法完成3项或以上日常生活活动（ADLs）",
  notes: "各家保司定义基本一致",
};

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 获取保司信息
 */
export function getInsurer(id: InsurerId) {
  return INSURERS.find((i) => i.id === id);
}

/**
 * 获取疾病信息
 */
export function getDisease(id: string) {
  return HIGH_INCIDENCE_DISEASES.find((d) => d.id === id);
}

/**
 * 获取癌症定义差异
 */
export function getCancerDifference(insurerId: InsurerId) {
  return CANCER_DEFINITION_DIFFERENCES.insurerSpecific[insurerId];
}

/**
 * 获取心脏病肌钙蛋白要求
 */
export function getHeartAttackTroponin(insurerId: InsurerId, type: "I" | "T") {
  if (type === "I") {
    return HEART_ATTACK_DEFINITION_DIFFERENCES.troponinI[insurerId];
  }
  return HEART_ATTACK_DEFINITION_DIFFERENCES.troponinT[insurerId];
}

/**
 * 获取中风持续时间要求
 */
export function getStrokeDuration(insurerId: InsurerId) {
  return STROKE_DEFINITION_DIFFERENCES.durationRequirement[insurerId];
}

/**
 * 比较两家保司在某项疾病上的宽松度
 */
export function compareInsurers(
  insurer1: InsurerId,
  insurer2: InsurerId,
  diseaseId: string
): {
  moreLenient: InsurerId | "similar";
  reason: string;
} {
  // 癌症：安盛前列腺癌标准更严格
  if (diseaseId === "cancer-prostate") {
    if (insurer1 === "axa" && insurer2 !== "axa") {
      return { moreLenient: insurer2, reason: "安盛对前列腺癌的排除标准（T2N0M0）比其他家更严格" };
    }
    if (insurer2 === "axa" && insurer1 !== "axa") {
      return { moreLenient: insurer1, reason: "安盛对前列腺癌的排除标准（T2N0M0）比其他家更严格" };
    }
  }

  // 心脏病：比较Troponin T要求
  if (diseaseId === "heart-attack") {
    const t1 = HEART_ATTACK_DEFINITION_DIFFERENCES.troponinT[insurer1];
    const t2 = HEART_ATTACK_DEFINITION_DIFFERENCES.troponinT[insurer2];
    if (t1 === "> 0.2 ng/ml" && t2 !== "> 0.2 ng/ml") {
      return { moreLenient: insurer1, reason: "安盛的Troponin T要求最低，理赔门槛更宽松" };
    }
    if (t2 === "> 0.2 ng/ml" && t1 !== "> 0.2 ng/ml") {
      return { moreLenient: insurer2, reason: "安盛的Troponin T要求最低，理赔门槛更宽松" };
    }
    if (t1 === "> 0.6 ng/ml" && t2 === "> 1.0 ng/ml") {
      return { moreLenient: insurer1, reason: "保诚的Troponin T要求比其他家较低" };
    }
    if (t2 === "> 0.6 ng/ml" && t1 === "> 1.0 ng/ml") {
      return { moreLenient: insurer2, reason: "保诚的Troponin T要求比其他家较低" };
    }
  }

  return { moreLenient: "similar", reason: "两家保司在此疾病上的定义基本一致" };
}

// =============================================================================
// 理赔数据（用于财富风险模拟器）
// =============================================================================

/**
 * 理赔年龄段分布
 */
export const CLAIMS_BY_AGE_GROUP = [
  {
    ageGroup: "0-18岁",
    riskProfile: "易感期",
    highIncidenceEvents: ["呼吸系统疾病住院", "意外受伤", "少儿特定重疾"],
  },
  {
    ageGroup: "19-30岁",
    riskProfile: "青年风险期",
    highIncidenceEvents: ["意外受伤", "甲状腺癌（女性）", "良性肿瘤切除"],
  },
  {
    ageGroup: "31-50岁",
    riskProfile: "家庭支柱承压期",
    highIncidenceEvents: ["女性乳癌", "妇科癌症", "心血管风险", "消化系统问题"],
  },
  {
    ageGroup: "51-65岁",
    riskProfile: "重疾高发期",
    highIncidenceEvents: ["癌症", "心脏病", "中风全面爆发"],
  },
  {
    ageGroup: "65岁以上",
    riskProfile: "长寿风险期",
    highIncidenceEvents: ["癌症身故", "肺炎", "心脏衰竭", "退行性疾病"],
  },
];

/**
 * 理赔疾病排名
 */
export const TOP_CLAIMS_DISEASES = {
  critical: [
    { rank: 1, disease: "癌症", share: "60%-80%", notes: "断层第一" },
    { rank: 2, disease: "心脏病", share: "三大高发重疾之一", notes: "男性高发" },
    { rank: 3, disease: "中风", share: "三大高发重疾之一", notes: "老年高发" },
  ],
  hospitalization: [
    { rank: 1, disease: "消化系统疾病", notes: "肠胃镜、息肉" },
    { rank: 2, disease: "呼吸系统疾病", notes: "肺炎、流感" },
    { rank: 3, disease: "肿瘤/癌症", notes: "住院治疗及化疗" },
    { rank: 4, disease: "损伤及后遗症", notes: "意外受伤、骨折" },
    { rank: 5, disease: "泌尿生殖系统", notes: "肾结石" },
  ],
  female: ["乳癌", "甲状腺癌", "肺癌", "大肠癌", "生殖系统癌症"],
  male: ["肺癌", "大肠癌", "甲状腺癌", "前列腺癌", "肝癌"],
};

/**
 * 关键理赔趋势
 */
export const CLAIMS_TRENDS = [
  {
    trend: "重疾年轻化",
    description: "重疾理赔的中位数年龄在40-50岁之间，对家庭财富积累期打击最大",
  },
  {
    trend: "癌症慢性病化",
    description: "癌症存活率提高，但也带来复发、转移或持续治疗的高昂费用",
  },
  {
    trend: "亚健康高检出率",
    description: "肺结节(53.6%)、甲状腺结节(47.7%)、脂肪肝(39.1%)检出率极高",
  },
  {
    trend: "医疗通胀",
    description: "医疗费用持续上升，标靶药、免疫治疗等昂贵疗法推高成本",
  },
  {
    trend: "性别差异",
    description: "30-50岁女性理赔率显著高于男性；50岁后男性身故率逐渐反超",
  },
];
