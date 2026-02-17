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

// =============================================================================
// 疾病分类（基于理赔数据的七大类别）
// =============================================================================

export const DISEASE_CATEGORIES = [
  {
    id: "malignant",
    name: "恶性肿瘤（含原位癌）",
    nameEn: "Malignant Tumours",
    description: "占所有重疾理赔60%-80%，最高发类别",
    color: "text-red-500",
    order: 1,
  },
  {
    id: "cardiovascular",
    name: "心脏及心脑血管疾病",
    nameEn: "Cardiovascular & Cerebrovascular",
    description: "三大高发重疾之一，心脑血管疾病",
    color: "text-orange-500",
    order: 2,
  },
  {
    id: "organ-failure",
    name: "器官功能衰竭与移植",
    nameEn: "Organ Failure & Transplant",
    description: "肾衰竭、肝衰竭、器官移植",
    color: "text-green-500",
    order: 3,
  },
  {
    id: "neurological",
    name: "神经系统与退行性疾病",
    nameEn: "Neurological & Degenerative",
    description: "脑肿瘤、阿尔茨海默、帕金森等",
    color: "text-purple-500",
    order: 4,
  },
  {
    id: "other",
    name: "其他严重疾病",
    nameEn: "Other Critical Illnesses",
    description: "失明、失聪、瘫痪、烧伤等",
    color: "text-blue-500",
    order: 5,
  },
] as const;

export type DiseaseCategoryId = typeof DISEASE_CATEGORIES[number]["id"];

// =============================================================================
// 高发重疾列表（按新分类重新组织）
// =============================================================================

export const HIGH_INCIDENCE_DISEASES = [
  // 第一类：恶性肿瘤（含原位癌）
  {
    id: "cancer",
    name: "癌症/恶性肿瘤",
    nameEn: "Cancer / Malignant Tumour",
    categoryId: "malignant" as DiseaseCategoryId,
    tier: 1,
    description: "恶性细胞不受控制地生长、扩散并侵入破坏正常组织。包括白血病、淋巴瘤和肉瘤。",
    keyConditions: "必须经病理学检查确诊。一般不包括原位癌及部分早期的前列腺癌、甲状腺癌。",
    claimsShare: "占所有重疾理赔的60%-80%",
    // 详细理赔标准
    severeCriteria: "经病理组织学检查确诊为恶性侵略性癌症，癌细胞已突破基底膜侵入周围组织。白血病、淋巴瘤、肉瘤直接确诊。\n\n【TNM分期简释】\n• T（肿瘤）：原发肿瘤大小/浸润深度，T1小，T4大\n• N（淋巴结）：N0表示无淋巴结转移\n• M（转移）：M0表示无远处转移\n\n【早期癌症排除】以下作为早期/轻症赔付：\n• 甲状腺癌T1N0M0（直径≤2cm，无转移）\n• 前列腺癌T1a/T1b期\n• 注意：安盛对前列腺癌要求更严，T2N0M0且Gleason<7也归入非严重",
    earlyCriteria: "部分早期癌症作为轻症赔付：T1N0M0甲状腺癌（直径≤2cm无转移）、T1a/T1b前列腺癌。具体赔付比例因保司而异。",
    mainlandStandard: "恶性肿瘤——重度（100%赔付）；TNM I期甲状腺癌、前列腺癌归入轻度（30%）",
    hongKongStandard: "严重癌症（100%赔付）；T1N0M0甲状腺癌、T1a/T1b前列腺癌为早期危疾（20-30%）",
  },
  {
    id: "carcinoma-in-situ",
    name: "原位癌",
    nameEn: "Carcinoma In Situ",
    categoryId: "malignant" as DiseaseCategoryId,
    tier: 0,
    description: "癌细胞仅出现在上皮层内，未突破基底膜侵犯周围组织的早期癌症。",
    keyConditions: "需经病理学检查确诊原位癌。各保司均将其排除在严重癌症之外，作为早期/轻症赔付。",
    claimsShare: "高发早期癌症",
    // 详细理赔标准 - 原位癌属于早期/轻症，不适用重症标准
    severeCriteria: undefined, // 原位癌不属于重症
    earlyCriteria: "【定义】癌细胞未穿透基底膜，局限在上皮层内。必须经组织病理活检确诊，临床诊断通常不受理。\n\n【常见受保器官】乳房、子宫颈（CIN III级）、结肠/直肠、肺、肝、胃食道、胰腺、鼻咽、膀胱（Ta期）、卵巢输卵管、睾丸阴茎。\n\n【各器官要点】\n• 乳房：需癌细胞未穿透基底膜，全乳切除可获更高赔付\n• 子宫颈：必须达到CIN III级（原位癌），CIN I/II不赔\n• 膀胱：通常包含Ta期乳头状癌\n• 前列腺：需达PIN III级\n• 甲状腺：T1N0M0期作为早期癌症赔付\n\n【排除项目】皮肤原位癌（包括原位黑色素瘤）一律不赔，因治愈率高影响小",
    mainlandStandard: "恶性肿瘤——轻度，赔付30%保额，上限10万",
    hongKongStandard: "早期危疾，赔付20-30%保额，不同器官可赔2次（万通30%最高）",
  },

  // 第二类：心脏及心脑血管疾病
  {
    id: "heart-attack",
    name: "心脏病发作/较重急性心肌梗死",
    nameEn: "Heart Attack / Acute Myocardial Infarction",
    categoryId: "cardiovascular" as DiseaseCategoryId,
    tier: 1,
    description: "因血液供应不足导致部分心肌坏死。",
    keyConditions: "通常需要满足典型胸痛病史、心电图改变、心肌酶或肌钙蛋白升高中的若干项。",
    claimsShare: "三大高发重疾之一",
    // 详细理赔标准
    severeCriteria: "满足以下至少3项：(1)典型胸痛病史；(2)心电图特定改变；(3)肌钙蛋白Troponin升高（香港通常>0.5ng/ml，安盛最低>0.2ng/ml）；(4)心肌酶CK-MB升高。",
    earlyCriteria: "不适用",
    mainlandStandard: "较重急性心肌梗死：肌钙蛋白≥15倍医院参考值上限",
    hongKongStandard: "心脏病发作：Troponin I>0.5ng/ml或T>0.2-1.0ng/ml，安盛最宽松",
  },
  {
    id: "stroke",
    name: "中风/严重脑中风后遗症",
    nameEn: "Stroke / Severe Stroke Sequelae",
    categoryId: "cardiovascular" as DiseaseCategoryId,
    tier: 1,
    description: "因脑血管出血、栓塞或梗塞导致的脑组织坏死。",
    keyConditions: "必须导致永久性的神经功能障碍，持续时间通常要求至少4周（香港）或180天（内地）。",
    claimsShare: "三大高发重疾之一",
    // 详细理赔标准
    severeCriteria: "(1)影像学证实（CT/MRI）；(2)永久性神经功能障碍（如肢体无力、语言障碍、吞咽困难等）；(3)持续时间：香港28天，内地180天。",
    earlyCriteria: "轻度脑中风：确诊但未遗留严重残疾，部分保司列为早期危疾",
    mainlandStandard: "确诊180天后仍遗留障碍之一",
    hongKongStandard: "确诊后持续至少4周（28天）即可赔付",
  },
  {
    id: "cabg",
    name: "冠状动脉搭桥手术",
    nameEn: "Coronary Artery Bypass Surgery",
    categoryId: "cardiovascular" as DiseaseCategoryId,
    tier: 2,
    description: "为治疗严重的冠心病而进行的开胸手术。",
    keyConditions: "必须实际实施了开胸手术以进行血管旁路移植。血管成形术（通波仔）通常属于早期/轻症。",
    claimsShare: "前六大重疾之一",
    // 详细理赔标准
    severeCriteria: "必须实际实施开胸手术（Open Chest），切开心包进行血管旁路移植，使用大隐静脉或内乳动脉进行搭桥。",
    earlyCriteria: "微创搭桥（小切口、锁孔手术）、冠状动脉血管成形术/支架植入（通波仔）属于早期/轻症，赔付20-30%。",
    mainlandStandard: "必须切开心包进行血管旁路移植，微创手术不赔重度",
    hongKongStandard: "开胸为严重，微创/锁孔为早期危疾",
  },
  {
    id: "heart-valve",
    name: "心脏瓣膜手术",
    nameEn: "Heart Valve Surgery",
    categoryId: "cardiovascular" as DiseaseCategoryId,
    tier: 3,
    description: "为治疗心脏瓣膜疾病而进行的开胸手术。",
    keyConditions: "必须实际实施开胸手术进行瓣膜修复或置换。",
    claimsShare: "心脏结构性疾病",
    // 详细理赔标准
    severeCriteria: "必须实施开胸手术（Open Heart）进行心脏瓣膜置换或修复。",
    earlyCriteria: "经皮/导管介入手术（如TAVI经导管主动脉瓣置换术）属于早期/非严重危疾，赔付20-30%。",
    mainlandStandard: "必须切开心脏进行瓣膜置换，介入手术不赔重度",
    hongKongStandard: "开胸为严重，介入手术列为早期",
  },
  {
    id: "aorta-surgery",
    name: "主动脉手术",
    nameEn: "Aorta Surgery",
    categoryId: "cardiovascular" as DiseaseCategoryId,
    tier: 3,
    description: "为治疗主动脉疾病而进行的开胸或开腹手术。",
    keyConditions: "需实际实施主动脉切除、血管置换或支架植入手术。",
    claimsShare: "血管性疾病",
    // 详细理赔标准
    severeCriteria: "必须实施开胸或开腹手术，切除、置换或修补病损的主动脉（胸主动脉或腹主动脉）。",
    earlyCriteria: "血管介入治疗（EVAR血管内动脉瘤修复术）属于早期危疾，赔付20-30%。",
    mainlandStandard: "开胸或开腹手术，介入治疗不赔重度",
    hongKongStandard: "开胸/开腹为严重，血管介入为早期危疾",
  },

  // 第三类：器官功能衰竭与移植
  {
    id: "kidney-failure",
    name: "肾衰竭/终末期肾病",
    nameEn: "Kidney Failure / End Stage Renal Disease",
    categoryId: "organ-failure" as DiseaseCategoryId,
    tier: 2,
    description: "慢性不可逆的双肾功能衰竭。",
    keyConditions: "必须已经进行了规律性的透析治疗或已接受肾脏移植手术，且持续至少90天。",
    claimsShare: "前六大重疾之一",
    // 详细理赔标准
    severeCriteria: "双肾功能慢性不可逆衰竭，已进行规律性透析治疗≥90天，或已接受肾脏移植手术。",
    earlyCriteria: "万通早期危疾：GFR<30ml/min/1.73m²且持续90天，可赔30%。",
    mainlandStandard: "CKD 5期，规律透析90天或移植",
    hongKongStandard: "需长期透析或移植，万通有早期保障",
  },
  {
    id: "organ-transplant",
    name: "重大器官移植术",
    nameEn: "Major Organ Transplantation",
    categoryId: "organ-failure" as DiseaseCategoryId,
    tier: 2,
    description: "因相应器官功能衰竭，实际接受了异体器官移植。",
    keyConditions: "受保器官包括心脏、肺、肝、肾、胰腺，也包括造血干细胞（骨髓）移植。",
    claimsShare: "前六大重疾之一",
    // 详细理赔标准
    severeCriteria: "已实际接受异体器官移植手术：心脏、肺、肝、肾、胰腺或造血干细胞（骨髓）移植。",
    earlyCriteria: "安盛对器官移植轮候名单上的受保人提供早期赔付（20-30%），无需等到手术实施。",
    mainlandStandard: "心、肺、肝、肾、小肠、造血干细胞移植（内地包含小肠）",
    hongKongStandard: "心、肺、肝、肾、胰腺、骨髓移植",
  },
  {
    id: "liver-failure",
    name: "肝衰竭",
    nameEn: "Liver Failure",
    categoryId: "organ-failure" as DiseaseCategoryId,
    tier: 3,
    description: "慢性不可逆的肝脏功能衰竭。",
    keyConditions: "需满足持续性肝功能衰竭症状，如黄疸、腹水、肝性脑病等。",
    claimsShare: "器官衰竭类",
    // 详细理赔标准
    severeCriteria: "由专科医生确诊，满足以下4项中的至少3项：(1)持续性黄疸；(2)腹水；(3)肝性脑病；(4)充血性脾肿大或食道胃底静脉曲张。",
    earlyCriteria: "不适用",
    mainlandStandard: "严重慢性肝衰竭：满足黄疸、腹水、肝性脑病、充血性脾肿大/静脉曲张",
    hongKongStandard: "安盛只需满足2项即可（最宽松），其他保司要求3项",
  },
  {
    id: "respiratory-failure",
    name: "呼吸衰竭",
    nameEn: "Respiratory Failure",
    categoryId: "organ-failure" as DiseaseCategoryId,
    tier: 3,
    description: "慢性不可逆的呼吸功能衰竭。",
    keyConditions: "需持续依赖呼吸机或长期氧疗。",
    claimsShare: "器官衰竭类",
    // 详细理赔标准
    severeCriteria: "慢性肺病导致呼吸功能永久衰竭，需满足：(1)FEV1持续<1公升（或<预计值30%）；(2)永久氧气治疗；(3)内地要求PaO2<50mmHg。",
    earlyCriteria: "部分保单放宽至FEV1<1.2公升",
    mainlandStandard: "PaO2<50mmHg，FEV1<30%预计值",
    hongKongStandard: "FEV1<1公升，安盛放宽至<1.2公升",
  },

  // 第四类：神经系统与退行性疾病
  {
    id: "brain-tumor",
    name: "良性脑肿瘤",
    nameEn: "Benign Brain Tumour",
    categoryId: "neurological" as DiseaseCategoryId,
    tier: 3,
    description: "脑部或颅脑膜内的非癌性肿瘤。",
    keyConditions: "必须引起颅内压增高症状，通常需要手术切除或导致永久性神经系统损害。",
    claimsShare: "神经系统疾病高发",
    // 详细理赔标准
    severeCriteria: "满足以下任一条件：(1)实际实施开颅手术切除肿瘤；(2)无法手术者，肿瘤导致永久性神经功能受损（如视力丧失、听力丧失、癫痫、颅内压增高等）。",
    earlyCriteria: "不适用",
    mainlandStandard: "需开颅手术或放射治疗，或导致神经系统功能损害，无明确时间要求",
    hongKongStandard: "需手术切除或永久性神经功能受损，持续时间：永明6个月，安盛90天",
  },
  {
    id: "alzheimers",
    name: "阿尔茨海默病/脑退化症",
    nameEn: "Alzheimer's Disease / Severe Dementia",
    categoryId: "neurological" as DiseaseCategoryId,
    tier: 3,
    description: "因大脑进行性不可逆改变导致的智能严重衰退。",
    keyConditions: "表现为严重的认知能力障碍，日常生活必须持续受到他人监护，部分保司要求MMSE<10分。",
    claimsShare: "老年退化性疾病",
    // 详细理赔标准
    severeCriteria: "满足以下任一条件即可获赔100%：\n\n【ADL评估】日常生活6项中无法完成3项或以上，需要持续他人监护：\n1. 穿衣：自己穿衣及脱衣（解开/扣上钮扣）\n2. 移动：从床移动到椅子/轮椅\n3. 行动：平地步行到另一个房间\n4. 如厕：控制大小便，使用洗手间\n5. 进食：将已准备好的食物送入口中\n6. 洗澡：淋浴/盆浴及清洁身体\n\n【MMSE评分】满分30分，严重要求<10分\n【CDR评分】内地要求CDR=3分（重度痴呆）",
    earlyCriteria: "早期脑退化：MMSE≤19-20分（宏利、友邦提供），赔付20-30%。",
    mainlandStandard: "3/6项ADL无法完成或CDR评分3分",
    hongKongStandard: "安盛/万通要求MMSE<10分；友邦/宏利/保诚侧重临床状态（需持续护理）",
  },
  {
    id: "parkinsons",
    name: "柏金逊病",
    nameEn: "Parkinson's Disease",
    categoryId: "neurological" as DiseaseCategoryId,
    tier: 3,
    description: "中枢神经系统退化性疾病，病因不明。",
    keyConditions: "必须无法通过药物控制，且导致日常生活活动无法自理（通常需无法完成3项以上ADLs）。",
    claimsShare: "老年退化性疾病",
    // 详细理赔标准
    severeCriteria: "必须同时满足以下条件：\n1. 无法通过药物控制症状\n2. 出现渐进性退化\n3. ADL评估：6项中无法完成3项或以上（穿衣、移动、行动、如厕、进食、洗澡）\n\n【ADL 6项】\n1. 穿衣、2. 移动、3. 行动、4. 如厕、5. 进食、6. 洗澡",
    earlyCriteria: "安盛/万通/宏利/友邦提供中度保障：只需无法完成2项ADL即可获赔20-50%。",
    mainlandStandard: "无法药物控制且3/6项ADL无法完成",
    hongKongStandard: "无法完成3项ADL；安盛中度仅需2项（最宽松）",
  },
  {
    id: "ms",
    name: "多发性硬化症",
    nameEn: "Multiple Sclerosis",
    categoryId: "neurological" as DiseaseCategoryId,
    tier: 4,
    description: "中枢神经系统白质脱髓鞘的疾病。",
    keyConditions: "必须有明确的神经系统功能缺损，且通常要求有多次发作记录或影像学证实。",
    claimsShare: "相对罕见",
    // 详细理赔标准
    severeCriteria: "需经影像学（MRI）证实脱髓鞘病变，并有明确的神经系统功能缺损。需提供多次发作记录或持续性神经功能受损的医学证据。",
    earlyCriteria: "不适用",
    mainlandStandard: "需有神经系统功能损害（具体定义较严格）",
    hongKongStandard: "安盛要求神经受损持续180天；永明要求持续6个月；友邦要求详细病历证实病情恶化及缓解",
  },

  // 第五类：其他严重疾病
  {
    id: "blindness",
    name: "失明",
    nameEn: "Blindness",
    categoryId: "other" as DiseaseCategoryId,
    tier: 4,
    description: "双眼视力永久不可逆性丧失。",
    keyConditions: "即使矫正后视力仍低于特定标准（如2/60）或视野半径极度缩小。",
    claimsShare: "常见重疾",
    // 详细理赔标准
    severeCriteria: "双眼视力永久不可逆性丧失，满足以下任一条件：(1)较好眼矫正视力<0.02（约1.2/60）；(2)视野半径<5度。",
    earlyCriteria: "单眼失明通常作为早期危疾赔付。",
    mainlandStandard: "矫正视力<0.02或视野<5度",
    hongKongStandard: "友邦/宏利/保诚：<2/60或视野<5度；安盛：<3/60或视野<20度（最宽松）",
  },
  {
    id: "deafness",
    name: "失聪",
    nameEn: "Deafness",
    categoryId: "other" as DiseaseCategoryId,
    tier: 4,
    description: "双耳听力永久不可逆性丧失。",
    keyConditions: "平均听力损失大于80分贝，或双耳全聋。",
    claimsShare: "相对罕见",
    // 详细理赔标准
    severeCriteria: "双耳听力永久不可逆性丧失，平均听阈>80分贝（香港）或>90分贝（内地）。",
    earlyCriteria: "单耳失聪：部分保单（如万通、宏利）作为早期危疾赔付，要求单耳损失>80分贝。",
    mainlandStandard: "双耳听阈>90分贝",
    hongKongStandard: "双耳听力损失最少80分贝（比内地宽松10分贝，更易获赔）",
  },
  {
    id: "paralysis",
    name: "瘫痪",
    nameEn: "Paralysis",
    categoryId: "other" as DiseaseCategoryId,
    tier: 4,
    description: "因疾病或意外导致四肢永久性完全瘫痪。",
    keyConditions: "必须导致两肢或以上永久性完全失去功能。",
    claimsShare: "意外相关",
    // 详细理赔标准
    severeCriteria: "两肢或以上永久性完全丧失运动功能。肌力2级定义：肌肉在不受重力影响下可运动，但不能抵抗重力（即无法抬举肢体）。",
    earlyCriteria: "不适用",
    mainlandStandard: "两肢或以上，肌力≤2级，持续180天",
    hongKongStandard: "两肢或以上，完全丧失功能：安盛90天（最快），万通/永明6个月",
  },
  {
    id: "burns",
    name: "严重烧伤",
    nameEn: "Major Burns",
    categoryId: "other" as DiseaseCategoryId,
    tier: 4,
    description: "皮肤受到大面积的三度烧伤。",
    keyConditions: "烧伤面积通常要求达到全身体表面积的20%或以上。",
    claimsShare: "意外相关",
    // 详细理赔标准
    severeCriteria: "三度烧伤（全层皮肤坏死），烧伤面积达到全身体表面积的20%或以上。采用\"九分法\"或Lund and Browder图表计算。",
    earlyCriteria: "面部三度烧伤：香港保司单独列为早期危疾，安盛面部30%可赔20%，万通面部50%可赔20%。",
    mainlandStandard: "III度烧伤，面积≥20%体表面积",
    hongKongStandard: "III度烧伤，面积≥20%；面部烧伤有额外早期保障（安盛、万通、友邦）",
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
    mainland: "≥15倍医院参考值上限（以报告为准）",
    aia: "> 0.5 ng/ml",
    prudential: "> 0.5 ng/ml",
    manulife: "> 0.5 ng/ml",
    axa: "> 500 ng/L (即0.5 ng/ml)",
    yf: "> 0.5 ng/ml",
    sunlife: "> 0.5 ng/ml",
  },
  troponinT: {
    mainland: "≥15倍医院参考值上限（以报告为准）",
    aia: "> 1.0 ng/ml",
    manulife: "> 0.6 ng/ml (中等偏宽)",
    prudential: "> 0.6 ng/ml",
    axa: "> 200 ng/L (即0.2 ng/ml，最宽松)",
    yf: "> 1.0 ng/ml",
    sunlife: "> 1.0 ng/ml",
  },
  notes: "内地2020新规要求≥15倍医院参考值上限才能赔100%，不同医院检测设备参考值不同。香港通常只需>0.2-1.0 ng/ml即可，安盛最宽松。",
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
  mainland: "无法药物控制，且3/6项ADL无法完成",
  aia: "需持续受到监护，未硬性规定分数",
  prudential: "无法完成3项ADL",
  manulife: "无法完成3项ADL",
  axa: "中度严重（非严重）仅要求无法完成2项ADL",
  yf: "无法完成3项ADL",
  sunlife: "无法完成3项ADL",
  notes: "安盛的中度柏金逊定义最宽松，非严重即可获赔20%",
};

/**
 * 冠状动脉搭桥手术定义差异
 */
export const CABG_DEFINITION_DIFFERENCES = {
  common: "严重危疾通常要求开胸手术",
  mainland: "必须切开心包（开胸）进行血管旁路移植，微创不赔重度",
  aia: "开胸为严重，微创/锁孔为早期危疾（20-30%）",
  prudential: "开胸为严重，微创为早期",
  manulife: "开胸为严重，微创为早期",
  axa: "开胸为严重，微创/锁孔为非严重（20-30%）",
  yf: "开胸为严重，微创为早期",
  sunlife: "开胸为严重，微创为早期",
  notes: "香港保司普遍将微创手术列为早期/轻症，保障更全面",
};

/**
 * 心脏瓣膜手术定义差异
 */
export const HEART_VALVE_DEFINITION_DIFFERENCES = {
  common: "严重危疾要求剖开心脏进行置换或修复",
  mainland: "必须切开心脏进行置换或修复，介入手术不赔重度",
  aia: "开胸为严重，非开胸为早期",
  prudential: "开胸为严重",
  manulife: "开胸为严重，非开胸为早期",
  axa: "经皮穿刺（非开胸）列为早期/非严重",
  yf: "经皮穿刺为早期危疾",
  sunlife: "开胸为严重",
  notes: "安盛、万通对介入手术定义更宽松",
};

/**
 * 主动脉手术定义差异
 */
export const AORTA_SURGERY_DEFINITION_DIFFERENCES = {
  common: "严重危疾要求开胸或开腹手术",
  mainland: "开胸或开腹切除、置换或修复，介入治疗不赔重度",
  aia: "开胸/开腹为严重，血管介入为早期",
  prudential: "开胸/开腹为严重",
  manulife: "开胸/开腹为严重，介入为早期",
  axa: "血管介入治疗列为早期危疾",
  yf: "血管介入治疗列为早期",
  sunlife: "开胸/开腹为严重",
  notes: "香港保司普遍将血管介入列为早期/轻症",
};

/**
 * 肾衰竭定义差异
 */
export const KIDNEY_FAILURE_DEFINITION_DIFFERENCES = {
  common: "慢性不可逆，规律透析90天或移植",
  mainland: "CKD 5期，规律透析90天或移植",
  aia: "需长期透析或移植",
  prudential: "需长期透析或移植",
  manulife: "需长期透析或移植",
  axa: "需长期透析或移植",
  yf: "严重：透析或移植；早期：GFR<30持续90天（30%赔付）",
  sunlife: "需长期透析或移植",
  notes: "万通提供早期肾衰竭保障，GFR<30可赔30%",
};

/**
 * 重大器官移植定义差异
 */
export const ORGAN_TRANSPLANT_DEFINITION_DIFFERENCES = {
  common: "心、肺、肝、肾、胰腺移植或造血干细胞移植",
  mainland: "心、肺、肝、肾、小肠、造血干细胞移植",
  aia: "心、肺、肝、肾、胰腺、骨髓移植",
  prudential: "心、肺、肝、肾、胰腺、骨髓移植",
  manulife: "心、肺、肝、肾、胰腺、骨髓移植",
  axa: "心、肺、肝、肾、胰腺、骨髓移植，轮候名单可获早期赔付",
  yf: "心、肺、肝、肾、胰腺、骨髓移植",
  sunlife: "心、肺、肝、肾、胰腺、骨髓移植",
  notes: "内地含小肠移植；安盛对轮候名单提供保障",
};

/**
 * 肝衰竭定义差异
 */
export const LIVER_FAILURE_DEFINITION_DIFFERENCES = {
  common: "需满足黄疸、腹水、肝性脑病等症状",
  mainland: "严重慢性肝衰竭：黄疸、腹水、肝性脑病、充血性脾肿大/静脉曲张",
  aia: "需黄疸、腹水、肝性脑病全部3项",
  prudential: "需满足严重慢性肝衰竭条件",
  manulife: "需黄疸、腹水、肝性脑病全部3项",
  axa: "只需满足黄疸、腹水、脑病、静脉曲张中2项（最宽松）",
  yf: "需黄疸、腹水、肝性脑病全部3项",
  sunlife: "需黄疸、腹水、肝性脑病全部3项",
  notes: "安盛定义最宽松，只需满足2项症状即可",
};

/**
 * 呼吸衰竭定义差异
 */
export const RESPIRATORY_FAILURE_DEFINITION_DIFFERENCES = {
  common: "永久不可逆，需长期氧气治疗",
  mainland: "永久不可逆，静息呼吸困难，PaO2<50mmHg，FEV1<30%",
  aia: "永久氧气治疗，FEV1<1公升",
  prudential: "永久氧气治疗",
  manulife: "永久氧气治疗，FEV1<1公升",
  axa: "FEV1<1.2公升（门槛略低）",
  yf: "永久氧气治疗，FEV1<1公升",
  sunlife: "永久氧气治疗，FEV1<1公升",
  notes: "安盛的FEV1<1.2公升相对宽松",
};

/**
 * 良性脑肿瘤定义差异
 */
export const BRAIN_TUMOR_DEFINITION_DIFFERENCES = {
  common: "需开颅手术或导致永久性神经功能受损",
  mainland: "需开颅手术或放射治疗，或导致神经系统功能损害",
  aia: "需手术切除或永久性神经功能受损",
  prudential: "需手术切除或永久性神经功能受损",
  manulife: "需手术切除或永久性神经功能受损",
  axa: "需手术切除或永久性神经功能受损，持续90天",
  yf: "需手术切除或永久性神经功能受损",
  sunlife: "需手术切除或永久性神经功能受损，持续6个月",
  notes: "香港要求受损持续时间（90天-6个月），内地无明确要求",
};

/**
 * 失明定义差异
 */
export const BLINDNESS_DEFINITION_DIFFERENCES = {
  common: "双眼视力永久不可逆性丧失",
  mainland: "矫正视力<0.02（约1.2/60）或视野<5度",
  aia: "矫正视力<2/60或视野<5度",
  prudential: "矫正视力<2/60或视野<5度",
  manulife: "矫正视力<2/60或视野<5度",
  axa: "矫正视力<3/60或视野<20度（最宽松）",
  yf: "矫正视力<2/60或视野<5度",
  sunlife: "矫正视力<2/60或视野<5度",
  notes: "安盛定义最宽松（<3/60），香港普遍比内地宽松",
};

/**
 * 失聪定义差异
 */
export const DEAFNESS_DEFINITION_DIFFERENCES = {
  common: "双耳听力永久不可逆性丧失",
  mainland: "双耳听阈>90分贝",
  aia: "双耳听阈>80分贝",
  prudential: "双耳听阈>80分贝",
  manulife: "双耳听阈>80分贝",
  axa: "双耳听阈>80分贝",
  yf: "双耳听阈>80分贝",
  sunlife: "双耳听阈>80分贝",
  notes: "香港标准（>80dB）比内地（>90dB）宽松10分贝",
};

/**
 * 瘫痪定义差异
 */
export const PARALYSIS_DEFINITION_DIFFERENCES = {
  common: "两肢或以上永久性完全丧失运动功能",
  mainland: "两肢或以上，肌力2级或以下，持续180天",
  aia: "两肢或以上，完全丧失功能",
  prudential: "两肢或以上，完全丧失功能",
  manulife: "两肢或以上，完全丧失功能",
  axa: "两肢或以上，完全丧失功能，持续90天（最快）",
  yf: "两肢或以上，完全丧失功能，持续6个月",
  sunlife: "两肢或以上，完全丧失功能，持续6个月",
  notes: "安盛要求90天即可获赔，比其他保司更快",
};

/**
 * 严重烧伤定义差异
 */
export const BURNS_DEFINITION_DIFFERENCES = {
  common: "III度烧伤，面积≥20%体表面积",
  mainland: "III度烧伤，面积≥20%",
  aia: "III度烧伤，面积≥20%，面部烧伤有额外早期保障",
  prudential: "III度烧伤，面积≥20%",
  manulife: "III度烧伤，面积≥20%",
  axa: "III度烧伤，面积≥20%，面部III度烧伤可赔20%",
  yf: "III度烧伤，面积≥20%，面部烧伤有额外保障",
  sunlife: "III度烧伤，面积≥20%",
  notes: "香港保司普遍有面部烧伤早期赔付保障",
};

/**
 * 多发性硬化症定义差异
 */
export const MS_DEFINITION_DIFFERENCES = {
  common: "需影像学证实脱髓鞘病变及神经功能受损",
  mainland: "需有神经系统功能损害",
  aia: "需详细病历证实病情恶化及缓解",
  prudential: "需神经功能受损",
  manulife: "需影像学证实及神经功能受损",
  axa: "神经受损持续180天",
  yf: "需影像学证实及神经功能受损",
  sunlife: "神经受损持续6个月",
  notes: "安盛和永明对受损持续时间有明确要求",
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
 * 获取疾病分类信息
 */
export function getCategory(id: DiseaseCategoryId) {
  return DISEASE_CATEGORIES.find((c) => c.id === id);
}

/**
 * 获取某分类下的所有疾病
 */
export function getDiseasesByCategory(categoryId: DiseaseCategoryId) {
  return HIGH_INCIDENCE_DISEASES.filter((d) => d.categoryId === categoryId);
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
