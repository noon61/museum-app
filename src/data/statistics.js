export const STAT_DOCUMENTS = [
  {
    id: "agriculture",
    category: "農業",
    title: "農家数・農家人口／経営耕地別面積",
    personaId: "p003",
    pages: [
      { id: "p400", label: "農家数・農家人口", page: 400, image: "/statistics/agriculture-families-400.png" },
      { id: "p401", label: "経営耕地別面積", page: 401, image: "/statistics/agriculture-area-401.png" },
    ],
  },
  {
    id: "fishery",
    category: "水産業",
    title: "生売水産物数量",
    personaId: "p004",
    pages: [
      { id: "p408", label: "生売水産物数量 1", page: 408, image: "/statistics/fish-products-408.png" },
      { id: "p409", label: "生売水産物数量 2", page: 409, image: "/statistics/fish-products-409.png" },
    ],
  },
  {
    id: "civil",
    category: "司法",
    title: "民事訴訟件数",
    personaId: "p005",
    pages: [
      { id: "p1088", label: "民事訴訟件数 1", page: 1088, image: "/statistics/civil-cases-1088.png" },
      { id: "p1089", label: "民事訴訟件数 2", page: 1089, image: "/statistics/civil-cases-1089.png" },
    ],
  },
  {
    id: "medical",
    category: "医療",
    title: "医療施設数及び医療従事者数",
    personaId: "p002",
    pages: [
      { id: "p1110", label: "戦前", page: 1110, image: "/statistics/medical-prewar-1110.png" },
      { id: "p1111", label: "戦後", page: 1111, image: "/statistics/medical-postwar-1111.png" },
    ],
  },
  {
    id: "education",
    category: "教育",
    title: "学齢児童数・就学児童数・就学率",
    personaId: "p001",
    pages: [
      { id: "p1136", label: "学齢児童数・就学児童数・就学率 1", page: 1136, image: "/statistics/school-attendance-1136.png" },
      { id: "p1137", label: "学齢児童数・就学児童数・就学率 2", page: 1137, image: "/statistics/school-attendance-1137.png" },
    ],
  },
];

export const getStatDocument = (id) => STAT_DOCUMENTS.find((item) => item.id === id) || STAT_DOCUMENTS[0];
