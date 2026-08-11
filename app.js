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
  matching:        { label: "待匹配",     tag: "st-matching" },
  internal_review: { label: "内审中",     tag: "st-internal" },
  client_review:   { label: "待客户确认", tag: "st-client" },
  confirmed:       { label: "已确认",     tag: "st-confirmed" }
};

const DESIGN_STATUS = {
  internal_review: { label: "内审中",     tag: "st-internal" },
  client_review:   { label: "待客户确认", tag: "st-client" },
  changes:         { label: "修改意见",   tag: "st-changes" },
  approved:        { label: "已定稿",     tag: "st-approved" }
};

const STAGES = [
  ["received", "Brief 接收"], ["structuring", "拆解中"], ["matching", "匹配中"],
  ["client_review", "待客户确认"], ["confirmed", "供应商已确认"],
  ["design", "设计协同"], ["design_done", "设计定稿"]
];
const STAGE_LABEL = Object.fromEntries(STAGES);
const STAGE_TAG = {
  received: "potential", structuring: "onboarding", matching: "qualified",
  client_review: "st-client", confirmed: "st-confirmed", design: "st-internal", design_done: "st-approved"
};

const DIMS = [
  { key: "category",  name: "品类专精", w: 20 },
  { key: "process",   name: "工艺覆盖", w: 15 },
  { key: "cert",      name: "认证覆盖", w: 15 },
  { key: "quality",   name: "质量表现", w: 12 },
  { key: "delivery",  name: "交付可靠", w: 10 },
  { key: "price",     name: "价格竞争力", w: 10 },
  { key: "capacity",  name: "产能匹配", w: 8 },
  { key: "clientExp", name: "客户经验", w: 5 },
  { key: "risk",      name: "风险等级", w: 5 }
];

/* ---------------- Mock：客户 ---------------- */

const clients = [
  {
    id: "CLI-001", name: "HEMA", region: "荷兰 · 零售连锁", level: "战略客户",
    since: "2020", annual: "¥4,200 万", contact: "采购总监（客户方）",
    prefs: "FSC 强制 · REACH 全线 · 环保材料优先",
    habit: "逐需求包确认推荐名单 + 设计稿逐版确认",
    brand: {
      dna: "平价优质的荷兰国民生活品牌：简洁、实用、亲和；面向家庭日常场景，反对过度设计。",
      colors: ["#E30613", "#FFFFFF", "#1A1A1A"],
      visual: "Logo 红底白字、不可变形拉伸；包装大面留白；无衬线字体体系；插画低饱和、几何化。",
      store: "白色货架 + 红色促销带；按生活场景分区陈列；每年 8 个上新档期，BTS 与圣诞为最大档。",
      history: "偏好简洁图形与低饱和插画；2025 秋冬拒绝过高饱和撞色系列；文具品类复购最好。",
      decision: "总部 PD 终审 → 设计负责人 → 品质合规；设计稿习惯两轮内定稿，超三轮需重开方向。",
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
      dna: "英国国民商超自有品牌：性价比第一，功能诉求直白，包装信息层级清晰。",
      colors: ["#00539F", "#EE1C2E", "#FFFFFF"],
      visual: "蓝红主色带；包装正面必须有清晰功能图示与容量标注；促销标签位预留。",
      store: "民生品类货架密度高；价格带标签醒目；季节档期跟随英国节日日历。",
      history: "厨房收纳线连续两季增长；对新材料接受度保守，倾向经过验证的方案。",
      decision: "Category Manager 主导，整单确认为主；重点包抽查实物样。",
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
      dna: "IP 驱动的快时尚零售：上新速度即生命线，情绪价值优先，单品性价比敏感。",
      colors: ["#EE2C3C", "#FFFFFF"],
      visual: "IP 形象必须按授权指引使用，比例与配色不可修改；包装统一露出 IP 联名标识。",
      store: "IP 专区集中陈列；月度上新；爆款快速返单，长尾快速清退。",
      history: "圣诞 IP 礼品去年售罄率 92%；对交期极敏感，延期即错档。",
      decision: "商品经理初审 → IP 授权方二次审核（周期约 2 周，需预留）。",
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
      dna: "丹麦设计驱动的生活方式品牌：大胆用色、幽默趣味，商品即内容。",
      colors: ["#0F1B79", "#F5C518", "#E84855"],
      visual: "高饱和撞色是品牌语言；图形手绘感；包装本身要有『被送礼』的完成度。",
      store: "动线式小店铺陈；低价冲动型购买；每月主题更换。",
      history: "新客户，首个项目拆解中；参考其公开产品线整理风格库。",
      decision: "Buyer 单点决策，节奏快；确认方式待首个项目磨合。",
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
    suggest: "主推分配，文具品类首选"
  },
  {
    id: "SUP-002", name: "供应商 B", status: "qualified", source: { type: "own" },
    type: "工厂", region: "义乌", cats: ["文具"], procs: ["印刷", "烫金", "模切"],
    capacity: 90000, price: 92, quality: 90, onTime: 88, lead: 38, sample: 8,
    certs: ["FSC", "EN71"], served: ["Flying Tiger"],
    years: 2, annual: "¥310 万", risk: "低", contact: "销售对接人 · 139****2233",
    suggest: "报价强，注意 REACH 认证缺口"
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
    type: "工厂", region: "台州", cats: ["水具", "家居"], procs: ["注塑", "丝印", "电镀"],
    capacity: 60000, price: 82, quality: 91, onTime: 92, lead: 45, sample: 8,
    certs: ["LFGB", "FDA", "ISO9001", "BSCI"], served: ["Tesco", "HEMA"],
    years: 4, annual: "¥640 万", risk: "低", contact: "销售对接人 · 135****3311",
    suggest: "水具/食品接触类首选"
  },
  {
    id: "SUP-006", name: "供应商 F", status: "onboarding", source: { type: "client", client: "CLI-001" },
    type: "工厂", region: "永康", cats: ["水具"], procs: ["注塑", "真空成型", "丝印"],
    capacity: 80000, price: 87, quality: 85, onTime: 80, lead: 48, sample: 10,
    certs: ["LFGB"], served: [],
    years: 0, annual: "—", risk: "中", contact: "销售对接人 · 133****9090",
    suggest: "客户提供 · 准入资料补充中，验厂待排期"
  },
  {
    id: "SUP-007", name: "供应商 G", status: "active", source: { type: "client", client: "CLI-003" },
    type: "贸易商", region: "深圳", cats: ["礼品", "文具"], procs: ["印刷", "注塑", "组装"],
    capacity: 100000, price: 80, quality: 89, onTime: 91, lead: 35, sample: 7,
    certs: ["BSCI", "EN71", "REACH", "Disney FAMA"], served: ["MINISO", "泡泡玛特"],
    years: 3, annual: "¥450 万", risk: "低", contact: "销售对接人 · 132****4455",
    suggest: "MINISO 体系，IP 类项目优先"
  },
  {
    id: "SUP-008", name: "供应商 H", status: "qualified", source: { type: "own" },
    type: "工厂", region: "苏州", cats: ["家居", "水具"], procs: ["注塑", "模压"],
    capacity: 45000, price: 78, quality: 92, onTime: 89, lead: 48, sample: 9,
    certs: ["LFGB", "FSC"], served: ["HEMA"],
    years: 2, annual: "¥270 万", risk: "低", contact: "销售对接人 · 131****6677",
    suggest: "家居类稳定，产能偏小"
  },
  {
    id: "SUP-009", name: "供应商 I", status: "suspended", source: { type: "own" },
    type: "工厂", region: "温州", cats: ["文具"], procs: ["印刷", "装订"],
    capacity: 70000, price: 83, quality: 78, onTime: 76, lead: 44, sample: 11,
    certs: ["BSCI（过期）"], served: ["HEMA（历史）"],
    years: 3, annual: "¥190 万", risk: "高", contact: "销售对接人 · 130****2200",
    suggest: "CAP 整改未关闭，暂停新项目分配"
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
    type: "自有工厂", region: "宁波", cats: ["文具", "包袋"], procs: ["印刷", "缝纫", "模切"],
    capacity: 120000, price: 76, quality: 96, onTime: 96, lead: 28, sample: 5,
    certs: ["FSC", "BSCI", "ISO9001", "REACH", "EN71"], served: ["HEMA", "Tesco", "MINISO"],
    years: 6, annual: "¥1,150 万", risk: "低", contact: "孙杰 · 138****9900",
    suggest: "关联自有工厂，质量交期最稳"
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
      { t: "08-04", txt: "进入供应商匹配阶段" }
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
      { t: "06-12", txt: "供应商推荐名单客户确认通过" },
      { t: "07-28", txt: "布艺收纳设计稿 V1 客户提出修改意见" },
      { t: "08-05", txt: "设计稿 V2 完成，进入内审" }
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
      { t: "05-20", txt: "供应商确认，进入设计协同" },
      { t: "07-15", txt: "全部设计稿定稿，等待打样启动（P2 范围）" }
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
      { t: "07-18", txt: "推荐名单内审通过，提交 MINISO 确认" }
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
    status: "matching", shortlist: [], confirmed: [], returnNote: null
  },
  {
    id: "REQ-02", prj: "PRJ-2601", name: "背包袋类需求包", cat: "包袋", sku: 22,
    monthly: 60000, qtyLabel: "6 万件/月", priceBand: "€4.0 – 8.0",
    procs: ["缝纫", "印刷"], certs: ["BSCI", "REACH"], leadLimit: 45,
    status: "matching", shortlist: [], confirmed: [], returnNote: null
  },
  {
    id: "REQ-03", prj: "PRJ-2601", name: "水杯水具需求包", cat: "水具", sku: 10,
    monthly: 40000, qtyLabel: "4 万件/月", priceBand: "€2.0 – 4.0",
    procs: ["注塑", "丝印"], certs: ["LFGB", "FDA"], leadLimit: 50,
    status: "matching", shortlist: [], confirmed: [], returnNote: null
  },
  {
    id: "REQ-H1", prj: "PRJ-2602", name: "布艺收纳需求包", cat: "家居", sku: 12,
    monthly: 30000, qtyLabel: "3 万件/月", priceBand: "€3.0 – 8.0",
    procs: ["缝纫", "模压"], certs: ["FSC", "BSCI"], leadLimit: 45,
    status: "confirmed", shortlist: ["SUP-008"], confirmed: ["SUP-008"], returnNote: null
  },
  {
    id: "REQ-H2", prj: "PRJ-2602", name: "保温杯具需求包", cat: "水具", sku: 8,
    monthly: 25000, qtyLabel: "2.5 万件/月", priceBand: "€6.0 – 12.0",
    procs: ["注塑", "丝印"], certs: ["LFGB", "FDA"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-005"], confirmed: ["SUP-005"], returnNote: null
  },
  {
    id: "REQ-T1", prj: "PRJ-2603", name: "厨房收纳盒需求包", cat: "家居", sku: 16,
    monthly: 45000, qtyLabel: "4.5 万件/月", priceBand: "£2.0 – 6.0",
    procs: ["注塑"], certs: ["LFGB", "BSCI"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-005"], confirmed: ["SUP-005"], returnNote: null
  },
  {
    id: "REQ-T2", prj: "PRJ-2603", name: "餐厨配件需求包", cat: "家居", sku: 9,
    monthly: 30000, qtyLabel: "3 万件/月", priceBand: "£2.0 – 9.0",
    procs: ["注塑", "模压"], certs: ["LFGB"], leadLimit: 50,
    status: "confirmed", shortlist: ["SUP-008"], confirmed: ["SUP-008"], returnNote: null
  },
  {
    id: "REQ-M1", prj: "PRJ-2604", name: "圣诞 IP 礼品需求包", cat: "礼品", sku: 18,
    monthly: 80000, qtyLabel: "8 万件/月", priceBand: "¥15 – 69",
    procs: ["印刷", "注塑", "组装"], certs: ["EN71", "Disney FAMA"], leadLimit: 40,
    status: "client_review", shortlist: ["SUP-007", "SUP-012"], confirmed: [], returnNote: null
  }
];

const designs = [
  {
    id: "D-01", pkg: "REQ-H1", ver: 1, designer: "设计师 A", date: "07-28",
    status: "changes", palette: ["#8FA8C8", "#E7EDF5"],
    note: "客户修改意见：整体色调偏冷，希望更贴近 HEMA 红白视觉体系；LOGO 占比放大 20%。"
  },
  {
    id: "D-02", pkg: "REQ-H1", ver: 2, designer: "设计师 A", date: "08-05",
    status: "internal_review", palette: ["#E64A45", "#F7F3EE"], note: null
  },
  {
    id: "D-03", pkg: "REQ-H2", ver: 1, designer: "设计师 B", date: "08-03",
    status: "client_review", palette: ["#2F6BD8", "#F2F6FB"], note: null
  },
  {
    id: "D-04", pkg: "REQ-T1", ver: 2, designer: "设计师 B", date: "07-12",
    status: "approved", palette: ["#4C9A6E", "#F2F7F0"], note: null
  },
  {
    id: "D-05", pkg: "REQ-T2", ver: 1, designer: "设计师 A", date: "07-10",
    status: "approved", palette: ["#C88B3C", "#FBF5EC"], note: null
  }
];

/* ---------------- 动态 / 历史 ---------------- */

const feed = [
  { t: "今天 09:40", txt: "HEMA 补充水具认证要求，REQ-03 需求包已更新" },
  { t: "今天 09:12", txt: "设计稿 D-02（布艺收纳 V2）提交内审" },
  { t: "昨天 17:26", txt: "MINISO 圣诞 IP 需求包推荐名单已提交客户确认" },
  { t: "昨天 14:03", txt: "供应商 F（HEMA 提供）进入准入流程，验厂待排期" },
  { t: "08-04 11:20", txt: "HEMA 2027 开学季进入供应商匹配阶段" }
];

const history = [
  { t: "07-18", txt: "REQ-M1 推荐名单内审通过（业务员 A），已提交 MINISO" },
  { t: "07-15", txt: "Tesco 厨房收纳全部设计稿客户定稿" },
  { t: "06-12", txt: "HEMA 秋冬家居 2 个需求包推荐名单客户确认通过" }
];

/* ---------------- 全局状态 ---------------- */

const state = {
  role: "sales",
  view: "dashboard",
  rtab: "pending",
  prjOpen: null,
  pkgSel: "REQ-01",
  weights: Object.fromEntries(DIMS.map(d => [d.key, d.w])),
  pinClient: true,
  reasonFor: null,          // { t: 'pkg-internal-return'|'pkg-swap'|'design-return'|'design-changes', id }
  clientSel: "CLI-001",
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
    nav: ["dashboard", "projects", "matching", "clients", "suppliers", "thinking"]
  },
  management: {
    banner: "管理层视角 · 全局只读",
    cls: "",
    hint: "查看所有项目健康度、审核积压与供应商风险，不直接操作。",
    nav: ["dashboard", "projects", "clients", "suppliers", "thinking"]
  },
  client: {
    banner: "客户视角 · HEMA（模拟客户登录）",
    cls: "client",
    hint: "仅可见自己的项目、待确认事项，以及自己体系的供应商；看不到内部打分与落选者。",
    nav: ["dashboard", "projects", "suppliers"],
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
  if (ps.some(x => x.status === "matching" || x.status === "internal_review")) return "matching";
  if (ps.some(x => x.status === "client_review")) return "client_review";
  const latest = latestDesignByPkg(p.id);
  if (!latest.length) return "confirmed";
  return latest.every(d => d.status === "approved") ? "design_done" : "design";
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
  suppliers.forEach(s => {
    if (!["active", "qualified"].includes(s.status)) {
      const why = { onboarding: "准入未完成", potential: "未准入 · 信息收集中", suspended: "已暂停 · CAP 未关闭", eliminated: "已淘汰" }[s.status];
      out.push({ s, why });
      return;
    }
    if (!s.cats.includes(p.cat)) {
      out.push({ s, why: `品类不匹配（主营 ${s.cats[0]}）` });
      return;
    }
    pass.push(s);
  });
  return { pass, out };
}

function dimScores(s, p) {
  const projClient = client(prj(p.prj)?.client);
  const clientName = projClient ? projClient.name : null;

  const category = s.cats[0] === p.cat ? 100 : 82;
  const process = Math.round(p.procs.filter(x => s.procs.includes(x)).length / p.procs.length * 100);
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

  return { category, process, cert, quality, delivery, price, capacity, clientExp, risk,
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
    if (p.status === "internal_review") items.push({ kind: "pkg", stage: "internal", p });
    if (p.status === "client_review") items.push({ kind: "pkg", stage: "client", p });
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
      const p = it.kind === "pkg" ? it.p : pkg(it.d.pkg);
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
    todos.push([p.returnNote ? "red" : "blue", p.returnNote ? "重新匹配" : "待匹配", `${p.name} · ${prj(p.prj).name}`, "匹配工作台"]);
  });
  revs.filter(r => r.stage === "internal").forEach(r => {
    const name = r.kind === "pkg" ? `${r.p.name} 推荐名单` : `设计稿 V${r.d.ver}（${pkg(r.d.pkg).name}）`;
    todos.push(["amber", "待内审", name, "审核中心"]);
  });
  revs.filter(r => r.stage === "client").forEach(r => {
    const p = r.kind === "pkg" ? r.p : pkg(r.d.pkg);
    const c = client(prj(p.prj)?.client);
    const name = r.kind === "pkg" ? `${p.name} 推荐名单` : `设计稿 V${r.d.ver}（${p.name}）`;
    todos.push(["skyc", "等待客户", `${name} · ${c ? c.name : ""}`, "客户处理"]);
  });
  designs.filter(d => d.status === "changes").forEach(d => {
    todos.push(["amber", "待改稿", `${pkg(d.pkg).name} 设计稿（客户已提意见）`, "项目详情"]);
  });

  const mgr = state.role === "management";
  el.innerHTML = `
    <div class="tile-grid">
      <div class="tile"><span>进行中项目</span><b>${projects.length}</b><div class="bar"><i style="--p:72%"></i></div><p>覆盖 ${clients.length} 个客户</p></div>
      <div class="tile"><span>待匹配需求包</span><b>${nMatching}</b><div class="bar"><i style="--p:${nMatching * 18}%"></i></div><p>等待进入匹配工作台</p></div>
      <div class="tile ${nInternal ? "warn" : ""}"><span>待内审</span><b>${nInternal}</b><div class="bar"><i style="--p:${nInternal * 25}%"></i></div><p>推荐名单 + 设计稿</p></div>
      <div class="tile"><span>待客户确认</span><b>${nClient}</b><div class="bar soft"><i style="--p:${nClient * 25}%"></i></div><p>已提交客户，等待回复</p></div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Pipeline</p><h3>项目阶段分布</h3></div>
        <button class="text-link" data-action="jump" data-jump="projects">查看项目列表</button></div>
      <div class="pipe-grid">
        ${STAGES.map(([k, label]) => `<div class="${counts[k] && (k === "matching" || k === "client_review") ? "hot" : ""}"><span>${label}</span><b>${counts[k]}</b><em>${{received:"待建档拆解",structuring:"结构化中",matching:"匹配+内审",client_review:"客户侧",confirmed:"待设计",design:"改稿确认中",design_done:"待打样(P2)"}[k]}</em></div>`).join("")}
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
      <div class="tile ${revs.length ? "warn" : ""}"><span>待我确认</span><b>${revs.length}</b><div class="bar"><i style="--p:${revs.length * 30}%"></i></div><p>推荐名单 / 设计稿</p></div>
      <div class="tile"><span>我提供的供应商</span><b>${provided.length}</b><div class="bar soft"><i style="--p:${provided.length * 30}%"></i></div><p>全量可见，含准入中</p></div>
      <div class="tile"><span>正在合作供应商</span><b>${cooperating.size}</b><div class="bar good"><i style="--p:${cooperating.size * 25}%"></i></div><p>为我的项目服务中</p></div>
    </div>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Pending Confirmation</p><h3>待您确认</h3></div></div>
      ${revs.length ? revs.map(r => {
        if (r.kind === "pkg") {
          const p = r.p, pr = prj(p.prj);
          return `<div class="confirm-card"><h4>${p.name} · 推荐供应商名单</h4>
            <p>${pr.name} · ${p.sku} SKU · ${p.qtyLabel}</p>
            <div class="chip-row">${p.shortlist.map(id => `<span class="chip blue">${sup(id).name}</span>`).join("")}</div>
            <p class="muted tight">请在右侧审核中心批准，或填写原因要求换选。</p></div>`;
        }
        const d = r.d, p = pkg(d.pkg);
        return `<div class="confirm-card"><h4>设计稿 V${d.ver} · ${p.name}</h4>
          <p>${prj(p.prj).name} · 设计师 ${d.designer} · ${d.date} 提交</p>
          <p class="muted tight">请在右侧审核中心确认定稿，或提出修改意见。</p></div>`;
      }).join("") : `<div class="empty">暂无待确认事项</div>`}
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
  const myPkgs = packages.filter(p => p.confirmed.includes(sid));
  return `
    <section class="panel">
      <div class="panel-head"><div><p class="label">My Profile</p><h3>${me.name} · 我的档案</h3></div>
        <span class="tag ${SUP_STATUS[me.status].tag}">${SUP_STATUS[me.status].label}</span></div>
      <div class="sec-grid">
        <div class="sec"><b>基础信息</b>
          <span>编号：<strong>${me.id}</strong></span><span>类型：${me.type} · ${me.region}</span>
          <span>主营：${me.cats.join(" / ")}</span><span>联系人：${me.contact}</span></div>
        <div class="sec"><b>能力与认证</b>
          <span>工艺：${me.procs.join(" / ")}</span><span>认证：${me.certs.join(" / ")}</span>
          <span>月产能：${(me.capacity / 10000).toFixed(0)} 万件</span></div>
        <div class="sec"><b>我的表现</b>
          <span>质量通过率：<strong>${me.quality}%</strong></span><span>交付准时率：<strong>${me.onTime}%</strong></span>
          <span>平均交期：${me.lead} 天 · 打样 ${me.sample} 天</span></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><p class="label">My Cooperation</p><h3>确认的合作</h3></div></div>
      ${myPkgs.length ? `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>需求包</th><th>项目</th><th>SKU</th><th>数量</th><th>设计稿状态</th></tr></thead>
        <tbody>${myPkgs.map(p => {
          const ds = designsOf(p.id); const last = ds[ds.length - 1];
          return `<tr><td><b>${p.name}</b></td><td>${prj(p.prj).name}</td><td>${p.sku}</td><td>${p.qtyLabel}</td>
            <td>${last ? `V${last.ver} <span class="tag ${DESIGN_STATUS[last.status].tag}">${DESIGN_STATUS[last.status].label}</span>` : "未开始"}</td></tr>`;
        }).join("")}</tbody></table></div>` : `<div class="empty">暂无确认的合作</div>`}
      <p class="muted tight">P2 规划：供应商门户将支持在线接任务、报价与上传打样资料。</p>
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
          <p class="label">${p.id} · Brief ${p.briefVer}（${p.briefFile}）</p>
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
        <thead><tr><th>需求包</th><th>品类</th><th>SKU</th><th>数量</th><th>认证要求</th><th>状态</th><th>推荐 / 确认供应商</th><th></th></tr></thead>
        <tbody>${ps.map(x => {
          const st = PKG_STATUS[x.status];
          let supCol = "—";
          if (x.status === "confirmed") supCol = x.confirmed.map(id => `<span class="chip green">${sup(id).name}</span>`).join(" ");
          else if (x.status === "client_review") supCol = x.shortlist.map(id => `<span class="chip skyc">${sup(id).name}</span>`).join(" ");
          else if (!isClient && x.shortlist.length) supCol = x.shortlist.map(id => `<span class="chip">${sup(id).name}</span>`).join(" ");
          else if (isClient) supCol = `<span class="muted">内部筹备中</span>`;
          let act = "";
          if (isSales) {
            if (x.status === "matching") act = `<button class="primary mini" data-action="goto-match" data-pkg="${x.id}">去匹配</button>`;
            else if (x.status === "internal_review") act = `<span class="muted">审核中心处理</span>`;
            else if (x.status === "client_review") act = `<span class="muted">等待客户</span>`;
          }
          return `<tr>
            <td><b>${x.name}</b>${x.returnNote ? `<br><span class="chip red">有退回意见</span>` : ""}</td>
            <td>${x.cat}</td><td>${x.sku}</td><td>${x.qtyLabel}</td>
            <td>${x.certs.join(" / ")}</td>
            <td><span class="tag ${st.tag}">${st.label}</span></td>
            <td>${supCol}</td><td>${act}</td></tr>`;
        }).join("")}</tbody></table></div>` : `<div class="empty">Brief 拆解中，需求包尚未生成${isSales ? " —— 拆解完成后在此列出，再进入匹配" : ""}</div>`}
      ${ps.some(x => x.returnNote) ? ps.filter(x => x.returnNote).map(x => `<div class="return-note tight">【${x.name}】${x.returnNote}</div>`).join("") : ""}
    </section>

    ${ds.length ? `<section class="panel">
      <div class="panel-head"><div><p class="label">Design Drafts</p><h3>设计稿（挂在需求包下 · 带版本）</h3></div></div>
      <div class="design-wall">
        ${ds.sort((a, b) => a.pkg.localeCompare(b.pkg) || a.ver - b.ver).map(d => designCard(d)).join("")}
      </div>
    </section>` : ""}

    <section class="panel">
      <div class="panel-head"><div><p class="label">Timeline</p><h3>项目动态</h3></div></div>
      <div class="timeline">${[...p.timeline].reverse().map(t => `<div class="tl-item"><time>${t.t}</time><p>${t.txt}</p></div>`).join("")}</div>
    </section>`;
}

function designCard(d) {
  const p = pkg(d.pkg);
  const st = DESIGN_STATUS[d.status];
  const isSales = state.role === "sales";
  const isClient = state.role === "client" && prj(p.prj)?.client === ROLES.client.clientId;
  const ds = designsOf(d.pkg);
  const isLatest = d.ver === ds[ds.length - 1].ver;

  let actions = "";
  if (isSales && d.status === "internal_review") {
    actions = `<button class="primary mini" data-action="design-pass" data-design="${d.id}">内审通过 → 提交客户</button>
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
    <div class="thumb" data-ver="V${d.ver}" style="background:linear-gradient(135deg, ${d.palette[0]} 0%, ${d.palette[0]} 52%, ${d.palette[1]} 52%, ${d.palette[1]} 100%)"></div>
    <div class="d-body">
      <h5>${p.name}</h5>
      <div class="d-meta">设计师 ${d.designer} · ${d.date} · <span class="tag ${st.tag}">${st.label}</span></div>
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

    ${cur.returnNote ? `<div class="return-note">${cur.returnNote} —— 请调整推荐名单后重新提交。</div>` : ""}
    ${locked ? `<div class="panel"><p class="muted">该需求包当前状态：<span class="tag ${PKG_STATUS[cur.status].tag}">${PKG_STATUS[cur.status].label}</span>，推荐名单已锁定：${cur.shortlist.map(id => `<span class="chip blue">${sup(id).name}</span>`).join(" ")}。${cur.status === "internal_review" ? "请到右侧审核中心处理。" : ""}</p></div>` : ""}

    <div class="match-grid">
      <section class="panel" style="margin-bottom:0">
        <div class="panel-head"><div><p class="label">Requirement</p><h3>${cur.name}</h3></div>
          <span class="chip blue">${pr.name} · ${c ? c.name : ""}</span></div>
        <div class="req-facts">
          <div class="kv"><span>品类</span><b>${cur.cat}</b></div>
          <div class="kv"><span>SKU 数</span><b>${cur.sku}</b></div>
          <div class="kv"><span>需求量</span><b>${cur.qtyLabel}</b></div>
          <div class="kv"><span>目标价格带</span><b>${cur.priceBand}</b></div>
          <div class="kv"><span>工艺要求</span><b>${cur.procs.join(" / ")}</b></div>
          <div class="kv"><span>认证要求</span><b>${cur.certs.join(" / ")}</b></div>
          <div class="kv"><span>交期上限</span><b>${cur.leadLimit} 天</b></div>
          ${c && c.compliance ? `<div class="kv"><span>客户验厂红线</span><b>${c.compliance.auditCerts.join(" / ")}</b></div>` : `<div class="kv"><span>需求包状态</span><b>${PKG_STATUS[cur.status].label}</b></div>`}
        </div>
      </section>

      <section class="panel" style="margin-bottom:0">
        <div class="panel-head"><div><p class="label">Weights</p><h3>匹配维度权重（可调 · 实时重排）</h3></div>
          <button class="ghost mini" data-action="w-reset">恢复默认</button></div>
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
    const statusOut = out.filter(o => !["active", "qualified"].includes(o.s.status));
    const catOut = out.filter(o => ["active", "qualified"].includes(o.s.status));
    funnel.innerHTML = `
      <div class="funnel">
        <div class="fstep"><span>供应商池</span><b>${suppliers.length}</b><em>全部来源</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>准入合格</span><b>${suppliers.length - statusOut.length}</b><em>排除 ${statusOut.length} 家</em></div>
        <div class="farrow">→</div>
        <div class="fstep"><span>品类匹配</span><b>${list.length}</b><em>排除 ${catOut.length} 家</em></div>
        <div class="farrow">→</div>
        <div class="fstep hot"><span>已选推荐</span><b>${cur.shortlist.length}</b><em>人工勾选</em></div>
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
          ${!locked && state.role === "sales" ? `<button class="${picked ? "ghost" : "primary"} mini" data-action="pick" data-sup="${x.s.id}">${picked ? "移出名单" : "加入推荐名单"}</button>` : ""}
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
        <span class="sl-label">推荐名单（${cur.shortlist.length}）</span>
        ${cur.shortlist.map(id => `<span class="chip">${sup(id).name}</span>`).join("") || `<span class="note" style="width:auto">从上方候选中勾选 1–3 家</span>`}
        <button class="primary mini" data-action="submit-internal" data-pkg="${cur.id}" ${locked || !cur.shortlist.length ? "disabled" : ""}>${locked ? "已提交" : "提交内审"}</button>
        <span class="note">提交后进入右侧审核中心 → 内审通过后提交客户确认；系统记录每一步依据。</span>`;
    }
  }
}

/* ---------- 客户管理 ---------- */

function renderClients() {
  const el = $("view-clients");
  const c = client(state.clientSel) || clients[0];
  state.clientSel = c.id;
  const myPrjs = projects.filter(p => p.client === c.id);
  const provided = suppliers.filter(s => s.source.type === "client" && s.source.client === c.id);

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
    </section>

    ${c.brand ? `
    <section class="panel">
      <div class="panel-head"><div><p class="label">Brand Intelligence</p><h3>${c.name} · 品牌智能档案</h3></div>
        <span class="chip skyc">拆解与设计的背景输入</span></div>
      <div class="sec-grid">
        <div class="sec"><b>品牌 DNA</b><span>${c.brand.dna}</span></div>
        <div class="sec"><b>视觉语言</b>
          <div class="swatch-row">${c.brand.colors.map(x => `<span class="swatch"><i style="background:${x}"></i>${x}</span>`).join("")}</div>
          <span>${c.brand.visual}</span></div>
        <div class="sec"><b>门店与陈列</b><span>${c.brand.store}</span></div>
        <div class="sec"><b>历史偏好与雷区</b><span>${c.brand.history}</span></div>
        <div class="sec"><b>决策链与确认习惯</b><span>${c.brand.decision}</span></div>
        <div class="sec"><b>怎么被平台使用</b><span>Brief 拆解时自动带出品牌要求；设计稿内审对照视觉规范；匹配时叠加客户经验维度。P3：AI 依据档案预审设计稿。</span></div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><div><p class="label">Brand Assets</p><h3>品牌资产库（${c.brand.assets.length}）</h3></div>
        <button class="ghost mini" data-action="brand-asset-add" data-client="${c.id}">+ 上传资产</button></div>
      <div class="asset-grid">
        ${c.brand.assets.map(a => `
          <div class="asset-card">
            <div class="a-icon" style="background:linear-gradient(135deg, ${c.brand.colors[0]} 0%, ${c.brand.colors[0]} 55%, ${c.brand.colors[1] || "#EEF2F9"} 55%)"></div>
            <div class="a-body">
              <h5>${a.name}</h5>
              <p>${a.ver} · ${a.date} · <span class="chip ${{ "规范": "blue", "视觉": "skyc", "素材": "green", "授权": "amber", "参考": "" }[a.type] || ""}">${a.type}</span></p>
            </div>
            <button class="text-link" data-action="brand-asset-ref" data-name="${a.name}">引用到项目</button>
          </div>`).join("")}
      </div>
      <p class="muted tight">品牌资产在新建 Brief 和设计稿环节可直接引用（本 Demo 为演示文件卡，正式版支持真实上传与版本管理）。</p>
    </section>` : ""}

    ${c.compliance ? `
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
          <span style="margin-top:6px">红线在匹配工作台自动校验：候选供应商触碰红线时亮红色警示。</span></div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table">
          <thead><tr><th style="width:140px">品类</th><th>测试标准（客户指定）</th></tr></thead>
          <tbody>${c.compliance.tests.map(x => `<tr><td><b>${x.cat}</b></td><td>${x.std}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="muted tight">分品类测试标准在新建 Brief 拆包时自动带入需求包的认证要求；正式版支持标准版本管理与生效日期。</p>
    </section>` : ""}

    <section class="panel">
      <div class="panel-head"><div><p class="label">Projects</p><h3>${c.name} 的项目</h3></div></div>
      ${myPrjs.length ? `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>项目</th><th>阶段</th><th>需求包</th><th>Owner</th><th>上市</th><th></th></tr></thead>
        <tbody>${myPrjs.map(p => {
          const ps = pkgsOf(p.id);
          return `<tr class="row-click" data-action="open-prj" data-prj="${p.id}"><td><b>${p.name}</b></td><td>${stageTag(deriveStage(p))}</td><td>${ps.filter(x => x.status === "confirmed").length}/${ps.length} 已确认</td><td>${p.owner}</td><td>${p.launch}</td><td><span class="text-link">进入 →</span></td></tr>`;
        }).join("")}</tbody></table></div>` : `<div class="empty">暂无项目</div>`}
    </section>`;
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
        <span>认证：</span><div class="chip-row">${s.certs.length ? s.certs.map(x => `<span class="chip green">${x}</span>`).join("") : `<span class="chip amber">待收集</span>`}</div></div>
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
    const usedIn = packages.filter(p => myPrjIds.includes(p.prj) && (p.confirmed.includes(s.id) || (p.status === "client_review" && p.shortlist.includes(s.id))));
    return `<div class="sup-card">
      <div class="sup-top"><span class="tag ${SUP_STATUS[s.status].tag}">${SUP_STATUS[s.status].label}</span>${sourceTag(s)}</div>
      <h4>${s.name}</h4>
      <p class="muted">${s.type} · ${s.region} · ${s.cats.join(" / ")}</p>
      <div class="chip-row" style="margin-top:8px">${s.certs.length ? s.certs.map(x => `<span class="chip green">${x}</span>`).join("") : `<span class="chip amber">认证资料收集中</span>`}</div>
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

function renderReview() {
  const items = reviewsForRole();
  $("reviewCount").textContent = state.role === "client" ? items.length : deriveReviews().length;
  document.querySelectorAll("[data-rtab]").forEach(b => b.classList.toggle("active", b.dataset.rtab === state.rtab));
  const box = $("reviewList");

  if (state.rtab === "done") {
    box.innerHTML = history.length ? history.map(h => `<div class="r-done"><b>${h.txt}</b><time>${h.t}</time></div>`).join("") : `<div class="empty">暂无记录</div>`;
    return;
  }

  if (state.role === "supplier") {
    const sid = ROLES.supplier.supplierId;
    const myPkgs = packages.filter(p => p.confirmed.includes(sid));
    box.innerHTML = myPkgs.length ? myPkgs.map(p => `<div class="r-done"><b>合作确认：${p.name}</b>${prj(p.prj).name}<time>详见项目排期</time></div>`).join("") : `<div class="empty">暂无通知</div>`;
    return;
  }

  if (!items.length) { box.innerHTML = `<div class="empty">没有待处理的审核事项</div>`; return; }

  box.innerHTML = items.map(it => {
    if (it.kind === "pkg") return reviewPkgItem(it);
    return reviewDesignItem(it);
  }).join("");
}

function reviewPkgItem(it) {
  const p = it.p, pr = prj(p.prj), c = client(pr.client);
  const isSales = state.role === "sales";
  const isClient = state.role === "client";
  const mine = (isSales && it.stage === "internal") || (isClient && it.stage === "client");
  const showScores = !isClient;
  const chips = p.shortlist.map(id => {
    const s = sup(id);
    if (!showScores) return `<span class="chip blue">${s.name}</span>`;
    const sc = totalScore(dimScores(s, p));
    return `<span class="chip blue">${s.name} · ${sc}分</span>`;
  }).join("");

  let actions = "";
  if (isSales && it.stage === "internal") {
    actions = `<button class="primary mini" data-action="pkg-pass" data-pkg="${p.id}">内审通过 → 提交客户</button>
               <button class="ghost mini" data-action="reason-open" data-rt="pkg-internal-return" data-rid="${p.id}">退回重匹配</button>`;
  } else if (isClient && it.stage === "client") {
    actions = `<button class="primary mini" data-action="pkg-approve" data-pkg="${p.id}">批准名单</button>
               <button class="ghost mini" data-action="reason-open" data-rt="pkg-swap" data-rid="${p.id}">要求换选</button>`;
  } else if (it.stage === "client") {
    actions = `<span class="r-wait">等待 ${c ? c.name : "客户"} 确认</span>`;
  } else {
    actions = `<span class="r-wait">内审环节 · 业务员处理</span>`;
  }
  const reasonBox = state.reasonFor && (state.reasonFor.t === "pkg-internal-return" || state.reasonFor.t === "pkg-swap") && state.reasonFor.id === p.id ? reasonBoxHtml() : "";

  return `<div class="r-item ${mine ? "mine" : ""}">
    <div class="r-top"><span class="chip blue">推荐名单</span><span class="tag ${PKG_STATUS[p.status].tag}">${PKG_STATUS[p.status].label}</span></div>
    <h4>${p.name}</h4>
    <div class="r-meta">${pr.name} · ${c ? c.name : ""} · ${p.sku} SKU · ${p.qtyLabel}</div>
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
    <div class="r-meta">${pr.name} · ${c ? c.name : ""} · 设计师 ${d.designer} · ${d.date}</div>
    <div class="thumb" style="height:52px;border-radius:8px;margin-bottom:8px;background:linear-gradient(135deg, ${d.palette[0]} 0%, ${d.palette[0]} 52%, ${d.palette[1]} 52%, ${d.palette[1]} 100%)"></div>
    <div class="r-actions">${actions}</div>
    ${reasonBox}
  </div>`;
}

/* ============================================================
   动作 & 事件
   ============================================================ */

function renderView() {
  renderChrome();
  ({
    dashboard: renderDashboard,
    projects: renderProjects,
    matching: renderMatching,
    clients: renderClients,
    suppliers: renderSuppliers,
    thinking: () => { renderMap(); setupMapInteractions(); }
  }[state.view])();
  renderReview();
}

function setView(v) {
  const role = ROLES[state.role];
  state.view = role.nav.includes(v) ? v : role.nav[0];
  state.reasonFor = null;
  state.supEdit = false;
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
  p.status = "internal_review";
  p.returnNote = null;
  log(`${p.name} 推荐名单（${p.shortlist.map(id => sup(id).name).join("、")}）提交内审`, p.prj);
  toast("已提交内审，请在右侧审核中心处理");
  renderView();
}

function pkgPass(pkgId) {
  const p = pkg(pkgId);
  p.status = "client_review";
  const c = client(prj(p.prj).client);
  log(`${p.name} 内审通过，推荐名单已提交 ${c ? c.name : "客户"} 确认`, p.prj);
  done(`${p.name} 推荐名单内审通过（业务员 A）`);
  toast(`内审通过 → 已提交 ${c ? c.name : "客户"}。切换到客户视角可模拟客户审核`);
  renderView();
}

function pkgApprove(pkgId) {
  const p = pkg(pkgId);
  p.status = "confirmed";
  p.confirmed = [...p.shortlist];
  const pr = prj(p.prj);
  log(`${client(pr.client).name} 批准 ${p.name} 推荐名单：${p.confirmed.map(id => sup(id).name).join("、")}`, p.prj);
  done(`${p.name} 客户确认通过`);
  toast("已批准。全部需求包确认后项目进入设计协同");
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
  toast("设计稿已定稿");
  renderView();
}

function uploadVersion(pkgId) {
  const ds = designsOf(pkgId);
  const last = ds[ds.length - 1];
  const p = pkg(pkgId);
  designs.push({
    id: `D-${String(designs.length + 1).padStart(2, "0")}`,
    pkg: pkgId, ver: last.ver + 1, designer: last.designer,
    date: nowLabel().replace("今天 ", "今天"),
    status: "internal_review",
    palette: [last.palette[1], last.palette[0]],
    note: null
  });
  log(`设计稿 V${last.ver + 1}（${p.name}）已上传，进入内审`, p.prj);
  toast(`已上传 V${last.ver + 1}，进入内审`);
  renderView();
}

function applyReason(text) {
  const rf = state.reasonFor;
  if (!rf) return;
  const note = text.trim() || "（未填写具体原因）";
  if (rf.t === "pkg-internal-return") {
    const p = pkg(rf.id);
    p.status = "matching";
    p.returnNote = `内审退回：${note}`;
    log(`${p.name} 推荐名单被内审退回：${note}`, p.prj);
    done(`${p.name} 内审退回`);
    toast("已退回，需求包回到待匹配");
  } else if (rf.t === "pkg-swap") {
    const p = pkg(rf.id);
    p.status = "matching";
    p.returnNote = `客户要求换选：${note}`;
    log(`${client(prj(p.prj).client).name} 要求 ${p.name} 换选：${note}`, p.prj);
    done(`${p.name} 客户要求换选`);
    toast("已记录客户意见，需求包回到待匹配");
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
  { id: "r-client", x: 46,  y: 34,  w: 158, h: 46, band: "role", label: "客户", sub: "发起 Brief · 最终确认",
    desc: "提交 Brief（正式文件 / 邮件 / 微信 / 口头都行）；按需求包批准推荐名单或填原因要求换选；逐版确认设计稿。只能看到内审通过的内容与自己体系的供应商。",
    hi: ["m-brief", "m-confirm", "m-design", "d-client", "d-pool"] },
  { id: "r-sales", x: 320, y: 34,  w: 196, h: 46, band: "role", label: "业务员 · 项目 Owner", sub: "拆解 · 匹配 · 内审",
    desc: "承接 Brief 并结构化拆解为需求包；在匹配工作台按维度筛选、勾选推荐名单并记录依据；内审把关后对客提交。内部是否再拆「业务员 / 采购」两条线，待业务访谈确认。",
    hi: ["m-brief", "m-parse", "m-pkg", "m-match", "m-review"] },
  { id: "r-mgr", x: 632, y: 34,  w: 150, h: 46, band: "role", label: "管理层", sub: "全局只读 · 风险关注",
    desc: "查看所有项目健康度、审核积压、供应商风险与换选记录；不直接操作流程。",
    hi: [] },
  { id: "r-sup", x: 902, y: 34,  w: 170, h: 46, band: "role", label: "供应商", sub: "承接确认的合作",
    desc: "P1 仅能看到自己的档案与已确认的需求包；P2 开供应商门户：在线接任务、报价、上传打样与设计文件。永远看不到竞争对手与报价对比。",
    hi: ["m-design", "d-pool"] },

  { id: "m-brief",   x: 22,   y: 250, w: 112, h: 58, band: "main", label: "Brief 接收", sub: "文件/邮件/微信/口头",
    desc: "任何形式的 Brief 都先进系统登记并生成版本（V1、V2…）。「新建项目」向导支持现场录入并直接拆包。", hi: ["r-client", "d-client"] },
  { id: "m-parse",   x: 169,  y: 250, w: 112, h: 58, band: "main", label: "结构化拆解", sub: "字段 + 需求包",
    desc: "把原始 Brief 拆成结构化字段（主题 / 市场 / 价格带 / 节点），并按品类拆出需求包。实际拆解习惯待业务员访谈校准。", hi: ["r-sales", "m-pkg"] },
  { id: "m-pkg",     x: 316,  y: 250, w: 112, h: 58, band: "hot",  label: "需求包", sub: "流转最小单位",
    desc: "一个 Brief 拆 N 个需求包，各自独立走完匹配和审核，客户逐包确认；项目状态由需求包汇总得出。这是整个平台的关键设计。", hi: ["m-parse", "m-match"] },
  { id: "m-match",   x: 463,  y: 250, w: 112, h: 58, band: "main", label: "多维度匹配", sub: "硬过滤 + 9 维打分",
    desc: "先硬过滤（准入状态、品类），再按 9 个维度加权打分排序；权重可调、漏斗全程透明；最终由人勾选，系统记录依据。", hi: ["d-pool", "m-pkg", "r-sales"] },
  { id: "m-review",  x: 610,  y: 250, w: 112, h: 58, band: "main", label: "内审", sub: "业务员把关",
    desc: "推荐名单与设计稿先内审再对客，可退回重匹配；所有需要判断的动作统一进右侧审核中心。", hi: ["r-sales", "d-log"] },
  { id: "m-confirm", x: 757,  y: 250, w: 112, h: 58, band: "main", label: "客户确认", sub: "逐包批准 / 换选",
    desc: "客户批准推荐名单，或填写原因要求换选（需求包回到待匹配）；原因原文记录进流转历史。", hi: ["r-client", "d-log"] },
  { id: "m-design",  x: 904,  y: 250, w: 112, h: 58, band: "main", label: "设计协同", sub: "版本 + 修改意见",
    desc: "设计稿挂在需求包下、带版本：内审 → 客户确认 → 定稿；修改意见记录原文，新版本重新走流程。", hi: ["r-client", "r-sup", "d-log"] },
  { id: "m-final",   x: 1051, y: 250, w: 112, h: 58, band: "main", label: "定稿", sub: "P2：打样 / 订单",
    desc: "全部需求包供应商确认 + 设计定稿后项目闭环；P2 向打样、订单跟进、供应商绩效沉淀延伸。", hi: ["d-prj"] },

  { id: "d-client", x: 60,  y: 480, w: 178, h: 54, band: "asset", label: "客户档案", sub: "偏好 · 审核习惯",
    desc: "品牌标准偏好、确认习惯、历史项目与该客户提供的供应商，为拆解和匹配提供背景输入。", hi: ["m-brief", "r-client"] },
  { id: "d-pool",   x: 356, y: 480, w: 232, h: 54, band: "asset", label: "供应商池", sub: "客户提供 / 自主开发 · 六状态",
    desc: "全量供应商资源库：来源标签 + 六种准入状态 + 能力标签（品类 / 工艺 / 认证 / 产能 / 绩效）。是匹配打分的数据地基；客户提供的供应商对该客户全量可见（含未准入）。", hi: ["m-match", "r-client", "r-sup"] },
  { id: "d-prj",    x: 700, y: 480, w: 170, h: 54, band: "asset", label: "项目库", sub: "历史沉淀 · 复用",
    desc: "完结项目沉淀为可复用资产：需求包结构、成交供应商、设计稿与确认记录；P3 供匹配模型自学习。", hi: ["m-final"] },
  { id: "d-log",    x: 940, y: 480, w: 190, h: 54, band: "asset", label: "审核与流转记录", sub: "每一步留痕",
    desc: "提交、内审、退回、换选、修改意见全部记录原因与时间线——对客户透明、对内可复盘的依据链。", hi: ["m-review", "m-confirm", "m-design"] }
];

const MAP_EDGES = [
  { from: "m-brief",   to: "m-parse",   label: "结构化",     type: "main" },
  { from: "m-parse",   to: "m-pkg",     label: "拆包",       type: "main" },
  { from: "m-pkg",     to: "m-match",   label: "逐包匹配",   type: "main" },
  { from: "m-match",   to: "m-review",  label: "推荐名单",   type: "main" },
  { from: "m-review",  to: "m-confirm", label: "提交客户",   type: "main" },
  { from: "m-confirm", to: "m-design",  label: "确定合作",   type: "main" },
  { from: "m-design",  to: "m-final",   label: "客户定稿",   type: "main" },
  { from: "m-review",  to: "m-match",   label: "内审退回",   type: "back", dip: 42 },
  { from: "m-confirm", to: "m-match",   label: "要求换选",   type: "back", dip: 74 },
  { from: "d-pool",    to: "m-match",   label: "供给候选",   type: "asset" },
  { from: "m-final",   to: "d-prj",     label: "沉淀复用",   type: "asset", vert: true },
  { from: "r-client",  to: "m-brief",   label: "提交 Brief", type: "role" },
  { from: "r-client",  to: "m-confirm", label: "批准 / 换选", type: "role", vert: true },
  { from: "r-client",  to: "m-design",  label: "确认设计稿", type: "role", sel: true, vert: true },
  { from: "r-sales",   to: "m-parse",   label: "拆解",       type: "role", sel: true },
  { from: "r-sales",   to: "m-match",   label: "勾选名单",   type: "role", sel: true },
  { from: "r-sales",   to: "m-review",  label: "内审",       type: "role", sel: true, vert: true },
  { from: "r-sup",     to: "m-design",  label: "P2：上传打样/设计", type: "role", sel: true },
  { from: "d-client",  to: "m-brief",   label: "背景输入",   type: "asset", sel: true },
  { from: "m-review",  to: "d-log",     label: "记录依据",   type: "asset", sel: true, vert: true },
  { from: "m-confirm", to: "d-log",     label: "确认留痕",   type: "asset", sel: true, vert: true },
  { from: "m-design",  to: "d-log",     label: "意见留痕",   type: "asset", sel: true }
];

const MAP_STORE_KEY = "eastlink_map_v1";
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
      <rect x="10" y="232" width="1160" height="94" rx="12"></rect><text x="24" y="248">业务主线 MAIN FLOW</text>
      <rect x="10" y="462" width="1160" height="90" rx="12"></rect><text x="24" y="478">数据资产 DATA</text>
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
          <label class="field">原始 Brief 文件名（Mock 不真实上传）<input id="nb-file" placeholder="如：Brief_V1.pdf"></label>
          <label class="field">项目主题<input id="nb-theme" placeholder="如：Summer Outdoor"></label>
          <label class="field">目标市场<input id="nb-market" placeholder="如：欧洲门店"></label>
          <label class="field">整体价格带<input id="nb-price" placeholder="如：€2.0 – 9.0"></label>
          <label class="field">上市时间<input id="nb-launch" placeholder="如：2027-06"></label>
        </div>
      </div>
      <div>
        <p class="label" style="margin-bottom:8px">② 结构化拆解为需求包（可先不拆，项目停在"拆解中"）</p>
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
    briefFile: $("nb-file").value.trim() || (source === "正式文件（PDF / PPT）" ? "Brief_V1.pdf" : "（非正式 Brief · 待整理归档）"),
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
    packages.push({
      id: `REQ-${String(packages.length + 1).padStart(2, "0")}`,
      prj: prjId, name: p.name, cat: p.cat, sku: p.sku, monthly: p.qty,
      qtyLabel: `${(p.qty / 10000).toFixed(p.qty % 10000 ? 1 : 0)} 万件/月`,
      priceBand: p.price, procs: p.procs, certs: p.certs, leadLimit: p.lead,
      status: "matching", shortlist: [], confirmed: [], returnNote: null
    });
  });
  if (pkgRows.length) prj(prjId).timeline.push({ t: today, txt: `Brief 结构化拆解完成，拆出 ${pkgRows.length} 个需求包` });
  feed.unshift({ t: nowLabel(), txt: `新项目「${name}」已创建${pkgRows.length ? `，拆出 ${pkgRows.length} 个需求包，进入供应商匹配` : "，Brief 拆解中"}` });

  $("briefModal").classList.remove("open");
  state.prjOpen = prjId;
  setView("projects");
  toast(pkgRows.length ? "项目已创建，需求包进入待匹配，可到匹配工作台处理" : "项目已创建，当前处于拆解中");
}

/* ----- 事件委托 ----- */

document.addEventListener("click", e => {
  if (e.target.id === "briefModal") { $("briefModal").classList.remove("open"); return; }
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
  else if (a === "pkg-pass") pkgPass(btn.dataset.pkg);
  else if (a === "pkg-approve") pkgApprove(btn.dataset.pkg);
  else if (a === "design-pass") designPass(btn.dataset.design);
  else if (a === "design-approve") designApprove(btn.dataset.design);
  else if (a === "upload-version") uploadVersion(btn.dataset.pkg);
  else if (a === "reason-open") {
    state.reasonFor = { t: btn.dataset.rt, id: btn.dataset.rid, inReview: !!btn.closest(".review") };
    renderView();
  }
  else if (a === "reason-confirm") {
    const txt = $("reasonText") ? $("reasonText").value : "";
    applyReason(txt);
  }
  else if (a === "reason-cancel") { state.reasonFor = null; renderView(); }
  else if (a === "client-sel") { state.clientSel = btn.dataset.client; renderClients(); }
  else if (a === "sup-sel") { state.supSel = btn.dataset.sup; state.supEdit = false; renderSupplierCards(); }
  else if (a === "sup-edit") { state.supEdit = true; renderSupplierCards(); }
  else if (a === "sup-edit-save") supEditSave();
  else if (a === "sup-edit-cancel") { state.supEdit = false; renderSupplierCards(); }
  else if (a === "brand-asset-add") {
    const c = client(btn.dataset.client);
    if (c && c.brand) {
      c.brand.assets.unshift({ name: "新上传资产（演示）", ver: "V1", type: "素材", date: "刚刚" });
      toast("资产已加入品牌资产库（Demo 演示，正式版为真实文件上传）");
      renderClients();
    }
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
  if (el.dataset.action === "sup-filter") {
    state.supFilters[el.dataset.f] = el.value;
    renderSupplierCards();
  }
  if (el.dataset.action === "pin-toggle") {
    state.pinClient = el.checked;
    renderCandidates();
  }
});

document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => {
  if (b.dataset.view === "projects") state.prjOpen = null;
  setView(b.dataset.view);
}));
document.querySelectorAll("[data-rtab]").forEach(b => b.addEventListener("click", () => { state.rtab = b.dataset.rtab; renderReview(); }));

/* ---------------- 启动 ---------------- */

renderView();
