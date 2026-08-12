/* ============================================================
   Eastlink 合作供应商平台 · Demo V0.1
   Mock 数据 + 匹配打分引擎 + 需求包状态机 + 角色视角
   ============================================================ */

/* ---------------- 基础字典 ---------------- */

const SUP_STATUS = {
  active:      { label: "合作中",   tag: "active" },
  qualified:   { label: "已准入",   tag: "qualified" },
  onboarding:  { label: "准入中",   tag: "onboarding" },
  potential:   { label: "潜在",     tag: "potential" },
  suspended:   { label: "暂停",     tag: "suspended" },
  eliminated:  { label: "已淘汰",   tag: "eliminated" }
};

const RISK = {
  "低": { tag: "risk-low",  score: 100 },
  "中": { tag: "risk-mid",  score: 60 },
  "高": { tag: "risk-high", score: 25 }
};

const PKG_STATUS = {
  design:           { label: "设计中",       tag: "onboarding" },
  matching:         { label: "待选打样候选", tag: "st-matching" },
  shortlist_review: { label: "打样名单内审", tag: "st-internal" },
  sampling:         { label: "打样中",       tag: "st-internal" },
  final_internal:   { label: "定商建议内审", tag: "st-internal" },
  confirmed:        { label: "已确认合作",   tag: "st-confirmed" }
};

const SAMPLE_STATUS = {
  sampling:  { label: "打样中", tag: "st-internal" },
  delivered: { label: "已寄样", tag: "st-client" },
  reviewing: { label: "评审中", tag: "onboarding" },
  scored:    { label: "已评分", tag: "st-confirmed" }
};

const DESIGN_STATUS = {
  internal_review: { label: "内审中",     tag: "st-internal" },
  client_review:   { label: "待客户确认", tag: "st-client" },
  changes:         { label: "修改意见",   tag: "st-changes" },
  approved:        { label: "已定稿",     tag: "st-approved" }
};

const STAGES = [
  ["received", "Brief 接收"], ["structuring", "拆解中"], ["design", "设计中"],
  ["sampling", "匹配与打样"], ["decide", "比样定商"], ["confirmed", "已确认合作"]
];
const STAGE_LABEL = Object.fromEntries(STAGES);
const STAGE_TAG = {
  received: "potential", structuring: "onboarding", design: "qualified",
  sampling: "st-internal", decide: "st-client", confirmed: "st-confirmed"
};

const DIMS = [
  { key: "category",  name: "品类专精", w: 20 },
  { key: "cert",      name: "认证覆盖", w: 17 },
  { key: "quality",   name: "质量表现", w: 15 },
  { key: "delivery",  name: "交付可靠", w: 12 },
  { key: "price",     name: "价格竞争力", w: 12 },
  { key: "capacity",  name: "产能匹配", w: 9 },
  { key: "clientExp", name: "客户经验", w: 8 },
  { key: "risk",      name: "风险等级", w: 7 }
];

/* ---------------- Mock：客户 ---------------- */

const clients = [
  {
    id: "CLI-001", name: "HEMA", region: "荷兰 · 零售连锁", level: "战略客户",
    since: "2020", annual: "¥4,200 万", contact: "采购总监（客户方）",
    prefs: "FSC 强制 · REACH 全线 · 环保材料优先",
    habit: "逐需求包确认推荐名单 + 设计稿逐版确认",
    brand: {
      positioning: { "定位": "平价优质的荷兰国民生活品牌", "价值主张": "简洁、实用、亲和，反对过度设计", "消费者画像": "城市家庭日常场景，重性价比与设计感", "价格心智": "『便宜但不廉价』，偏好 €1/2/3 整数价位" },
      colors: ["#E30613", "#FFFFFF", "#1A1A1A"],
      visual: {
        logo: "红底白字，不可变形拉伸，最小尺寸 12mm",
        font: "无衬线字体体系，标题粗体、正文常规",
        graphic: "插画低饱和、几何化，留白充足",
        packaging: "包装大面留白，信息层级清晰",
        forbidden: ["Logo 不可变形 / 改色", "禁高饱和撞色", "禁大面积满印图案"]
      },
      matlib: {
        colors: [
          { name: "HEMA 红", pantone: "PMS 485C", hex: "#E30613", usage: "主色 · Logo 与包装主视觉", tol: "ΔE ≤ 1.5" },
          { name: "暖白", pantone: "PMS 9080C", hex: "#F7F3EE", usage: "底色 · 大面留白", tol: "ΔE ≤ 2.0" },
          { name: "墨黑", pantone: "Black 6C", hex: "#1A1A1A", usage: "正文与线稿", tol: "ΔE ≤ 2.0" },
          { name: "低饱和蓝", pantone: "PMS 2915C", hex: "#8FB8DE", usage: "点缀 · 品类识别（低饱和体系）", tol: "ΔE ≤ 2.5" }
        ],
        colorNote: "打样以 Pantone 纸版色卡为准；季节辅助色每年 2 月更新，高饱和撞色全线禁用。",
        materials: [
          { name: "FSC 认证纸板", spec: "内页 80–120g · 灰板 1.5mm", cats: ["文具"], cert: "FSC CoC", status: "已认可" },
          { name: "再生涤纶 600D", spec: "含 50% 再生纱（GRS）", cats: ["包袋"], cert: "GRS + REACH", status: "已认可" },
          { name: "Tritan 共聚酯", spec: "食品接触级 · 透明本色", cats: ["水具"], cert: "LFGB / EU 10/2011", status: "已认可" },
          { name: "PP 食品级", spec: "本色或低饱和色粉", cats: ["水具", "家居"], cert: "LFGB", status: "已认可" },
          { name: "竹纤维复合料", spec: "餐厨件 · 天然色", cats: ["家居"], cert: "LFGB + 迁移测试", status: "试用中" }
        ],
        forbidden: [
          { name: "PVC", why: "增塑剂风险，全品类禁用" },
          { name: "偶氮染料面料", why: "AZO 超标风险" },
          { name: "不可回收复合膜", why: "违背 2027 包装可回收目标" }
        ],
        sustainability: "2027 目标：纸类 100% FSC；塑料件再生含量 ≥30%；包装单一材质可回收。"
      },
      store: {
        display: "白色货架 + 红色促销带，按生活场景分区陈列",
        priceBands: [
          { cat: "文具", band: "€1.5 – 3.0" }, { cat: "包袋", band: "€4.0 – 8.0" },
          { cat: "水具", band: "€3.0 – 6.0" }, { cat: "家居", band: "€5.0 – 12.0" }
        ],
        rhythm: "每年 8 个上新档期，BTS 与圣诞为最大档"
      },
      history: {
        wins: [
          { t: "低饱和插画文具系列", why: "复购最好，连续三季返单" },
          { t: "莫兰迪色收纳系列", why: "客单价拉升 18%" }
        ],
        fails: [
          { t: "2025 秋冬高饱和撞色系列", why: "一轮否决——违背品牌低饱和审美" }
        ]
      },
      decision: [
        { step: "设计初审", role: "设计负责人", note: "视觉规范与禁用规则符合性" },
        { step: "产品终审", role: "总部 PD", note: "习惯两轮内定稿，超三轮需重开方向" },
        { step: "品质合规", role: "品质合规团队", note: "认证与测试标准核验" },
        { step: "定商知会", role: "采购总监", note: "接收 Eastlink 定商结果与比样依据备案（无需客户确认动作）" }
      ],
      briefTemplate: {
        fields: ["上市档期", "SKU 结构", "分品类价格带", "FSC / 环保要求", "低饱和视觉方向", "认证清单", "包装规范版本"],
        note: "HEMA Brief 建议按品类拆包，价格带用整数价位锚定。"
      },
      assets: [
        { name: "HEMA 品牌 VI 手册", ver: "V3.2", type: "规范", date: "2026-03" },
        { name: "2027 BTS 主视觉套件", ver: "V1", type: "视觉", date: "2026-07" },
        { name: "Logo 与图形素材包", ver: "V2", type: "素材", date: "2025-11" },
        { name: "包装与吊牌规范", ver: "V4", type: "规范", date: "2026-01" },
        { name: "历史爆款产品图库", ver: "—", type: "参考", date: "持续更新" }
      ]
    },
    compliance: {
      auditCerts: ["BSCI"],
      audit: { scheme: "amfori BSCI", grade: "C 级及以上（A/B 优先分配）", cycle: "证书有效期 2 年，到期前 90 天启动复审", transition: "新供应商可凭 SMETA 4P 报告过渡 6 个月，期间完成 BSCI" },
      social: "童工零容忍；周工时 ≤60h；消防与应急通道达标；未申报分包一经发现终止合作",
      tests: [
        { cat: "文具", std: "EN71-1/2/3 · REACH 附录 XVII · 邻苯二甲酸盐 · 甲醛" },
        { cat: "包袋", std: "REACH · AZO 偶氮 · 镍释放 · 六价铬（皮革件）" },
        { cat: "水具", std: "LFGB §30/31 · EU 10/2011 食品接触迁移 · 感官测试" },
        { cat: "家居", std: "REACH · 纺织阻燃 · FSC CoC（纸木类）" }
      ],
      docs: "TCF 按 SKU 建档；测试报告有效期 ≤2 年，食品接触与儿童品类 ≤1 年；报告出具方限 TÜV / SGS / Intertek",
      inspection: "AQL Ⅱ 级：Major 2.5 / Minor 4.0；首单必验 + 年度抽验，验货由 Eastlink QC 或指定第三方执行",
      env: "纸木制品 FSC 强制；2027 目标塑料再生料占比 ≥30%；包装去塑化路线图",
      redlines: ["无有效 BSCI 不可下单", "纸木品无 FSC 不可下单", "食品接触无 LFGB 不可出运"]
    },
  },
  {
    id: "CLI-002", name: "Tesco", region: "英国 · 商超", level: "核心客户",
    since: "2021", annual: "¥2,600 万", contact: "Category Manager（客户方）",
    prefs: "LFGB / FDA 食品接触 · 价格敏感",
    habit: "整单确认为主，重点包抽查",
    brand: {
      positioning: { "定位": "英国国民商超自有品牌", "价值主张": "性价比第一，功能诉求直白", "消费者画像": "大众家庭一站式采购", "价格心智": "对标品牌品便宜 20–30%，£X.00 / £X.50 定价" },
      colors: ["#00539F", "#EE1C2E", "#FFFFFF"],
      visual: {
        logo: "蓝红主色带，位置与配色固定",
        font: "功能优先的信息字体，正面大号容量标注",
        graphic: "实拍图为主，图示化功能说明",
        packaging: "正面必须有功能图示与容量标注，促销标签位预留",
        forbidden: ["正面禁纯装饰图形", "禁占用促销标签位", "禁未经验证的材料宣称"]
      },
      matlib: {
        colors: [
          { name: "Tesco 蓝", pantone: "PMS 293C", hex: "#00539F", usage: "主色带与 Logo", tol: "ΔE ≤ 1.5" },
          { name: "警示红", pantone: "PMS 185C", hex: "#EE1C2E", usage: "促销与价格标签", tol: "ΔE ≤ 2.0" }
        ],
        colorNote: "自有品牌用色随包装规范执行，功能图示配色须保证货架 3 米可读。",
        materials: [
          { name: "PP 食品级", spec: "透明 / 本色 · 耐 -20~120℃", cats: ["家居", "水具"], cert: "LFGB + EU 10/2011", status: "已认可" },
          { name: "FSC 竹木", spec: "餐厨配件 · 食品级涂层", cats: ["家居"], cert: "FSC + 迁移测试", status: "已认可" },
          { name: "铂金硫化硅胶", spec: "食品接触 · 耐高温", cats: ["家居", "水具"], cert: "LFGB §30/31", status: "已认可" },
          { name: "304 / 316 不锈钢", spec: "内胆与餐具件", cats: ["水具"], cert: "食品接触迁移测试", status: "已认可" }
        ],
        forbidden: [
          { name: "PVC（食品接触）", why: "集团红线" },
          { name: "三聚氰胺树脂（儿童品）", why: "高温迁移风险" }
        ],
        sustainability: "包装减塑路线：2026 起自有品牌塑料包装 100% 可回收。"
      },
      store: {
        display: "民生品类货架密度高，价格带标签醒目",
        priceBands: [
          { cat: "家居", band: "£2.0 – 6.0" }, { cat: "水具", band: "£3.0 – 9.0" }
        ],
        rhythm: "跟随英国节日日历，季前 9 个月锁定 Brief"
      },
      history: {
        wins: [{ t: "厨房收纳系列", why: "连续两季销售增长" }],
        fails: [{ t: "再生材料水杯提案", why: "材料宣称未通过审核，需完整证据链" }]
      },
      decision: [
        { step: "整单确认", role: "Category Manager", note: "整单确认为主，重点包抽查实物样" },
        { step: "质量抽验", role: "QA 团队", note: "首三单连续必验" },
        { step: "店测", role: "门店运营", note: "部分品类小批量店测后放量" }
      ],
      briefTemplate: {
        fields: ["品类容量段", "£ 价格带", "功能图示要求", "UKCA 标识文案", "耐久测试项", "促销标签位"],
        note: "Tesco Brief 按容量段拆包更贴合货架逻辑。"
      },
      assets: [
        { name: "Tesco 自有品牌包装规范", ver: "V5", type: "规范", date: "2025-09" },
        { name: "厨房品类视觉模板", ver: "V2", type: "视觉", date: "2026-04" },
        { name: "标签与合规文案库", ver: "V3", type: "素材", date: "2026-02" }
      ]
    },
    compliance: {
      auditCerts: ["SEDEX", "SMETA"],
      audit: { scheme: "SMETA（SEDEX 4-Pillar）", grade: "无重大不符合项", cycle: "2 年一审；SAQ 自评每年更新", transition: "接受 BSCI 报告并行 3 个月，需同时提交 SMETA 排期" },
      social: "遵循 ETI Base Code；工时与工资记录可追溯 12 个月",
      tests: [
        { cat: "家居 / 厨房", std: "LFGB · EU 10/2011 全套迁移 · UKCA 标识 · 洗碗机耐久循环" },
        { cat: "水具", std: "LFGB · FDA（北美线复用）· 密封与跌落测试" }
      ],
      docs: "食品接触类测试报告有效期 ≤1 年；技术文件按 Tesco QC Pack 模板提交",
      inspection: "AQL Ⅱ 级：Major 1.5 / Minor 4.0（严于常规）；首三单连续必验",
      env: "包装可回收声明必填；一次性塑料件需提交替代方案说明",
      redlines: ["无 SMETA 不可下单", "食品接触未做全套迁移测试不可出运"]
    },
  },
  {
    id: "CLI-003", name: "MINISO", region: "中国 · IP 零售", level: "成长客户",
    since: "2023", annual: "¥1,100 万", contact: "商品经理（客户方）",
    prefs: "IP 授权合规 · 上新速度优先",
    habit: "推荐名单确认 + IP 方二次审核",
    brand: {
      positioning: { "定位": "IP 驱动的快时尚零售", "价值主张": "情绪价值优先，上新速度即生命线", "消费者画像": "Z 世代冲动型购买", "价格心智": "¥9.9 / 19.9 / 29.9 档位锚定" },
      colors: ["#EE2C3C", "#FFFFFF"],
      visual: {
        logo: "IP 联名标识统一露出",
        font: "圆体活泼，IP 方指定字体优先",
        graphic: "IP 形象按授权指引使用",
        packaging: "包装即陈列，正面 IP 露出占比 ≥40%",
        forbidden: ["IP 形象禁改比例与配色", "禁自创 IP 表情动作", "禁遮挡联名标识"]
      },
      matlib: {
        colors: [
          { name: "节庆红", pantone: "PMS 186C", hex: "#EE2C3C", usage: "圣诞档主色", tol: "ΔE ≤ 2.0" },
          { name: "IP 主题色", pantone: "随授权指引", hex: "#F5D08C", usage: "以 IP 方 Style Guide 色值为准，禁自行调整", tol: "按 IP 方标准" }
        ],
        colorNote: "IP 类目色值以授权方 Style Guide 为最高优先级，与本库冲突时以 IP 方为准。",
        materials: [
          { name: "PVC 软胶", spec: "挂件公仔 · 6P 增塑剂合规", cats: ["礼品"], cert: "EN71-3 + 邻苯测试", status: "已认可" },
          { name: "陶瓷（釉上彩）", spec: "马克杯 · 铅镉迁移合规", cats: ["礼品"], cert: "FDA / LFGB", status: "已认可" },
          { name: "FSC 灰板", spec: "拼图与彩盒", cats: ["礼品", "文具"], cert: "FSC + EN71", status: "已认可" },
          { name: "短毛绒", spec: "IP 玩偶 · 阻燃处理", cats: ["礼品"], cert: "EN71-1/2/3", status: "已认可" }
        ],
        forbidden: [{ name: "未授权 IP 素材", why: "法务红线，一票否决" }],
        sustainability: "IP 品类暂无强制再生要求，彩盒逐步 FSC 化。"
      },
      store: {
        display: "IP 专区集中陈列，月度更换主题",
        priceBands: [
          { cat: "礼品", band: "¥15 – 69" }, { cat: "文具", band: "¥9.9 – 29.9" }
        ],
        rhythm: "月度上新，跟随 IP 授权窗口期"
      },
      history: {
        wins: [{ t: "圣诞 IP 礼品系列", why: "售罄率 92%，爆款快速返单" }],
        fails: [{ t: "某联名系列延期 2 周", why: "错过档期全线清仓——交期即生命线" }]
      },
      decision: [
        { step: "商品初审", role: "商品经理", note: "价格档位与上新节奏把关" },
        { step: "IP 方审核", role: "IP 授权方", note: "周期约 2 周，必须预留" },
        { step: "授权核验", role: "法务 / 合规", note: "Disney 系核 FAMA 与授权链" }
      ],
      briefTemplate: {
        fields: ["IP 授权范围", "档期倒推交期", "价格档位", "IP 素材包版本", "内外销双标认证", "IP 方审核预留 2 周"],
        note: "MINISO Brief 先锁授权链与档期，再拆品类。"
      },
      assets: [
        { name: "IP 授权素材包（当季）", ver: "V1", type: "授权", date: "2026-06" },
        { name: "IP 联名设计指引", ver: "V2", type: "规范", date: "2026-05" },
        { name: "门店陈列参考图集", ver: "—", type: "参考", date: "2026-07" }
      ]
    },
    compliance: {
      auditCerts: ["BSCI", "SEDEX"],
      audit: { scheme: "BSCI 或 SMETA 均可", grade: "C 级及以上", cycle: "2 年一审；IP 联名品类叠加 IP 方审厂", transition: "可凭工厂自检 + Eastlink 验厂报告先行打样" },
      social: "常规社会责任要求；IP 方保留突击审核权",
      tests: [
        { cat: "礼品 / 玩具属性", std: "EN71（出口线）/ GB6675（内销线）· 邻苯" },
        { cat: "文具", std: "GB21027 学生用品安全 · 内外销双标执行" }
      ],
      docs: "IP 授权链文件必须完整（授权书 → 品类 → 区域 → 期限）；Disney 系 IP 需 FAMA",
      inspection: "AQL Ⅱ 级：Major 2.5 / Minor 4.0；上新档期紧张时驻厂验货",
      env: "包装印刷油墨环保声明",
      redlines: ["IP 类无完整授权链不可打样", "Disney 系无 FAMA 不可下单"]
    },
  },
  {
    id: "CLI-004", name: "Flying Tiger", region: "丹麦 · 生活方式", level: "新客户",
    since: "2025", annual: "¥380 万", contact: "Buyer（客户方）",
    prefs: "设计驱动 · 小单快反",
    habit: "合作初期，确认方式待建立",
    brand: {
      positioning: { "定位": "丹麦设计驱动的生活方式品牌", "价值主张": "大胆用色、幽默趣味，商品即内容", "消费者画像": "年轻都市人群，低价冲动型购买", "价格心智": "€1–5 冲动价位，整数价格点" },
      colors: ["#0F1B79", "#F5C518", "#E84855"],
      visual: {
        logo: "深蓝底黄字，允许趣味变体（需报备）",
        font: "手写感标题 + 简洁正文",
        graphic: "高饱和撞色是品牌语言，图形手绘感",
        packaging: "包装要有『被送礼』的完成度",
        forbidden: ["禁性冷淡极简风", "禁无完成度的裸包装（新客户 · 规则校准中）"]
      },
      matlib: {
        colors: [
          { name: "克莱因深蓝", pantone: "PMS 2748C", hex: "#0F1B79", usage: "品牌底色", tol: "ΔE ≤ 2.0" },
          { name: "明黄", pantone: "PMS 116C", hex: "#F5C518", usage: "主打撞色 · 允许大面积使用", tol: "ΔE ≤ 2.5" },
          { name: "珊瑚红", pantone: "PMS 178C", hex: "#E84855", usage: "高饱和点缀（品牌语言）", tol: "ΔE ≤ 2.5" }
        ],
        colorNote: "高饱和撞色是品牌语言——与 HEMA 相反，低饱和『性冷淡』方向反而会被否。",
        materials: [
          { name: "FSC 纸品", spec: "手账、贴纸与包装", cats: ["文具"], cert: "FSC", status: "已认可" },
          { name: "再生 PET 板材", spec: "文件收纳件", cats: ["文具"], cert: "GRS（提供声明）", status: "试用中" }
        ],
        forbidden: [{ name: "哑光高级灰涂装", why: "与品牌大胆用色冲突（新客户 · 校准中）" }],
        sustainability: "新客户 · 可持续要求随首个项目校准。"
      },
      store: {
        display: "动线式小店铺陈，商品即内容",
        priceBands: [{ cat: "文具", band: "€1.0 – 3.0（暂定）" }],
        rhythm: "每月主题更换"
      },
      history: { wins: [], fails: [] },
      decision: [
        { step: "单点决策", role: "Buyer", note: "节奏快，确认方式待首个项目磨合" }
      ],
      briefTemplate: {
        fields: ["主题月历", "€ 整数价格点", "用色幽默方向", "POPs / REACH", "小单快反批量"],
        note: "新客户——以首个项目沉淀 Brief 模板。"
      },
      assets: [
        { name: "公开产品风格研究", ver: "V1", type: "参考", date: "2026-08" }
      ]
    },
    compliance: {
      auditCerts: ["BSCI"],
      audit: { scheme: "amfori BSCI", grade: "待确认（新客户）", cycle: "待确认", transition: "首单前完成验厂即可" },
      social: "参照丹麦企业责任惯例，标准梳理中",
      tests: [
        { cat: "文创 / 文具", std: "EN71 · REACH · POPs 持久性污染物（丹麦执行严格）" }
      ],
      docs: "标准建立中——以首个项目为试点沉淀模板",
      inspection: "AQL 待定，暂按 Major 2.5 / Minor 4.0 执行",
      env: "待确认",
      redlines: ["首单前必须完成 BSCI 验厂"]
    },
  }
];

/* ---------------- Mock：供应商（含来源字段） ---------------- */
/* source: { type: 'own' } 自主开发 | { type: 'client', client: 'CLI-001' } 客户提供 */

const suppliers = [
  {
    id: "SUP-001", name: "供应商 A", status: "active", source: { type: "own" },
    type: "工厂", region: "宁波", cats: ["文具", "礼品"], procs: ["印刷", "模切", "装订"],
    capacity: 150000, price: 88, quality: 94, onTime: 95, lead: 32, sample: 6,
    certs: ["FSC", "BSCI", "ISO9001", "EN71", "REACH"], served: ["HEMA", "Tesco"],
    years: 5, annual: "¥820 万", risk: "低", contact: "销售对接人 · 138****1188",
    suggest: "主推分配，文具品类首选",
    audits: [{ scheme: "BSCI", grade: "B", valid: "2027-01", status: "有效" }],
    caps: []
  },
  {
    id: "SUP-002", name: "供应商 B", status: "qualified", source: { type: "own" },
    type: "工厂", region: "义乌", cats: ["文具"], procs: ["印刷", "烫金", "模切"],
    capacity: 90000, price: 92, quality: 90, onTime: 88, lead: 38, sample: 8,
    certs: ["FSC", "EN71"], served: ["Flying Tiger"],
    years: 2, annual: "¥310 万", risk: "低", contact: "销售对接人 · 139****2233",
    suggest: "报价强，注意 REACH 认证缺口",
    audits: [{ scheme: "SMETA 4P", grade: "低风险", valid: "2026-12", status: "有效" }],
    caps: []
  },
  {
    id: "SUP-003", name: "供应商 C", status: "active", source: { type: "client", client: "CLI-001" },
    type: "工厂", region: "杭州", cats: ["包袋"], procs: ["缝纫", "印刷", "压花"],
    capacity: 70000, price: 85, quality: 93, onTime: 94, lead: 40, sample: 7,
    certs: ["BSCI", "GRS", "REACH"], served: ["HEMA", "Zara Home"],
    years: 4, annual: "¥560 万", risk: "低", contact: "销售对接人 · 137****5566",
    suggest: "HEMA 体系供应商，包袋优先评估"
  },
  {
    id: "SUP-004", name: "供应商 D", status: "qualified", source: { type: "own" },
    type: "工厂", region: "广州", cats: ["包袋", "礼品"], procs: ["缝纫", "丝印"],
    capacity: 55000, price: 90, quality: 88, onTime: 90, lead: 42, sample: 9,
    certs: ["BSCI", "SEDEX"], served: ["MINISO"],
    years: 3, annual: "¥380 万", risk: "中", contact: "销售对接人 · 136****7788",
    suggest: "可分配，价格竞争力好，关注风险"
  },
  {
    id: "SUP-005", name: "供应商 E", status: "active", source: { type: "own" },
    type: "工厂", region: "台州", cats: ["水具", "家居"], procs: ["注塑", "丝印", "模压", "电镀"],
    capacity: 60000, price: 82, quality: 91, onTime: 92, lead: 45, sample: 8,
    certs: ["LFGB", "FDA", "ISO9001", "BSCI"], served: ["Tesco", "HEMA"],
    years: 4, annual: "¥640 万", risk: "低", contact: "销售对接人 · 135****3311",
    suggest: "水具/食品接触类首选",
    audits: [{ scheme: "BSCI", grade: "A", valid: "2027-03", status: "有效" }],
    caps: []
  },
  {
    id: "SUP-006", name: "供应商 F", status: "onboarding", source: { type: "client", client: "CLI-001" },
    type: "工厂", region: "永康", cats: ["水具"], procs: ["注塑", "真空成型", "丝印"],
    capacity: 80000, price: 87, quality: 85, onTime: 80, lead: 48, sample: 10,
    certs: ["LFGB"], served: [],
    years: 0, annual: "—", risk: "中", contact: "销售对接人 · 133****9090",
    suggest: "客户提供 · 准入资料补充中，验厂待排期",
    audits: [{ scheme: "BSCI", grade: "—", valid: "—", status: "待排期" }],
    caps: []
  },
  {
    id: "SUP-007", name: "供应商 G", status: "active", source: { type: "client", client: "CLI-003" },
    type: "贸易商", region: "深圳", cats: ["礼品", "文具"], procs: ["印刷", "注塑", "组装"],
    capacity: 100000, price: 80, quality: 89, onTime: 91, lead: 35, sample: 7,
    certs: ["BSCI", "EN71", "REACH", "Disney FAMA"], served: ["MINISO", "泡泡玛特"],
    years: 3, annual: "¥450 万", risk: "低", contact: "销售对接人 · 132****4455",
    suggest: "MINISO 体系，IP 类项目优先",
    audits: [{ scheme: "Disney FAMA", grade: "通过", valid: "2027-06", status: "有效" }],
    caps: [{ id: "CAP-03", src: "测试", issue: "EN71-3 铅含量临界值预警，更换色粉供应商", sev: "Minor", due: "07-10", status: "已关闭" }]
  },
  {
    id: "SUP-008", name: "供应商 H", status: "qualified", source: { type: "own" },
    type: "工厂", region: "苏州", cats: ["家居", "水具"], procs: ["注塑", "模压", "丝印"],
    capacity: 45000, price: 78, quality: 92, onTime: 89, lead: 48, sample: 9,
    certs: ["LFGB", "FSC"], served: ["HEMA"],
    years: 2, annual: "¥270 万", risk: "低", contact: "销售对接人 · 131****6677",
    suggest: "家居类稳定，产能偏小",
    audits: [{ scheme: "BSCI", grade: "C", valid: "2026-09", status: "即将到期" }],
    caps: [
      { id: "CAP-01", src: "验厂", issue: "消防通道堆物、工时记录不完整", sev: "Minor", due: "08-25", status: "整改中" },
      { id: "CAP-05", src: "验货", issue: "REQ-T2 首单验货 Major 4 处（合模线毛刺），全检返工", sev: "Major", due: "08-18", status: "待复审" }
    ]
  },
  {
    id: "SUP-009", name: "供应商 I", status: "suspended", source: { type: "own" },
    type: "工厂", region: "温州", cats: ["文具"], procs: ["印刷", "装订"],
    capacity: 70000, price: 83, quality: 78, onTime: 76, lead: 44, sample: 11,
    certs: ["BSCI（过期）"], served: ["HEMA（历史）"],
    years: 3, annual: "¥190 万", risk: "高", contact: "销售对接人 · 130****2200",
    suggest: "CAP 整改未关闭，暂停新项目分配",
    audits: [{ scheme: "BSCI", grade: "D", valid: "已失效", status: "已过期" }],
    caps: [{ id: "CAP-02", src: "验厂", issue: "未申报分包 + 应急出口锁闭", sev: "Critical", due: "07-31", status: "逾期" }]
  },
  {
    id: "SUP-010", name: "供应商 J", status: "eliminated", source: { type: "own" },
    type: "工厂", region: "东莞", cats: ["家居"], procs: ["冲压", "电镀"],
    capacity: 50000, price: 70, quality: 58, onTime: 61, lead: 55, sample: 14,
    certs: [], served: ["历史客户"],
    years: 2, annual: "—", risk: "高", contact: "—",
    suggest: "重大质量事故，不建议再启用"
  },
  {
    id: "SUP-011", name: "供应商 K", status: "potential", source: { type: "own" },
    type: "工贸一体", region: "金华", cats: ["包袋"], procs: ["缝纫"],
    capacity: 40000, price: null, quality: null, onTime: null, lead: null, sample: null,
    certs: [], served: [],
    years: 0, annual: "—", risk: "中", contact: "销售对接人 · 189****1212",
    suggest: "展会接触，信息收集中，可启动准入评估"
  },
  {
    id: "SUP-012", name: "供应商 L", status: "active", source: { type: "own" },
    type: "自有工厂", region: "宁波", cats: ["文具", "包袋"], procs: ["印刷", "缝纫", "模切", "组装"],
    capacity: 120000, price: 76, quality: 96, onTime: 96, lead: 28, sample: 5,
    certs: ["FSC", "BSCI", "ISO9001", "REACH", "EN71"], served: ["HEMA", "Tesco", "MINISO"],
    years: 6, annual: "¥1,150 万", risk: "低", contact: "孙杰 · 138****9900",
    suggest: "关联自有工厂，质量交期最稳",
    audits: [{ scheme: "BSCI", grade: "A", valid: "2027-05", status: "有效" }, { scheme: "Disney FAMA", grade: "通过", valid: "2026-11", status: "有效" }],
    caps: [{ id: "CAP-04", src: "测试", issue: "XM-101 邻苯二甲酸盐超标，更换软胶料并复测", sev: "Major", due: "08-20", status: "整改中" }]
  }
];

/* ---------------- Mock：项目 / 需求包 / 设计稿 ---------------- */

const projects = [
  {
    id: "PRJ-2601", name: "HEMA 2027 开学季系列", client: "CLI-001", owner: "业务员 A",
    launch: "2027-06", briefVer: "V2", briefFile: "HEMA_BTS_2027_Brief_V2.pdf",
    brief: {
      "项目主题": "Back to School 2027", "目标市场": "欧洲门店 + 线上",
      "SKU 结构": "文具 40 · 包袋 22 · 水具 10", "整体价格带": "€1.5 – 8.0",
      "上市时间": "2027-06", "关键节点": "设计稿 2026-11 · 大货下单 2027-02",
      "客户决策人": "客户采购总监", "Eastlink Owner": "业务员 A"
    },
    timeline: [
      { t: "07-21", txt: "客户提交 Brief V1（邮件 + PDF）" },
      { t: "07-24", txt: "Brief 结构化拆解完成，拆出 3 个需求包" },
      { t: "07-30", txt: "客户补充水具认证要求，Brief 升级 V2" },
      { t: "08-04", txt: "文具包设计定稿，进入打样候选匹配" }
    ]
  },
  {
    id: "PRJ-2602", name: "HEMA 2026 秋冬家居系列", client: "CLI-001", owner: "业务员 A",
    launch: "2026-10", briefVer: "V1", briefFile: "HEMA_AW26_Home_Brief.pdf",
    brief: {
      "项目主题": "Autumn Warm Home", "目标市场": "欧洲门店",
      "SKU 结构": "布艺收纳 12 · 保温杯具 8", "整体价格带": "€3.0 – 12.0",
      "上市时间": "2026-10", "关键节点": "设计定稿 2026-08 · 大货下单 2026-09",
      "客户决策人": "客户采购总监", "Eastlink Owner": "业务员 A"
    },
    timeline: [
      { t: "06-12", txt: "保温杯具需求包定商确认（供应商 E · 内审），结果同步客户" },
      { t: "07-28", txt: "布艺收纳设计稿 V1 客户提出修改意见" },
      { t: "08-05", txt: "布艺收纳候选打样评分完成，定商建议进入内审" }
    ]
  },
  {
    id: "PRJ-2603", name: "Tesco 厨房收纳系列", client: "CLI-002", owner: "业务员 B",
    launch: "2026-12", briefVer: "V1", briefFile: "Tesco_Kitchen_Brief.pdf",
    brief: {
      "项目主题": "Kitchen Storage Refresh", "目标市场": "英国门店",
      "SKU 结构": "收纳盒 16 · 餐厨配件 9", "整体价格带": "£2.0 – 9.0",
      "上市时间": "2026-12", "关键节点": "已完成设计定稿",
      "客户决策人": "客户 Category Manager", "Eastlink Owner": "业务员 B"
    },
    timeline: [
      { t: "05-20", txt: "比样定商完成（内审确认），结果同步客户" },
      { t: "07-15", txt: "金样确认，等待大货下单（P2 范围）" }
    ]
  },
  {
    id: "PRJ-2604", name: "MINISO 圣诞 IP 礼品", client: "CLI-003", owner: "业务员 A",
    launch: "2026-11", briefVer: "V1", briefFile: "MINISO_Xmas_IP_Brief.pptx",
    brief: {
      "项目主题": "圣诞 IP 联名礼品", "目标市场": "中国 + 东南亚",
      "SKU 结构": "IP 礼品 18", "整体价格带": "¥15 – 69",
      "上市时间": "2026-11", "关键节点": "IP 方审核 2026-09",
      "客户决策人": "客户商品经理", "Eastlink Owner": "业务员 A"
    },
    timeline: [
      { t: "07-18", txt: "打样名单内审通过，2 家候选出样中" }
    ]
  },
  {
    id: "PRJ-2605", name: "Flying Tiger 春季文创", client: "CLI-004", owner: "业务员 B",
    launch: "2027-03", briefVer: "V1", briefFile: "FT_Spring_Brief_Sketch.jpg",
    brief: {
      "项目主题": "Spring Playful Stationery", "目标市场": "北欧门店",
      "SKU 结构": "拆解中", "整体价格带": "待确认",
      "上市时间": "2027-03", "关键节点": "拆解完成后排期",
      "客户决策人": "客户 Buyer", "Eastlink Owner": "业务员 B"
    },
    timeline: [
      { t: "08-02", txt: "客户微信发来手绘参考图 + 品类方向，Brief 结构化进行中" }
    ]
  },
  {
    id: "PRJ-2606", name: "IP 品牌（华南）合作询单", client: null, owner: "业务员 A",
    launch: "待定", briefVer: "V0", briefFile: "微信聊天记录整理.docx",
    brief: {
      "项目主题": "IP 衍生品合作意向", "目标市场": "待确认",
      "SKU 结构": "待拆解", "整体价格带": "待确认",
      "上市时间": "待定", "关键节点": "客户建档 + Brief 补全",
      "客户决策人": "待确认", "Eastlink Owner": "业务员 A"
    },
    timeline: [
      { t: "08-06", txt: "收到合作询单，待客户建档" }
    ]
  }
];

const packages = [
  {
    id: "REQ-01", prj: "PRJ-2601", name: "文具套装需求包", cat: "文具", sku: 40,
    monthly: 100000, qtyLabel: "10 万件/月", priceBand: "€1.5 – 3.0",
    procs: ["印刷", "模切"], certs: ["FSC", "EN71", "REACH"], leadLimit: 40,
    status: "matching", shortlist: [], confirmed: [], suggestSup: null, returnNote: null,
    skuList: [
      { id: "BTS-101", name: "A5 线圈笔记本 · 3 款封面", spec: "FSC 纸 80g · 60 页", qty: "3.2 万/月", price: "€1.5", status: "定稿",
        tests: [{ std: "EN71-3", status: "待送测" }, { std: "甲醛（纸品）", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } },
      { id: "BTS-102", name: "12 色彩铅纸盒装", spec: "椴木杆 · FSC 纸盒", qty: "2.4 万/月", price: "€2.2", status: "定稿",
        tests: [{ std: "EN71-1/2/3", status: "待送测" }, { std: "REACH 附录 XVII", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } },
      { id: "BTS-103", name: "笔袋文具 5 件套", spec: "PP 磨砂盒 · 模切内衬", qty: "2.6 万/月", price: "€3.0", status: "定稿",
        tests: [{ std: "EN71-3 + 邻苯", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } },
      { id: "BTS-104", name: "贴纸手账套装", spec: "铜版纸模切 · 环保覆膜", qty: "1.8 万/月", price: "€1.8", status: "定稿",
        tests: [{ std: "EN71-3", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } }
    ]
  },
  {
    id: "REQ-02", prj: "PRJ-2601", name: "背包袋类需求包", cat: "包袋", sku: 22,
    monthly: 60000, qtyLabel: "6 万件/月", priceBand: "€4.0 – 8.0",
    procs: ["缝纫", "印刷"], certs: ["BSCI", "REACH"], leadLimit: 45,
    status: "design", shortlist: [], confirmed: [], suggestSup: null, returnNote: null,
    skuList: [
      { id: "BTS-201", name: "儿童双肩背包 · 主款", spec: "600D 再生涤纶 · 反光条", qty: "2.8 万/月", price: "€7.5", status: "设计中", struct: "新结构",
        tests: [{ std: "REACH + AZO", status: "待送测" }, { std: "镍释放（金属件）", status: "待送测" }],
        tcf: { 设计定稿: false, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } },
      { id: "BTS-202", name: "抽绳运动袋", spec: "210D 涤纶 · 单色印刷", qty: "2.0 万/月", price: "€4.0", status: "设计中",
        tests: [{ std: "REACH + AZO", status: "待送测" }],
        tcf: { 设计定稿: false, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } },
      { id: "BTS-203", name: "拉链笔袋包", spec: "帆布 · 双头拉链", qty: "1.2 万/月", price: "€4.5", status: "设计中",
        tests: [{ std: "REACH", status: "待送测" }],
        tcf: { 设计定稿: false, 材料声明: false, 测试报告: false, 样品记录: false, 验货报告: false } }
    ]
  },
  {
    id: "REQ-03", prj: "PRJ-2601", name: "水杯水具需求包", cat: "水具", sku: 10,
    monthly: 40000, qtyLabel: "4 万件/月", priceBand: "€2.0 – 4.0",
    procs: ["注塑", "丝印"], certs: ["LFGB", "FDA"], leadLimit: 50,
    status: "sampling", shortlist: ["SUP-005", "SUP-008"], confirmed: [], suggestSup: null, returnNote: null,
    skuList: [
      { id: "BTS-301", name: "运动水壶 550ml", spec: "Tritan 瓶身 · 丝印 logo", qty: "2.2 万/月", price: "€2.8", status: "打样中",
        design: "V1 定稿", sample: "打样评审中", test: "待送测", next: "比样定商",
        tests: [{ std: "LFGB §30/31", status: "待送测" }, { std: "感官测试", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: true, 验货报告: false } },
      { id: "BTS-302", name: "儿童保温杯 350ml", spec: "316 内胆 · 吸管盖", qty: "1.8 万/月", price: "€4.0", status: "打样中",
        design: "V1 定稿", sample: "候选打样中", test: "待送测", next: "比样定商",
        tests: [{ std: "LFGB §30/31", status: "待送测" }, { std: "EU 10/2011 迁移", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: false, 验货报告: false } }
    ]
  },
  {
    id: "REQ-H1", prj: "PRJ-2602", name: "布艺收纳需求包", cat: "家居", sku: 12,
    monthly: 30000, qtyLabel: "3 万件/月", priceBand: "€3.0 – 8.0",
    procs: ["模压"], certs: ["FSC", "BSCI"], leadLimit: 45,
    status: "final_internal", shortlist: ["SUP-008", "SUP-005"], confirmed: [], suggestSup: "SUP-008", returnNote: null,
    skuList: [
      { id: "AW-101", name: "布艺收纳筐三件套", spec: "棉麻面料 · 模压定型", qty: "1.4 万/月", price: "€6.5", status: "打样中" },
      { id: "AW-102", name: "床底收纳袋", spec: "无纺布 · 可视窗", qty: "1.0 万/月", price: "€3.5", status: "打样中" },
      { id: "AW-103", name: "挂式收纳格", spec: "棉麻 · 四格", qty: "0.6 万/月", price: "€4.0", status: "打样中" }
    ]
  },
  {
    id: "REQ-H2", prj: "PRJ-2602", name: "保温杯具需求包", cat: "水具", sku: 8,
    monthly: 25000, qtyLabel: "2.5 万件/月", priceBand: "€6.0 – 12.0",
    procs: ["注塑", "丝印"], certs: ["LFGB", "FDA"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-005"], confirmed: ["SUP-005"], suggestSup: "SUP-005", returnNote: null,
    skuList: [
      { id: "AW-201", name: "保温杯 500ml · 燕麦色", spec: "304 内胆 · 粉体涂装", qty: "1.0 万/月", price: "€9.5", status: "已确认",
        design: "V1 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "EU 10/2011 迁移", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: false } },
      { id: "AW-202", name: "保温杯 350ml · 藏蓝", spec: "304 内胆 · 粉体涂装", qty: "0.8 万/月", price: "€8.0", status: "已确认",
        design: "V1 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "EU 10/2011 迁移", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: false } },
      { id: "AW-203", name: "儿童吸管杯 300ml", spec: "Tritan · 防漏吸管盖", qty: "0.7 万/月", price: "€6.5", status: "已确认",
        design: "V1 定稿", sample: "二次修样确认", test: "送测中", next: "测试通过后下单",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "感官测试", status: "测试中" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: true, 验货报告: false } }
    ]
  },
  {
    id: "REQ-T1", prj: "PRJ-2603", name: "厨房收纳盒需求包", cat: "家居", sku: 16,
    monthly: 45000, qtyLabel: "4.5 万件/月", priceBand: "£2.0 – 6.0",
    procs: ["注塑"], certs: ["LFGB", "BSCI"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-005"], confirmed: ["SUP-005"], suggestSup: "SUP-005", returnNote: null,
    skuList: [
      { id: "TK-101", name: "密封收纳盒 1.2L", spec: "PP 食品级 · 四扣密封", qty: "1.8 万/月", price: "£2.8", status: "已确认",
        design: "V2 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "EU 10/2011 迁移", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: true } },
      { id: "TK-102", name: "密封收纳盒 2.4L", spec: "PP 食品级 · 四扣密封", qty: "1.4 万/月", price: "£4.2", status: "已确认",
        design: "V2 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "EU 10/2011 迁移", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: true } }
    ]
  },
  {
    id: "REQ-T2", prj: "PRJ-2603", name: "餐厨配件需求包", cat: "家居", sku: 9,
    monthly: 30000, qtyLabel: "3 万件/月", priceBand: "£2.0 – 9.0",
    procs: ["注塑", "模压"], certs: ["LFGB"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-008"], confirmed: ["SUP-008"], suggestSup: "SUP-008", returnNote: null,
    skuList: [
      { id: "TK-201", name: "沥水置物架", spec: "PP + 竹纤维托盘", qty: "1.2 万/月", price: "£5.5", status: "已确认",
        design: "V1 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }, { std: "竹纤维迁移测试", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: false } },
      { id: "TK-202", name: "调料收纳罐 4 件套", spec: "PET 罐身 · 模压盖", qty: "1.0 万/月", price: "£6.8", status: "已确认",
        design: "V1 定稿", sample: "金样确认", test: "LFGB 通过", next: "大货下单（P2）",
        tests: [{ std: "LFGB §30/31", status: "通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: true, 样品记录: true, 验货报告: false } }
    ]
  },
  {
    id: "REQ-M1", prj: "PRJ-2604", name: "圣诞 IP 礼品需求包", cat: "礼品", sku: 18,
    monthly: 80000, qtyLabel: "8 万件/月", priceBand: "¥15 – 69",
    procs: ["印刷", "组装"], certs: ["EN71", "Disney FAMA"], leadLimit: 40,
    status: "sampling", shortlist: ["SUP-007", "SUP-012"], confirmed: [], suggestSup: null, returnNote: null,
    skuList: [
      { id: "XM-101", name: "IP 盲盒挂件 · 6 款", spec: "PVC 软胶 · 独立彩盒", qty: "3.5 万/月", price: "¥19", status: "打样中", struct: "新结构",
        tests: [{ std: "EN71-3", status: "通过" }, { std: "邻苯二甲酸盐", status: "不通过" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: true, 验货报告: false } },
      { id: "XM-102", name: "圣诞马克杯礼盒", spec: "陶瓷 · 烫金印刷礼盒", qty: "2.0 万/月", price: "¥39", status: "打样中",
        tests: [{ std: "铅镉迁移（FDA/LFGB）", status: "测试中" }],
        tcf: { 设计定稿: true, 材料声明: true, 测试报告: false, 样品记录: true, 验货报告: false } },
      { id: "XM-103", name: "IP 拼图 500 片", spec: "FSC 灰板 · 哑膜", qty: "1.5 万/月", price: "¥45", status: "打样中",
        tests: [{ std: "EN71-1/2/3", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: false, 测试报告: false, 样品记录: true, 验货报告: false } },
      { id: "XM-104", name: "节日袜礼品套装", spec: "针织 + 卡头组装", qty: "1.0 万/月", price: "¥15", status: "打样中",
        tests: [{ std: "EN71 + AZO", status: "待送测" }],
        tcf: { 设计定稿: true, 材料声明: false, 测试报告: false, 样品记录: false, 验货报告: false } }
    ]
  }
];

/* skuMap：该设计版本内各 SKU 的出稿覆盖（需求包整体定稿前，逐 SKU 跟踪） */
const designs = [
  { id: "D-01", pkg: "REQ-02", ver: 1, designer: "设计师 A", date: "08-05",
    status: "internal_review", palette: ["#2F6BD8", "#F2F6FB"], note: null,
    skuMap: [{ sku: "BTS-201", status: "已出稿" }, { sku: "BTS-202", status: "已出稿" }, { sku: "BTS-203", status: "已出稿" }] },
  { id: "D-02", pkg: "REQ-01", ver: 1, designer: "设计师 A", date: "07-30",
    status: "approved", palette: ["#E64A45", "#F7F3EE"], note: null,
    skuMap: [{ sku: "BTS-101", status: "已出稿" }, { sku: "BTS-102", status: "已出稿" }, { sku: "BTS-103", status: "已出稿" }, { sku: "BTS-104", status: "已出稿" }] },
  { id: "D-03", pkg: "REQ-03", ver: 1, designer: "设计师 B", date: "07-26",
    status: "approved", palette: ["#4C9A6E", "#F2F7F0"], note: null,
    skuMap: [{ sku: "BTS-301", status: "已出稿" }, { sku: "BTS-302", status: "已出稿" }] },
  { id: "D-04", pkg: "REQ-H1", ver: 1, designer: "设计师 A", date: "06-20",
    status: "changes", palette: ["#8FA8C8", "#E7EDF5"],
    note: "客户修改意见：整体色调偏冷，希望更贴近 HEMA 红白视觉体系。",
    skuMap: [{ sku: "AW-101", status: "修改中", note: "主色调整改" }, { sku: "AW-102", status: "修改中", note: "配色随主 SKU 调整" }, { sku: "AW-103", status: "已出稿" }] },
  { id: "D-05", pkg: "REQ-H1", ver: 2, designer: "设计师 A", date: "07-02",
    status: "approved", palette: ["#E64A45", "#F7F3EE"], note: null,
    skuMap: [{ sku: "AW-101", status: "已出稿" }, { sku: "AW-102", status: "已出稿" }, { sku: "AW-103", status: "已出稿" }] },
  { id: "D-06", pkg: "REQ-H2", ver: 1, designer: "设计师 B", date: "06-28",
    status: "approved", palette: ["#2F6BD8", "#F2F6FB"], note: null,
    skuMap: [{ sku: "AW-201", status: "已出稿" }, { sku: "AW-202", status: "已出稿" }, { sku: "AW-203", status: "已出稿" }] },
  { id: "D-07", pkg: "REQ-T1", ver: 2, designer: "设计师 B", date: "05-12",
    status: "approved", palette: ["#4C9A6E", "#F2F7F0"], note: null,
    skuMap: [{ sku: "TK-101", status: "已出稿" }, { sku: "TK-102", status: "已出稿" }] },
  { id: "D-08", pkg: "REQ-T2", ver: 1, designer: "设计师 A", date: "05-10",
    status: "approved", palette: ["#C88B3C", "#FBF5EC"], note: null,
    skuMap: [{ sku: "TK-201", status: "已出稿" }, { sku: "TK-202", status: "已出稿" }] },
  { id: "D-09", pkg: "REQ-M1", ver: 1, designer: "设计师 B", date: "07-08",
    status: "approved", palette: ["#EE2C3C", "#FDF3F0"], note: null,
    skuMap: [{ sku: "XM-101", status: "已出稿" }, { sku: "XM-102", status: "已出稿" }, { sku: "XM-103", status: "已出稿" }, { sku: "XM-104", status: "已出稿" }] }
];

/* 打样任务：候选供应商按定稿设计出样，评分后比样定商 */
const samples = [
  { id: "S-01", pkg: "REQ-03", supplier: "SUP-005", status: "reviewing", due: "08-20",
    score: null, preset: { 质量: 91, 工艺还原: 89, 报价: 84 }, note: "样品已到，评审中" },
  { id: "S-02", pkg: "REQ-03", supplier: "SUP-008", status: "sampling", due: "08-24",
    score: null, preset: { 质量: 90, 工艺还原: 86, 报价: 90 }, note: "打样进行中" },
  { id: "S-03", pkg: "REQ-H1", supplier: "SUP-008", status: "scored", due: "—",
    score: { 质量: 92, 工艺还原: 90, 报价: 85 }, preset: null, note: "布纹与配色还原度最好",
    skuScores: [
      { sku: "AW-101", 质量: 93, 工艺还原: 91, 报价: 84 },
      { sku: "AW-102", 质量: 91, 工艺还原: 90, 报价: 86 },
      { sku: "AW-103", 质量: 92, 工艺还原: 89, 报价: 85 }
    ] },
  { id: "S-04", pkg: "REQ-H1", supplier: "SUP-005", status: "scored", due: "—",
    score: { 质量: 88, 工艺还原: 84, 报价: 90 }, preset: null, note: "报价最优，车缝走线一般",
    skuScores: [
      { sku: "AW-101", 质量: 89, 工艺还原: 85, 报价: 91 },
      { sku: "AW-102", 质量: 87, 工艺还原: 83, 报价: 89 },
      { sku: "AW-103", 质量: 88, 工艺还原: 84, 报价: 90 }
    ] },
  { id: "S-05", pkg: "REQ-M1", supplier: "SUP-007", status: "delivered", due: "08-18",
    score: null, preset: { 质量: 89, 工艺还原: 92, 报价: 83 }, note: "IP 还原度待评审" },
  { id: "S-06", pkg: "REQ-M1", supplier: "SUP-012", status: "sampling", due: "08-22",
    score: null, preset: { 质量: 93, 工艺还原: 88, 报价: 80 }, note: "" }
];
const samplesOf = pkgId => samples.filter(s => s.pkg === pkgId);

/* 验货计划与结果（已确认合作的需求包；首单必验，AQL Ⅱ 级标准来自客户合规档案） */
const inspections = [
  { id: "INS-01", pkg: "REQ-T1", supplier: "SUP-005", type: "首单 AQL Ⅱ（Major 2.5 / Minor 4.0）", date: "08-06", status: "通过", by: "Eastlink QC" },
  { id: "INS-02", pkg: "REQ-H2", supplier: "SUP-005", type: "首单 AQL Ⅱ（Major 2.5 / Minor 4.0）", date: "08-15", status: "待录入", by: "Eastlink QC" },
  { id: "INS-03", pkg: "REQ-T2", supplier: "SUP-008", type: "首单 AQL Ⅱ（Major 2.5 / Minor 4.0）", date: "07-28", status: "不通过", by: "第三方（客户指定）", note: "Major 4 处：合模线毛刺 → 已开 CAP-05 整改" },
  { id: "INS-04", pkg: "REQ-T2", supplier: "SUP-008", type: "整改后复验 AQL Ⅱ", date: "待排期", status: "待排期", by: "Eastlink QC" }
];

/* ---------------- 动态 / 历史 ---------------- */

const feed = [
  { t: "今天 09:40", txt: "HEMA 补充水具认证要求，REQ-03 需求包已更新" },
  { t: "今天 09:12", txt: "设计稿 V1（背包袋类需求包）提交内审" },
  { t: "昨天 17:26", txt: "MINISO 圣诞 IP 需求包打样邀请已发出，2 家候选出样中" },
  { t: "昨天 14:03", txt: "供应商 F（HEMA 提供）进入准入流程，验厂待排期" },
  { t: "08-04 11:20", txt: "HEMA 开学季文具包设计定稿，进入打样候选匹配" }
];

const history = [
  { t: "07-18", txt: "REQ-M1 打样名单内审通过，打样邀请已发出" },
  { t: "07-15", txt: "Tesco 厨房收纳全部设计稿客户定稿" },
  { t: "06-12", txt: "HEMA 秋冬家居保温杯具需求包定商确认（供应商 E · 内审），结果同步客户" }
];

/* ---------------- 全局状态 ---------------- */

const state = {
  role: "sales",
  view: "dashboard",
  rtab: "pending",
  prjOpen: null,
  pkgSel: "REQ-01",
  weights: Object.fromEntries(DIMS.map(d => [d.key, d.w])),
  gates: { cert: false, redline: false },
  nbFile: null,
  railAll: false,
  skuOpen: {},
  sampSku: {},
  pinClient: true,
  reasonFor: null,          // { t: 'pkg-internal-return'|'pkg-swap'|'design-return'|'design-changes', id }
  clientSel: "CLI-001",
  clientTab: "basic",
  supSel: "SUP-001",
  supEdit: false,
  mapSel: null,
  supFilters: { status: "all", cat: "all", risk: "all", source: "all", q: "" }
};

const ROLES = {
  sales: {
    banner: "业务员视角 · 项目 Owner",
    cls: "",
    hint: "负责 Brief 拆解、供应商匹配、内审与对客提交。",
    nav: ["dashboard", "projects", "matching", "clients", "suppliers", "quality", "thinking"]
  },
  management: {
    banner: "管理层视角 · 全局只读",
    cls: "",
    hint: "查看所有项目健康度、审核积压与供应商风险，不直接操作。",
    nav: ["dashboard", "projects", "clients", "suppliers", "quality", "thinking"]
  },
  client: {
    banner: "客户视角 · HEMA（模拟客户登录）",
    cls: "client",
    hint: "提需求、确认设计稿、提供品牌规范；定商由 Eastlink 确定并同步结果。看不到内部打分与落选者。",
    nav: ["dashboard", "projects", "suppliers", "quality"],
    clientId: "CLI-001"
  },
  supplier: {
    banner: "供应商视角 · 供应商 E（模拟供应商登录）",
    cls: "supplier",
    hint: "仅可见自己的档案与确认的合作，看不到其他供应商与报价对比。",
    nav: ["dashboard"],
    supplierId: "SUP-005"
  }
};

/* ---------------- 工具 ---------------- */

const $ = id => document.getElementById(id);
const sup = id => suppliers.find(s => s.id === id);
const pkg = id => packages.find(p => p.id === id);
const prj = id => projects.find(p => p.id === id);
const client = id => clients.find(c => c.id === id);
const pkgsOf = prjId => packages.filter(p => p.prj === prjId);
const designsOf = pkgId => designs.filter(d => d.pkg === pkgId).sort((a, b) => a.ver - b.ver);

/* 缩略图背景：有真实上传的图片文件时用原图，否则用配色渐变示意 */
const thumbBg = d => d && d.file && d.file.src && d.file.mime.startsWith("image/")
  ? `background-image:url(${d.file.src});background-size:cover;background-position:center`
  : d
    ? `background:linear-gradient(135deg, ${d.palette[0]} 0%, ${d.palette[0]} 52%, ${d.palette[1]} 52%, ${d.palette[1]} 100%)`
    : "background:#EEF2F9";
const esc = s => String(s == null ? "" : s);

function latestDesignByPkg(prjId) {
  const map = {};
  designs.forEach(d => {
    const p = pkg(d.pkg);
    if (!p || p.prj !== prjId) return;
    if (!map[d.pkg] || d.ver > map[d.pkg].ver) map[d.pkg] = d;
  });
  return Object.values(map);
}

function deriveStage(p) {
  const ps = pkgsOf(p.id);
  if (!ps.length) return p.id === "PRJ-2606" ? "received" : "structuring";
  if (ps.some(x => x.status === "design")) return "design";
  if (ps.some(x => ["matching", "shortlist_review", "sampling"].includes(x.status))) return "sampling";
  if (ps.some(x => x.status === "final_internal")) return "decide";
  return "confirmed";
}

function stageTag(stage) {
  return `<span class="tag ${STAGE_TAG[stage]} stage-tag">${STAGE_LABEL[stage]}</span>`;
}

function nowLabel() {
  const d = new Date();
  return `今天 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function log(txt, prjId) {
  feed.unshift({ t: nowLabel(), txt });
  if (prjId) {
    const p = prj(prjId);
    const d = new Date();
    if (p) p.timeline.push({ t: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, txt });
  }
}

function done(txt) { history.unshift({ t: nowLabel(), txt }); }

let toastTimer = null;
function toast(txt) {
  const el = $("toast");
  el.textContent = txt;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

function sourceTag(s) {
  if (s.source.type === "client") {
    const c = client(s.source.client);
    return `<span class="tag src-client">客户提供 · ${c ? c.name : ""}</span>`;
  }
  return `<span class="tag src-own">自主开发</span>`;
}

/* ---------------- 匹配引擎 ---------------- */

function hardFilter(p) {
  const pass = [], out = [];
  const projClient = client(prj(p.prj)?.client);
  const auditCerts = (projClient && projClient.compliance && projClient.compliance.auditCerts) || [];
  suppliers.forEach(s => {
    if (!["active", "qualified"].includes(s.status)) {
      const why = { onboarding: "准入未完成", potential: "未准入 · 信息收集中", suspended: "已暂停 · CAP 未关闭", eliminated: "已淘汰" }[s.status];
      out.push({ s, why, gate: "status" });
      return;
    }
    if (!s.cats.includes(p.cat)) {
      out.push({ s, why: `品类不匹配（主营 ${s.cats[0]}）`, gate: "cat" });
      return;
    }
    const missProcs = p.procs.filter(x => !s.procs.includes(x));
    if (missProcs.length) {
      out.push({ s, why: `缺工艺：${missProcs.join(" / ")}`, gate: "proc" });
      return;
    }
    if (state.gates.cert) {
      const missCerts = p.certs.filter(x => !s.certs.includes(x));
      if (missCerts.length) {
        out.push({ s, why: `缺认证：${missCerts.join(" / ")}（认证门槛已开）`, gate: "cert" });
        return;
      }
    }
    if (state.gates.redline && auditCerts.length) {
      const ok = auditCerts.some(a => s.certs.some(x => x.includes(a)));
      if (!ok) {
        out.push({ s, why: `客户验厂红线：缺 ${auditCerts.join(" / ")}（红线门槛已开）`, gate: "redline" });
        return;
      }
    }
    pass.push(s);
  });
  return { pass, out };
}

function dimScores(s, p) {
  const projClient = client(prj(p.prj)?.client);
  const clientName = projClient ? projClient.name : null;

  const category = s.cats[0] === p.cat ? 100 : 82;
  const certHit = p.certs.filter(x => s.certs.includes(x));
  const cert = Math.round(certHit.length / p.certs.length * 100);
  const quality = s.quality ?? 0;
  const leadScore = s.lead == null ? 0 : (s.lead <= p.leadLimit ? 100 : Math.max(0, 100 - (s.lead - p.leadLimit) * 5));
  const delivery = Math.round((s.onTime ?? 0) * 0.6 + leadScore * 0.4);
  const price = s.price ?? 0;
  const ratio = s.capacity / p.monthly;
  const capacity = ratio >= 1.5 ? 100 : ratio >= 1 ? Math.round(70 + (ratio - 1) / 0.5 * 30) : Math.round(ratio * 70);
  const clientExp = clientName && s.served.some(x => x.startsWith(clientName)) ? 100 : (s.served.length ? 65 : 40);
  const risk = RISK[s.risk].score;

  return { category, cert, quality, delivery, price, capacity, clientExp, risk,
    _missCerts: p.certs.filter(x => !s.certs.includes(x)), _ratio: ratio, _clientName: clientName,
    _comp: projClient ? projClient.compliance : null };
}

function totalScore(scores) {
  let sum = 0, wsum = 0;
  DIMS.forEach(d => { sum += scores[d.key] * state.weights[d.key]; wsum += state.weights[d.key]; });
  return wsum ? Math.round(sum / wsum) : 0;
}

function reasons(s, p, sc) {
  const good = [], warn = [];
  if (sc.category === 100) good.push("主营品类完全对口");
  if (sc.process === 100) good.push("需求工艺全覆盖");
  if (sc.cert === 100) good.push("认证全齐");
  if (sc.quality >= 92) good.push(`质量通过率 ${s.quality}%`);
  if (sc.delivery >= 92) good.push(`交付准时率 ${s.onTime}%`);
  if (sc.price >= 88) good.push("报价竞争力强");
  if (sc.clientExp === 100 && sc._clientName) good.push(`服务过 ${sc._clientName}`);
  if (s.source.type === "client") good.push("客户体系供应商");

  if (sc._missCerts.length) warn.push(`缺认证：${sc._missCerts.join(" / ")}`);
  if (sc._ratio < 1) warn.push(`产能缺口约 ${Math.round((1 - sc._ratio) * 100)}%`);
  if (s.lead != null && s.lead > p.leadLimit) warn.push(`交期超限 ${s.lead - p.leadLimit} 天`);
  if (s.risk !== "低") warn.push(`风险等级：${s.risk}`);

  const red = [];
  const comp = sc._comp;
  if (comp && comp.auditCerts && comp.auditCerts.length) {
    const ok = comp.auditCerts.some(a => s.certs.some(x => x.includes(a)));
    if (!ok) red.push(`${sc._clientName} 验厂红线：缺 ${comp.auditCerts.join(" / ")}，下单前须完成验厂`);
  }
  (s.audits || []).forEach(a => {
    if (a.status === "即将到期") warn.push(`${a.scheme} 即将到期（${a.valid}，复审排期中）`);
    if (a.status === "已过期") red.push(`${a.scheme} 已过期，重审前不可下单`);
  });
  if ((s.caps || []).some(c => c.status === "逾期")) red.push(`CAP 逾期未关闭（详见质量控制塔）`);
  return { good: good.slice(0, 4), warn, red };
}

function rankedCandidates(p) {
  const { pass, out } = hardFilter(p);
  const projClientId = prj(p.prj)?.client;
  let list = pass.map(s => {
    const sc = dimScores(s, p);
    return { s, sc, total: totalScore(sc), rs: reasons(s, p, sc) };
  }).sort((a, b) => b.total - a.total);
  if (state.pinClient && projClientId) {
    const mine = list.filter(x => x.s.source.type === "client" && x.s.source.client === projClientId);
    const rest = list.filter(x => !(x.s.source.type === "client" && x.s.source.client === projClientId));
    list = [...mine, ...rest];
  }
  return { list, out };
}

/* ---------------- 审核队列（由状态推导） ---------------- */

function deriveReviews() {
  const items = [];
  packages.forEach(p => {
    if (p.status === "shortlist_review") items.push({ kind: "shortlist", stage: "internal", p });
    if (p.status === "final_internal") items.push({ kind: "final", stage: "internal", p });
  });
  designs.forEach(d => {
    if (d.status === "internal_review") items.push({ kind: "design", stage: "internal", d });
    if (d.status === "client_review") items.push({ kind: "design", stage: "client", d });
  });
  return items;
}

function reviewsForRole() {
  const all = deriveReviews();
  if (state.role === "client") {
    const cid = ROLES.client.clientId;
    return all.filter(it => {
      const p = it.p || pkg(it.d.pkg);
      return it.stage === "client" && prj(p.prj)?.client === cid;
    });
  }
  if (state.role === "supplier") return [];
  return all;
}

/* ============================================================
   渲染
   ============================================================ */

const TITLES = {
  dashboard: ["Overview", "总览"],
  projects: ["Projects", "项目管理"],
  matching: ["Matching Workbench", "匹配工作台"],
  clients: ["Clients", "客户管理"],
  suppliers: ["Supplier Pool", "供应商管理"],
  quality: ["Quality Tower", "质量控制塔"],
  thinking: ["Platform Thinking", "平台思路"]
};

function renderChrome() {
  const role = ROLES[state.role];
  document.querySelectorAll(".nav-btn").forEach(b => {
    const allowed = role.nav.includes(b.dataset.view);
    b.style.display = allowed ? "" : "none";
    b.classList.toggle("active", b.dataset.view === state.view);
  });
  $("roleHint").textContent = role.hint;
  const banner = $("roleBanner");
  banner.textContent = role.banner;
  banner.className = `role-banner ${role.cls}`;
  const t = TITLES[state.view];
  $("pageLabel").textContent = t[0];
  $("pageTitle").textContent = t[1];
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${state.view}`));
}

/* ---------- 总览 ---------- */

function renderDashboard() {
  const el = $("view-dashboard");
  if (state.role === "client") { el.innerHTML = dashClient(); return; }
  if (state.role === "supplier") { el.innerHTML = dashSupplier(); return; }

  const stages = projects.map(p => deriveStage(p));
  const counts = Object.fromEntries(STAGES.map(([k]) => [k, 0]));
  stages.forEach(s => counts[s]++);
  const revs = deriveReviews();
  const nMatching = packages.filter(p => p.status === "matching").length;
  const nInternal = revs.filter(r => r.stage === "internal").length;
  const nClient = revs.filter(r => r.stage === "client").length;

  const todos = [];
  packages.filter(p => p.status === "matching" && prj(p.prj)).forEach(p => {
    todos.push([p.returnNote ? "red" : "blue", p.returnNote ? "重选候选" : "待选候选", `${p.name} · ${prj(p.prj).name}`, "匹配工作台"]);
  });
  packages.filter(p => p.status === "sampling").forEach(p => {
    const ss = samplesOf(p.id);
    const allScored = ss.length && ss.every(x => x.score);
    todos.push([allScored ? "blue" : "amber", allScored ? "待定商建议" : "打样跟进", `${p.name} · ${ss.filter(x => x.score).length}/${ss.length} 家已评分`, "打样与比样"]);
  });
  revs.filter(r => r.stage === "internal").forEach(r => {
    const name = r.kind === "shortlist" ? `${r.p.name} 打样候选名单` : r.kind === "final" ? `${r.p.name} 定商建议` : `设计稿 V${r.d.ver}（${pkg(r.d.pkg).name}）`;
    todos.push(["amber", "待内审", name, "审核中心"]);
  });
  revs.filter(r => r.stage === "client").forEach(r => {
    const p = r.p || pkg(r.d.pkg);
    const c = client(prj(p.prj)?.client);
    todos.push(["skyc", "等待客户", `设计稿 V${r.d.ver}（${p.name}）· ${c ? c.name : ""}`, "客户处理"]);
  });
  designs.filter(d => d.status === "changes").forEach(d => {
    const pk = pkg(d.pkg);
    const latest = designsOf(d.pkg).slice(-1)[0];
    if (latest && latest.id === d.id) todos.push(["amber", "待改稿", `${pk.name} 设计稿（客户已提意见）`, "项目详情"]);
  });

  const mgr = state.role === "management";
  el.innerHTML = `
    <div class="tile-grid">
      <div class="tile"><span>进行中项目</span><b>${projects.length}</b><div class="bar"><i style="--p:72%"></i></div><p>覆盖 ${clients.length} 个客户</p></div>
      <div class="tile"><span>待选打样候选</span><b>${nMatching}</b><div class="bar"><i style="--p:${nMatching * 18}%"></i></div><p>设计已定稿，待匹配候选</p></div>
      <div class="tile ${nInternal ? "warn" : ""}"><span>待内审</span><b>${nInternal}</b><div class="bar"><i style="--p:${nInternal * 25}%"></i></div><p>打样名单 / 定商建议 / 设计稿</p></div>
      <div class="tile"><span>待客户确认</span><b>${nClient}</b><div class="bar soft"><i style="--p:${nClient * 25}%"></i></div><p>设计稿定稿（定商无需客户确认）</p></div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Pipeline</p><h3>项目阶段分布</h3></div>
        <button class="text-link" data-action="jump" data-jump="projects">查看项目列表</button></div>
      <div class="pipe-grid">
        ${STAGES.map(([k, label]) => `<div class="${counts[k] && (k === "design" || k === "sampling") ? "hot" : ""}"><span>${label}</span><b>${counts[k]}</b><em>${{received:"待建档拆解",structuring:"结构化中",design:"设计与定稿",sampling:"选候选+打样",decide:"比样定商",confirmed:"待大货(P2)"}[k]}</em></div>`).join("")}
      </div>
    </section>

    <div class="dash-grid">
      <section class="panel">
        <div class="panel-head"><div><p class="label">${mgr ? "Attention" : "My Tasks"}</p><h3>${mgr ? "需要关注" : "我的待办"}</h3></div></div>
        <div class="todo-list">
          ${todos.length ? todos.map(t => `
            <div class="todo-item"><span class="chip ${t[0]}">${t[1]}</span><b>${t[2]}</b><span>${t[3]}</span></div>`).join("") : `<div class="empty">暂无待办</div>`}
        </div>
        ${mgr ? `<p class="muted tight">高风险供应商使用中：${suppliers.filter(s => s.risk === "高" && ["active","qualified"].includes(s.status)).length} 家 · 暂停/淘汰 ${suppliers.filter(s => ["suspended","eliminated"].includes(s.status)).length} 家</p>` : ""}
      </section>
      <section class="panel span-2">
        <div class="panel-head"><div><p class="label">Activity</p><h3>最近动态</h3></div></div>
        <div class="feed">
          ${feed.slice(0, 8).map(f => `<div class="feed-item"><time>${f.t}</time><p>${f.txt}</p></div>`).join("")}
        </div>
      </section>
    </div>`;
}

function dashClient() {
  const cid = ROLES.client.clientId;
  const myPrjs = projects.filter(p => p.client === cid);
  const revs = reviewsForRole();
  const provided = suppliers.filter(s => s.source.type === "client" && s.source.client === cid);
  const cooperating = new Set();
  myPrjs.forEach(p => pkgsOf(p.id).forEach(x => x.confirmed.forEach(id => cooperating.add(id))));

  return `
    <div class="tile-grid">
      <div class="tile"><span>我的项目</span><b>${myPrjs.length}</b><div class="bar"><i style="--p:60%"></i></div><p>进行中的合作项目</p></div>
      <div class="tile ${revs.length ? "warn" : ""}"><span>待我确认</span><b>${revs.length}</b><div class="bar"><i style="--p:${revs.length * 30}%"></i></div><p>设计稿定稿确认</p></div>
      <div class="tile"><span>我提供的供应商</span><b>${provided.length}</b><div class="bar soft"><i style="--p:${provided.length * 30}%"></i></div><p>全量可见，含准入中</p></div>
      <div class="tile"><span>正在合作供应商</span><b>${cooperating.size}</b><div class="bar good"><i style="--p:${cooperating.size * 25}%"></i></div><p>为我的项目服务中</p></div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Pending Confirmation</p><h3>待您确认（仅设计稿）</h3></div></div>
      ${revs.length ? revs.map(r => {
        const d = r.d, p = pkg(d.pkg);
        return `<div class="confirm-card"><h4>设计稿 V${d.ver} · ${p.name}</h4>
          <p>${prj(p.prj).name} · 设计师 ${d.designer} · ${d.date} 提交</p>
          <p class="muted tight">请在右侧审核中心确认定稿（定稿后进入打样候选匹配），或提出修改意见。</p></div>`;
      }).join("") : `<div class="empty">暂无待确认事项</div>`}
      <p class="muted tight">您只需确认设计稿——合作供应商由 Eastlink 依据打样比样确定并同步结果，无需您二次确认。</p>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Decision Sync</p><h3>定商结果通知</h3></div></div>
      ${myPrjs.flatMap(pr0 => pkgsOf(pr0.id).filter(x => x.status === "confirmed")).map(x =>
        `<div class="ri-line"><b>${x.name} → ${x.confirmed.map(id => sup(id).name).join("、")}</b><span class="muted">${prj(x.prj).name} · 依据打样比样确定 · 质量保障见「质量控制」</span></div>`
      ).join("") || `<div class="empty">暂无已确认合作的需求包</div>`}
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Brand Standards</p><h3>品牌规范托管（您提供 · Eastlink 执行）</h3></div></div>
      <div class="chip-row">
        <span class="chip blue">品牌智能档案</span><span class="chip blue">材料与色彩资产库</span>
        <span class="chip blue">合规验厂标准</span><span class="chip blue">Brief 拆解模板</span>
      </div>
      <p class="muted tight">您的品牌规范细则（视觉禁区、Pantone 色卡与色差要求、认可/禁用材料、验厂红线与测试标准）已结构化托管——拆解、设计、匹配与质量管控全程按此执行；规范更新请随 Brief 或邮件同步给项目 Owner。</p>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">My Projects</p><h3>我的项目</h3></div>
        <button class="text-link" data-action="jump" data-jump="projects">查看全部</button></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>项目</th><th>阶段</th><th>需求包</th><th>上市</th></tr></thead>
        <tbody>${myPrjs.map(p => {
          const ps = pkgsOf(p.id);
          return `<tr class="row-click" data-action="open-prj" data-prj="${p.id}"><td><b>${p.name}</b></td><td>${stageTag(deriveStage(p))}</td><td>${ps.filter(x => x.status === "confirmed").length}/${ps.length} 已确认</td><td>${p.launch}</td></tr>`;
        }).join("")}</tbody>
      </table></div>
    </section>`;
}

function dashSupplier() {
  const sid = ROLES.supplier.supplierId;
  const me = sup(sid);
  const myTasks = samples.filter(s => s.supplier === sid);
  const myPkgs = packages.filter(p => p.confirmed.includes(sid) || myTasks.some(s => s.pkg === p.id));

  const taskCard = s => {
    const pk = pkg(s.pkg);
    const pr = prj(pk.prj);
    const d = designsOf(pk.id).filter(x => x.status === "approved").slice(-1)[0];
    const st = SAMPLE_STATUS[s.status];
    let act = "";
    if (s.status === "sampling") act = `<button class="primary mini" data-action="sample-advance" data-sample="${s.id}">标记已寄样</button>`;
    else if (s.status === "delivered" || s.status === "reviewing") act = `<span class="muted" style="font-size:11.5px">等待 Eastlink 评审</span>`;
    else if (s.status === "scored" && s.score) act = `<span class="chip green">我的样品综合 ${Math.round((s.score.质量 + s.score.工艺还原 + s.score.报价) / 3)} 分</span>`;
    return `<div class="samp-task">
      <div${d ? ` class="thumb click-prev" data-action="file-open" data-kind="design" data-id="${d.id}"` : ` class="thumb"`} style="${thumbBg(d)}"></div>
      <div class="st-body">
        <h5>${pk.name} · 打样任务</h5>
        <p class="muted">${pr.name} · 设计稿 ${d ? "V" + d.ver + " 定稿" : "待定稿"} · 截止 ${s.due}</p>
        <p class="muted">要求：${pk.procs.join(" / ")} · 认证 ${pk.certs.join(" / ")} · 目标价 ${pk.priceBand}</p>
        <p class="muted">出样 SKU（${(pk.skuList || []).length} 个，逐 SKU 评分）：${(pk.skuList || []).map(k => k.id).join(" / ") || "—"}</p>
        <div class="chip-row"><span class="tag ${st.tag}">${st.label}</span>${act}</div>
      </div>
    </div>`;
  };

  const skuTable = pk => {
    if (!pk.skuList || !pk.skuList.length) return "";
    return `<div style="margin-top:12px"><b style="font-size:13px">${pk.name} · ${prj(pk.prj).name}</b>
      <div class="table-wrap" style="margin-top:6px"><table class="data-table">
        <thead><tr><th>SKU</th><th>产品</th><th>设计稿</th><th>样品状态</th><th>测试</th><th>下一节点</th></tr></thead>
        <tbody>${pk.skuList.map(k => `<tr><td><b>${k.id}</b></td><td>${k.name}</td><td>${k.design}</td><td>${k.sample}</td><td>${k.test}</td><td>${k.next}</td></tr>`).join("")}</tbody>
      </table></div></div>`;
  };

  return `
    <section class="panel">
      <div class="panel-head"><div><p class="label">My Profile</p><h3>${me.name} · 我的档案</h3></div>
        <span class="tag ${SUP_STATUS[me.status].tag}">${SUP_STATUS[me.status].label}</span></div>
      <div class="sec-grid">
        <div class="sec"><b>基础信息</b>
          <span>编号：<strong>${me.id}</strong> · ${me.type} · ${me.region}</span>
          <span>主营：${me.cats.join(" / ")} · 联系人：${me.contact}</span></div>
        <div class="sec"><b>能力与认证</b>
          <span>工艺：${me.procs.join(" / ")}</span><span>认证：${me.certs.join(" / ")}</span>
          <span>月产能：${(me.capacity / 10000).toFixed(0)} 万件</span></div>
        <div class="sec"><b>我的表现</b>
          <span>质量通过率：<strong>${me.quality}%</strong> · 交付准时率：<strong>${me.onTime}%</strong></span>
          <span>平均交期：${me.lead} 天 · 打样 ${me.sample} 天</span></div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Sampling Tasks</p><h3>我的打样任务（${myTasks.length}）</h3></div></div>
      ${myTasks.length ? myTasks.map(taskCard).join("") : `<div class="empty">暂无打样任务</div>`}
      <p class="muted tight">按定稿设计打样，寄样后由 Eastlink 评审比样；您看不到其他候选与评分对比。</p>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">My SKUs</p><h3>我的合作 SKU 明细</h3></div></div>
      ${myPkgs.some(pk => pk.skuList && pk.skuList.length) ? myPkgs.map(skuTable).join("") : `<div class="empty">暂无 SKU 明细</div>`}
      <p class="muted tight">P2 规划：供应商门户支持在线接任务、报价、上传打样与出货资料，SKU 状态实时同步。</p>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Quality & CAP</p><h3>质量与整改</h3></div></div>
      <div class="chip-row">${(me.audits || []).length ? me.audits.map(a => `<span class="chip ${AUDIT_CHIP[a.status] || ""}">${a.scheme} ${a.grade} · ${a.status}${a.valid !== "—" ? ` · 有效期 ${a.valid}` : ""}</span>`).join("") : `<span class="chip outline">暂无验厂记录</span>`}</div>
      ${(me.caps || []).filter(c => c.status !== "已关闭").length
        ? `<div style="margin-top:8px">${me.caps.filter(c => c.status !== "已关闭").map(c => `<div class="ri-line"><b>${c.id} · ${c.src}（${c.sev}）</b><span class="muted">${c.status} · 截止 ${c.due}</span></div>`).join("")}</div>`
        : `<p class="muted tight">当前无开放整改项</p>`}
      <p class="muted tight">验货/测试/验厂发现将生成 CAP 并要求限期整改；P2 供应商门户支持在线提交整改证据。</p>
    </section>`;
}

/* ---------- 项目管理 ---------- */

function renderProjects() {
  const el = $("view-projects");
  if (state.prjOpen) { el.innerHTML = projectDetail(state.prjOpen); return; }

  const isClient = state.role === "client";
  const list = isClient ? projects.filter(p => p.client === ROLES.client.clientId) : projects;
  el.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Portfolio</p><h3>项目列表</h3></div>
        ${state.role === "sales" ? `<button class="primary mini" data-action="brief-new">+ 新建项目 · 接收 Brief</button>` : ""}</div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>项目</th><th>客户</th><th>阶段</th><th>需求包</th><th>负责人</th><th>上市</th><th></th></tr></thead>
        <tbody>
          ${list.map(p => {
            const ps = pkgsOf(p.id);
            const c = client(p.client);
            return `<tr class="row-click" data-action="open-prj" data-prj="${p.id}">
              <td><b>${p.name}</b><br><span class="muted">${p.id} · Brief ${p.briefVer}</span></td>
              <td>${c ? c.name : `<span class="chip amber">待建档</span>`}</td>
              <td>${stageTag(deriveStage(p))}</td>
              <td>${ps.length ? `${ps.filter(x => x.status === "confirmed").length}/${ps.length} 已确认` : "—"}</td>
              <td>${p.owner}</td><td>${p.launch}</td>
              <td><span class="text-link">进入 →</span></td></tr>`;
          }).join("")}
        </tbody></table></div>
    </section>`;
}

function projectDetail(prjId) {
  const p = prj(prjId);
  const c = client(p.client);
  const stage = deriveStage(p);
  const ps = pkgsOf(prjId);
  const stageIdx = STAGES.findIndex(([k]) => k === stage);
  const isSales = state.role === "sales";
  const isClient = state.role === "client";
  const ds = designs.filter(d => pkg(d.pkg)?.prj === prjId);

  return `
    <button class="ghost mini" data-action="back-prj">← 返回项目列表</button>
    <div class="panel" style="margin-top:12px">
      <div class="prj-head">
        <div>
          <p class="label">${p.id} · Brief ${p.briefVer} · <button class="text-link" data-action="file-open" data-kind="brief" data-prj="${p.id}" title="点击预览 Brief 文件">${p.briefFile}</button></p>
          <h2>${p.name}</h2>
          <p class="muted">客户：${c ? c.name : "待建档"} · Owner：${p.owner} · 上市：${p.launch}</p>
        </div>
        ${stageTag(stage)}
      </div>
      <div class="stepper">
        ${STAGES.map(([k, label], i) => `<div class="step ${i < stageIdx ? "done" : i === stageIdx ? "now" : ""}"><b>${label}</b>${i === stageIdx ? "当前阶段" : ""}</div>`).join("")}
      </div>
      <div class="kv-grid">
        ${Object.entries(p.brief).map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join("")}
      </div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Requirement Packages</p><h3>需求包（Brief 拆解结果 · 流转最小单位）</h3></div></div>
      ${ps.length ? `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>需求包</th><th>品类</th><th>SKU</th><th>数量</th><th>认证要求</th><th>状态</th><th>设计 / 候选 / 合作</th><th></th></tr></thead>
        <tbody>${ps.map(x => {
          const st = PKG_STATUS[x.status];
          const latestD = designsOf(x.id).slice(-1)[0];
          let supCol = "—";
          if (x.status === "design") supCol = latestD ? `<span class="muted">设计 V${latestD.ver} · ${DESIGN_STATUS[latestD.status].label}</span>` : `<span class="muted">设计排期中</span>`;
          else if (x.status === "confirmed") supCol = x.confirmed.map(id => `<span class="chip green">${sup(id).name}</span>`).join(" ");
          else if (x.status === "final_internal") supCol = isClient ? `<span class="muted">比样定商中</span>` : `<span class="chip">建议：${sup(x.suggestSup)?.name || "—"}</span>`;
          else if (["shortlist_review", "sampling"].includes(x.status)) supCol = isClient ? `<span class="muted">打样进行中</span>` : x.shortlist.map(id => `<span class="chip">${sup(id).name}</span>`).join(" ");
          else if (isClient) supCol = `<span class="muted">内部筹备中</span>`;
          let act = "";
          if (isSales) {
            if (x.status === "matching") act = `<button class="primary mini" data-action="goto-match" data-pkg="${x.id}">选打样候选</button>`;
            else if (x.status === "design") act = `<span class="muted">设计稿区处理</span>`;
            else if (x.status === "sampling") act = `<span class="muted">打样与比样区</span>`;
            else if (["shortlist_review", "final_internal"].includes(x.status)) act = `<span class="muted">审核中心处理</span>`;
          }
          const hasSku = x.skuList && x.skuList.length;
          const open = hasSku && state.skuOpen[x.id];
          const skuCell = hasSku
            ? `<button class="text-link sku-btn" data-action="sku-toggle" data-pkg="${x.id}">${x.sku} 个 ${open ? "▴" : "▾"}</button>`
            : `${x.sku} 个`;
          const skuRow = open ? `<tr class="sku-row"><td colspan="8"><div class="sku-box">
              <p class="sku-cap">SKU 明细 · 代表条目 ${x.skuList.length} 条（共 ${x.sku} 个 SKU，Demo 列举）· 规格书 PSF 由平台生成、客户确认；质量要求 PPA 随定稿前置定义</p>
              <table><thead><tr><th>SKU 编号</th><th>名称</th><th>规格 / 材质</th><th>结构</th><th>数量</th><th>目标单价</th><th>状态</th><th>PSF</th></tr></thead>
              <tbody>${x.skuList.map((k, ki) => `<tr><td><b>${k.id}</b></td><td>${k.name}</td><td>${k.spec || "待补充"}</td>
                <td>${k.struct === "新结构" ? `<span class="chip amber" title="先出结构样 / 3D 样验证结构，再投入全开发">新结构 · 结构样先行</span>` : k.struct === "待判定" ? `<span class="chip outline">待判定</span>` : `<span class="chip">成熟结构</span>`}</td>
                <td>${k.qty || "待分配"}</td><td>${k.price || "见价格带"}</td>
                <td><span class="chip ${{ "已确认": "green", "打样中": "skyc", "定稿": "blue", "设计中": "", "待设计": "outline" }[k.status] ?? ""}">${k.status || "—"}</span></td>
                <td><button class="text-link" data-action="file-open" data-kind="psf" data-pkg="${x.id}" data-idx="${ki}" title="查看该 SKU 的产品规格书（PSF）">查看</button></td></tr>`).join("")}</tbody></table>
            </div></td></tr>` : "";
          return `<tr>
            <td><b>${x.name}</b>${x.returnNote ? `<br><span class="chip red">有退回意见</span>` : ""}</td>
            <td>${x.cat}</td><td>${skuCell}</td><td>${x.qtyLabel}</td>
            <td>${x.certs.join(" / ")}</td>
            <td><span class="tag ${st.tag}">${st.label}</span></td>
            <td>${supCol}</td><td>${act}</td></tr>${skuRow}`;
        }).join("")}</tbody></table></div>` : `<div class="empty">Brief 拆解中，需求包尚未生成${isSales ? " —— 拆解完成后先设计，定稿后再匹配打样候选" : ""}</div>`}
      ${ps.some(x => x.returnNote) ? ps.filter(x => x.returnNote).map(x => `<div class="return-note tight">【${x.name}】${x.returnNote}</div>`).join("") : ""}
    </section>

    ${(!isClient && ps.some(x => samplesOf(x.id).length)) ? `<section class="panel">
      <div class="panel-head"><div><p class="label">Sampling & Compare</p><h3>打样与比样（候选按定稿设计出样 → 评分 → 定商建议）</h3></div></div>
      ${ps.filter(x => samplesOf(x.id).length).map(x => samplingCard(x)).join("")}
    </section>` : ""}

    ${ds.length ? `<section class="panel">
      <div class="panel-head"><div><p class="label">Design Drafts</p><h3>设计稿（挂在需求包下 · 定稿后进入打样匹配）</h3></div></div>
      <div class="design-wall">
        ${ds.sort((a, b) => a.pkg.localeCompare(b.pkg) || a.ver - b.ver).map(d => designCard(d)).join("")}
      </div>
    </section>` : ""}

    <section class="panel">
      <div class="panel-head"><div><p class="label">Timeline</p><h3>项目动态</h3></div></div>
      <div class="timeline">${[...p.timeline].reverse().map(t => `<div class="tl-item"><time>${t.t}</time><p>${t.txt}</p></div>`).join("")}</div>
    </section>`;
}

function samplingCard(x) {
  const ss = samplesOf(x.id);
  const allScored = ss.length && ss.every(s => s.score);
  const isSales = state.role === "sales";
  const rows = ss.map(s => {
    const su = sup(s.supplier);
    const st = SAMPLE_STATUS[s.status];
    const isWin = x.suggestSup === s.supplier && ["final_internal", "confirmed"].includes(x.status);
    let act = "";
    if (isSales) {
      if (s.status === "sampling") act = `<button class="ghost mini" data-action="sample-advance" data-sample="${s.id}">标记已寄样</button>`;
      else if (s.status === "delivered") act = `<button class="ghost mini" data-action="sample-advance" data-sample="${s.id}">开始评审</button>`;
      else if (s.status === "reviewing") act = `<button class="primary mini" data-action="sample-score" data-sample="${s.id}">录入评分（演示）</button>`;
    }
    const scores = s.score ? ["质量", "工艺还原", "报价"].map(k =>
      `<div class="score-line"><em>${k}</em><div class="bar ${s.score[k] >= 90 ? "good" : ""}"><i style="--p:${s.score[k]}%"></i></div><strong>${s.score[k]}</strong></div>`).join("")
      : `<span class="muted" style="font-size:11.5px">评分待录入 · 出样 SKU：${(x.skuList || []).map(k => k.id).join(" / ") || "—"}</span>`;
    const skuOpen = s.skuScores && s.skuScores.length && state.sampSku[s.id];
    const skuBtn = s.skuScores && s.skuScores.length
      ? `<button class="text-link" data-action="samp-sku-toggle" data-sample="${s.id}">SKU 明细 ${skuOpen ? "▴" : "▾"}</button>` : "";
    const skuTbl = skuOpen ? `<div class="sku-box" style="margin-top:8px"><table>
        <thead><tr><th>SKU</th><th>质量</th><th>工艺还原</th><th>报价</th><th>综合</th></tr></thead>
        <tbody>${s.skuScores.map(k => {
          const a = Math.round((k.质量 + k.工艺还原 + k.报价) / 3);
          return `<tr><td><b>${k.sku}</b></td><td>${k.质量}</td><td>${k.工艺还原}</td><td>${k.报价}</td><td><b>${a}</b></td></tr>`;
        }).join("")}</tbody></table>
      <p class="muted" style="font-size:10.5px;margin-top:4px">综合分为各 SKU 均值；单 SKU 异常可作为换选 / 分单依据（P2）。</p></div>` : "";
    return `<div class="samp-row ${isWin ? "win" : ""}">
      <div class="sr-head">
        <b>${su.name}</b>${isWin ? `<span class="chip green">建议定商</span>` : ""}
        <span class="tag ${st.tag}">${st.label}</span>
        <span class="muted" style="font-size:11px">截止 ${s.due}${s.note ? ` · ${s.note}` : ""}</span>
        ${skuBtn}${act}
      </div>
      <div class="sr-scores">${scores}</div>
      ${skuTbl}
    </div>`;
  }).join("");
  let foot = "";
  if (isSales && x.status === "sampling" && allScored) {
    foot = `<button class="primary mini" data-action="gen-final" data-pkg="${x.id}">生成定商建议（按评分）</button>`;
  } else if (x.status === "final_internal") {
    foot = `<span class="muted" style="font-size:12px">定商建议已生成 → 右侧审核中心内审（通过即确认合作，结果同步客户）</span>`;
  } else if (x.status === "confirmed") {
    foot = `<span class="chip green">已确认合作：${x.confirmed.map(id => sup(id).name).join("、")}</span>`;
  }
  return `<div class="samp-card">
    <div class="sc-head"><b>${x.name}</b><span class="tag ${PKG_STATUS[x.status].tag}">${PKG_STATUS[x.status].label}</span></div>
    ${x.returnNote ? `<div class="return-note" style="margin-bottom:8px">${x.returnNote}</div>` : ""}
    ${rows}
    <div class="sc-foot">${foot}</div>
  </div>`;
}

function designCard(d) {
  const p = pkg(d.pkg);
  const st = DESIGN_STATUS[d.status];
  const isSales = state.role === "sales";
  const isClient = state.role === "client" && prj(p.prj)?.client === ROLES.client.clientId;
  const ds = designsOf(d.pkg);
  const isLatest = d.ver === ds[ds.length - 1].ver;

  const cov = d.skuMap || [];
  const covDone = cov.filter(k => k.status === "已出稿").length;
  const covFull = !cov.length || covDone === cov.length;

  let actions = "";
  if (isSales && d.status === "internal_review") {
    actions = covFull
      ? `<button class="primary mini" data-action="design-pass" data-design="${d.id}">内审通过 → 提交客户</button>
         <button class="ghost mini" data-action="reason-open" data-rt="design-return" data-rid="${d.id}">退回</button>`
      : `<button class="primary mini" disabled title="版本内全部 SKU 出稿后才可内审">内审通过（SKU 未全出稿）</button>
         <button class="ghost mini" data-action="reason-open" data-rt="design-return" data-rid="${d.id}">退回</button>`;
  } else if (isSales && d.status === "changes" && isLatest) {
    actions = `<button class="primary mini" data-action="upload-version" data-pkg="${d.pkg}">上传新版本 V${d.ver + 1}</button>`;
  } else if (isSales && d.status === "client_review") {
    actions = `<span class="muted" style="font-size:11.5px">等待客户确认</span>`;
  } else if (isClient && d.status === "client_review") {
    actions = `<button class="primary mini" data-action="design-approve" data-design="${d.id}">确认定稿</button>
               <button class="ghost mini" data-action="reason-open" data-rt="design-changes" data-rid="${d.id}">提修改意见</button>`;
  }
  const reasonBox = state.reasonFor && !state.reasonFor.inReview && ((state.reasonFor.t === "design-return" || state.reasonFor.t === "design-changes") && state.reasonFor.id === d.id) ? reasonBoxHtml() : "";

  return `<div class="design-card">
    <div class="thumb click-prev" data-action="file-open" data-kind="design" data-id="${d.id}" data-ver="V${d.ver}" style="${thumbBg(d)}"></div>
    <div class="d-body">
      <h5>${p.name}</h5>
      <div class="d-meta">设计师 ${d.designer} · ${d.date} · <span class="tag ${st.tag}">${st.label}</span></div>
      ${cov.length ? `<div class="d-skus">
        <span>SKU 出稿 ${covDone}/${cov.length}</span>
        <div class="chip-row">${cov.map(k => `<span class="chip ${k.status === "已出稿" ? "green" : k.status === "修改中" ? "amber" : "outline"}" title="${k.note || k.status}">${k.sku}</span>`).join("")}</div>
      </div>` : ""}
      ${d.note ? `<div class="d-note">${d.note}</div>` : ""}
      <div class="d-actions">${actions}</div>
      ${reasonBox}
    </div></div>`;
}

/* ---------- 匹配工作台 ---------- */

function renderMatching() {
  const el = $("view-matching");
  const selectable = packages.filter(x => x.prj === "PRJ-2601" || x.status === "matching");
  const cur = pkg(state.pkgSel) && selectable.some(x => x.id === state.pkgSel) ? pkg(state.pkgSel) : selectable[0];
  if (!cur) { el.innerHTML = `<div class="empty">暂无待匹配的需求包</div>`; return; }
  state.pkgSel = cur.id;
  const pr = prj(cur.prj);
  const c = client(pr.client);
  const locked = cur.status !== "matching";

  el.innerHTML = `
    <div class="pkg-pills">
      ${selectable.map(x => `<button class="pkg-pill ${x.id === cur.id ? "active" : ""}" data-action="pkg-sel" data-pkg="${x.id}">${x.name}<small>${PKG_STATUS[x.status].label}</small></button>`).join("")}
    </div>

    ${cur.returnNote ? `<div class="return-note">${cur.returnNote} —— 请调整打样候选后重新提交。</div>` : ""}
    ${locked ? `<div class="panel"><p class="muted">${cur.status === "design"
      ? `该需求包处于<span class="tag onboarding">设计中</span>，设计定稿后进入打样候选匹配（先设计 → 打样 → 定商）。`
      : `该需求包当前状态：<span class="tag ${PKG_STATUS[cur.status].tag}">${PKG_STATUS[cur.status].label}</span>，打样候选已锁定：${cur.shortlist.map(id => `<span class="chip blue">${sup(id).name}</span>`).join(" ")}。${cur.status === "shortlist_review" ? "请到右侧审核中心内审。" : "打样与比样进度见项目详情。"}`}</p></div>` : ""}

    <div class="match-grid">
      <section class="panel" style="margin-bottom:0">
        <div class="panel-head"><div><p class="label">Requirement</p><h3>${cur.name}</h3></div>
          <span class="chip blue">${pr.name} · ${c ? c.name : ""}</span></div>
        <div class="req-facts">
          <div class="kv"><span>品类</span><b>${cur.cat}</b></div>
          <div class="kv"><span>SKU 数</span><b>${cur.sku}</b></div>
          <div class="kv"><span>需求量</span><b>${cur.qtyLabel}</b></div>
          <div class="kv"><span>目标价格带</span><b>${cur.priceBand}</b></div>
          <div class="kv"><span>工艺要求（硬性门槛）</span><b>${cur.procs.join(" / ")}</b></div>
          <div class="kv"><span>认证要求</span><b>${cur.certs.join(" / ")}</b></div>
          <div class="kv"><span>交期上限</span><b>${cur.leadLimit} 天</b></div>
          ${c && c.compliance ? `<div class="kv"><span>客户验厂红线</span><b>${c.compliance.auditCerts.join(" / ")}</b></div>` : `<div class="kv"><span>需求包状态</span><b>${PKG_STATUS[cur.status].label}</b></div>`}
        </div>
        ${cur.skuList && cur.skuList.length ? `<p class="muted tight">含：${cur.skuList.slice(0, 3).map(k => k.name).join("、")}${cur.skuList.length > 3 ? " 等" : ""} —— SKU 明细见项目详情</p>` : ""}
        ${(() => {
          const mats = c && c.brand && c.brand.matlib ? c.brand.matlib.materials.filter(m => m.cats.includes(cur.cat)) : [];
          return mats.length ? `<p class="muted tight">客户材料基线：${mats.map(m => m.name).join("、")}（详见客户管理 · 品牌智能）</p>` : "";
        })()}
      </section>

      <section class="panel" style="margin-bottom:0">
        <div class="panel-head"><div><p class="label">Gates & Weights</p><h3>硬性门槛 + 加权排序</h3></div>
          <button class="ghost mini" data-action="w-reset">恢复默认权重</button></div>
        <div class="gate-box">
          <p class="gate-title">硬性门槛 —— 过不了直接进排除名单，不参与打分</p>
          <div class="gate-row fixed">✓ 准入状态：已准入 / 合作中</div>
          <div class="gate-row fixed">✓ 品类覆盖：主营或兼营覆盖需求品类</div>
          <div class="gate-row fixed">✓ 工艺全覆盖：缺任一需求工艺即排除（做不了就是做不了）</div>
          <label class="toggle-row gate-row"><input type="checkbox" data-action="gate-toggle" data-gate="cert" ${state.gates.cert ? "checked" : ""}>认证全齐设为硬性 <span class="gate-hint">默认走评分——打样期间可补办认证</span></label>
          <label class="toggle-row gate-row"><input type="checkbox" data-action="gate-toggle" data-gate="redline" ${state.gates.redline ? "checked" : ""}>客户验厂红线设为硬性 <span class="gate-hint">默认红色警示——打样可并行补审，下单前须完成</span></label>
        </div>
        <p class="gate-title" style="margin:12px 0 6px">加权排序（8 维 · 在过了门槛的候选里比高低）</p>
        ${DIMS.map(d => `
          <div class="w-row">
            <label>${d.name}</label>
            <input type="range" min="0" max="30" step="1" value="${state.weights[d.key]}" data-action="w-slide" data-dim="${d.key}">
            <b id="wv-${d.key}">${state.weights[d.key]}</b>
          </div>`).join("")}
        <div class="w-total"><span>权重合计 <b id="wSum">${DIMS.reduce((a, d) => a + state.weights[d.key], 0)}</b>（按占比归一化计算）</span>
          <label class="toggle-row"><input type="checkbox" data-action="pin-toggle" ${state.pinClient ? "checked" : ""}>客户体系供应商置顶</label></div>
      </section>
    </div>

    <section class="panel" style="margin-top:16px">
      <div class="panel-head"><div><p class="label">Matching Funnel</p><h3>匹配漏斗（每一步淘汰了谁、为什么，全程透明）</h3></div></div>
      <div id="funnelBox"></div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Candidates</p><h3>候选供应商（按综合匹配分排序）</h3></div></div>
      <div class="cand-list" id="candList"></div>
    </section>

    <div class="shortlist-bar" id="shortlistBar"></div>`;

  renderCandidates();
}

function renderCandidates() {
  const cur = pkg(state.pkgSel);
  if (!cur) return;
  const locked = cur.status !== "matching";
  const { list, out } = rankedCandidates(cur);
  const projClientId = prj(cur.prj)?.client;

  const funnel = $("funnelBox");
  if (funnel) {
    const nStatus = out.filter(o => o.gate === "status").length;
    const nCat = out.filter(o => o.gate === "cat").length;
    const nProc = out.filter(o => o.gate === "proc").length;
    const nGate = out.filter(o => o.gate === "cert" || o.gate === "redline").length;
    const afterStatus = suppliers.length - nStatus;
    const afterCat = afterStatus - nCat;
    const afterProc = afterCat - nProc;
    funnel.innerHTML = `
      <div class="funnel">
        <div class="fstep"><span>供应商池</span><b>${suppliers.length}</b><em>全部来源</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>准入合格</span><b>${afterStatus}</b><em>排除 ${nStatus}</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>品类匹配</span><b>${afterCat}</b><em>排除 ${nCat}</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>工艺达标</span><b>${afterProc}</b><em>排除 ${nProc} · 硬门槛</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>候选排序</span><b>${list.length}</b><em>${nGate ? `门槛开关排除 ${nGate}` : "8 维加权"}</em></div>
        <div class="farrow">→</div>
        <div class="fstep hot"><span>已选打样候选</span><b>${cur.shortlist.length}</b><em>人工勾选</em></div>
      </div>
      <details class="excluded-box">
        <summary>查看被排除的 ${out.length} 家供应商及原因</summary>
        <div class="excluded-list">
          ${out.map(o => `<div><b>${o.s.name}</b><span class="tag ${SUP_STATUS[o.s.status].tag}">${SUP_STATUS[o.s.status].label}</span>${o.s.source.type === "client" ? sourceTag(o.s) : ""}<span class="why">${o.why}</span></div>`).join("")}
        </div>
      </details>`;
  }

  const box = $("candList");
  if (box) {
    box.innerHTML = list.length ? list.map((x, i) => {
      const picked = cur.shortlist.includes(x.s.id);
      const isPinned = state.pinClient && x.s.source.type === "client" && x.s.source.client === projClientId;
      return `<div class="cand-card ${picked ? "picked" : ""}">
        <div class="cand-head">
          <div class="cand-rank">${i + 1}</div>
          <div><h4>${x.s.name}</h4><div class="meta">${x.s.type} · ${x.s.region} · 月产能 ${(x.s.capacity / 10000).toFixed(0)} 万件 · 打样 ${x.s.sample} 天</div></div>
          ${sourceTag(x.s)}${isPinned ? `<span class="chip skyc">置顶</span>` : ""}
          <div class="cand-score"><b>${x.total}</b><span>综合匹配分</span></div>
        </div>
        <div class="dim-grid">
          ${DIMS.map(d => `<div class="dim"><label>${d.name}</label><div class="bar ${x.sc[d.key] >= 90 ? "good" : ""}"><i style="--p:${x.sc[d.key]}%"></i></div><b>${x.sc[d.key]}</b></div>`).join("")}
        </div>
        <div class="reason-row">
          ${(x.rs.red || []).map(r => `<span class="chip red">⛔ ${r}</span>`).join("")}
          ${x.rs.good.map(g => `<span class="chip green">✓ ${g}</span>`).join("")}
          ${x.rs.warn.map(w => `<span class="chip amber">⚠ ${w}</span>`).join("")}
        </div>
        <div class="cand-foot">
          <span class="src">认证：${x.s.certs.join(" / ") || "—"} · 服务过：${x.s.served.join(" / ") || "—"}</span>
          ${!locked && state.role === "sales" ? `<button class="${picked ? "ghost" : "primary"} mini" data-action="pick" data-sup="${x.s.id}">${picked ? "移出候选" : "加入打样候选"}</button>` : ""}
        </div>
      </div>`;
    }).join("") : `<div class="empty">无符合硬性条件的候选供应商 —— 可考虑放宽条件或启动新供应商准入</div>`;
  }

  const bar = $("shortlistBar");
  if (bar) {
    if (state.role !== "sales") { bar.style.display = "none"; }
    else {
      bar.style.display = "";
      bar.innerHTML = `
        <span class="sl-label">打样候选名单（${cur.shortlist.length}）</span>
        ${cur.shortlist.map(id => `<span class="chip">${sup(id).name}</span>`).join("") || `<span class="note" style="width:auto">从上方候选中勾选 2–3 家进入打样比价</span>`}
        <button class="primary mini" data-action="submit-internal" data-pkg="${cur.id}" ${locked || !cur.shortlist.length ? "disabled" : ""}>${locked ? "已提交" : "提交内审 · 发打样邀请"}</button>
        <span class="note">内审通过后各家按定稿设计打样 → 按 SKU 评分比样 → 定商建议内审通过即确认合作（结果同步客户）；系统记录每一步依据。</span>`;
    }
  }
}

/* ---------- 客户管理 ---------- */

const secKV = obj => Object.entries(obj).map(([k, v]) => `<span>${k}：<strong>${v}</strong></span>`).join("");
const caseItems = (list, bad) => list && list.length
  ? list.map(x => `<div class="case ${bad ? "bad" : ""}"><b>${x.t}</b><span>${x.why}</span></div>`).join("")
  : `<span style="padding:4px 0">新客户 · 风格库整理中</span>`;

function renderClients() {
  const el = $("view-clients");
  const c = client(state.clientSel) || clients[0];
  state.clientSel = c.id;
  const myPrjs = projects.filter(p => p.client === c.id);
  const provided = suppliers.filter(s => s.source.type === "client" && s.source.client === c.id);
  const tab = state.clientTab;
  const b = c.brand;
  const pane = (id, html) => `<div class="c-tabpane ${tab === id ? "" : "hide"}">${html}</div>`;

  const basicPane = `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Client Profile</p><h3>${c.name} · 客户档案</h3></div></div>
      <div class="sec-grid">
        <div class="sec"><b>基本档案</b>
          <span>合作等级：<strong>${c.level}</strong></span><span>地区：${c.region}</span>
          <span>合作起始：${c.since}</span><span>年采购额：<strong>${c.annual}</strong></span>
          <span>联系人：${c.contact}</span></div>
        <div class="sec"><b>品牌偏好与标准</b>
          <span>${c.prefs}</span><span style="margin-top:6px">审核习惯：<strong>${c.habit}</strong></span></div>
        <div class="sec"><b>提供的供应商（${provided.length}）</b>
          ${provided.length ? provided.map(s => `<span><strong>${s.name}</strong> · <span class="tag ${SUP_STATUS[s.status].tag}">${SUP_STATUS[s.status].label}</span></span>`).join("") : "<span>无 —— 全部由 Eastlink 自主匹配</span>"}</div>
      </div>
    </section>`;

  const brandPane = b ? `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Brand Intelligence</p><h3>${c.name} · 品牌智能档案</h3></div>
        <span class="chip skyc">拆解与设计的背景输入</span></div>
      <div class="sec-grid">
        <div class="sec"><b>品牌定位</b>${secKV(b.positioning)}</div>
        <div class="sec"><b>视觉语言</b>
          <div class="swatch-row">${b.colors.map(x => `<span class="swatch"><i style="background:${x}"></i>${x}</span>`).join("")}</div>
          ${secKV({ "Logo": b.visual.logo, "字体": b.visual.font, "图形": b.visual.graphic, "包装": b.visual.packaging })}
          <span style="margin-top:6px">禁用规则：</span>
          <div class="chip-row">${b.visual.forbidden.map(x => `<span class="chip red">⛔ ${x}</span>`).join("")}</div></div>
        <div class="sec"><b>门店与陈列</b>
          <span>${b.store.display}</span>
          <span style="margin-top:4px">分品类价格带：</span>
          <div class="chip-row">${b.store.priceBands.map(x => `<span class="chip outline">${x.cat} ${x.band}</span>`).join("")}</div>
          <span>上新节奏：<strong>${b.store.rhythm}</strong></span></div>
        <div class="sec"><b>成功案例</b>${caseItems(b.history.wins, false)}</div>
        <div class="sec"><b>失败案例与雷区</b>${caseItems(b.history.fails, true)}</div>
        <div class="sec"><b>Brief 拆解模板</b>
          <div class="chip-row">${b.briefTemplate.fields.map(x => `<span class="chip skyc">${x}</span>`).join("")}</div>
          <span style="margin-top:6px">${b.briefTemplate.note}</span>
          <span>新建 Brief 选中该客户时自动带出此模板与价格带提示。</span></div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table">
          <thead><tr><th style="width:110px">环节</th><th style="width:150px">决策人</th><th>说明</th></tr></thead>
          <tbody>${b.decision.map(d => `<tr><td><b>${d.step}</b></td><td>${d.role}</td><td>${d.note}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="muted tight">怎么被平台使用：Brief 拆解自动带出品牌要求与价格带；设计稿内审对照视觉规范与禁用规则；P3：AI 依据档案预审设计稿。</p>
    </section>

    ${b.matlib ? `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Materials & Colors</p><h3>材料与色彩资产库</h3></div>
        <span class="chip outline">设计定稿与打样比样的物料基线</span></div>
      <div class="mc-grid">
        <div>
          <p class="mc-title">色彩体系（点击色卡预览）</p>
          ${b.matlib.colors.map((x, i) => `
            <div class="color-row click-prev" data-action="file-open" data-kind="color" data-client="${c.id}" data-idx="${i}" title="点击预览色卡">
              <i style="background:${x.hex}"></i>
              <div class="cr-body"><b>${x.name}</b><small>${x.pantone} · ${x.hex} · ${x.usage}</small></div>
              <span class="chip outline">${x.tol}</span>
            </div>`).join("")}
          <p class="muted tight">${b.matlib.colorNote}</p>
        </div>
        <div>
          <p class="mc-title">认可材料（点击查看材料卡）</p>
          <div class="sku-box"><table>
            <thead><tr><th>材料</th><th>规格</th><th>适用品类</th><th>认证要求</th><th>状态</th></tr></thead>
            <tbody>${b.matlib.materials.map((m, i) => `
              <tr class="click-prev" data-action="file-open" data-kind="mat" data-client="${c.id}" data-idx="${i}" title="点击查看材料卡">
                <td><b>${m.name}</b></td><td>${m.spec}</td><td>${m.cats.join(" / ")}</td><td>${m.cert}</td>
                <td><span class="chip ${{ "已认可": "green", "试用中": "amber", "禁用": "red" }[m.status] || ""}">${m.status}</span></td></tr>`).join("")}</tbody>
          </table></div>
          <div class="chip-row" style="margin-top:10px">${b.matlib.forbidden.map(x => `<span class="chip red" title="${x.why}">⛔ ${x.name}</span>`).join("")}</div>
          <p class="muted tight">可持续目标：${b.matlib.sustainability}（悬停禁用材料查看原因）</p>
        </div>
      </div>
      <p class="muted tight">怎么被平台使用：匹配需求卡按品类自动带出材料基线；设计稿色彩以色卡与色差要求校验；打样与验货对照材料卡执行。</p>
    </section>` : ""}

    <section class="panel">
      <div class="panel-head"><div><p class="label">Brand Assets</p><h3>品牌资产库（${b.assets.length}）</h3></div>
        <button class="ghost mini" data-action="brand-asset-add" data-client="${c.id}">+ 上传资产</button></div>
      <div class="asset-grid">
        ${b.assets.map((a, i) => `
          <div class="asset-card click-prev" data-action="file-open" data-kind="asset" data-client="${c.id}" data-idx="${i}" title="点击预览">
            <div class="a-icon" style="${a.file && a.file.src && a.file.mime.startsWith("image/") ? `background-image:url(${a.file.src});background-size:cover;background-position:center` : `background:linear-gradient(135deg, ${b.colors[0]} 0%, ${b.colors[0]} 55%, ${b.colors[1] || "#EEF2F9"} 55%)`}"></div>
            <div class="a-body">
              <h5>${a.name}</h5>
              <p>${a.ver} · ${a.date} · <span class="chip ${{ "规范": "blue", "视觉": "skyc", "素材": "green", "授权": "amber", "参考": "" }[a.type] || ""}">${a.type}</span></p>
            </div>
            <button class="text-link" data-action="brand-asset-ref" data-name="${a.name}">引用到项目</button>
          </div>`).join("")}
      </div>
      <p class="muted tight">点击资产卡可打开预览；「+ 上传资产」真实选取本机文件（仅存本页内存，刷新即清）。品牌资产在新建 Brief 和设计稿环节可直接引用。</p>
    </section>` : `<div class="empty">该客户暂无品牌档案</div>`;

  const compliancePane = c.compliance ? `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Compliance & Audit</p><h3>${c.name} · 合规与验厂标准</h3></div>
        <span class="chip red">红线自动参与匹配校验</span></div>
      <div class="sec-grid">
        <div class="sec"><b>验厂标准</b>
          <span>体系：<strong>${c.compliance.audit.scheme}</strong></span>
          <span>等级要求：${c.compliance.audit.grade}</span>
          <span>周期：${c.compliance.audit.cycle}</span>
          <span>过渡政策：${c.compliance.audit.transition}</span></div>
        <div class="sec"><b>社会责任要求</b><span>${c.compliance.social}</span></div>
        <div class="sec"><b>TCF 与文件要求</b><span>${c.compliance.docs}</span></div>
        <div class="sec"><b>验货标准</b><span>${c.compliance.inspection}</span></div>
        <div class="sec"><b>环保与可持续</b><span>${c.compliance.env}</span></div>
        <div class="sec"><b>一票否决红线</b>
          <div class="chip-row" style="margin-top:4px">${c.compliance.redlines.map(r => `<span class="chip red">⛔ ${r}</span>`).join("")}</div>
          <span style="margin-top:6px">红线在匹配工作台自动校验：候选供应商触碰红线时亮红色警示。</span>
          <span style="margin-top:4px">该标准在「质量控制塔」逐供应商 / 逐 SKU 落地执行：验厂到期预警、测试与 TCF 建档、验货与 CAP 整改闭环。</span></div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table">
          <thead><tr><th style="width:140px">品类</th><th>测试标准（客户指定）</th></tr></thead>
          <tbody>${c.compliance.tests.map(x => `<tr><td><b>${x.cat}</b></td><td>${x.std}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="muted tight">分品类测试标准在新建 Brief 拆包时自动带入需求包的认证要求；正式版支持标准版本管理与生效日期。</p>
    </section>` : `<div class="empty">该客户合规标准建立中</div>`;

  const projectsPane = `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Projects</p><h3>${c.name} 的项目</h3></div></div>
      ${myPrjs.length ? `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>项目</th><th>阶段</th><th>需求包</th><th>Owner</th><th>上市</th><th></th></tr></thead>
        <tbody>${myPrjs.map(p => {
          const ps = pkgsOf(p.id);
          return `<tr class="row-click" data-action="open-prj" data-prj="${p.id}"><td><b>${p.name}</b></td><td>${stageTag(deriveStage(p))}</td><td>${ps.filter(x => x.status === "confirmed").length}/${ps.length} 已定商</td><td>${p.owner}</td><td>${p.launch}</td><td><span class="text-link">进入 →</span></td></tr>`;
        }).join("")}</tbody></table></div>` : `<div class="empty">暂无项目</div>`}
    </section>`;

  el.innerHTML = `
    <div class="client-grid">
      ${clients.map(x => {
        const n = projects.filter(p => p.client === x.id).length;
        return `<button class="client-card ${x.id === c.id ? "active" : ""}" data-action="client-sel" data-client="${x.id}">
          <span class="chip ${x.level === "战略客户" ? "blue" : x.level === "核心客户" ? "skyc" : ""}">${x.level}</span>
          <h4>${x.name}</h4><p class="muted">${x.region}</p>
          <div class="c-stats"><div><b>${n}</b><span>项目</span></div><div><b>${x.annual}</b><span>年采购额</span></div></div>
        </button>`;
      }).join("")}
    </div>
    <div class="c-tabs">
      ${[["basic", "基本档案"], ["brand", "品牌智能"], ["compliance", "合规标准"], ["projects", "项目"]]
        .map(([id, l]) => `<button class="${tab === id ? "active" : ""}" data-action="client-tab" data-tab="${id}">${l}</button>`).join("")}
    </div>
    ${pane("basic", basicPane)}
    ${pane("brand", brandPane)}
    ${pane("compliance", compliancePane)}
    ${pane("projects", projectsPane)}`;
}

/* ---------- 供应商管理 ---------- */

function renderSuppliers() {
  const el = $("view-suppliers");
  if (state.role === "client") { el.innerHTML = suppliersClientView(); return; }
  if (state.role === "supplier") { el.innerHTML = `<section class="panel">${dashSupplier()}</section>`; return; }

  const counts = Object.fromEntries(Object.keys(SUP_STATUS).map(k => [k, suppliers.filter(s => s.status === k).length]));
  el.innerHTML = `
    <div class="sup-stats">
      <div class="tile"><span>供应商总池</span><b>${suppliers.length}</b><p>全部来源</p></div>
      ${Object.entries(SUP_STATUS).map(([k, v]) => `<div class="tile"><span>${v.label}</span><b>${counts[k]}</b><p>${{active:"正在承接项目",qualified:"可参与匹配",onboarding:"资料/验厂中",potential:"待启动准入",suspended:"整改未关闭",eliminated:"不建议启用"}[k]}</p></div>`).join("")}
    </div>
    <section class="panel">
      <div class="panel-head">
        <div><p class="label">Supplier Board</p><h3>供应商看板</h3></div>
        <div class="filters">
          <select data-action="sup-filter" data-f="status">
            <option value="all">全部状态</option>
            ${Object.entries(SUP_STATUS).map(([k, v]) => `<option value="${k}" ${state.supFilters.status === k ? "selected" : ""}>${v.label}</option>`).join("")}
          </select>
          <select data-action="sup-filter" data-f="cat">
            ${["all", "文具", "包袋", "水具", "礼品", "家居"].map(x => `<option value="${x}" ${state.supFilters.cat === x ? "selected" : ""}>${x === "all" ? "全部品类" : x}</option>`).join("")}
          </select>
          <select data-action="sup-filter" data-f="risk">
            ${["all", "低", "中", "高"].map(x => `<option value="${x}" ${state.supFilters.risk === x ? "selected" : ""}>${x === "all" ? "全部风险" : "风险 · " + x}</option>`).join("")}
          </select>
          <select data-action="sup-filter" data-f="source">
            <option value="all" ${state.supFilters.source === "all" ? "selected" : ""}>全部来源</option>
            <option value="own" ${state.supFilters.source === "own" ? "selected" : ""}>自主开发</option>
            <option value="client" ${state.supFilters.source === "client" ? "selected" : ""}>客户提供</option>
          </select>
          <input type="search" placeholder="搜索名称 / 地区" value="${esc(state.supFilters.q)}" data-action="sup-search">
        </div>
      </div>
      <div class="sup-grid" id="supGrid"></div>
    </section>
    <section class="panel" id="supDetail"></section>`;
  renderSupplierCards();
}

function renderSupplierCards() {
  const f = state.supFilters;
  const list = suppliers
    .filter(s => f.status === "all" || s.status === f.status)
    .filter(s => f.cat === "all" || s.cats.includes(f.cat))
    .filter(s => f.risk === "all" || s.risk === f.risk)
    .filter(s => f.source === "all" || s.source.type === f.source)
    .filter(s => !f.q || s.name.includes(f.q) || s.region.includes(f.q));
  if (!list.some(s => s.id === state.supSel) && list.length) state.supSel = list[0].id;

  const grid = $("supGrid");
  if (grid) grid.innerHTML = list.length ? list.map(s => `
    <button class="sup-card ${s.id === state.supSel ? "active" : ""}" data-action="sup-sel" data-sup="${s.id}">
      <div class="sup-top"><span class="tag ${SUP_STATUS[s.status].tag}">${SUP_STATUS[s.status].label}</span>
        <span class="tag ${RISK[s.risk].tag}">风险 ${s.risk}</span>${sourceTag(s)}</div>
      <h4>${s.name}</h4>
      <p class="muted">${s.id} · ${s.type} · ${s.region} · ${s.cats.join(" / ")}</p>
      <div class="sup-metrics">
        <div><b>${s.price ?? "—"}</b><span>报价</span></div>
        <div><b>${s.quality ?? "—"}${s.quality ? "%" : ""}</b><span>质量</span></div>
        <div><b>${s.onTime ?? "—"}${s.onTime ? "%" : ""}</b><span>准时</span></div>
        <div><b>${(s.capacity / 10000).toFixed(0)}万</b><span>月产能</span></div>
      </div>
      <div class="sup-suggest">${s.suggest}</div>
    </button>`).join("") : `<div class="empty">没有符合筛选条件的供应商</div>`;

  const s = sup(state.supSel);
  const det = $("supDetail");
  if (det && s) det.innerHTML = state.supEdit && state.role === "sales" ? supplierEditHtml(s) : supplierDetailHtml(s);
}

function supplierDetailHtml(s) {
  const usedIn = packages.filter(p => p.confirmed.includes(s.id) || p.shortlist.includes(s.id));
  return `
    <div class="panel-head"><div><p class="label">Supplier Profile</p><h3>${s.name} · 完整档案</h3></div>
      <div class="sup-top">${sourceTag(s)}<span class="tag ${SUP_STATUS[s.status].tag}">${SUP_STATUS[s.status].label}</span><span class="tag ${RISK[s.risk].tag}">风险 ${s.risk}</span>
      ${state.role === "sales" ? `<button class="primary mini" data-action="sup-edit">✎ 编辑档案</button>` : ""}</div></div>
    <div class="sec-grid">
      <div class="sec"><b>基础信息</b>
        <span>编号：<strong>${s.id}</strong> · ${s.type}</span><span>地区：${s.region}</span>
        <span>联系人：${s.contact}</span><span>合作年限：${s.years} 年 · 年采购额 ${s.annual}</span></div>
      <div class="sec"><b>能力标签（匹配数据源）</b>
        <span>品类：</span><div class="chip-row">${s.cats.map((c, i) => `<span class="chip ${i === 0 ? "blue" : ""}">${c}${i === 0 ? " · 主营" : ""}</span>`).join("")}</div>
        <span>工艺：</span><div class="chip-row">${s.procs.map(x => `<span class="chip">${x}</span>`).join("")}</div>
        <span>认证：</span><div class="chip-row">${s.certs.length ? s.certs.map(x => `<span class="chip green click-prev" data-action="file-open" data-kind="cert" data-sup="${s.id}" data-cert="${x}" title="点击预览证书">${x}</span>`).join("") : `<span class="chip amber">待收集</span>`}</div></div>
      <div class="sec"><b>产能与交付</b>
        <span>月产能：<strong>${(s.capacity / 10000).toFixed(0)} 万件</strong></span>
        <span>平均交期：${s.lead ?? "—"} 天 · 打样 ${s.sample ?? "—"} 天</span>
        <div class="score-line"><em>报价竞争力</em><div class="bar"><i style="--p:${s.price ?? 0}%"></i></div><strong>${s.price ?? "—"}</strong></div>
        <div class="score-line"><em>质量通过率</em><div class="bar good"><i style="--p:${s.quality ?? 0}%"></i></div><strong>${s.quality ?? "—"}${s.quality ? "%" : ""}</strong></div>
        <div class="score-line"><em>交付准时率</em><div class="bar"><i style="--p:${s.onTime ?? 0}%"></i></div><strong>${s.onTime ?? "—"}${s.onTime ? "%" : ""}</strong></div></div>
      <div class="sec"><b>合作历史</b>
        <span>服务过：${s.served.join(" / ") || "—"}</span>
        <span>当前参与：${usedIn.length ? usedIn.map(p => `${p.name}（${PKG_STATUS[p.status].label}）`).join("；") : "暂无"}</span></div>
      <div class="sec"><b>来源与准入</b>
        <span>${s.source.type === "client" ? `客户提供 · ${client(s.source.client)?.name}移交` : "Eastlink 自主开发"}</span>
        <span>准入状态：<strong>${SUP_STATUS[s.status].label}</strong></span></div>
      <div class="sec"><b>验厂与整改（质量控制塔同步）</b>
        ${(s.audits || []).length ? s.audits.map(a => `<span>${a.scheme} · ${a.grade} · 有效期 ${a.valid} <span class="chip ${AUDIT_CHIP[a.status] || ""}">${a.status}</span></span>`).join("") : `<span>暂无验厂记录</span>`}
        ${(s.caps || []).filter(c => c.status !== "已关闭").length
          ? `<span>开放 CAP：${s.caps.filter(c => c.status !== "已关闭").map(c => `${c.id}（${c.src} ${c.sev} · ${c.status}）`).join("；")}</span>`
          : `<span>无开放 CAP</span>`}</div>
      <div class="sec"><b>系统建议</b><span>${s.suggest}</span></div>
    </div>`;
}

const SUP_CATS = ["文具", "包袋", "水具", "礼品", "家居"];

function supplierEditHtml(s) {
  const chips = (list, sel, cls) => list.map(x => `<span class="chip chip-toggle ${cls} ${sel.includes(x) ? "sel" : ""}">${x}</span>`).join("");
  return `
    <div class="panel-head"><div><p class="label">Edit Supplier</p><h3>编辑档案 · ${s.name}</h3></div>
      <span class="chip amber">改动实时影响匹配打分（Demo 内存演示，刷新还原）</span></div>
    <div class="form-grid">
      <label class="field">准入状态
        <select id="se-status">${Object.entries(SUP_STATUS).map(([k, v]) => `<option value="${k}" ${s.status === k ? "selected" : ""}>${v.label}</option>`).join("")}</select></label>
      <label class="field">供应商类型<input id="se-type" value="${esc(s.type)}"></label>
      <label class="field">所在地区<input id="se-region" value="${esc(s.region)}"></label>
      <label class="field">联系人<input id="se-contact" value="${esc(s.contact)}"></label>
      <label class="field">月产能（件）<input id="se-capacity" type="number" value="${s.capacity ?? ""}"></label>
      <label class="field">平均交期（天）<input id="se-lead" type="number" value="${s.lead ?? ""}"></label>
      <label class="field">打样（天）<input id="se-sample" type="number" value="${s.sample ?? ""}"></label>
      <label class="field">报价竞争力（0-100）<input id="se-price" type="number" min="0" max="100" value="${s.price ?? ""}"></label>
      <label class="field">质量通过率（%）<input id="se-quality" type="number" min="0" max="100" value="${s.quality ?? ""}"></label>
      <label class="field">交付准时率（%）<input id="se-onTime" type="number" min="0" max="100" value="${s.onTime ?? ""}"></label>
      <label class="field">风险等级
        <select id="se-risk">${["低", "中", "高"].map(x => `<option ${s.risk === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
      <label class="field">主营品类
        <select id="se-maincat">${SUP_CATS.map(x => `<option ${s.cats[0] === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
      <label class="field" style="grid-column:1/-1">系统建议 / 备注<input id="se-suggest" value="${esc(s.suggest)}"></label>
    </div>
    <div class="field" style="margin-top:10px">兼营品类（点选）<div class="chip-row" id="se-cats">${chips(SUP_CATS, s.cats.slice(1), "")}</div></div>
    <div class="field" style="margin-top:8px">工艺能力（点选 · 匹配数据源）<div class="chip-row" id="se-procs">${chips(NB_PROCS, s.procs, "")}</div></div>
    <div class="field" style="margin-top:8px">资质认证（点选 · 匹配数据源）<div class="chip-row" id="se-certs">${chips(NB_CERTS, s.certs, "")}</div></div>
    <div class="r-actions" style="margin-top:14px">
      <button class="primary" data-action="sup-edit-save">保存档案</button>
      <button class="ghost" data-action="sup-edit-cancel">取消</button>
    </div>`;
}

function supEditSave() {
  const s = sup(state.supSel);
  if (!s) return;
  const num = (id, clamp) => {
    const v = $(id).value.trim();
    if (v === "") return null;
    const n = Number(v);
    return isNaN(n) ? null : (clamp ? Math.max(0, Math.min(100, n)) : Math.max(0, n));
  };
  const oldStatus = s.status;
  s.status = $("se-status").value;
  s.type = $("se-type").value.trim() || s.type;
  s.region = $("se-region").value.trim() || s.region;
  s.contact = $("se-contact").value.trim() || s.contact;
  s.capacity = num("se-capacity") ?? s.capacity;
  s.lead = num("se-lead");
  s.sample = num("se-sample");
  s.price = num("se-price", true);
  s.quality = num("se-quality", true);
  s.onTime = num("se-onTime", true);
  s.risk = $("se-risk").value;
  s.suggest = $("se-suggest").value.trim() || s.suggest;
  const main = $("se-maincat").value;
  const others = [...document.querySelectorAll("#se-cats .chip-toggle.sel")].map(x => x.textContent).filter(x => x !== main);
  s.cats = [main, ...others];
  s.procs = [...document.querySelectorAll("#se-procs .chip-toggle.sel")].map(x => x.textContent);
  s.certs = [...document.querySelectorAll("#se-certs .chip-toggle.sel")].map(x => x.textContent);
  if (oldStatus !== s.status) {
    feed.unshift({ t: nowLabel(), txt: `${s.name} 准入状态变更：${SUP_STATUS[oldStatus].label} → ${SUP_STATUS[s.status].label}` });
  }
  state.supEdit = false;
  toast("档案已更新，匹配打分将实时使用新数据");
  renderSuppliers();
}

function suppliersClientView() {
  const cid = ROLES.client.clientId;
  const myPrjIds = projects.filter(p => p.client === cid).map(p => p.id);
  const provided = suppliers.filter(s => s.source.type === "client" && s.source.client === cid);
  const coopIds = new Set();
  packages.filter(p => myPrjIds.includes(p.prj)).forEach(p => p.confirmed.forEach(id => coopIds.add(id)));
  const coop = suppliers.filter(s => coopIds.has(s.id) && !provided.some(x => x.id === s.id));

  const cardLite = s => {
    const usedIn = packages.filter(p => myPrjIds.includes(p.prj) && p.confirmed.includes(s.id));
    return `<div class="sup-card">
      <div class="sup-top"><span class="tag ${SUP_STATUS[s.status].tag}">${SUP_STATUS[s.status].label}</span>${sourceTag(s)}</div>
      <h4>${s.name}</h4>
      <p class="muted">${s.type} · ${s.region} · ${s.cats.join(" / ")}</p>
      <div class="chip-row" style="margin-top:8px">${s.certs.length ? s.certs.map(x => `<span class="chip green click-prev" data-action="file-open" data-kind="cert" data-sup="${s.id}" data-cert="${x}" title="点击预览证书">${x}</span>`).join("") : `<span class="chip amber">认证资料收集中</span>`}</div>
      <p class="muted" style="margin-top:8px">${usedIn.length ? "参与：" + usedIn.map(p => p.name).join("、") : s.status === "onboarding" ? "准入进行中：资料补充 + 验厂排期" : "暂未参与您的项目"}</p>
    </div>`;
  };

  return `
    <section class="panel">
      <div class="panel-head"><div><p class="label">My Suppliers</p><h3>我提供的供应商（${provided.length}）</h3></div></div>
      <p class="muted" style="margin-bottom:12px">您移交给 Eastlink 的供应商全量可见（含未完成准入的）。Eastlink 负责准入评估、质量数据维护与项目分配。</p>
      <div class="sup-grid">${provided.length ? provided.map(cardLite).join("") : `<div class="empty">暂无</div>`}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><p class="label">Cooperating</p><h3>正在为我的项目服务的供应商（${coop.length}）</h3></div></div>
      <div class="sup-grid">${coop.length ? coop.map(cardLite).join("") : `<div class="empty">暂无</div>`}</div>
      <p class="muted tight">注：内部匹配评分与落选候选不对客户展示。</p>
    </section>`;
}

/* ---------- 审核中心 ---------- */

function reasonBoxHtml() {
  return `<div class="reason-box">
    <textarea id="reasonText" placeholder="请填写原因 / 意见（将记录进流转历史）"></textarea>
    <div class="r-actions">
      <button class="primary mini" data-action="reason-confirm">确认提交</button>
      <button class="ghost mini" data-action="reason-cancel">取消</button>
    </div></div>`;
}

function renderReview(scope) {
  let items = reviewsForRole();
  $("reviewCount").textContent = state.role === "client" ? items.length : deriveReviews().length;
  document.querySelectorAll("[data-rtab]").forEach(b => b.classList.toggle("active", b.dataset.rtab === state.rtab));
  const box = $("reviewList");

  if (state.rtab === "done") {
    box.innerHTML = history.length ? history.map(h => `<div class="r-done"><b>${h.txt}</b><time>${h.t}</time></div>`).join("") : `<div class="empty">暂无记录</div>`;
    return;
  }

  if (state.role === "supplier") {
    const sid = ROLES.supplier.supplierId;
    const myTasks = samples.filter(s => s.supplier === sid && s.status !== "scored");
    const myPkgs = packages.filter(p => p.confirmed.includes(sid));
    const html = [
      ...myTasks.map(s => `<div class="r-done"><b>打样任务：${pkg(s.pkg).name}</b>${SAMPLE_STATUS[s.status].label} · 截止 ${s.due}<time>${prj(pkg(s.pkg).prj).name}</time></div>`),
      ...myPkgs.map(p => `<div class="r-done"><b>合作确认：${p.name}</b>${prj(p.prj).name}<time>详见项目排期</time></div>`)
    ].join("");
    box.innerHTML = html || `<div class="empty">暂无通知</div>`;
    return;
  }

  /* 上下文过滤（业务员/管理层）：按项目 or 按匹配链路 */
  let sub = "";
  if (scope && scope.prj) {
    const pr = prj(scope.prj);
    items = items.filter(it => (it.p || pkg(it.d.pkg)).prj === scope.prj);
    sub = `<div class="rail-sub"><span>当前项目：${pr ? pr.name : scope.prj}</span><button class="text-link" data-action="rail-all-toggle">查看全部</button></div>`;
  } else if (scope && scope.kinds) {
    items = items.filter(it => scope.kinds.includes(it.kind));
    sub = `<div class="rail-sub"><span>只看匹配与定商相关</span></div>`;
  } else if (scope && scope.allNote) {
    sub = `<div class="rail-sub"><span>全部待办</span><button class="text-link" data-action="rail-all-toggle">只看当前项目</button></div>`;
  }

  if (!items.length) {
    box.innerHTML = sub + `<div class="empty">${scope && scope.prj ? "该项目没有待处理事项" : scope && scope.kinds ? "当前没有匹配相关审核" : "没有待处理的审核事项"}</div>`;
    return;
  }

  box.innerHTML = sub + items.map(it => {
    if (it.kind === "shortlist") return reviewShortlistItem(it);
    if (it.kind === "final") return reviewFinalItem(it);
    return reviewDesignItem(it);
  }).join("");
}

function reviewShortlistItem(it) {
  const p = it.p, pr = prj(p.prj), c = client(pr.client);
  const isSales = state.role === "sales";
  const chips = p.shortlist.map(id => {
    const s = sup(id);
    return `<span class="chip blue">${s.name} · 匹配 ${totalScore(dimScores(s, p))} 分</span>`;
  }).join("");
  const actions = isSales
    ? `<button class="primary mini" data-action="shortlist-pass" data-pkg="${p.id}">内审通过 → 发出打样邀请</button>
       <button class="ghost mini" data-action="reason-open" data-rt="shortlist-return" data-rid="${p.id}">退回重选</button>`
    : `<span class="r-wait">内审环节 · 业务员处理</span>`;
  const reasonBox = state.reasonFor && state.reasonFor.t === "shortlist-return" && state.reasonFor.id === p.id ? reasonBoxHtml() : "";
  return `<div class="r-item ${isSales ? "mine" : ""}">
    <div class="r-top"><span class="chip blue">打样候选名单</span><span class="tag st-internal">内审中</span></div>
    <h4>${p.name}</h4>
    <div class="r-meta">${pr.name} · ${c ? c.name : ""} · 候选 ${p.shortlist.length} 家，通过后各自按定稿设计打样</div>
    ${p.returnNote ? `<div class="r-note">${p.returnNote}</div>` : ""}
    <div class="chip-row">${chips}</div>
    <div class="r-actions">${actions}</div>
    ${reasonBox}
  </div>`;
}

function reviewFinalItem(it) {
  const p = it.p, pr = prj(p.prj), c = client(pr.client);
  const isSales = state.role === "sales";
  const win = sup(p.suggestSup);
  const chips = samplesOf(p.id).filter(s => s.score).map(s => {
    const avg = Math.round((s.score.质量 + s.score.工艺还原 + s.score.报价) / 3);
    return `<span class="chip ${s.supplier === p.suggestSup ? "green" : ""}">${sup(s.supplier).name} · 样品 ${avg} 分</span>`;
  }).join("");
  const actions = isSales
    ? `<button class="primary mini" data-action="final-pass" data-pkg="${p.id}">内审通过 → 确认合作（结果同步客户）</button>
       <button class="ghost mini" data-action="reason-open" data-rt="final-return" data-rid="${p.id}">退回比样</button>`
    : `<span class="r-wait">内审环节 · 业务员处理</span>`;
  const reasonBox = state.reasonFor && state.reasonFor.t === "final-return" && state.reasonFor.id === p.id ? reasonBoxHtml() : "";
  return `<div class="r-item ${isSales ? "mine" : ""}">
    <div class="r-top"><span class="chip green">定商建议</span><span class="tag ${PKG_STATUS[p.status].tag}">${PKG_STATUS[p.status].label}</span></div>
    <h4>${p.name} · 建议定商：${win ? win.name : "—"}</h4>
    <div class="r-meta">${pr.name} · ${c ? c.name : ""} · 依据候选打样按 SKU 评分比样得出（综合分为各 SKU 均值，明细见项目详情打样区）；定商属 Eastlink 内部决策，客户不再二次确认</div>
    ${p.returnNote ? `<div class="r-note">${p.returnNote}</div>` : ""}
    <div class="chip-row">${chips}</div>
    <div class="r-actions">${actions}</div>
    ${reasonBox}
  </div>`;
}

function reviewDesignItem(it) {
  const d = it.d, p = pkg(d.pkg), pr = prj(p.prj), c = client(pr.client);
  const isSales = state.role === "sales";
  const isClient = state.role === "client";
  const mine = (isSales && it.stage === "internal") || (isClient && it.stage === "client");

  let actions = "";
  if (isSales && it.stage === "internal") {
    actions = `<button class="primary mini" data-action="design-pass" data-design="${d.id}">内审通过 → 提交客户</button>
               <button class="ghost mini" data-action="reason-open" data-rt="design-return" data-rid="${d.id}">退回</button>`;
  } else if (isClient && it.stage === "client") {
    actions = `<button class="primary mini" data-action="design-approve" data-design="${d.id}">确认定稿</button>
               <button class="ghost mini" data-action="reason-open" data-rt="design-changes" data-rid="${d.id}">提修改意见</button>`;
  } else if (it.stage === "client") {
    actions = `<span class="r-wait">等待 ${c ? c.name : "客户"} 确认</span>`;
  } else {
    actions = `<span class="r-wait">内审环节 · 业务员处理</span>`;
  }
  const reasonBox = state.reasonFor && (state.reasonFor.t === "design-return" || state.reasonFor.t === "design-changes") && state.reasonFor.id === d.id && state.reasonFor.inReview ? reasonBoxHtml() : "";

  return `<div class="r-item ${mine ? "mine" : ""}">
    <div class="r-top"><span class="chip skyc">设计稿</span><span class="tag ${DESIGN_STATUS[d.status].tag}">${DESIGN_STATUS[d.status].label}</span></div>
    <h4>${p.name} · V${d.ver}</h4>
    <div class="r-meta">${pr.name} · ${c ? c.name : ""} · 设计师 ${d.designer} · ${d.date}${d.skuMap && d.skuMap.length ? ` · SKU 出稿 ${d.skuMap.filter(k => k.status === "已出稿").length}/${d.skuMap.length}` : ""}</div>
    <div class="thumb click-prev" data-action="file-open" data-kind="design" data-id="${d.id}" style="height:52px;border-radius:8px;margin-bottom:8px;${thumbBg(d)}"></div>
    <div class="r-actions">${actions}</div>
    ${reasonBox}
  </div>`;
}

/* ============================================================
   动作 & 事件
   ============================================================ */

/* ---------- 质量控制塔：TCF · 测试 · 验货 · 验厂 · CAP ---------- */

const AUDIT_CHIP = { "有效": "green", "即将到期": "amber", "审核中": "skyc", "待排期": "outline", "已过期": "red" };
const CAP_CHIP = { "整改中": "amber", "待复审": "skyc", "已关闭": "green", "逾期": "red" };
const TEST_CHIP = { "通过": "green", "测试中": "skyc", "待送测": "outline", "不通过": "red" };
const INSP_CHIP = { "通过": "green", "不通过": "red", "待录入": "amber", "待排期": "outline" };

const tcfPct = t => t ? Math.round(Object.values(t).filter(Boolean).length / Object.keys(t).length * 100) : 0;

/* 质量数据聚合（业务员/管理层全量） */
function qaData() {
  const audits = suppliers.flatMap(s => (s.audits || []).map(a => ({ s, a })));
  const caps = suppliers.flatMap(s => (s.caps || []).map(cp => ({ s, cp })));
  const skuRows = packages.flatMap(p => (p.skuList || []).filter(k => k.tests).map(k => ({
    p, k, su: p.confirmed.length ? sup(p.confirmed[0]) : p.suggestSup ? sup(p.suggestSup) : null
  })));
  return { audits, caps, skuRows };
}

function qaReadiness(p) {
  const su = sup(p.confirmed[0]);
  const auditOk = su && (su.audits || []).some(a => a.status === "有效") ? "ok"
    : su && (su.audits || []).some(a => a.status === "即将到期") ? "warn" : "bad";
  const skus = (p.skuList || []).filter(k => k.tests);
  const testOk = skus.length && skus.every(k => k.tests.every(t => t.status === "通过")) ? "ok"
    : skus.some(k => k.tests.some(t => t.status === "不通过")) ? "bad" : "warn";
  const tcfAvg = skus.length ? Math.round(skus.reduce((a, k) => a + tcfPct(k.tcf), 0) / skus.length) : 0;
  const ins = inspections.filter(i => i.pkg === p.id);
  const last = ins[ins.length - 1];
  const inspOk = !last ? "warn" : last.status === "通过" ? "ok" : last.status === "不通过" ? "bad" : "warn";
  const ready = auditOk === "ok" && testOk === "ok" && tcfAvg === 100 && inspOk === "ok";
  return { su, auditOk, testOk, tcfAvg, inspOk, ready };
}

function renderQuality() {
  const el = $("view-quality");
  if (state.role === "client") { renderQualityClient(el); return; }
  const isSales = state.role === "sales";
  const { audits, caps, skuRows } = qaData();

  const auditValid = audits.filter(x => x.a.status === "有效").length;
  const auditWarn = audits.filter(x => ["即将到期", "待排期", "已过期"].includes(x.a.status)).length;
  const capOpen = caps.filter(x => x.cp.status !== "已关闭").length;
  const capLate = caps.filter(x => x.cp.status === "逾期").length;
  const allTests = skuRows.flatMap(r => r.k.tests);
  const testPass = Math.round(allTests.filter(t => t.status === "通过").length / (allTests.length || 1) * 100);
  const inspPending = inspections.filter(i => ["待录入", "待排期"].includes(i.status)).length;
  const tcfAvgAll = skuRows.length ? Math.round(skuRows.reduce((a, r) => a + tcfPct(r.k.tcf), 0) / skuRows.length) : 0;

  const stChip = (map, v) => `<span class="chip ${map[v] || ""}">${v}</span>`;
  const mark = v => v === "ok" ? `<span class="chip green">✓</span>` : v === "warn" ? `<span class="chip amber">⚠</span>` : `<span class="chip red">✗</span>`;

  el.innerHTML = `
    <div class="tile-grid" style="grid-template-columns:repeat(6,1fr)">
      <div class="tile"><span>验厂有效</span><b>${auditValid}/${audits.length}</b><div class="bar good"><i style="--p:${Math.round(auditValid / (audits.length || 1) * 100)}%"></i></div><p>到期 / 待排期 ${auditWarn}</p></div>
      <div class="tile ${capLate ? "warn" : ""}"><span>CAP 开放</span><b>${capOpen}</b><div class="bar"><i style="--p:${capOpen * 20}%"></i></div><p>${capLate ? `逾期 ${capLate} 项` : "无逾期"}</p></div>
      <div class="tile"><span>测试通过率</span><b>${testPass}%</b><div class="bar ${testPass >= 80 ? "good" : ""}"><i style="--p:${testPass}%"></i></div><p>${allTests.filter(t => t.status === "不通过").length} 项不通过</p></div>
      <div class="tile"><span>待验货</span><b>${inspPending}</b><div class="bar soft"><i style="--p:${inspPending * 25}%"></i></div><p>首单必验 · AQL Ⅱ</p></div>
      <div class="tile"><span>TCF 齐备率</span><b>${tcfAvgAll}%</b><div class="bar ${tcfAvgAll === 100 ? "good" : ""}"><i style="--p:${tcfAvgAll}%"></i></div><p>按 SKU 建档</p></div>
      <div class="tile"><span>质量口径</span><b style="font-size:15px">客户合规标准</b><p>红线在匹配拦截，塔内闭环执行</p></div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Factory Audits</p><h3>验厂看板（体系 / 等级 / 有效期）</h3></div>
        <span class="chip outline">到期前 90 天自动提醒复审排期</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>供应商</th><th>体系</th><th>等级</th><th>有效期</th><th>状态</th><th>下一步</th></tr></thead>
        <tbody>${audits.map(({ s, a }) => `<tr class="${["已过期"].includes(a.status) ? "row-bad" : ""}">
          <td><b>${s.name}</b></td><td>${a.scheme}</td><td>${a.grade}</td><td>${a.valid}</td>
          <td>${stChip(AUDIT_CHIP, a.status)}</td>
          <td class="dim">${a.status === "即将到期" ? "复审排期中（到期前完成）" : a.status === "待排期" ? "准入流程内安排初审" : a.status === "已过期" ? "暂停分配，整改后重审" : "—"}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">CAP Tracking</p><h3>CAP 整改跟踪（验厂 / 验货 / 测试发现）</h3></div>
        <span class="chip red">逾期 ${capLate} 项</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>编号</th><th>供应商</th><th>来源</th><th>问题与整改</th><th>严重度</th><th>截止</th><th>状态</th><th></th></tr></thead>
        <tbody>${caps.map(({ s, cp }) => `<tr class="${cp.status === "逾期" ? "row-bad" : ""}">
          <td><b>${cp.id}</b></td><td>${s.name}</td><td>${cp.src}</td><td>${cp.issue}</td>
          <td><span class="chip ${cp.sev === "Critical" ? "red" : cp.sev === "Major" ? "amber" : ""}">${cp.sev}</span></td>
          <td>${cp.due}</td><td>${stChip(CAP_CHIP, cp.status)}</td>
          <td>${isSales && ["整改中", "待复审", "逾期"].includes(cp.status) ? `<button class="ghost mini" data-action="cap-close" data-sup="${s.id}" data-cap="${cp.id}">复审通过 → 关闭</button>` : ""}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="muted tight">验货不通过、测试不通过、验厂发现项都会生成 CAP 并挂到供应商档案；逾期未关闭自动暂停新项目分配（如 ${sup("SUP-009").name}）。</p>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">SKU Quality File</p><h3>SKU 质量档案（测试 × TCF）</h3></div>
        <span class="chip outline">PPA 前置：测试要求随设计定稿同步定义，不等打样</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>SKU</th><th>需求包</th><th>供应商</th><th>测试项</th><th style="min-width:150px">TCF 完整度</th></tr></thead>
        <tbody>${skuRows.map(({ p, k, su }) => {
          const pct = tcfPct(k.tcf);
          const missing = Object.entries(k.tcf).filter(([, v]) => !v).map(([n]) => n);
          const ki = p.skuList.indexOf(k);
          return `<tr>
            <td><b>${k.id}</b> <button class="text-link" data-action="file-open" data-kind="psf" data-pkg="${p.id}" data-idx="${ki}" style="font-size:10.5px">PSF</button><br><span class="dim" style="font-size:11px">${k.name}</span></td>
            <td>${p.name}</td><td>${su ? su.name : "定商前"}</td>
            <td><div class="chip-row">${k.tests.map(t => `<span class="chip ${TEST_CHIP[t.status] || ""}">${t.std} · ${t.status}</span>`).join("")}</div></td>
            <td><div class="score-line"><div class="bar ${pct === 100 ? "good" : ""}"><i style="--p:${pct}%"></i></div><strong>${pct}%</strong></div>
              ${missing.length ? `<span class="dim" style="font-size:10.5px">缺：${missing.join(" / ")}</span>` : `<span class="chip green" style="font-size:10px">TCF 齐备</span>`}</td></tr>`;
        }).join("")}</tbody>
      </table></div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Inspections</p><h3>验货计划与结果</h3></div>
        <span class="chip outline">首单必验 · AQL 标准来自客户合规档案</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>编号</th><th>需求包</th><th>供应商</th><th>类型</th><th>日期</th><th>执行方</th><th>结果</th><th></th></tr></thead>
        <tbody>${inspections.map(i => `<tr class="${i.status === "不通过" ? "row-bad" : ""}">
          <td><b>${i.id}</b></td><td>${pkg(i.pkg).name}</td><td>${sup(i.supplier).name}</td>
          <td>${i.type}</td><td>${i.date}</td><td>${i.by}</td>
          <td>${stChip(INSP_CHIP, i.status)}${i.note ? `<br><span class="dim" style="font-size:11px">${i.note}</span>` : ""}</td>
          <td>${isSales && i.status === "待录入" ? `<button class="primary mini" data-action="insp-result" data-insp="${i.id}">录入结果（演示）</button>` : ""}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Order Readiness</p><h3>大货下单就绪度（P2 下单动作的前置门）</h3></div></div>
      ${packages.filter(p => p.status === "confirmed").map(p => {
        const r = qaReadiness(p);
        return `<div class="qa-ready">
          <b>${p.name}</b><span class="dim">${r.su ? r.su.name : ""}</span>
          <span class="chip-row">
            ${mark(r.auditOk)} 验厂有效
            ${mark(r.testOk)} 测试全通过
            ${mark(r.tcfAvg === 100 ? "ok" : "warn")} TCF ${r.tcfAvg}%
            ${mark(r.inspOk)} 验货通过
          </span>
          <span class="tag ${r.ready ? "st-confirmed" : "st-internal"}">${r.ready ? "可下单" : "未就绪"}</span>
        </div>`;
      }).join("")}
      <p class="muted tight">四项全绿才可进入大货下单（P2）；数据口径来自客户合规标准（客户管理 · 合规页签），红线在匹配拦截，塔内跟踪执行闭环。</p>
    </section>`;
}

/* 客户视角：仅自己项目的质量保障汇总（不暴露 CAP 明细与严重度） */
function renderQualityClient(el) {
  const cid = ROLES.client.clientId;
  const myPkgs = packages.filter(p => prj(p.prj)?.client === cid && (p.skuList || []).some(k => k.tests));
  el.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Quality Assurance</p><h3>质量保障（您的项目）</h3></div>
        <span class="chip skyc">Eastlink 质量控制塔实时同步</span></div>
      ${myPkgs.length ? myPkgs.map(p => {
        const su = p.confirmed.length ? sup(p.confirmed[0]) : null;
        const skus = (p.skuList || []).filter(k => k.tests);
        const tcfAvg = skus.length ? Math.round(skus.reduce((a, k) => a + tcfPct(k.tcf), 0) / skus.length) : 0;
        const testAll = skus.every(k => k.tests.every(t => t.status === "通过"));
        const ins = inspections.filter(i => i.pkg === p.id);
        const last = ins[ins.length - 1];
        const audit = su && (su.audits || []).find(a => a.status === "有效");
        const closed = su ? (su.caps || []).filter(c => c.status === "已关闭").length : 0;
        return `<div class="qa-ready">
          <b>${p.name}</b><span class="dim">${su ? `合作：${su.name}` : "比样定商中"}</span>
          <span class="chip-row">
            ${audit ? `<span class="chip green">验厂 ${audit.scheme} 有效</span>` : `<span class="chip amber">验厂跟进中</span>`}
            <span class="chip ${testAll ? "green" : "skyc"}">${testAll ? "测试全通过" : "测试进行中"}</span>
            <span class="chip ${last && last.status === "通过" ? "green" : "outline"}">${last ? `验货${last.status === "待录入" ? "已排期" : last.status}` : "验货待排期"}</span>
            <span class="chip ${tcfAvg === 100 ? "green" : "outline"}">TCF ${tcfAvg}%</span>
            ${closed ? `<span class="chip green">闭环整改 ${closed} 项</span>` : ""}
          </span>
        </div>`;
      }).join("") : `<div class="empty">暂无进入打样/合作阶段的需求包</div>`}
      <p class="muted tight">TCF 按 SKU 建档（设计定稿 / 材料声明 / 测试报告 / 样品记录 / 验货报告）；测试与验货标准执行您的合规档案，问题整改由 Eastlink 闭环后同步结果。</p>
    </section>`;
}

/* ---------- 右栏：随左侧导航上下文切换（业务员/管理层） ---------- */

function setRailHead(label, title, tabsOn) {
  $("railLabel").textContent = label;
  $("railTitle").textContent = title;
  $("railTabs").style.display = tabsOn ? "" : "none";
}

function renderRail() {
  /* 客户/供应商角色：右栏保持个人待办/通知，不做上下文切换 */
  if (state.role === "client" || state.role === "supplier" || state.view === "dashboard") {
    setRailHead("Review Center", "审核中心", true);
    renderReview();
    return;
  }
  if (state.view === "projects") {
    setRailHead("Review Center", "审核中心", true);
    renderReview(state.prjOpen ? (state.railAll ? { allNote: true } : { prj: state.prjOpen }) : null);
    return;
  }
  if (state.view === "matching") {
    setRailHead("Review Center", "审核中心", true);
    renderReview({ kinds: ["shortlist", "final"] });
    return;
  }
  if (state.view === "clients") { setRailHead("Client Intel", "客户情报", false); railClient(); return; }
  if (state.view === "suppliers") { setRailHead("Supplier Intel", "供应商情报", false); railSupplier(); return; }
  if (state.view === "quality") { setRailHead("Quality Alerts", "质量预警", false); railQuality(); return; }
  if (state.view === "thinking") { setRailHead("Demo Flow", "演示动线", false); railDemo(); return; }
  setRailHead("Review Center", "审核中心", true);
  renderReview();
}

function railClient() {
  $("reviewCount").textContent = deriveReviews().length;
  const box = $("reviewList");
  const c = client(state.clientSel);
  if (!c) { box.innerHTML = `<div class="empty">未选择客户</div>`; return; }
  const pend = deriveReviews().filter(it => it.stage === "client" && prj((it.p || pkg(it.d.pkg)).prj)?.client === c.id);
  const redl = (c.compliance && c.compliance.auditCerts) || [];
  const news = feed.filter(f => f.txt.includes(c.name)).slice(0, 3);
  box.innerHTML = `
    <div class="rail-sub"><span>当前客户：${c.name}</span></div>
    <div class="r-item">
      <div class="r-top"><span class="chip skyc">待客户确认</span><span class="chip">${pend.length} 项</span></div>
      ${pend.length ? pend.map(it => {
        const p = it.p || pkg(it.d.pkg), pr = prj(p.prj);
        return `<div class="ri-line"><b>${it.kind === "design" ? `设计稿 V${it.d.ver} 定稿 · ${p.name}` : `定商确认 · ${p.name}`}</b>
          <button class="text-link" data-action="open-prj" data-prj="${pr.id}">打开项目</button></div>`;
      }).join("") : `<p class="muted">暂无需要该客户确认的事项</p>`}
    </div>
    <div class="r-item">
      <div class="r-top"><span class="chip red">验厂红线</span></div>
      ${redl.length
        ? `<div class="chip-row">${redl.map(x => `<span class="chip red">${x}</span>`).join("")}</div><p class="muted" style="margin-top:6px">下单前必须有效 · 匹配台自动校验，可切为硬性门槛</p>`
        : `<p class="muted">未设置硬性验厂红线（按项目要求执行）</p>`}
    </div>
    <div class="r-item">
      <div class="r-top"><span class="chip">最近动态</span></div>
      ${news.length ? news.map(n => `<div class="ri-news"><time>${n.t}</time>${n.txt}</div>`).join("") : `<p class="muted">近期暂无该客户相关动态</p>`}
    </div>`;
}

function railSupplier() {
  $("reviewCount").textContent = deriveReviews().length;
  const box = $("reviewList");
  const s = sup(state.supSel);
  if (!s) { box.innerHTML = `<div class="empty">未选择供应商</div>`; return; }
  const tasks = samples.filter(x => x.supplier === s.id && x.status !== "scored");
  const coop = packages.filter(p => p.confirmed.includes(s.id));
  const st = SUP_STATUS[s.status];
  box.innerHTML = `
    <div class="rail-sub"><span>当前供应商：${s.name}</span></div>
    <div class="r-item">
      <div class="r-top"><span class="tag ${st.tag}">${st.label}</span>${sourceTag(s)}</div>
      <p class="muted">${s.type} · ${s.region} · 主营 ${s.cats[0]}</p>
      ${(s.audits || []).length ? `<div class="chip-row" style="margin-top:6px">${s.audits.map(a => `<span class="chip ${AUDIT_CHIP[a.status] || ""}">${a.scheme} ${a.grade} · ${a.status}</span>`).join("")}${(s.caps || []).filter(c => c.status !== "已关闭").length ? `<span class="chip amber">CAP 开放 ${s.caps.filter(c => c.status !== "已关闭").length}</span>` : ""}</div>` : ""}
      ${s.status === "onboarding" ? `<p class="muted" style="margin-top:6px">准入待办：资料补充 + 验厂排期，完成前不参与候选（漏斗中透明展示原因）</p>` : ""}
    </div>
    <div class="r-item">
      <div class="r-top"><span class="chip skyc">打样任务进行中</span><span class="chip">${tasks.length} 项</span></div>
      ${tasks.length ? tasks.map(x => `<div class="ri-line"><b>${pkg(x.pkg).name}</b><span class="muted">${SAMPLE_STATUS[x.status].label} · 截止 ${x.due}</span></div>`).join("") : `<p class="muted">暂无进行中的打样任务</p>`}
    </div>
    <div class="r-item">
      <div class="r-top"><span class="chip green">已确认合作</span><span class="chip">${coop.length} 个需求包</span></div>
      ${coop.length ? coop.map(p => `<div class="ri-line"><b>${p.name}</b><button class="text-link" data-action="open-prj" data-prj="${p.prj}">打开项目</button></div>`).join("") : `<p class="muted">暂无确认合作的需求包</p>`}
    </div>
    <div class="r-item">
      <div class="r-top"><span class="chip green">认证（点击预览证书）</span></div>
      ${s.certs.length ? `<div class="chip-row">${s.certs.map(x => `<span class="chip green click-prev" data-action="file-open" data-kind="cert" data-sup="${s.id}" data-cert="${x}" title="点击预览证书">${x}</span>`).join("")}</div>` : `<p class="muted">认证资料收集中</p>`}
    </div>`;
}

const DEMO_STEPS = [
  { k: "map", n: 1, t: "全景导图开场", d: "平台思路页 2 分钟讲全局（本页）" },
  { k: "brief", n: 2, t: "新建 Brief · 现场拆包", d: "选客户自动带出品牌模板与价格带" },
  { k: "design", n: 3, t: "HEMA 2027 项目详情", d: "设计闭环：内审 → 客户意见 → V2 定稿" },
  { k: "match", n: 4, t: "匹配台 · 文具需求包", d: "硬性门槛开关 + 漏斗 + 权重滑杆" },
  { k: "sampling", n: 5, t: "打样与比样", d: "寄样 → 按 SKU 评分 → 定商建议" },
  { k: "client", n: 6, t: "切客户视角", d: "只确认设计稿 · 定商结果通知（切回用左下角色框）" },
  { k: "supplier", n: 7, t: "切供应商视角", d: "打样任务 + SKU 明细（切回用左下角色框）" },
  { k: "brand", n: 8, t: "品牌档案与合规", d: "客户管理页签：智能档案 + 验厂红线" },
  { k: "quality", n: 9, t: "质量控制塔", d: "验厂 / CAP / 测试 / TCF / 验货一屏闭环" }
];

function railQuality() {
  $("reviewCount").textContent = deriveReviews().length;
  const { audits, caps, skuRows } = qaData();
  const alerts = [
    ...caps.filter(x => x.cp.status === "逾期").map(x => ({ c: "red", t: `CAP 逾期：${x.s.name} · ${x.cp.id}（${x.cp.src} ${x.cp.sev}）`, d: `截止 ${x.cp.due} 已过` })),
    ...skuRows.flatMap(r => r.k.tests.filter(t => t.status === "不通过").map(t => ({ c: "red", t: `测试不通过：${r.k.id} · ${t.std}`, d: `${r.p.name} · 整改复测中` }))),
    ...audits.filter(x => x.a.status === "已过期").map(x => ({ c: "red", t: `验厂过期：${x.s.name} · ${x.a.scheme}`, d: "暂停分配，整改后重审" })),
    ...audits.filter(x => x.a.status === "即将到期").map(x => ({ c: "amber", t: `验厂即将到期：${x.s.name} · ${x.a.scheme} ${x.a.grade}`, d: `有效期至 ${x.a.valid} · 复审排期中` })),
    ...inspections.filter(i => i.status === "待录入").map(i => ({ c: "amber", t: `验货待录入：${pkg(i.pkg).name}`, d: `${i.date} · ${i.by}` })),
    ...caps.filter(x => x.cp.status === "待复审").map(x => ({ c: "skyc", t: `CAP 待复审：${x.s.name} · ${x.cp.id}`, d: `截止 ${x.cp.due}` })),
    ...inspections.filter(i => i.status === "待排期").map(i => ({ c: "outline", t: `验货待排期：${pkg(i.pkg).name}`, d: i.type }))
  ];
  $("reviewList").innerHTML = `
    <div class="rail-sub"><span>按风险优先级排列 · ${alerts.length} 条</span></div>
    ${alerts.map(a => `<div class="r-done"><b><span class="chip ${a.c}" style="margin-right:6px">${a.c === "red" ? "高" : a.c === "amber" ? "中" : "低"}</span>${a.t}</b>${a.d}</div>`).join("") || `<div class="empty">暂无质量预警</div>`}`;
}

function railDemo() {
  $("reviewCount").textContent = deriveReviews().length;
  $("reviewList").innerHTML = `
    <div class="rail-sub"><span>演示路线 · 点击直达对应页面</span></div>
    ${DEMO_STEPS.map(s => `
      <button class="demo-step" data-action="demo-jump" data-step="${s.k}">
        <i>${s.n}</i><span><b>${s.t}</b><small>${s.d}</small></span>
      </button>`).join("")}
    <p class="muted tight">沟通中的修正可当场画到左侧画板上，导出 JSON 汇总。</p>`;
}

function renderView() {
  renderChrome();
  ({
    dashboard: renderDashboard,
    projects: renderProjects,
    matching: renderMatching,
    clients: renderClients,
    suppliers: renderSuppliers,
    quality: renderQuality,
    thinking: () => { renderMap(); setupMapInteractions(); }
  }[state.view])();
  renderRail();
}

function setView(v) {
  const role = ROLES[state.role];
  state.view = role.nav.includes(v) ? v : role.nav[0];
  state.reasonFor = null;
  state.supEdit = false;
  state.railAll = false;
  renderView();
  window.scrollTo({ top: 0 });
}

function setRole(r) {
  state.role = r;
  state.reasonFor = null;
  const role = ROLES[r];
  if (!role.nav.includes(state.view)) state.view = role.nav[0];
  if (state.prjOpen && r === "client" && prj(state.prjOpen)?.client !== ROLES.client.clientId) state.prjOpen = null;
  renderView();
  toast(`已切换到：${role.banner}`);
}

/* ----- 状态流转动作 ----- */

function submitInternal(pkgId) {
  const p = pkg(pkgId);
  if (!p.shortlist.length) return;
  p.status = "shortlist_review";
  p.returnNote = null;
  log(`${p.name} 打样候选名单（${p.shortlist.map(id => sup(id).name).join("、")}）提交内审`, p.prj);
  toast("打样候选名单已提交内审，请在右侧审核中心处理");
  renderView();
}

function shortlistPass(pkgId) {
  const p = pkg(pkgId);
  p.status = "sampling";
  p.shortlist.forEach(sid => {
    if (!samples.some(s => s.pkg === pkgId && s.supplier === sid)) {
      const su = sup(sid);
      samples.push({
        id: "S-" + String(samples.length + 1).padStart(2, "0"),
        pkg: pkgId, supplier: sid, status: "sampling", due: "15 天内",
        score: null,
        preset: { 质量: Math.max(70, (su.quality ?? 85) - 2), 工艺还原: Math.max(70, (su.quality ?? 85) - 5), 报价: su.price ?? 80 },
        note: ""
      });
    }
  });
  log(`${p.name} 打样名单内审通过，已向 ${p.shortlist.length} 家候选发出打样邀请`, p.prj);
  done(`${p.name} 打样邀请已发出（${p.shortlist.map(id => sup(id).name).join("、")}）`);
  toast("打样邀请已发出，进入打样阶段（项目详情 → 打样与比样）");
  renderView();
}

function sampleAdvance(sampleId) {
  const s = samples.find(x => x.id === sampleId);
  if (!s) return;
  const nxt = { sampling: "delivered", delivered: "reviewing" }[s.status];
  if (!nxt) return;
  s.status = nxt;
  log(`${sup(s.supplier).name} 的 ${pkg(s.pkg).name} 样品${SAMPLE_STATUS[nxt].label}`, pkg(s.pkg).prj);
  renderView();
}

function sampleScore(sampleId) {
  const s = samples.find(x => x.id === sampleId);
  if (!s || !s.preset) return;
  s.score = { ...s.preset };
  s.status = "scored";
  /* 按 SKU 生成明细分（零和偏移 → 各 SKU 均值恰等于综合分） */
  const skus = (pkg(s.pkg).skuList || []).map(k => k.id);
  if (skus.length) {
    const zeroSum = n => {
      const o = [];
      for (const pair of [[2, -2], [1, -1]]) if (o.length + 2 <= n) o.push(...pair);
      while (o.length < n) o.push(0);
      return o;
    };
    const o1 = zeroSum(skus.length), o2 = [...o1.slice(1), o1[0]];
    s.skuScores = skus.map((id, i) => ({
      sku: id, 质量: s.preset.质量 + o1[i], 工艺还原: s.preset.工艺还原 + o2[i], 报价: s.preset.报价
    }));
  }
  const avg = Math.round((s.score.质量 + s.score.工艺还原 + s.score.报价) / 3);
  log(`${sup(s.supplier).name} 的 ${pkg(s.pkg).name} 样品评分完成：综合 ${avg} 分（按 SKU 明细见比样区）`, pkg(s.pkg).prj);
  toast(`已录入评分（按 SKU，综合 ${avg} 分）`);
  renderView();
}

function genFinal(pkgId) {
  const p = pkg(pkgId);
  const scored = samplesOf(pkgId).filter(s => s.score);
  if (!scored.length) return;
  const best = scored.reduce((a, b) =>
    (b.score.质量 + b.score.工艺还原 + b.score.报价) > (a.score.质量 + a.score.工艺还原 + a.score.报价) ? b : a);
  p.suggestSup = best.supplier;
  p.status = "final_internal";
  p.returnNote = null;
  log(`${p.name} 比样完成，定商建议：${sup(best.supplier).name}（依据打样评分），进入内审`, p.prj);
  toast(`定商建议已生成：${sup(best.supplier).name}，请在右侧审核中心内审`);
  renderView();
}

function finalPass(pkgId) {
  const p = pkg(pkgId);
  p.status = "confirmed";
  p.confirmed = [p.suggestSup];
  const c = client(prj(p.prj).client);
  log(`${p.name} 定商内审通过，确认合作供应商：${sup(p.suggestSup).name}（依据打样评分），结果已同步 ${c ? c.name : "客户"}`, p.prj);
  done(`${p.name} 定商确认：${sup(p.suggestSup).name}（内审 · 业务员 A）`);
  toast(`已确认合作：${sup(p.suggestSup).name}，结果已同步客户（无需客户二次确认）`);
  renderView();
}

function designPass(dId) {
  const d = designs.find(x => x.id === dId);
  d.status = "client_review";
  const p = pkg(d.pkg);
  log(`设计稿 V${d.ver}（${p.name}）内审通过，提交客户确认`, p.prj);
  done(`设计稿 V${d.ver}（${p.name}）内审通过`);
  toast("设计稿已提交客户，切换到客户视角可确认定稿");
  renderView();
}

function designApprove(dId) {
  const d = designs.find(x => x.id === dId);
  d.status = "approved";
  const p = pkg(d.pkg);
  log(`${client(prj(p.prj).client).name} 确认设计稿 V${d.ver}（${p.name}）定稿`, p.prj);
  done(`设计稿 V${d.ver}（${p.name}）客户定稿`);
  let advanced = false;
  if (p.status === "design") {
    const latest = designsOf(p.id).slice(-1)[0];
    if (latest && latest.status === "approved") {
      p.status = "matching";
      advanced = true;
      log(`${p.name} 设计定稿，进入打样候选匹配`, p.prj);
    }
  }
  toast(advanced ? "设计定稿，需求包进入打样候选匹配" : "设计稿已定稿");
  renderView();
}

function uploadVersion(pkgId, file) {
  const ds = designsOf(pkgId);
  const last = ds[ds.length - 1];
  const p = pkg(pkgId);
  designs.push({
    id: `D-${String(designs.length + 1).padStart(2, "0")}`,
    pkg: pkgId, ver: last.ver + 1, designer: last.designer,
    date: nowLabel().replace("今天 ", "今天"),
    status: "internal_review",
    palette: [last.palette[1], last.palette[0]],
    note: null,
    file: file || null,
    skuMap: (p.skuList || []).map(k => ({ sku: k.id, status: "已出稿" }))
  });
  log(`设计稿 V${last.ver + 1}（${p.name}）已上传${file ? `：${file.name}` : ""}，进入内审`, p.prj);
  toast(`已上传 V${last.ver + 1}${file ? `（${file.name}）` : ""}，进入内审`);
  renderView();
}

function applyReason(text) {
  const rf = state.reasonFor;
  if (!rf) return;
  const note = text.trim() || "（未填写具体原因）";
  if (rf.t === "shortlist-return") {
    const p = pkg(rf.id);
    p.status = "matching";
    p.returnNote = `打样名单内审退回：${note}`;
    log(`${p.name} 打样候选名单被内审退回：${note}`, p.prj);
    done(`${p.name} 打样名单内审退回`);
    toast("已退回，需求包回到待选打样候选");
  } else if (rf.t === "final-return") {
    const p = pkg(rf.id);
    p.status = "sampling";
    p.returnNote = `定商建议内审退回：${note}`;
    log(`${p.name} 定商建议被内审退回：${note}`, p.prj);
    toast("已退回比样阶段，可复核评分后重新生成建议");
  } else if (rf.t === "design-return") {
    const d = designs.find(x => x.id === rf.id);
    d.status = "changes";
    d.note = `内审退回：${note}`;
    log(`设计稿 V${d.ver}（${pkg(d.pkg).name}）内审退回：${note}`, pkg(d.pkg).prj);
    toast("设计稿已退回设计师");
  } else if (rf.t === "design-changes") {
    const d = designs.find(x => x.id === rf.id);
    d.status = "changes";
    d.note = `客户修改意见：${note}`;
    log(`${client(prj(pkg(d.pkg).prj).client).name} 对设计稿 V${d.ver}（${pkg(d.pkg).name}）提出修改意见：${note}`, pkg(d.pkg).prj);
    done(`设计稿 V${d.ver}（${pkg(d.pkg).name}）客户提修改意见`);
    toast("修改意见已记录，等待上传新版本");
  }
  state.reasonFor = null;
  renderView();
}

/* ---------- 平台全景导图 ---------- */

const MAP_INIT = [
  { id: "r-client", x: 46,  y: 34,  w: 158, h: 46, band: "role", label: "客户", sub: "Brief · 定稿 · 品牌规范",
    desc: "客户只做三件事：提交 Brief 需求（正式文件 / 邮件 / 微信 / 口头都行）；确认设计稿定稿；提供品牌规范细则（视觉 / 材料色彩 / 合规标准）。定商由 Eastlink 依据打样比样内部确定并同步结果。",
    hi: ["m-brief", "m-design", "d-client", "d-pool"] },
  { id: "r-sales", x: 320, y: 34,  w: 196, h: 46, band: "role", label: "业务员 · 项目 Owner", sub: "拆解 · 选候选 · 比样",
    desc: "承接 Brief 并拆解为需求包；设计定稿后在匹配工作台选打样候选并内审；跟进打样、录入评分、生成定商建议。",
    hi: ["m-brief", "m-parse", "m-pkg", "m-match", "m-sample"] },
  { id: "r-mgr", x: 632, y: 34,  w: 150, h: 46, band: "role", label: "管理层", sub: "全局只读 · 风险关注",
    desc: "查看所有项目健康度、审核积压、供应商风险与换选记录；不直接操作流程。",
    hi: [] },
  { id: "r-sup", x: 902, y: 34,  w: 170, h: 46, band: "role", label: "供应商", sub: "按定稿打样 · 接合作通知",
    desc: "作为打样候选按定稿设计出样、寄样；定商后收到合作通知，看到自己的 SKU 明细、任务与质量整改项。永远看不到竞争候选与评分对比。",
    hi: ["m-sample", "m-coop", "d-pool"] },

  /* 第一行 · Stage 1–2：Brief → 设计定稿 → 规格与质量前置 */
  { id: "m-brief",  x: 28,  y: 248, w: 150, h: 54, band: "main", label: "Brief 接收", sub: "文件/邮件/微信/口头",
    desc: "Stage 1。任何形式的 Brief 都先进系统登记并生成版本。「新建项目」向导支持现场录入并直接拆包。", hi: ["r-client", "d-client"] },
  { id: "m-parse",  x: 216, y: 248, w: 150, h: 54, band: "main", label: "结构化拆解", sub: "字段 + 需求包",
    desc: "Stage 1。把原始 Brief 拆成结构化字段并按品类拆出需求包；品牌档案的模板与价格带自动带入。", hi: ["r-sales", "m-pkg"] },
  { id: "m-pkg",    x: 404, y: 248, w: 150, h: 54, band: "hot",  label: "需求包 · SKU 清单", sub: "流转最小单位",
    desc: "Stage 1。一个 Brief 拆 N 个需求包；包内继续拆到 SKU 开发清单（编号 / 规格材质 / 结构 / 数量 / 目标单价 / 状态），后续设计、规格、打样、质量全部按 SKU 跟踪。项目状态由需求包汇总得出。", hi: ["m-parse", "m-propose"] },
  { id: "m-propose", x: 592, y: 248, w: 150, h: 54, band: "main", label: "产品提案", sub: "成熟结构复用 / 新结构验证",
    desc: "Stage 1。逐 SKU 判定成熟结构还是新结构：成熟结构直接复用已有方案进入开发；新结构先出结构样 / 3D 样验证结构，验证通过再投入全开发——避免在没验证的结构上做完整开发。", hi: ["r-sales", "m-design"] },
  { id: "m-design", x: 780, y: 248, w: 150, h: 54, band: "main", label: "设计协同", sub: "逐 SKU 出稿 · 客户定稿",
    desc: "Stage 1。版本内逐 SKU 跟踪出稿覆盖，全出稿才可内审 → 客户确认 → 定稿；修改意见记录原文并标记受影响 SKU。设计定稿是客户唯一的确认节点，也是打样的前提——候选按同一套定稿出样，比样才公平。", hi: ["r-client", "m-spec", "d-log"] },
  { id: "m-spec",   x: 968, y: 248, w: 150, h: 54, band: "hot",  label: "规格与质量", sub: "PSF + PPA 前置",
    desc: "Stage 2（本方案的关键变化）。定稿同时产出可投产规格：每个 SKU 一份规格书 PSF（规格 / 材质 / 结构 / 工艺 / 认证 / 色彩基线），以及质量与测试要求 PPA——都由平台整理、客户确认，不再等样品出来才补定义，从源头消除后期改规格的返工。", hi: ["r-client", "r-sales", "d-quality", "d-client"] },

  /* 第二行 · Stage 3–4：匹配打样 → 比价比样定商 → 合作与交付 */
  { id: "m-match",  x: 28,  y: 352, w: 150, h: 54, band: "main", label: "多维度匹配", sub: "硬门槛 + 8 维排序",
    desc: "Stage 3。带着定稿与规格进入匹配：先过硬性门槛（准入 / 品类 / 工艺全覆盖，认证与验厂红线可切为硬性），再按 8 维加权排序选 2–3 家打样候选；漏斗全程透明，名单内审通过即发打样邀请。", hi: ["d-pool", "r-sales"] },
  { id: "m-sample", x: 216, y: 352, w: 150, h: 54, band: "main", label: "打样", sub: "候选按定稿出样",
    desc: "Stage 3。候选各自按同一套定稿设计与 PSF 出样、寄样；质量 / 工艺还原按 SKU 逐项评分。", hi: ["r-sup", "d-log"] },
  { id: "m-tender", x: 404, y: 352, w: 150, h: 54, band: "main", label: "比价", sub: "报价对比 · 成本优化",
    desc: "Stage 3。各候选基于同一份规格报价，报价与质量、工艺还原并列为按 SKU 评分的三项之一；同规格同口径比价，避免用不同方案报出的价格互相比较。", hi: ["r-sup", "m-decide"] },
  { id: "m-decide", x: 592, y: 352, w: 150, h: 54, band: "main", label: "比样定商", sub: "综合评分 · 内审确认",
    desc: "Stage 3。综合分 = 各 SKU 均值，据此生成定商建议并内审；内审通过即确认合作供应商（内部决策，客户无需二次确认），也可退回比样 / 换选。", hi: ["d-log"] },
  { id: "m-coop",   x: 780, y: 352, w: 150, h: 54, band: "main", label: "确认合作", sub: "通知供应商",
    desc: "Stage 3 收口。确认结果同步客户、合作通知发给供应商；需求包进入交付准备，项目资产沉淀入库。", hi: ["d-prj", "r-sup", "m-deliver"] },
  { id: "m-deliver", x: 968, y: 352, w: 150, h: 54, band: "main", label: "金样与包装", sub: "FS 确认 · 刀线（P2）",
    desc: "Stage 4。金样 / 最终样确认（FS）与包装结构、刀线、装箱信息准备；质量控制塔的四项就绪门（验厂有效 + 测试全通过 + TCF 齐备 + 验货通过）全绿才可进入大货下单。包装与刀线库属 P2 建设范围。", hi: ["d-quality", "d-prj"] },

  { id: "d-client", x: 60,  y: 480, w: 178, h: 54, band: "asset", label: "客户档案", sub: "品牌智能 · 材料色彩 · 合规",
    desc: "品牌智能档案（定位/视觉/价格带/决策链/Brief 模板）、材料与色彩资产库（Pantone/ΔE/认可禁用材料）与合规验厂标准，为拆解、设计和匹配提供背景与红线——客户提供规范，平台按此执行。", hi: ["m-brief", "r-client"] },
  { id: "d-pool",   x: 290, y: 480, w: 200, h: 54, band: "asset", label: "供应商池", sub: "客户提供 / 自主开发 · 六状态",
    desc: "全量供应商资源库：来源标签 + 六种准入状态 + 能力标签。是匹配打分的数据地基；客户提供的供应商对该客户全量可见。", hi: ["m-match", "r-client", "r-sup"] },
  { id: "d-quality", x: 540, y: 480, w: 190, h: 54, band: "hot", label: "质量控制塔", sub: "TCF·测试·验厂·验货·CAP",
    desc: "PPA 测试要求随设计定稿前置定义；TCF 按 SKU 建档；验厂到期预警、验货与 CAP 整改闭环；验厂有效 + 测试全通过 + TCF 齐备 + 验货通过四项就绪门全绿才可下大货（P2）。质量数据回流供应商档案与匹配风险提示。", hi: ["m-design", "m-coop", "d-pool"] },
  { id: "d-prj",    x: 780, y: 480, w: 150, h: 54, band: "asset", label: "项目库", sub: "历史沉淀 · 复用",
    desc: "完结项目沉淀为可复用资产：需求包结构、定稿设计、打样评分与定商记录；P3 供匹配模型自学习。", hi: ["m-coop"] },
  { id: "d-log",    x: 980, y: 480, w: 180, h: 54, band: "asset", label: "审核与流转记录", sub: "每一步留痕",
    desc: "设计意见、打样评分、定商依据、换选原因全部记录原文与时间线——对客户透明、对内可复盘。", hi: ["m-design", "m-sample", "m-decide"] }
];

const MAP_EDGES = [
  /* 主线 Stage 1–2（第一行） */
  { from: "m-brief",   to: "m-parse",   label: "结构化",       type: "main" },
  { from: "m-parse",   to: "m-pkg",     label: "拆包",         type: "main" },
  { from: "m-pkg",     to: "m-propose", label: "定结构",  type: "main" },
  { from: "m-propose", to: "m-design",  label: "出设计",     type: "main" },
  { from: "m-design",  to: "m-spec",    label: "定稿",     type: "main" },
  /* 换行：规格就绪后进入 Stage 3 */
  { from: "m-spec",    to: "m-match",   label: "可投产规格 → 进入匹配", type: "main", vert: true },
  /* 主线 Stage 3–4（第二行） */
  { from: "m-match",   to: "m-sample",  label: "发打样",     type: "main" },
  { from: "m-sample",  to: "m-tender",  label: "报价",  type: "main" },
  { from: "m-tender",  to: "m-decide",  label: "比样",   type: "main" },
  { from: "m-decide",  to: "m-coop",    label: "确认",     type: "main" },
  { from: "m-coop",    to: "m-deliver", label: "交付",     type: "main" },
  { from: "m-decide",  to: "m-match",   label: "换选 / 加打样", type: "back", dip: 34 },
  /* 知识与数据 */
  { from: "d-pool",    to: "m-match",   label: "供给候选",     type: "asset" },
  { from: "m-coop",    to: "d-prj",     label: "沉淀复用",     type: "asset", vert: true },
  { from: "m-spec",    to: "d-quality", label: "PPA 前置",     type: "asset", sel: true, vert: true },
  { from: "d-quality", to: "m-deliver", label: "四项就绪门",   type: "asset", vert: true },
  { from: "d-client",  to: "m-brief",   label: "背景输入",     type: "asset", sel: true },
  { from: "d-client",  to: "m-spec",    label: "规范输入",     type: "asset", sel: true, vert: true },
  /* 角色动作 */
  { from: "r-client",  to: "m-brief",   label: "提交 Brief",   type: "role" },
  { from: "r-client",  to: "m-design",  label: "确认设计稿",   type: "role", vert: true },
  { from: "r-client",  to: "m-spec",    label: "确认规格",     type: "role", sel: true, vert: true },
  { from: "m-decide",  to: "r-client",  label: "结果同步",     type: "role", vert: true },
  { from: "r-sales",   to: "m-parse",   label: "拆解",         type: "role", sel: true },
  { from: "r-sales",   to: "m-propose", label: "结构方案",     type: "role", sel: true, vert: true },
  { from: "r-sales",   to: "m-spec",    label: "出 PSF / PPA", type: "role", sel: true, vert: true },
  { from: "r-sales",   to: "m-match",   label: "选打样候选",   type: "role", sel: true, vert: true },
  { from: "r-sales",   to: "m-tender",  label: "评分比样",     type: "role", sel: true, vert: true },
  { from: "r-sup",     to: "m-sample",  label: "按定稿出样",   type: "role", sel: true, vert: true },
  { from: "r-sup",     to: "m-tender",  label: "报价",         type: "role", sel: true, vert: true },
  { from: "m-coop",    to: "r-sup",     label: "合作通知",     type: "role", vert: true },
  /* 留痕 */
  { from: "m-design",  to: "d-log",     label: "意见留痕",     type: "asset", sel: true, vert: true },
  { from: "m-tender",  to: "d-log",     label: "评分留痕",     type: "asset", sel: true, vert: true },
  { from: "m-decide",  to: "d-log",     label: "确认留痕",     type: "asset", sel: true, vert: true }
];


const MAP_STORE_KEY = "eastlink_map_v2";
let mapNodes = [], mapEdges = [], mapSeq = 100;
const mnode = id => mapNodes.find(n => n.id === id);
const medge = eid => mapEdges.find(e => e.eid === eid);

function mapDefaults() {
  mapNodes = MAP_INIT.map(n => ({ ...n, hi: [...n.hi] }));
  mapEdges = MAP_EDGES.map((e, i) => ({ ...e, eid: "e" + (i + 1) }));
  mapSeq = 100;
}

function mapSave() {
  try {
    localStorage.setItem(MAP_STORE_KEY, JSON.stringify({ v: 1, nodes: mapNodes, edges: mapEdges, seq: mapSeq }));
    const el = $("mapSaveState");
    if (el) el.textContent = "已保存到本机 " + nowLabel().replace("今天 ", "");
  } catch (e) { /* 隐私模式等场景下静默降级 */ }
}

function mapLoad() {
  mapDefaults();
  try {
    const raw = localStorage.getItem(MAP_STORE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d && Array.isArray(d.nodes) && Array.isArray(d.edges) &&
        d.nodes.every(n => n.id && typeof n.x === "number" && typeof n.y === "number")) {
      mapNodes = d.nodes;
      mapEdges = d.edges;
      mapSeq = d.seq || 100;
    }
  } catch (e) { /* 数据损坏则回退默认 */ }
}
mapLoad();

function mapNeighbors(id) {
  const s = new Set();
  const n = mnode(id);
  (n?.hi || []).forEach(x => { if (mnode(x)) s.add(x); });
  mapEdges.forEach(e => {
    if (e.from === id && mnode(e.to)) s.add(e.to);
    if (e.to === id && mnode(e.from)) s.add(e.from);
  });
  return s;
}

function cubicAt(t, p) {
  const u = 1 - t;
  return {
    x: u*u*u*p.x1 + 3*u*u*t*p.c1x + 3*u*t*t*p.c2x + t*t*t*p.x2,
    y: u*u*u*p.y1 + 3*u*u*t*p.c1y + 3*u*t*t*p.c2y + t*t*t*p.y2
  };
}

function edgeGeom(e) {
  const a = mnode(e.from), b = mnode(e.to);
  const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
  const dx = bcx - acx, dy = bcy - acy;
  let p;
  if (e.type === "back") {
    const y1 = a.y + a.h, y2 = b.y + b.h;
    const dip = Math.max(y1, y2) + (e.dip || 46);
    p = { x1: acx, y1, c1x: acx, c1y: dip, c2x: bcx, c2y: dip, x2: bcx, y2 };
  } else if (!e.vert && Math.abs(dx) >= Math.abs(dy)) {
    const x1 = dx > 0 ? a.x + a.w : a.x, x2 = dx > 0 ? b.x : b.x + b.w;
    const off = Math.min(56, Math.abs(x2 - x1) / 2 + 8);
    p = { x1, y1: acy, c1x: x1 + (dx > 0 ? off : -off), c1y: acy, c2x: x2 - (dx > 0 ? off : -off), c2y: bcy, x2, y2: bcy };
  } else {
    const y1 = dy > 0 ? a.y + a.h : a.y, y2 = dy > 0 ? b.y : b.y + b.h;
    const off = Math.min(e.vert ? 96 : 56, Math.abs(y2 - y1) / 2 + 8);
    p = { x1: acx, y1, c1x: acx, c1y: y1 + (dy > 0 ? off : -off), c2x: bcx, c2y: y2 - (dy > 0 ? off : -off), x2: bcx, y2 };
  }
  return { d: `M ${p.x1} ${p.y1} C ${p.c1x} ${p.c1y}, ${p.c2x} ${p.c2y}, ${p.x2} ${p.y2}`, mid: cubicAt(0.5, p) };
}

function mapEdgesHtml() {
  const sel = state.mapSel;
  return mapEdges.map(e => {
    if (!mnode(e.from) || !mnode(e.to)) return "";
    const touches = sel && (e.from === sel || e.to === sel);
    if (e.sel && !touches && !e.custom) return "";
    const isSel = state.mapEdgeSel === e.eid;
    const dim = (sel && !touches) || (state.mapEdgeSel && !isSel);
    const cls = `edge ${e.type} ${isSel ? "esel" : ""} ${touches ? "hot" : ""} ${dim ? "dim" : ""}`;
    const g = edgeGeom(e);
    const marker = { main: "arrow-main", back: "arrow-back", asset: "arrow-asset", role: "arrow-role" }[e.type] || "arrow-role";
    return `<g class="${cls}" data-eid="${e.eid}">
      <path class="hit" d="${g.d}"></path>
      <path d="${g.d}" marker-end="url(#${marker})"></path>
      <text x="${g.mid.x}" y="${g.mid.y - 5}" text-anchor="middle">${esc(e.label)}</text>
    </g>`;
  }).join("");
}

function mapNodesHtml() {
  const sel = state.mapSel;
  const rel = sel ? mapNeighbors(sel) : null;
  const edgeSel = state.mapEdgeSel ? medge(state.mapEdgeSel) : null;
  return mapNodes.map(n => {
    const isEnd = edgeSel && (edgeSel.from === n.id || edgeSel.to === n.id);
    const cls = [
      "map-node",
      { role: "mn-role", main: "mn-main", hot: "mn-hot", asset: "mn-asset" }[n.band] || "mn-main",
      sel === n.id ? "sel" : "",
      (rel && rel.has(n.id)) || isEnd ? "rel" : "",
      sel && sel !== n.id && !rel.has(n.id) ? "dim" : ""
    ].join(" ");
    return `<g class="${cls}" data-node="${n.id}" transform="translate(${n.x},${n.y})">
      <rect width="${n.w}" height="${n.h}" rx="11"></rect>
      <text class="mn-label" x="${n.w / 2}" y="${n.h / 2 - 2}" text-anchor="middle">${esc(n.label)}</text>
      <text class="mn-sub" x="${n.w / 2}" y="${n.h / 2 + 13}" text-anchor="middle">${esc(n.sub)}</text>
    </g>`;
  }).join("");
}

function renderMap() {
  const svg = $("platformMap");
  if (!svg) return;
  svg.classList.toggle("linking", !!state.mapLink);
  svg.innerHTML = `
    <defs>
      ${[["arrow-main", "#0666FF"], ["arrow-back", "#B45309"], ["arrow-asset", "#0C7A4B"], ["arrow-role", "#0B5E93"]]
        .map(([id, c]) => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="${c}"></path></marker>`).join("")}
    </defs>
    <g class="map-band">
      <rect x="10" y="18" width="1160" height="78" rx="12"></rect><text x="24" y="34">角色 ROLES</text>
      <rect x="10" y="222" width="1160" height="204" rx="12"></rect><text x="24" y="238">业务主线 MAIN FLOW（Stage 1–2 上行：设计与规格前置 ｜ Stage 3–4 下行：打样定商与交付）</text>
      <rect x="10" y="462" width="1160" height="90" rx="12"></rect><text x="24" y="478">组织知识 KNOWLEDGE（个人知识 → 组织知识）</text>
    </g>
    <g id="mapEdgeLayer">${mapEdgesHtml()}</g>
    <g id="mapNodeLayer">${mapNodesHtml()}</g>`;
  renderMapDetail();
}

const MAP_TYPE_OPTIONS = sel => ["main:主线（蓝实线）", "back:退回（橙虚线）", "asset:数据（绿虚线）", "role:角色（蓝点线）"]
  .map(x => { const [v, l] = x.split(":"); return `<option value="${v}" ${v === sel ? "selected" : ""}>${l}</option>`; }).join("");

function renderMapDetail() {
  const box = $("mapDetail");
  if (!box) return;

  if (state.mapLink) {
    const from = mnode(state.mapLink.from);
    box.innerHTML = `<b>连线模式</b> · 从「${esc(from.label)}」出发，<span class="muted">现在点击目标节点完成连线，点空白处取消</span>
      <div class="map-form">
        <label class="field">连线标签<input id="mlk-label" value="${esc(state.mapLink.label)}"></label>
        <label class="field">线型<select id="mlk-type">${MAP_TYPE_OPTIONS(state.mapLink.type)}</select></label>
      </div>
      <div class="r-actions" style="margin-top:8px"><button class="ghost mini" data-action="map-link-cancel">取消连线</button></div>`;
    return;
  }

  if (state.mapEdgeSel) {
    const e = medge(state.mapEdgeSel);
    if (e) {
      const a = mnode(e.from), b = mnode(e.to);
      box.innerHTML = `<b>连线</b> · ${a ? esc(a.label) : "?"} → ${b ? esc(b.label) : "?"}
        <div class="map-form">
          <label class="field">标签<input id="med-label" value="${esc(e.label)}"></label>
          <label class="field">线型<select id="med-type">${MAP_TYPE_OPTIONS(e.type)}</select></label>
        </div>
        <div class="r-actions" style="margin-top:8px">
          <button class="primary mini" data-action="map-edge-save">保存</button>
          <button class="ghost mini" data-action="map-edge-del">删除连线</button>
        </div>`;
      return;
    }
  }

  const n = state.mapSel ? mnode(state.mapSel) : null;
  if (!n) {
    box.innerHTML = `这是一块<b>可编辑画板</b>：点击节点看说明，<b>双击节点直接编辑</b>文字，拖动自由布局；选中节点后可「连线到…」「删除」；点击连线可改标签或删除。改动<b>自动保存在本机浏览器</b>；用「导出」把画板发给同事，对方「导入」即可查看（多人实时协同为 P2 后端范围）。`;
    return;
  }

  if (state.mapEdit) {
    box.innerHTML = `<b>编辑节点</b>
      <div class="map-form">
        <label class="field">名称<input id="mne-label" value="${esc(n.label)}"></label>
        <label class="field">副标题<input id="mne-sub" value="${esc(n.sub)}"></label>
        <label class="field">类型<select id="mne-band">
          <option value="role">角色（天蓝）</option><option value="main">主线（白）</option>
          <option value="hot">重点（品牌蓝）</option><option value="asset">数据（绿）</option></select></label>
        <label class="field" style="grid-column:1/-1">说明（点击节点时展示）<textarea id="mne-desc">${esc(n.desc)}</textarea></label>
      </div>
      <div class="r-actions" style="margin-top:8px">
        <button class="primary mini" data-action="map-node-save">保存</button>
        <button class="ghost mini" data-action="map-node-cancel">取消</button>
      </div>`;
    $("mne-band").value = n.band;
    return;
  }

  const rel = [...mapNeighbors(n.id)];
  box.innerHTML = `<b>${esc(n.label)}</b> · <span class="muted">${esc(n.sub)}</span>
    <p style="margin-top:6px">${esc(n.desc) || "（暂无说明，点「编辑节点」补充）"}</p>
    ${rel.length ? `<div class="chip-row">${rel.map(id => `<span class="chip blue">${esc(mnode(id).label)}</span>`).join("")}</div>` : ""}
    <div class="r-actions" style="margin-top:10px">
      <button class="ghost mini" data-action="map-node-edit">✎ 编辑节点</button>
      <button class="ghost mini" data-action="map-link-start">→ 连线到…</button>
      <button class="ghost mini" data-action="map-node-del">删除节点</button>
    </div>`;
}

function mapClearSel() {
  state.mapSel = null;
  state.mapEdgeSel = null;
  state.mapEdit = false;
  state.mapLink = null;
}

function setupMapInteractions() {
  const svg = $("platformMap");
  if (!svg || svg.dataset.bound) return;
  svg.dataset.bound = "1";
  let drag = null;

  svg.addEventListener("pointerdown", e => {
    const g = e.target.closest("[data-node]");

    if (state.mapLink) {
      if (g && g.dataset.node !== state.mapLink.from) {
        mapEdges.push({
          eid: "e" + (++mapSeq),
          from: state.mapLink.from,
          to: g.dataset.node,
          label: ($("mlk-label") ? $("mlk-label").value.trim() : "") || "关联",
          type: $("mlk-type") ? $("mlk-type").value : "asset",
          custom: true
        });
        state.mapLink = null;
        mapSave();
        renderMap();
        toast("连线已创建");
      } else {
        state.mapLink = null;
        renderMap();
      }
      return;
    }

    if (g) {
      const n = mnode(g.dataset.node);
      const pt = svgPoint(svg, e);
      drag = { n, dx: pt.x - n.x, dy: pt.y - n.y, sx: e.clientX, sy: e.clientY, moved: false };
      svg.setPointerCapture(e.pointerId);
      return;
    }

    const eg = e.target.closest("[data-eid]");
    if (eg) {
      state.mapSel = null;
      state.mapEdit = false;
      state.mapEdgeSel = state.mapEdgeSel === eg.dataset.eid ? null : eg.dataset.eid;
      renderMap();
      return;
    }

    if (state.mapSel || state.mapEdgeSel) { mapClearSel(); renderMap(); }
  });

  svg.addEventListener("pointermove", e => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) drag.moved = true;
    if (!drag.moved) return;
    const pt = svgPoint(svg, e);
    drag.n.x = Math.max(4, Math.min(1180 - drag.n.w - 4, pt.x - drag.dx));
    drag.n.y = Math.max(4, Math.min(620 - drag.n.h - 4, pt.y - drag.dy));
    const g = svg.querySelector(`[data-node="${drag.n.id}"]`);
    if (g) g.setAttribute("transform", `translate(${drag.n.x},${drag.n.y})`);
    const layer = svg.querySelector("#mapEdgeLayer");
    if (layer) layer.innerHTML = mapEdgesHtml();
  });

  svg.addEventListener("pointerup", () => {
    if (!drag) return;
    if (drag.moved) {
      mapSave();
    } else {
      state.mapEdgeSel = null;
      state.mapEdit = false;
      state.mapSel = state.mapSel === drag.n.id ? null : drag.n.id;
      renderMap();
    }
    drag = null;
  });
  svg.addEventListener("pointercancel", () => { drag = null; });

  svg.addEventListener("dblclick", e => {
    const g = e.target.closest("[data-node]");
    if (!g) return;
    state.mapSel = g.dataset.node;
    state.mapEdgeSel = null;
    state.mapEdit = true;
    renderMap();
  });
}

function svgPoint(svg, e) {
  const r = svg.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * 1180, y: (e.clientY - r.top) / r.height * 620 };
}

/* ----- 画板编辑动作 ----- */

function mapAddNode() {
  const id = "c" + (++mapSeq);
  mapNodes.push({
    id, x: 470 + (mapSeq % 4) * 28, y: 128 + (mapSeq % 3) * 26, w: 150, h: 52,
    band: "main", label: "新节点", sub: "双击修改", desc: "", hi: []
  });
  state.mapSel = id;
  state.mapEdgeSel = null;
  state.mapEdit = true;
  mapSave();
  renderMap();
}

function mapNodeSave() {
  const n = mnode(state.mapSel);
  if (!n) return;
  n.label = $("mne-label").value.trim() || n.label;
  n.sub = $("mne-sub").value.trim();
  n.band = $("mne-band").value;
  n.desc = $("mne-desc").value.trim();
  n.w = Math.min(260, Math.max(120, n.label.length * 14 + 44));
  state.mapEdit = false;
  mapSave();
  renderMap();
  toast("节点已保存");
}

function mapNodeDel() {
  const id = state.mapSel;
  if (!id) return;
  mapNodes = mapNodes.filter(n => n.id !== id);
  mapEdges = mapEdges.filter(e => e.from !== id && e.to !== id);
  mapClearSel();
  mapSave();
  renderMap();
  toast("节点及其连线已删除（「重置」可还原默认画板）");
}

function mapEdgeSave() {
  const e = medge(state.mapEdgeSel);
  if (!e) return;
  e.label = $("med-label").value.trim() || e.label;
  e.type = $("med-type").value;
  mapSave();
  renderMap();
  toast("连线已保存");
}

function mapEdgeDel() {
  mapEdges = mapEdges.filter(e => e.eid !== state.mapEdgeSel);
  state.mapEdgeSel = null;
  mapSave();
  renderMap();
  toast("连线已删除");
}

function mapExport() {
  const blob = new Blob([JSON.stringify({ v: 1, nodes: mapNodes, edges: mapEdges, seq: mapSeq }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "eastlink-platform-map.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("画板已导出为 JSON，可发给同事导入查看");
}

function mapImport(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || !Array.isArray(d.nodes) || !Array.isArray(d.edges) ||
          !d.nodes.every(n => n.id && typeof n.x === "number")) throw new Error("bad");
      mapNodes = d.nodes;
      mapEdges = d.edges;
      mapSeq = Math.max(100, d.seq || 0,
        ...mapNodes.map(n => Number(String(n.id).replace(/\D/g, "")) || 0),
        ...mapEdges.map(e => Number(String(e.eid).replace(/\D/g, "")) || 0));
      mapClearSel();
      mapSave();
      renderMap();
      toast("画板已导入并保存");
    } catch (err) {
      toast("导入失败：不是有效的画板 JSON 文件");
    }
  };
  reader.readAsText(file);
}

/* ----- 新建 Brief 向导 ----- */

const NB_PROCS = ["印刷", "模切", "装订", "烫金", "缝纫", "丝印", "压花", "注塑", "模压", "电镀", "组装"];
const NB_CERTS = ["FSC", "EN71", "REACH", "BSCI", "GRS", "SEDEX", "ISO9001", "LFGB", "FDA", "Disney FAMA"];

function pkgRowHtml() {
  return `<div class="nb-pkg">
    <button class="ghost mini rm" data-action="brief-rm-pkg">删除</button>
    <div class="form-grid">
      <label class="field">需求包名称 *<input class="nbp-name" placeholder="如：野餐餐具需求包"></label>
      <label class="field">品类 *<select class="nbp-cat"><option value="">选择品类</option>${["文具", "包袋", "水具", "礼品", "家居"].map(c => `<option>${c}</option>`).join("")}</select></label>
      <label class="field">SKU 数<input class="nbp-sku" type="number" min="1" placeholder="如：12"></label>
      <label class="field">月需求量（件）<input class="nbp-qty" type="number" min="1000" step="1000" placeholder="如：50000"></label>
      <label class="field">目标价格带<input class="nbp-price" placeholder="如：€2.0 – 4.0"></label>
      <label class="field">交期上限（天）<input class="nbp-lead" type="number" placeholder="45"></label>
    </div>
    <div class="field">工艺要求（点选）<div class="chip-row">${NB_PROCS.map(x => `<span class="chip chip-toggle nbp-proc">${x}</span>`).join("")}</div></div>
    <div class="field">认证要求（点选）<div class="chip-row">${NB_CERTS.map(x => `<span class="chip chip-toggle nbp-cert">${x}</span>`).join("")}</div></div>
  </div>`;
}

function openBriefModal() {
  state.nbFile = null;
  $("briefModalInner").innerHTML = `
    <div class="modal-head">
      <div><p class="label">New Brief</p><h3>新建项目 · 接收 Brief</h3></div>
      <button class="ghost mini" data-action="brief-close">✕ 关闭</button>
    </div>
    <div class="modal-body">
      <div>
        <p class="label" style="margin-bottom:8px">① Brief 接收</p>
        <div class="form-grid">
          <label class="field">客户
            <select id="nb-client">
              ${clients.map(c => `<option value="${c.id}">${c.name} · ${c.level}</option>`).join("")}
              <option value="__new">新客户（先建项目，后补建档）</option>
            </select></label>
          <label class="field">项目名称 *<input id="nb-name" placeholder="如：HEMA 2028 夏季户外系列"></label>
          <label class="field">Brief 形式
            <select id="nb-source">
              <option>正式文件（PDF / PPT）</option><option>邮件正文</option>
              <option>微信聊天记录</option><option>口头描述 + 参考图</option>
            </select></label>
          <div class="field">原始 Brief 文件（可选 · 真实选取，仅本页预览）
            <span class="up-row"><button type="button" class="ghost mini" data-action="nb-pick">选择文件</button><span class="up-name" id="nb-file-name">未选择</span></span></div>
          <label class="field">项目主题<input id="nb-theme" placeholder="如：Summer Outdoor"></label>
          <label class="field">目标市场<input id="nb-market" placeholder="如：欧洲门店"></label>
          <label class="field">整体价格带<input id="nb-price" placeholder="如：€2.0 – 9.0"></label>
          <label class="field">上市时间<input id="nb-launch" placeholder="如：2027-06"></label>
        </div>
        <div id="nb-brand-hint"></div>
      </div>
      <div>
        <p class="label" style="margin-bottom:8px">② 结构化拆解为需求包（可先不拆，项目停在"拆解中"）</p>
        <p class="muted" style="margin-bottom:8px">每个需求包创建后按 SKU 数自动生成 SKU 占位（编号/规格/单价待细化），明细在项目详情展开补充。</p>
        <div id="nb-pkgs">${pkgRowHtml()}</div>
        <button class="ghost mini" data-action="brief-add-pkg">+ 再加一个需求包</button>
      </div>
    </div>
    <div class="modal-foot">
      <span class="muted">创建后：填了需求包 → 直接进入「匹配中」；没填 → 停在「拆解中」，之后再补。</span>
      <button class="ghost" data-action="brief-close">取消</button>
      <button class="primary" data-action="brief-create">创建项目</button>
    </div>`;
  $("briefModal").classList.add("open");
  renderBriefHint($("nb-client").value);
}

function renderBriefHint(clientId) {
  const box = $("nb-brand-hint");
  if (!box) return;
  const c = client(clientId);
  if (!c || !c.brand) { box.innerHTML = ""; return; }
  const b = c.brand;
  box.innerHTML = `<div class="nb-hint">
    <b>${c.name} · Brief 拆解模板提示（来自品牌智能档案）</b>
    <div class="chip-row">${b.briefTemplate.fields.map(x => `<span class="chip skyc">${x}</span>`).join("")}</div>
    <div class="chip-row">${b.store.priceBands.map(x => `<span class="chip outline">${x.cat} ${x.band}</span>`).join("")}${b.visual.forbidden.slice(0, 2).map(x => `<span class="chip red">⛔ ${x}</span>`).join("")}</div>
    ${b.matlib ? `<div class="chip-row">${b.matlib.materials.slice(0, 3).map(m => `<span class="chip green">${m.name}</span>`).join("")}<span class="chip outline">材料基线 · 详见品牌档案</span></div>` : ""}
    <span>${b.briefTemplate.note} 选择品类后，目标价格带自动带入参考值。</span>
  </div>`;
}

function briefCreate() {
  const name = $("nb-name").value.trim();
  if (!name) { toast("请填写项目名称"); return; }
  const rows = [...document.querySelectorAll("#nb-pkgs .nb-pkg")];
  const pkgRows = [];
  for (const r of rows) {
    const pname = r.querySelector(".nbp-name").value.trim();
    const cat = r.querySelector(".nbp-cat").value;
    if (!pname && !cat) continue;
    if (!pname || !cat) { toast("需求包需要填写名称并选择品类"); return; }
    pkgRows.push({
      name: pname, cat,
      sku: Number(r.querySelector(".nbp-sku").value) || 12,
      qty: Number(r.querySelector(".nbp-qty").value) || 30000,
      price: r.querySelector(".nbp-price").value.trim() || "待确认",
      lead: Number(r.querySelector(".nbp-lead").value) || 45,
      procs: [...r.querySelectorAll(".nbp-proc.sel")].map(x => x.textContent),
      certs: [...r.querySelectorAll(".nbp-cert.sel")].map(x => x.textContent)
    });
  }
  const cliVal = $("nb-client").value;
  const source = $("nb-source").value;
  const launch = $("nb-launch").value.trim() || "待定";
  const prjId = "PRJ-" + (2600 + projects.length + 1);
  const d = new Date();
  const today = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  projects.push({
    id: prjId, name, client: cliVal === "__new" ? null : cliVal, owner: "业务员 A",
    launch, briefVer: "V1",
    briefFile: state.nbFile ? state.nbFile.name : (source === "正式文件（PDF / PPT）" ? "Brief_V1.pdf" : "（非正式 Brief · 待整理归档）"),
    briefUpload: state.nbFile,
    brief: {
      "项目主题": $("nb-theme").value.trim() || "待补充",
      "目标市场": $("nb-market").value.trim() || "待确认",
      "SKU 结构": pkgRows.length ? pkgRows.map(p => `${p.cat} ${p.sku}`).join(" · ") : "待拆解",
      "整体价格带": $("nb-price").value.trim() || "待确认",
      "上市时间": launch,
      "关键节点": "待排期",
      "Brief 形式": source,
      "Eastlink Owner": "业务员 A"
    },
    timeline: [{ t: today, txt: `Brief 接收（${source}），项目创建` }]
  });

  pkgRows.forEach(p => {
    const catCode = { "文具": "ST", "包袋": "BG", "水具": "DR", "家居": "HM", "礼品": "GF" }[p.cat] || "SK";
    packages.push({
      id: `REQ-${String(packages.length + 1).padStart(2, "0")}`,
      prj: prjId, name: p.name, cat: p.cat, sku: p.sku, monthly: p.qty,
      qtyLabel: `${(p.qty / 10000).toFixed(p.qty % 10000 ? 1 : 0)} 万件/月`,
      priceBand: p.price, procs: p.procs, certs: p.certs, leadLimit: p.lead,
      status: "design", shortlist: [], confirmed: [], suggestSup: null, returnNote: null,
      skuList: Array.from({ length: Math.min(p.sku, 4) }, (_, i) => ({
        id: `${catCode}-${String(i + 1).padStart(2, "0")}`, name: `${p.cat} SKU-${String(i + 1).padStart(2, "0")}（待细化）`,
        spec: "待补充", qty: "待分配", price: "见价格带", status: "待设计", struct: "待判定"
      }))
    });
  });
  if (pkgRows.length) prj(prjId).timeline.push({ t: today, txt: `Brief 结构化拆解完成，拆出 ${pkgRows.length} 个需求包，进入设计阶段` });
  feed.unshift({ t: nowLabel(), txt: `新项目「${name}」已创建${pkgRows.length ? `，拆出 ${pkgRows.length} 个需求包，先行设计（定稿后匹配打样候选）` : "，Brief 拆解中"}` });

  $("briefModal").classList.remove("open");
  state.prjOpen = prjId;
  setView("projects");
  toast(pkgRows.length ? "项目已创建，需求包进入设计阶段（设计定稿后匹配打样候选）" : "项目已创建，当前处于拆解中");
}

/* ============================================================
   文件预览与真实上传（纯内存：刷新即清，不上传任何服务器）
   ============================================================ */

/* 真实文件选择器：图片/PDF ≤3.5MB 读成 dataURL 可预览，其余仅记录元信息 */
function pickFile(accept, cb) {
  const inp = $("fileInput");
  inp.accept = accept || "";
  inp.value = "";
  inp.onchange = () => {
    const f = inp.files[0];
    if (!f) return;
    const meta = { name: f.name.replace(/[<>"'&]/g, ""), mime: f.type || "application/octet-stream", size: f.size, src: null };
    if (f.size <= 3.5 * 1024 * 1024 && (meta.mime.startsWith("image/") || meta.mime === "application/pdf")) {
      const r = new FileReader();
      r.onload = () => { meta.src = r.result; cb(meta); };
      r.readAsDataURL(f);
    } else {
      if (f.size > 3.5 * 1024 * 1024) toast("文件较大，Demo 只保留元信息，不缓存预览");
      cb(meta);
    }
  };
  inp.click();
}

const fmtSize = n => !n && n !== 0 ? "—" : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

/* ---------- Mock 示意图生成器（SVG 字符串，品牌配色） ---------- */

const FV_INK = "#12254A", FV_FAINT = "#64748F", FV_LINE = "#DCE5F2", FV_BLUE = "#0666FF", FV_GREEN = "#0C7A4B";

/* 按品类画产品线稿（设计稿示意） */
function fvSketch(cat, c0) {
  const S = `fill:${c0};fill-opacity:.16;stroke:${FV_INK};stroke-width:3`;
  const A = `fill:${c0};fill-opacity:.4;stroke:${FV_INK};stroke-width:2.5`;
  if (cat.includes("包袋")) return `
    <path d="M160 240 Q250 150 340 240 L340 370 Q340 392 318 392 L182 392 Q160 392 160 370 Z" style="${S}"/>
    <path d="M222 196 Q250 162 278 196" fill="none" stroke="${FV_INK}" stroke-width="6" stroke-linecap="round"/>
    <rect x="205" y="292" width="90" height="64" rx="14" style="${A}"/>
    <path d="M172 262 H328" stroke="${FV_INK}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/>`;
  if (cat.includes("文具") || cat.includes("文创")) return `
    <rect x="160" y="188" width="145" height="184" rx="10" style="${S}"/>
    ${[0, 1, 2, 3, 4].map(i => `<circle cx="160" cy="${212 + i * 34}" r="6" fill="#fff" stroke="${FV_INK}" stroke-width="2.5"/>`).join("")}
    ${[0, 1, 2].map(i => `<path d="M190 ${240 + i * 36} H278" stroke="${FV_INK}" stroke-width="2.5" opacity=".45"/>`).join("")}
    <g transform="rotate(16 350 280)"><rect x="338" y="196" width="24" height="140" rx="5" style="${A}"/>
    <path d="M338 336 L350 366 L362 336 Z" style="${S}"/></g>`;
  if (cat.includes("水具")) return `
    <rect x="230" y="162" width="40" height="28" rx="7" style="${A}"/>
    <path d="M212 212 Q212 190 238 190 L262 190 Q288 190 288 212 L288 342 Q288 372 258 372 L242 372 Q212 372 212 342 Z" style="${S}"/>
    <rect x="212" y="268" width="76" height="44" style="${A}"/>`;
  if (cat.includes("家居") || cat.includes("厨房")) return `
    <rect x="152" y="204" width="196" height="34" rx="9" style="${A}"/>
    <rect x="164" y="238" width="172" height="126" rx="10" style="${S}"/>
    <ellipse cx="250" cy="292" rx="28" ry="11" fill="#fff" stroke="${FV_INK}" stroke-width="2.5"/>`;
  if (cat.includes("礼品") || cat.includes("玩具")) return `
    <rect x="158" y="214" width="184" height="34" rx="7" style="${A}"/>
    <rect x="170" y="248" width="160" height="118" rx="8" style="${S}"/>
    <rect x="238" y="214" width="24" height="152" style="${A}"/>
    <circle cx="230" cy="202" r="15" style="${S}"/><circle cx="270" cy="202" r="15" style="${S}"/>`;
  return `
    <rect x="165" y="180" width="170" height="195" rx="16" style="${S}"/>
    <path d="M180 214 H320" stroke="${FV_INK}" stroke-width="2.5" stroke-dasharray="7 6"/>
    <rect x="288" y="150" width="34" height="46" rx="6" style="${A}"/>`;
}

/* 设计稿示意：画板 + 品类线稿 + 尺寸标注 + 色彩/工艺/认证栏 */
function svgDesignArt(d, p) {
  const [c0, c1] = d.palette;
  const dims = `stroke:${FV_FAINT};stroke-width:1.6`;
  return `<svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" role="img" style="background:#FBFCFF">
    <defs><pattern id="fvgrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0 H0 V24" fill="none" stroke="#EAF0FA" stroke-width="1"/></pattern></defs>
    <rect width="800" height="560" fill="url(#fvgrid)"/>
    <text x="42" y="58" font-size="21" font-weight="700" fill="${FV_INK}">${p.name} · 设计稿</text>
    <text x="42" y="82" font-size="12.5" fill="${FV_FAINT}">需求包 ${p.id} · 品类 ${p.cat} · 目标价 ${p.priceBand}</text>
    <rect x="694" y="38" width="66" height="32" rx="9" fill="${c0}"/>
    <text x="727" y="59" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">V${d.ver}</text>
    <rect x="42" y="104" width="418" height="368" rx="14" fill="#fff" stroke="${FV_LINE}"/>
    ${fvSketch(p.cat, c0)}
    <path d="M160 412 V424 M340 412 V424 M160 418 H340" style="${dims}"/>
    <text x="250" y="440" font-size="11.5" fill="${FV_FAINT}" text-anchor="middle">420 mm（示意标注）</text>
    <path d="M368 190 H380 M368 372 H380 M374 190 V372" style="${dims}"/>
    <text x="392" y="286" font-size="11.5" fill="${FV_FAINT}">300 mm</text>
    <text x="492" y="132" font-size="13" font-weight="700" fill="${FV_INK}">色彩规范</text>
    <rect x="492" y="146" width="48" height="48" rx="10" fill="${c0}"/><text x="550" y="176" font-size="11.5" fill="${FV_FAINT}">${c0}</text>
    <rect x="492" y="204" width="48" height="48" rx="10" fill="${c1}" stroke="${FV_LINE}"/><text x="550" y="234" font-size="11.5" fill="${FV_FAINT}">${c1}</text>
    <text x="492" y="298" font-size="13" font-weight="700" fill="${FV_INK}">工艺要求（硬性门槛）</text>
    ${p.procs.map((x, i) => `<text x="492" y="${322 + i * 24}" font-size="12.5" fill="${FV_FAINT}">· ${x}</text>`).join("")}
    <text x="492" y="${322 + p.procs.length * 24 + 26}" font-size="13" font-weight="700" fill="${FV_INK}">认证要求</text>
    <text x="492" y="${322 + p.procs.length * 24 + 50}" font-size="12.5" fill="${FV_FAINT}">${p.certs.join(" / ") || "—"}</text>
    <text x="42" y="516" font-size="12" fill="${FV_FAINT}">设计师 ${d.designer} · ${d.date} · ${DESIGN_STATUS[d.status].label}</text>
    <text x="42" y="538" font-size="11" fill="#93A3BF">Eastlink Demo 生成示意稿 · 非真实文件</text>
  </svg>`;
}

/* 文档页示意（规范类资产 / Brief 附件） */
function svgDoc(title, rows, accent) {
  const bars = [432, 470, 380, 452, 300, 462, 420, 338, 408, 282, 446, 360];
  const body = rows && rows.length
    ? rows.slice(0, 9).map(([k, v], i) => `
        <text x="62" y="${188 + i * 46}" font-size="13.5" font-weight="700" fill="${FV_INK}">${k}</text>
        <text x="556" y="${188 + i * 46}" font-size="13" fill="${FV_FAINT}" text-anchor="end">${String(v).slice(0, 26)}</text>
        <path d="M62 ${202 + i * 46} H556" stroke="${FV_LINE}" stroke-width="1"/>`).join("")
    : bars.map((w, i) => `<rect x="62" y="${176 + i * 40}" width="${w}" height="12" rx="6" fill="#E7EDF7"/>`).join("");
  return `<svg viewBox="0 0 620 820" xmlns="http://www.w3.org/2000/svg" role="img">
    <rect x="34" y="34" width="560" height="760" rx="10" fill="#D9E2F2"/>
    <rect x="26" y="26" width="560" height="760" rx="10" fill="#fff" stroke="${FV_LINE}"/>
    <rect x="26" y="26" width="560" height="10" fill="${accent || FV_BLUE}"/>
    <text x="62" y="94" font-size="21" font-weight="700" fill="${FV_INK}">${title}</text>
    <text x="62" y="120" font-size="12" fill="${FV_FAINT}">Demo 生成示意文档 · 非真实文件内容</text>
    ${body}
    <text x="62" y="762" font-size="11" fill="#93A3BF">第 1 页 · Eastlink 合作供应商平台 Demo</text>
  </svg>`;
}

/* 图库拼贴示意（视觉 / 素材 / 参考类资产） */
function svgPhotoGrid(label, colors) {
  const c0 = colors[0] || FV_BLUE, c1 = colors[1] || "#4FB3F6";
  const shape = i => [
    `<circle cx="116" cy="105" r="42" fill="#fff" fill-opacity=".85"/>`,
    `<rect x="74" y="63" width="84" height="84" rx="16" fill="#fff" fill-opacity=".85"/>`,
    `<path d="M116 60 L162 150 L70 150 Z" fill="#fff" fill-opacity=".85"/>`
  ][i % 3];
  return `<svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" role="img">
    <rect width="800" height="560" fill="#FBFCFF"/>
    <text x="40" y="52" font-size="18" font-weight="700" fill="${FV_INK}">${label}</text>
    <text x="40" y="74" font-size="12" fill="${FV_FAINT}">Demo 生成示意拼贴 · 非真实素材</text>
    ${[0, 1, 2, 3, 4, 5].map(i => {
      const x = 40 + (i % 3) * 248, y = 94 + Math.floor(i / 3) * 226;
      return `<g transform="translate(${x} ${y})">
        <rect width="232" height="210" rx="14" fill="${i % 2 ? c1 : c0}" fill-opacity="${i % 3 === 2 ? ".55" : ".85"}"/>
        ${shape(i)}</g>`;
    }).join("")}
    <text x="40" y="548" font-size="11" fill="#93A3BF">Eastlink 合作供应商平台 Demo</text>
  </svg>`;
}

/* 证书版式示意（供应商认证） */
function svgCert(certName, supName) {
  return `<svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" role="img">
    <rect width="800" height="560" fill="#fff"/>
    <rect x="24" y="24" width="752" height="512" rx="14" fill="none" stroke="${FV_BLUE}" stroke-width="4"/>
    <rect x="40" y="40" width="720" height="480" rx="10" fill="none" stroke="${FV_LINE}"/>
    <text x="400" y="112" font-size="13" letter-spacing="6" fill="${FV_FAINT}" text-anchor="middle">CERTIFICATE OF COMPLIANCE</text>
    <text x="400" y="168" font-size="36" font-weight="800" fill="${FV_INK}" text-anchor="middle">${certName}</text>
    <path d="M320 196 H480" stroke="${FV_BLUE}" stroke-width="3"/>
    <text x="400" y="248" font-size="14" fill="${FV_FAINT}" text-anchor="middle">兹证明</text>
    <text x="400" y="290" font-size="24" font-weight="700" fill="${FV_INK}" text-anchor="middle">${supName}</text>
    <text x="400" y="330" font-size="14" fill="${FV_FAINT}" text-anchor="middle">已通过 ${certName} 相关标准的审核要求</text>
    <text x="180" y="472" font-size="12.5" fill="${FV_FAINT}">有效期至 2027-12（示意）</text>
    <text x="180" y="496" font-size="11" fill="#93A3BF">Eastlink 合作供应商平台 Demo · 非真实证书</text>
    <circle cx="620" cy="440" r="56" fill="none" stroke="${FV_GREEN}" stroke-width="2" stroke-dasharray="4 5"/>
    <circle cx="620" cy="440" r="44" fill="#2FCE8B" fill-opacity=".14" stroke="${FV_GREEN}" stroke-width="2.5"/>
    <text x="620" y="448" font-size="17" font-weight="700" fill="${FV_GREEN}" text-anchor="middle">示意</text>
  </svg>`;
}

/* 色卡示意（客户色彩体系） */
function svgColorCard(col, holder) {
  const kv = [["PANTONE", col.pantone], ["HEX", col.hex], ["用途", col.usage], ["色差要求", col.tol]];
  return `<svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" role="img">
    <rect width="800" height="560" fill="#FBFCFF"/>
    <rect x="56" y="64" width="320" height="400" rx="18" fill="${col.hex}" stroke="${FV_LINE}"/>
    <rect x="56" y="404" width="320" height="60" rx="0" fill="#fff" fill-opacity=".92"/>
    <text x="76" y="440" font-size="15" font-weight="700" fill="${FV_INK}">${col.name} · ${col.pantone}</text>
    <text x="430" y="130" font-size="30" font-weight="800" fill="${FV_INK}">${col.name}</text>
    ${kv.map(([k, v], i) => `
      <text x="430" y="${190 + i * 62}" font-size="12" fill="${FV_FAINT}" letter-spacing="2">${k}</text>
      <text x="430" y="${214 + i * 62}" font-size="16.5" font-weight="700" fill="${FV_INK}">${String(v).slice(0, 24)}</text>`).join("")}
    <text x="56" y="506" font-size="12" fill="${FV_FAINT}">${holder} 色彩标准 · 打样以 Pantone 纸版色卡为准</text>
    <text x="56" y="528" font-size="11" fill="#93A3BF">Eastlink Demo 生成示意色卡 · 非正式标准文件</text>
  </svg>`;
}

/* ---------- 预览弹窗 ---------- */

function fvStageFor(file, fallbackSvg) {
  if (file && file.src && file.mime.startsWith("image/")) return { stage: `<img src="${file.src}" alt="${file.name}">`, real: true };
  if (file && file.src && file.mime === "application/pdf")
    return { stage: `<embed src="${file.src}" type="application/pdf" style="width:100%;height:56vh">`, real: true, pdf: true };
  return { stage: fallbackSvg, real: false };
}

function openFileView(kind, ref) {
  let title = "", stage = "", metas = [];
  let hint = "示意预览由 Demo 实时生成；正式版接入真实文件服务与版本管理。";

  if (kind === "design") {
    const d = designs.find(x => x.id === ref.id);
    if (!d) return;
    const p = pkg(d.pkg);
    const fv = fvStageFor(d.file, "");
    title = `${p.name} · 设计稿 V${d.ver}`;
    stage = fv.real ? fv.stage : svgDesignArt(d, p);
    if (fv.real) hint = fv.pdf ? "真实上传的 PDF（仅本页内存）；浏览器限制内嵌时以元信息为准。" : "真实上传文件，仅保存在本页内存，刷新后恢复示意图。";
    metas = [["文件名", d.file ? d.file.name : `${p.id}_设计稿_V${d.ver}.svg（示意）`], ["版本", `V${d.ver}`], ["状态", DESIGN_STATUS[d.status].label],
             ["设计师", d.designer], ["日期", d.date], d.file ? ["大小", fmtSize(d.file.size)] : null];
  }
  else if (kind === "asset") {
    const c = client(ref.client);
    const a = c && c.brand && c.brand.assets[+ref.idx];
    if (!a) return;
    const fallback = a.type === "规范" ? svgDoc(a.name, null, c.brand.colors[0])
      : a.type === "授权" ? svgCert(a.name, c.name)
      : svgPhotoGrid(a.name, c.brand.colors);
    const fv = fvStageFor(a.file, fallback);
    title = `${c.name} · ${a.name}`;
    stage = fv.stage;
    if (fv.real) hint = "真实上传文件，仅保存在本页内存（刷新即清），不会上传到任何服务器。";
    metas = [["文件名", a.file ? a.file.name : `${a.name}.pdf（示意）`], ["类型", a.type], ["版本", a.ver], ["更新", a.date],
             ["所属", c.name], a.file ? ["大小", fmtSize(a.file.size)] : null];
  }
  else if (kind === "brief") {
    const p = prj(ref.prj);
    if (!p) return;
    const fv = fvStageFor(p.briefUpload, svgDoc(`${p.name} · Brief ${p.briefVer}`, Object.entries(p.brief)));
    title = `${p.name} · Brief 原文`;
    stage = fv.stage;
    if (fv.real) hint = fv.pdf ? "真实上传的 Brief PDF（仅本页内存）。" : "真实上传的 Brief 文件，仅保存在本页内存。";
    metas = [["文件名", p.briefFile], ["版本", `Brief ${p.briefVer}`], ["客户", client(p.client) ? client(p.client).name : "待建档"],
             ["Owner", p.owner], ["上市", p.launch]];
  }
  else if (kind === "cert") {
    const s = sup(ref.sup);
    if (!s) return;
    title = `${s.name} · ${ref.cert} 证书`;
    stage = svgCert(ref.cert, s.name);
    metas = [["证书", ref.cert], ["持有方", s.name], ["文件", `${ref.cert}_证书扫描件.pdf（示意）`], ["核验", "准入审核已核验（Demo）"]];
  }
  else if (kind === "color") {
    const c = client(ref.client);
    const col = c && c.brand && c.brand.matlib && c.brand.matlib.colors[+ref.idx];
    if (!col) return;
    title = `${c.name} · ${col.name} 色卡`;
    stage = svgColorCard(col, c.name);
    metas = [["Pantone", col.pantone], ["HEX", col.hex], ["用途", col.usage], ["色差要求", col.tol]];
    hint = "示意色卡由 Demo 生成；实际打样以 Pantone 纸版色卡与客户签样为准。";
  }
  else if (kind === "mat") {
    const c = client(ref.client);
    const m = c && c.brand && c.brand.matlib && c.brand.matlib.materials[+ref.idx];
    if (!m) return;
    title = `${c.name} · ${m.name} 材料卡`;
    stage = svgDoc(m.name, [["规格", m.spec], ["适用品类", m.cats.join(" / ")], ["认证要求", m.cert], ["状态", m.status], ["用途", "打样与大货物料基线"]], c.brand.colors[0]);
    metas = [["材料", m.name], ["认证要求", m.cert], ["状态", m.status], ["所属", c.name]];
    hint = "材料卡为 Demo 生成示意；正式版挂接材料检测报告与供应商物料档案。";
  }
  else if (kind === "psf") {
    const p = pkg(ref.pkg);
    const k = p && p.skuList && p.skuList[+ref.idx];
    if (!k) return;
    const c = client(prj(p.prj)?.client);
    const mainColor = c && c.brand && c.brand.matlib ? c.brand.matlib.colors[0] : null;
    title = `${k.id} · 产品规格书（PSF）`;
    stage = svgDoc(`${k.id} 产品规格书（PSF）`, [
      ["SKU 名称", k.name],
      ["规格 / 材质", k.spec || "待补充"],
      ["结构", k.struct || "成熟结构"],
      ["数量", k.qty || "待分配"],
      ["目标单价", k.price || "见价格带"],
      ["工艺（需求包）", p.procs.join(" / ")],
      ["认证（需求包）", p.certs.join(" / ")],
      ["测试要求 PPA", k.tests ? k.tests.map(t => t.std).join("、") : "随定稿定义"],
      ["色彩基线", mainColor ? `${mainColor.name} ${mainColor.pantone}（${mainColor.tol}）` : "见品牌档案"]
    ], c && c.brand ? c.brand.colors[0] : null);
    metas = [["SKU", k.id], ["需求包", p.name], ["状态", k.status || "—"], ["口径", "平台生成 · 客户确认"]];
    hint = "PSF 为 Demo 生成示意——规格 / 测试 / 色彩基线由平台按品牌规范整理，客户只需确认；正式版为可下载的标准规格文件。";
  }
  else return;

  $("fileModalInner").innerHTML = `
    <div class="modal-head">
      <div><p class="label">File Preview</p><h3>${title}</h3></div>
      <button class="ghost mini" data-action="file-close">✕ 关闭</button>
    </div>
    <div class="modal-body">
      <div class="fv-stage">${stage}</div>
      <div class="fv-meta">${metas.filter(Boolean).map(([k, v]) => `<span>${k}：<b>${v}</b></span>`).join("")}</div>
      <p class="muted tight" style="margin-top:9px">${hint}</p>
    </div>`;
  $("fileModal").classList.add("open");
}

function closeFileView() {
  $("fileModal").classList.remove("open");
  $("fileModalInner").innerHTML = "";
}

/* ----- 事件委托 ----- */

document.addEventListener("click", e => {
  if (e.target.id === "briefModal") { $("briefModal").classList.remove("open"); return; }
  if (e.target.id === "fileModal") { closeFileView(); return; }
  const chip = e.target.closest(".chip-toggle");
  if (chip) { chip.classList.toggle("sel"); return; }
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const a = btn.dataset.action;

  if (a === "jump") setView(btn.dataset.jump);
  else if (a === "open-prj") { state.prjOpen = btn.dataset.prj; setView("projects"); }
  else if (a === "back-prj") { state.prjOpen = null; renderView(); }
  else if (a === "goto-match") { state.pkgSel = btn.dataset.pkg; setView("matching"); }
  else if (a === "pkg-sel") { state.pkgSel = btn.dataset.pkg; state.reasonFor = null; renderMatching(); }
  else if (a === "w-reset") {
    DIMS.forEach(d => state.weights[d.key] = d.w);
    renderMatching();
    toast("权重已恢复默认");
  }
  else if (a === "pick") {
    const p = pkg(state.pkgSel);
    const id = btn.dataset.sup;
    if (p.shortlist.includes(id)) p.shortlist = p.shortlist.filter(x => x !== id);
    else p.shortlist.push(id);
    renderCandidates();
  }
  else if (a === "submit-internal") submitInternal(btn.dataset.pkg);
  else if (a === "shortlist-pass") shortlistPass(btn.dataset.pkg);
  else if (a === "sample-advance") sampleAdvance(btn.dataset.sample);
  else if (a === "sample-score") sampleScore(btn.dataset.sample);
  else if (a === "gen-final") genFinal(btn.dataset.pkg);
  else if (a === "final-pass") finalPass(btn.dataset.pkg);
  else if (a === "design-pass") designPass(btn.dataset.design);
  else if (a === "design-approve") designApprove(btn.dataset.design);
  else if (a === "upload-version") { const pk = btn.dataset.pkg; pickFile("image/*,application/pdf", f => uploadVersion(pk, f)); }
  else if (a === "file-open") openFileView(btn.dataset.kind, btn.dataset);
  else if (a === "file-close") closeFileView();
  else if (a === "fold-all") {
    const folds = [...document.querySelectorAll("details.fold")];
    const openAll = !folds.every(d => d.open);
    folds.forEach(d => { d.open = openAll; });
    btn.textContent = openAll ? "收起全部细节" : "展开全部细节";
  }
  else if (a === "sku-toggle") { state.skuOpen[btn.dataset.pkg] = !state.skuOpen[btn.dataset.pkg]; renderView(); }
  else if (a === "samp-sku-toggle") { state.sampSku[btn.dataset.sample] = !state.sampSku[btn.dataset.sample]; renderView(); }
  else if (a === "rail-all-toggle") { state.railAll = !state.railAll; renderRail(); }
  else if (a === "demo-jump") {
    const k = btn.dataset.step;
    if (k === "map") {
      setView("thinking");
      const fm = $("foldMap");
      if (fm) { fm.open = true; fm.scrollIntoView({ behavior: "smooth", block: "start" }); }
      toast("开场：先讲「框架一页纸」，再用全景导图展开全局");
    }
    else if (k === "brief") openBriefModal();
    else if (k === "design") { state.prjOpen = "PRJ-2601"; setView("projects"); toast("设计稿区演示：内审 → 客户意见 → V2 → 定稿"); }
    else if (k === "match") { state.pkgSel = "REQ-01"; setView("matching"); toast("演示门槛开关与漏斗，勾 2 家提交内审"); }
    else if (k === "sampling") { state.prjOpen = "PRJ-2601"; setView("projects"); toast("项目详情中部即「打样与比样」区"); }
    else if (k === "client") setRole("client");
    else if (k === "supplier") setRole("supplier");
    else if (k === "brand") { state.clientSel = "CLI-001"; state.clientTab = "brand"; setView("clients"); }
    else if (k === "quality") { setView("quality"); toast("演示：录入验货结果 → 自动生成 CAP → 复审关闭"); }
  }
  else if (a === "insp-result") {
    const ins = inspections.find(i => i.id === btn.dataset.insp);
    if (ins && ins.status === "待录入") {
      ins.status = "不通过";
      ins.note = "Major 3 处：印刷色差 ΔE 超标（对照客户色卡）→ 已开 CAP 整改";
      const su = sup(ins.supplier);
      if (su) {
        su.caps = su.caps || [];
        const capId = `CAP-${String(suppliers.reduce((a, s) => a + (s.caps || []).length, 0) + 1).padStart(2, "0")}`;
        su.caps.push({ id: capId, src: "验货", issue: `${pkg(ins.pkg).name} 首单验货 Major 3 处（印刷色差 ΔE 超标），返工后复验`, sev: "Major", due: "09-01", status: "整改中" });
        ins.note += `（${capId}）`;
        log(`${pkg(ins.pkg).name} 首单验货不通过，已生成 ${capId} 挂 ${su.name}，复验前不可下大货`, pkg(ins.pkg).prj);
        toast(`验货不通过 → 已自动生成 ${capId}（${su.name}）`);
      }
      renderView();
    }
  }
  else if (a === "cap-close") {
    const su = sup(btn.dataset.sup);
    const cp = su && (su.caps || []).find(x => x.id === btn.dataset.cap);
    if (cp) {
      cp.status = "已关闭";
      log(`${su.name} 的 ${cp.id}（${cp.src}）复审通过，整改闭环`, null);
      toast(`${cp.id} 已关闭（复审通过）`);
      renderView();
    }
  }
  else if (a === "nb-pick") pickFile("", f => {
    state.nbFile = f;
    const el = $("nb-file-name");
    if (el) el.textContent = `${f.name}（${fmtSize(f.size)}）`;
  });
  else if (a === "reason-open") {
    state.reasonFor = { t: btn.dataset.rt, id: btn.dataset.rid, inReview: !!btn.closest(".review") };
    renderView();
  }
  else if (a === "reason-confirm") {
    const txt = $("reasonText") ? $("reasonText").value : "";
    applyReason(txt);
  }
  else if (a === "reason-cancel") { state.reasonFor = null; renderView(); }
  else if (a === "client-sel") { state.clientSel = btn.dataset.client; renderClients(); renderRail(); }
  else if (a === "client-tab") { state.clientTab = btn.dataset.tab; renderClients(); }
  else if (a === "sup-sel") { state.supSel = btn.dataset.sup; state.supEdit = false; renderSupplierCards(); renderRail(); }
  else if (a === "sup-edit") { state.supEdit = true; renderSupplierCards(); }
  else if (a === "sup-edit-save") supEditSave();
  else if (a === "sup-edit-cancel") { state.supEdit = false; renderSupplierCards(); }
  else if (a === "brand-asset-add") {
    const cid = btn.dataset.client;
    pickFile("", f => {
      const c = client(cid);
      if (!c || !c.brand) return;
      const type = f.mime.startsWith("image/") ? "素材" : f.mime === "application/pdf" ? "规范" : "文件";
      c.brand.assets.unshift({ name: f.name, ver: "V1", type, date: "刚刚", file: f });
      toast(`「${f.name}」已加入品牌资产库（仅本页内存，点击卡片可预览）`);
      renderClients();
    });
  }
  else if (a === "brand-asset-ref") toast(`「${btn.dataset.name}」已引用到当前项目（演示）——正式版在 Brief 与设计稿环节直接挂接`);
  else if (a === "brief-new") openBriefModal();
  else if (a === "brief-close") $("briefModal").classList.remove("open");
  else if (a === "brief-add-pkg") $("nb-pkgs").insertAdjacentHTML("beforeend", pkgRowHtml());
  else if (a === "brief-rm-pkg") btn.closest(".nb-pkg").remove();
  else if (a === "brief-create") briefCreate();
  else if (a === "map-add-node") mapAddNode();
  else if (a === "map-node-edit") { state.mapEdit = true; renderMapDetail(); }
  else if (a === "map-node-save") mapNodeSave();
  else if (a === "map-node-cancel") { state.mapEdit = false; renderMapDetail(); }
  else if (a === "map-node-del") mapNodeDel();
  else if (a === "map-link-start") {
    state.mapLink = { from: state.mapSel, label: "关联", type: "asset" };
    state.mapEdit = false;
    renderMap();
  }
  else if (a === "map-link-cancel") { state.mapLink = null; renderMap(); }
  else if (a === "map-edge-save") mapEdgeSave();
  else if (a === "map-edge-del") mapEdgeDel();
  else if (a === "map-export") mapExport();
  else if (a === "map-import") $("mapImportFile").click();
  else if (a === "map-reset") {
    if (btn.dataset.arm) {
      delete btn.dataset.arm;
      mapDefaults();
      try { localStorage.removeItem(MAP_STORE_KEY); } catch (e) {}
      mapClearSel();
      renderMap();
      const el = $("mapSaveState");
      if (el) el.textContent = "已还原默认画板";
      btn.textContent = "重置";
      toast("画板已还原为默认，并清除本机保存");
    } else {
      btn.dataset.arm = "1";
      btn.textContent = "确认重置？";
      setTimeout(() => { if (btn.dataset.arm) { delete btn.dataset.arm; btn.textContent = "重置"; } }, 2600);
    }
  }
});

document.addEventListener("change", e => {
  if (e.target.id === "mapImportFile" && e.target.files && e.target.files[0]) {
    mapImport(e.target.files[0]);
    e.target.value = "";
  }
});

document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.action === "w-slide") {
    state.weights[el.dataset.dim] = Number(el.value);
    const lbl = $(`wv-${el.dataset.dim}`);
    if (lbl) lbl.textContent = el.value;
    const sum = $("wSum");
    if (sum) sum.textContent = DIMS.reduce((a, d) => a + state.weights[d.key], 0);
    renderCandidates();
  }
  if (el.dataset.action === "sup-search") {
    state.supFilters.q = el.value;
    renderSupplierCards();
  }
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.id === "roleSelect") setRole(el.value);
  if (el.id === "nb-client") renderBriefHint(el.value);
  if (el.classList && el.classList.contains("nbp-cat")) {
    const c = client($("nb-client") ? $("nb-client").value : "");
    const band = c && c.brand ? c.brand.store.priceBands.find(x => x.cat === el.value) : null;
    const priceInput = el.closest(".nb-pkg") ? el.closest(".nb-pkg").querySelector(".nbp-price") : null;
    if (priceInput && band) priceInput.placeholder = `参考 ${band.band}`;
  }
  if (el.dataset.action === "sup-filter") {
    state.supFilters[el.dataset.f] = el.value;
    renderSupplierCards();
  }
  if (el.dataset.action === "pin-toggle") {
    state.pinClient = el.checked;
    renderCandidates();
  }
  if (el.dataset.action === "gate-toggle") {
    state.gates[el.dataset.gate] = el.checked;
    renderCandidates();
    toast(el.checked ? "已设为硬性门槛：不满足的候选已移入排除名单" : "已恢复为评分/警示模式");
  }
});

document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => {
  if (b.dataset.view === "projects") state.prjOpen = null;
  setView(b.dataset.view);
}));
document.querySelectorAll("[data-rtab]").forEach(b => b.addEventListener("click", () => { state.rtab = b.dataset.rtab; renderRail(); }));

/* ---------------- 启动 ---------------- */

renderView();
